import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage as memStorage } from "./storage"; // In-memory storage
import { mongoDBStorage } from "./mongodb-storage"; // MongoDB storage
import { insertCartItemSchema, insertUserSchema } from "@shared/schema";
import { processHealthQuery, getMedicationInfo, analyzeMedicationInteractions } from "./ai-service";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { setupSeoRoutes } from './sitemap-generator';

// Choose the appropriate storage implementation
declare global {
  var useMongoStorage: boolean;
}

// Default to in-memory storage if not set
const dbStorage = global.useMongoStorage ? mongoDBStorage : memStorage;
console.log(`Using ${global.useMongoStorage ? 'MongoDB' : 'in-memory'} storage for database operations`);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Configure multer storage
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Generate a unique filename to avoid collisions
      const uniqueFilename = `${uuidv4()}-${file.originalname.replace(/\s+/g, '-').toLowerCase()}`;
      cb(null, uniqueFilename);
    }
  });
  
  // Create multer instance with file filter for images
  const upload = multer({
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed') as any);
      }
    }
  });
  
  // Serve uploads directory statically
  app.use('/uploads', express.static(uploadsDir));
  
  // Add image upload endpoint
  app.post('/api/upload-image', upload.single('file'), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Generate URL for the uploaded file
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Return the URL to the client
      res.status(201).json({ 
        imageUrl,
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });
  
  // Add error handling middleware for multer
  app.use((err: any, req: Request, res: Response, next: Function) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds the 5MB limit' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }
    next();
  });
  // Data will be imported from CSV in index.ts
  // Get all categories
  app.get("/api/categories", async (_req: Request, res: Response) => {
    const categories = await dbStorage.getCategories();
    res.json(categories);
  });
  
  // Get category by ID
  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const category = await dbStorage.getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  });
  
  // Get all products
  app.get("/api/products", async (_req: Request, res: Response) => {
    const products = await dbStorage.getProducts();
    res.json(products);
  });
  
  // Get products by category
  app.get("/api/products/category/:categoryId", async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    const products = await dbStorage.getProductsByCategory(categoryId);
    res.json(products);
  });
  
  // Get featured products
  app.get("/api/products/featured", async (_req: Request, res: Response) => {
    const products = await dbStorage.getFeaturedProducts();
    res.json(products);
  });
  
  // Get product by ID
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const product = await dbStorage.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  });
  
  // Get cart items for a user
  app.get("/api/cart/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const cartItems = await dbStorage.getCartItemWithProductDetails(userId);
    
    // Add debug information
    console.log(`Fetching cart for userId: ${userId}, found ${cartItems.length} items`);
    
    res.json(cartItems);
  });
  
  // Test cart transfer endpoint - for debugging only
  app.post("/api/cart/transfer", async (req: Request, res: Response) => {
    const { fromUserId, toUserId } = req.body;
    
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ error: "Both fromUserId and toUserId are required" });
    }
    
    try {
      // Get cart before transfer
      const beforeFromCart = await dbStorage.getCartItems(fromUserId);
      const beforeToCart = await dbStorage.getCartItems(toUserId);
      
      // Perform the transfer - this function needs to be implemented in both storage types
      // For now just copy from one user to another
      let success = false;
      
      if (beforeFromCart.length > 0) {
        // Copy all items from fromUser to toUser
        for (const item of beforeFromCart) {
          await dbStorage.addToCart({
            userId: toUserId,
            productId: item.productId,
            quantity: item.quantity
          });
        }
        
        // Clear the fromUser's cart
        await dbStorage.clearCart(fromUserId);
        success = true;
      }
      
      // Get cart after transfer
      const afterFromCart = await dbStorage.getCartItems(fromUserId);
      const afterToCart = await dbStorage.getCartItems(toUserId);
      
      res.json({
        success,
        before: {
          fromCart: beforeFromCart,
          toCart: beforeToCart
        },
        after: {
          fromCart: afterFromCart,
          toCart: afterToCart
        }
      });
    } catch (error) {
      console.error("Cart transfer error:", error);
      res.status(500).json({ error: "Failed to transfer cart items" });
    }
  });
  
  // Create an order from cart items
  app.post("/api/cart-to-order", async (req: Request, res: Response) => {
    const { userId, shippingAddress, paymentMethod } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    try {
      // Get the cart items with product details
      const cartItems = await dbStorage.getCartItemWithProductDetails(userId);
      
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      // Calculate total amount
      const totalAmount = cartItems.reduce((total, item) => {
        const itemPrice = item.product.discountedPrice || item.product.price;
        return total + (itemPrice * item.quantity);
      }, 0);
      
      // Create a new order
      const newOrder = await dbStorage.createOrder({
        userId: userId,
        orderDate: new Date(),
        status: "pending",
        totalAmount: totalAmount,
        shippingAddress: shippingAddress || "Default Shipping Address",
        paymentMethod: paymentMethod || "credit_card",
        trackingNumber: `TRK${Math.floor(Math.random() * 1000000)}`
      });
      
      // Add the order items
      for (const item of cartItems) {
        await dbStorage.createOrderItem({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.discountedPrice || item.product.price
        });
      }
      
      // Clear the cart after creating the order
      await dbStorage.clearCart(userId);
      
      res.status(201).json({ 
        message: "Order created successfully",
        order: newOrder
      });
    } catch (error) {
      console.error("Failed to create order from cart:", error);
      res.status(500).json({ error: "Failed to create order from cart" });
    }
  });
  
  // Add item to cart
  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      const cartItem = insertCartItemSchema.parse(req.body);
      
      // Check if user is logged in via session
      const userSession = req.session as any;
      if (userSession && userSession.user) {
        // If logged in, make sure to use the session user ID
        cartItem.userId = userSession.user.id;
      }
      
      const newCartItem = await dbStorage.addToCart(cartItem);
      res.status(201).json(newCartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  
  // Update cart item quantity
  app.put("/api/cart/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { quantity } = req.body;
    
    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }
    
    const updatedItem = await dbStorage.updateCartItem(id, quantity);
    
    if (!updatedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    res.json(updatedItem);
  });
  
  // Remove item from cart
  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await dbStorage.removeFromCart(id);
    
    if (!success) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    res.status(204).send();
  });
  
  // Clear user's cart
  app.delete("/api/cart/user/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    await dbStorage.clearCart(userId);
    res.status(204).send();
  });
  
  // Get all articles
  app.get("/api/articles", async (_req: Request, res: Response) => {
    const articles = await dbStorage.getArticles();
    res.json(articles);
  });
  
  // Get all testimonials
  app.get("/api/testimonials", async (_req: Request, res: Response) => {
    const testimonials = await dbStorage.getTestimonials();
    res.json(testimonials);
  });
  
  // Get all lab tests
  app.get("/api/lab-tests", async (_req: Request, res: Response) => {
    const labTests = await dbStorage.getLabTests();
    res.json(labTests);
  });
  
  // Get all health tips
  app.get("/api/health-tips", async (_req: Request, res: Response) => {
    try {
      const healthTips = await dbStorage.getHealthTips();
      res.json(healthTips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch health tips" });
    }
  });
  
  // Get random health tip
  app.get("/api/health-tips/random", async (_req: Request, res: Response) => {
    try {
      const healthTip = await dbStorage.getRandomHealthTip();
      if (!healthTip) {
        return res.status(404).json({ error: "No health tips found" });
      }
      res.json(healthTip);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch random health tip" });
    }
  });
  
  // Get health tip by ID
  app.get("/api/health-tips/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      const healthTip = await dbStorage.getHealthTipById(id);
      if (!healthTip) {
        return res.status(404).json({ error: "Health tip not found" });
      }
      
      res.json(healthTip);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch health tip" });
    }
  });
  
  // User registration
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const { tempUserId, ...userData } = req.body;
      const validUserData = insertUserSchema.parse(userData);
      
      // Check if user with the username already exists
      const existingUser = await dbStorage.getUserByUsername(validUserData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const newUser = await dbStorage.createUser(validUserData);
      
      // Set user in session
      (req.session as any).user = newUser;
      
      // Transfer cart items from temp user to the newly registered user
      if (tempUserId && tempUserId !== newUser.id) {
        console.log(`Transferring cart items from temp user ${tempUserId} to new user ${newUser.id}`);
        try {
          await dbStorage.transferCartItems(tempUserId, newUser.id);
        } catch (err) {
          console.error("Error transferring cart items during registration:", err);
        }
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  // User login (simple implementation without actual authentication)
  app.post("/api/login", async (req: Request, res: Response) => {
    const { username, password, tempUserId } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await dbStorage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Set user in session
    (req.session as any).user = user;
    
    // Transfer cart items from temp user to authenticated user
    if (tempUserId && tempUserId !== user.id) {
      console.log(`Transferring cart items from temp user ${tempUserId} to user ${user.id}`);
      try {
        await dbStorage.transferCartItems(tempUserId, user.id);
      } catch (err) {
        console.error("Error transferring cart items:", err);
      }
    }
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // AI Healthcare Assistant endpoints
  
  // Process health query
  app.post("/api/ai/health-query", async (req: Request, res: Response) => {
    try {
      const { query, messageHistory } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Valid query string is required" });
      }
      
      const response = await processHealthQuery(query, messageHistory || []);
      res.json({ response });
    } catch (error) {
      console.error("Error processing health query:", error);
      res.status(500).json({ error: "Failed to process health query" });
    }
  });
  
  // Get medication information
  app.get("/api/ai/medication/:name", async (req: Request, res: Response) => {
    try {
      const medicationName = req.params.name;
      
      if (!medicationName) {
        return res.status(400).json({ error: "Medication name is required" });
      }
      
      const medicationInfo = await getMedicationInfo(medicationName);
      
      if (!medicationInfo) {
        return res.status(404).json({ error: "Could not retrieve information for this medication" });
      }
      
      res.json(medicationInfo);
    } catch (error) {
      console.error("Error getting medication information:", error);
      res.status(500).json({ error: "Failed to get medication information" });
    }
  });
  
  // Analyze medication interactions
  app.post("/api/ai/medications/interactions", async (req: Request, res: Response) => {
    try {
      const { medications } = req.body;
      
      if (!Array.isArray(medications) || medications.length < 2) {
        return res.status(400).json({ error: "At least two medication names are required" });
      }
      
      const interactions = await analyzeMedicationInteractions(medications);
      res.json(interactions);
    } catch (error) {
      console.error("Error analyzing medication interactions:", error);
      res.status(500).json({ error: "Failed to analyze medication interactions" });
    }
  });

  // Pincode lookup endpoint
  app.get("/api/pincode/:pincode", async (req: Request, res: Response) => {
    try {
      const pincode = req.params.pincode;
      
      if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
        return res.status(400).json({ error: "Invalid pincode format. Must be a 6-digit number." });
      }
      
      // Try to get from both MongoDB and in-memory storage
      try {
        // Try MongoDB first using Mongoose
        const mongoose = await import('mongoose');
        const { Pincode } = await import('./models');
        
        if (mongoose.connection.readyState === 1) {  // Connected
          const pincodeData = await Pincode.findOne({ pincode });
          
          if (pincodeData) {
            return res.json({
              pincode: pincodeData.pincode,
              city: pincodeData.officename,
              district: pincodeData.district,
              state: pincodeData.statename,
              deliveryAvailable: pincodeData.delivery === 'Delivery'
            });
          }
        }
      } catch (error) {
        console.error("MongoDB pincode lookup failed:", error);
        // Continue to in-memory fallback
      }
      
      // Fallback to in-memory search through CSV sample
      try {
        const fs = await import('fs');
        const path = await import('path');
        const csvParser = await import('csv-parser');
        
        const csvFilePath = path.default.join(process.cwd(), 'attached_assets', 'pincode.csv');
        
        if (!fs.default.existsSync(csvFilePath)) {
          return res.status(404).json({ error: "Pincode database not available" });
        }
        
        let found = false;
        
        return new Promise<void>((resolve, reject) => {
          fs.default.createReadStream(csvFilePath)
            .pipe(csvParser.default())
            .on('data', (data) => {
              if (data.pincode === pincode) {
                found = true;
                res.json({
                  pincode: data.pincode,
                  city: data.officename,
                  district: data.district,
                  state: data.statename,
                  deliveryAvailable: data.delivery === 'Delivery'
                });
                resolve();
              }
            })
            .on('end', () => {
              if (!found) {
                res.status(404).json({ error: "Pincode not found" });
              }
              resolve();
            })
            .on('error', (error) => {
              console.error("CSV parsing error:", error);
              reject(error);
            });
        });
      } catch (error) {
        console.error("In-memory pincode lookup failed:", error);
        return res.status(500).json({ error: "Failed to lookup pincode" });
      }
    } catch (error) {
      console.error("Pincode lookup error:", error);
      res.status(500).json({ error: "Failed to lookup pincode" });
    }
  });
  
  // Product search endpoint
  app.get("/api/products/search", async (req: Request, res: Response) => {
    try {
      const { query, limit = 10, page = 1 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      // Try to search in MongoDB first using text index
      try {
        const mongoose = await import('mongoose');
        const { Product } = await import('./models');
        
        if (mongoose.connection.readyState === 1) {  // Connected
          const skip = (Number(page) - 1) * Number(limit);
          
          const products = await Product.find(
            { $text: { $search: query } },
            { score: { $meta: "textScore" } }
          )
          .sort({ score: { $meta: "textScore" } })
          .skip(skip)
          .limit(Number(limit));
          
          const total = await Product.countDocuments({ $text: { $search: query } });
          
          return res.json({
            products,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          });
        }
      } catch (error) {
        console.error("MongoDB search failed:", error);
        // Continue to in-memory fallback
      }
      
      // Fallback to in-memory search
      const searchQuery = query.toLowerCase();
      const allProducts = await dbStorage.getProducts();
      
      const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery) ||
        (product.description && product.description.toLowerCase().includes(searchQuery)) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery))
      );
      
      const limitNum = Number(limit);
      const pageNum = Number(page);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return res.json({
        products: paginatedProducts,
        pagination: {
          total: filteredProducts.length,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(filteredProducts.length / limitNum)
        }
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search products" });
    }
  });
  
  // Real-time medicine search endpoint
  app.get("/api/medicine/search", async (req: Request, res: Response) => {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const query = q.toLowerCase();
      
      // Fallback to in-memory search
      const allProducts = await dbStorage.getProducts();
      
      const filteredProducts = allProducts.filter(product => {
        // Always check basic fields that are guaranteed to exist
        const nameMatch = product.name.toLowerCase().includes(query);
        const brandMatch = product.brand ? product.brand.toLowerCase().includes(query) : false;
        const descriptionMatch = product.description ? product.description.toLowerCase().includes(query) : false;
        
        // Handle additional properties safely using type assertion
        const productWithExtras = product as any;
        const compositionMatch = productWithExtras.composition ? 
          productWithExtras.composition.toLowerCase().includes(query) : false;
        const manufacturerMatch = productWithExtras.manufacturer ? 
          productWithExtras.manufacturer.toLowerCase().includes(query) : false;
          
        return nameMatch || brandMatch || descriptionMatch || compositionMatch || manufacturerMatch;
      });
      
      return res.json(filteredProducts.slice(0, Number(limit)));
    } catch (error) {
      console.error("Medicine search error:", error);
      res.status(500).json({ error: "Error searching medicines" });
    }
  });
  
  // Medicine substitutes endpoint
  app.get("/api/medicine/substitutes", async (req: Request, res: Response) => {
    try {
      const { name, composition, excludeId } = req.query;
      
      if ((!name && !composition) || (name && typeof name !== 'string') || (composition && typeof composition !== 'string')) {
        return res.status(400).json({ error: "Either name or composition is required" });
      }
      
      const excludedId = excludeId ? parseInt(excludeId as string) : undefined;
      const allProducts = await dbStorage.getProducts();
      let substitutes = [];
      
      if (composition) {
        // If we have composition, use that for a more accurate match
        const compositionLower = composition.toLowerCase();
        substitutes = allProducts.filter(product => {
          // First check if product matches the excluded ID
          if (product.id === excludedId) return false;
          
          // Use type assertion to safely access composition
          const productExt = product as any;
          return productExt.composition && 
                 productExt.composition.toLowerCase().includes(compositionLower);
        });
      } else if (name) {
        // Otherwise try to match by name, extracting the likely generic name
        // Heuristic: Try to get the first word which might be the generic name
        const nameParts = name.split(' ');
        const likelyGenericName = nameParts[0].toLowerCase();
        
        substitutes = allProducts.filter(product => 
          product.id !== excludedId && 
          product.name.toLowerCase().includes(likelyGenericName)
        );
      }
      
      // Sort substitutes by price (lowest first)
      substitutes.sort((a, b) => {
        const priceA = a.discountedPrice || a.price;
        const priceB = b.discountedPrice || b.price;
        return priceA - priceB;
      });
      
      res.json(substitutes.slice(0, 10));
    } catch (error) {
      console.error("Substitutes search error:", error);
      res.status(500).json({ error: "Error finding substitute medicines" });
    }
  });
  
  // Admin dashboard endpoints
  app.post("/api/admin/products", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is an admin
      const userSession = req.session as any;
      if (!userSession || !userSession.user || userSession.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized. Admin access required." });
      }
      
      const productData = req.body;
      
      // Try to add to MongoDB first
      try {
        const mongoose = await import('mongoose');
        const { Product } = await import('./models');
        
        if (mongoose.connection.readyState === 1) {  // Connected
          const newProduct = await Product.create(productData);
          return res.status(201).json(newProduct);
        }
      } catch (error) {
        console.error("MongoDB product creation failed:", error);
        // Continue to in-memory fallback
      }
      
      // Fallback to in-memory product creation
      const newProduct = await dbStorage.createProduct(productData);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Admin product creation error:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });
  
  // Get all user data (admin only)
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is an admin
      const userSession = req.session as any;
      if (!userSession || !userSession.user || userSession.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized. Admin access required." });
      }
      
      // Try MongoDB first
      try {
        const mongoose = await import('mongoose');
        const { User } = await import('./models');
        
        if (mongoose.connection.readyState === 1) {  // Connected
          const users = await User.find({}, { password: 0 });  // Exclude passwords
          return res.json(users);
        }
      } catch (error) {
        console.error("MongoDB users fetch failed:", error);
        // Continue to in-memory fallback
      }
      
      // Fallback to in-memory - get all users
      const allUsers = await dbStorage.getUsers();
      // Filter to admin users only
      const users = allUsers.filter((user) => user.role === 'admin');
      // Remove passwords before sending
      const safeUsers = users.map((user) => {
        // @ts-ignore - We know password exists but we're removing it
        const { password, ...rest } = user;
        return rest;
      });
      res.json(safeUsers);
    } catch (error) {
      console.error("Admin users fetch error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // ===== Order Management Routes =====
  
  // Get all orders
  app.get("/api/orders", async (_req: Request, res: Response) => {
    try {
      const orders = await dbStorage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  // Get order by ID
  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const order = await dbStorage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  
  // Get orders by user ID
  app.get("/api/orders/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      let orders = await dbStorage.getOrdersByUser(userId);
      
      // Enhance orders with items
      const enhancedOrders = await Promise.all(orders.map(async (order) => {
        const orderItems = await dbStorage.getOrderItems(order.id);
        
        // For each order item, get product details
        const enhancedItems = await Promise.all(orderItems.map(async (item) => {
          const product = await dbStorage.getProductById(item.productId);
          return {
            ...item,
            product
          };
        }));
        
        // Return a new object with items added
        return {
          ...order,
          items: enhancedItems
        };
      }));
      
      res.json(enhancedOrders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ message: "Failed to fetch user orders" });
    }
  });
  
  // Get order items for a specific order
  app.get("/api/orders/:id/items", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const orderItems = await dbStorage.getOrderItems(id);
      
      // If we want to include product details with each order item
      const enhancedItems = [];
      for (const item of orderItems) {
        const product = await dbStorage.getProductById(item.productId);
        enhancedItems.push({
          ...item,
          product
        });
      }
      
      res.json(enhancedItems);
    } catch (error) {
      console.error('Error fetching order items:', error);
      res.status(500).json({ message: "Failed to fetch order items" });
    }
  });
  
  // Create a new order
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { userId, shippingAddress, totalAmount, items, paymentMethod } = req.body;
      
      // Create the order
      const order = await dbStorage.createOrder({
        userId,
        shippingAddress,
        totalAmount,
        paymentMethod: paymentMethod || 'credit_card',
        status: 'processing',
        orderDate: new Date()
      });
      
      // Create order items
      for (const item of items) {
        await dbStorage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
      }
      
      // Clear the user's cart after successful order
      await dbStorage.clearCart(userId);
      
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  // Update order status
  app.patch("/api/orders/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedOrder = await dbStorage.updateOrderStatus(id, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
