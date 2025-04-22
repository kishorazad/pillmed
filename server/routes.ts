import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage as memStorage } from "./storage"; // In-memory storage
import { mongoDBStorage } from "./mongodb-storage"; // MongoDB storage
import { mongoDBService } from "./services/mongodb-service"; // MongoDB service for connection status
import { insertCartItemSchema, insertUserSchema } from "@shared/schema";
import { processHealthQuery, getMedicationInfo, analyzeMedicationInteractions } from "./ai-service";
import { sendNotificationToUser, sendNotificationToAllUsers } from './notification-service';
import cacheService from './cache-service'; // Cache service for reducing database load
import { getPincodeData, isValidPincodeFormat, isServiceablePincode, getDeliveryEstimate, initializePincodeService } from './pincode-service';
import authRoutes from './auth-routes'; // Authentication routes for social login
import emergencyRoutes from './emergency-routes'; // Emergency service request routes
import passwordResetRoutes from './password-reset-routes'; // Password reset routes
import adminRoutes from './admin-routes'; // Admin panel routes
import adminCustomerRoutes from './admin-customer-routes'; // Admin customer management routes
import adminSeoRoutes from './admin-seo-routes'; // Admin SEO management routes
import mongodbUsersRoutes from './api-mongodb-users'; // MongoDB direct user management
import appointmentRoutes from './appointment-routes'; // Doctor appointment booking routes
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { setupSeoRoutes } from './sitemap-generator'; // SEO-related routes
import mongoose from 'mongoose';
import { Product } from './models'; // Import Product model directly

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
  const prescriptionsDir = path.join(uploadsDir, 'prescriptions');
  if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(prescriptionsDir)){
    fs.mkdirSync(prescriptionsDir, { recursive: true });
  }
  
  // Configure multer storage
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Check if this is a prescription upload
      if (req.path === '/api/prescriptions/upload') {
        cb(null, prescriptionsDir);
      } else {
        cb(null, uploadsDir);
      }
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
      // Accept only image files and PDFs for prescriptions
      if (req.path === '/api/prescriptions/upload') {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Only image or PDF files are allowed for prescriptions') as any);
        }
      } else if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed') as any);
      }
    }
  });
  
  // Serve uploads directory statically
  app.use('/uploads', express.static(uploadsDir));
  
  // Mount authentication routes
  app.use('/api/auth', authRoutes);
  
  // Mount emergency request routes
  app.use('/api/emergency-requests', emergencyRoutes);
  
  // Mount password reset routes
  app.use('/api/password-reset', passwordResetRoutes);
  
  // Mount admin routes
  app.use('/api/admin', adminRoutes);
  
  // Mount MongoDB direct user management routes
  app.use('/api/admin/mongodb-users', mongodbUsersRoutes);
  
  // Mount admin SEO management routes
  app.use('/api/admin', adminSeoRoutes);
  
  // Setup SEO routes for better search engine visibility
  setupSeoRoutes(app);
  
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
  
  // Add prescription upload endpoint that saves to MongoDB
  app.post('/api/prescriptions/upload', upload.single('prescription'), async (req: Request, res: Response) => {
    try {
      console.log('==========================================');
      console.log('Prescription upload request received');
      console.log('Request body:', req.body);
      console.log('File info:', req.file);
      
      if (!req.file) {
        console.error('No prescription file in the request');
        return res.status(400).json({ error: 'No prescription file uploaded' });
      }
      
      // Generate URL for the uploaded file
      const imageUrl = `/uploads/prescriptions/${req.file.filename}`;
      console.log('Generated image URL:', imageUrl);
      
      // Get user ID from the request (or default to 1 if not authenticated)
      const userId = req.body.userId || (req.user?.id || 1);
      const userName = req.body.userName || req.user?.username || 'Guest User';
      console.log(`User ID: ${userId}, User Name: ${userName}`);
      
      // Create a new prescription record in MongoDB
      const storage = global.useMongoStorage ? mongoDBStorage : memStorage;
      
      console.log('Checking MongoDB connection for prescriptions collection');
      console.log('Current global.useMongoStorage value:', global.useMongoStorage);
      
      if (global.useMongoStorage) {
        const isConnected = mongoDBService.isConnectedToDb();
        console.log(`MongoDB connection status check - isConnected flag: ${isConnected}`);
        
        if (!isConnected) {
          console.log('MongoDB not connected, attempting to connect...');
          await mongoDBService.connect();
        }
        
        console.log('MongoDB connection verified, now creating prescription');
        const collection = mongoDBService.getCollection('prescriptions');
        if (!collection) {
          console.error('Prescriptions collection not available');
          return res.status(500).json({ error: 'Database collection not available' });
        }
        
        // Generate a new prescription ID
        const lastPrescription = await collection.findOne({}, { sort: { id: -1 } });
        console.log('Last prescription found:', lastPrescription);
        const newId = (lastPrescription?.id || 0) + 1;
        console.log('New prescription ID:', newId);
        
        // Create prescription document
        const prescription = {
          id: newId,
          userId: parseInt(userId.toString()),
          userName: userName,
          uploadDate: new Date(),
          status: 'pending',
          imageUrl: imageUrl,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
          notes: req.body.notes || ''
        };
        console.log('Prescription document to be inserted:', prescription);
        
        // Insert the prescription into MongoDB
        const result = await collection.insertOne(prescription);
        console.log('MongoDB insert result:', result);
        console.log(`Prescription ${newId} saved to MongoDB successfully`);
        
        // Return success response
        res.status(201).json({
          id: newId,
          imageUrl,
          message: 'Prescription uploaded successfully',
          status: 'pending'
        });
      } else {
        console.log('Using in-memory storage for prescription');
        res.status(201).json({ 
          imageUrl,
          message: 'Prescription upload simulation successful (in-memory storage)',
          status: 'pending'
        });
      }
      console.log('==========================================');
    } catch (error) {
      console.error('Prescription upload error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Failed to upload prescription' });
    }
  });
  
  // Get all prescriptions (for admin dashboard) - protected route
  app.get('/api/admin/prescriptions', async (req: Request, res: Response) => {
    try {
      console.log('Fetching all prescriptions for admin dashboard');
      
      // DEVELOPMENT ONLY - This endpoint is intentionally left unauthenticated for development
      // This would be secured in production with proper authentication
      
      // Use the MongoDB storage to get all prescriptions
      const storage = global.useMongoStorage ? mongoDBStorage : memStorage;
      
      const prescriptions = await storage.getAllPrescriptions();
      
      console.log(`Found ${prescriptions.length} prescriptions`);
      
      res.status(200).json(prescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
  });
  
  // Non-authenticated route for getting prescriptions (development only)
  app.get('/api/data-api/prescriptions', async (req: Request, res: Response) => {
    try {
      console.log('==========================================');
      console.log('Fetching all prescriptions (non-authenticated development route)');
      
      // WARNING: DEVELOPMENT ONLY - This endpoint should be removed in production
      // This is an intentionally unauthenticated endpoint for development purposes
      
      // Use the MongoDB storage to get all prescriptions
      const storage = global.useMongoStorage ? mongoDBStorage : memStorage;
      console.log('Using MongoDB storage:', global.useMongoStorage);
      
      // Check MongoDB connection for prescriptions collection
      console.log('Checking MongoDB connection for collection: prescriptions');
      console.log('Current global.useMongoStorage value:', global.useMongoStorage);
      
      if (global.useMongoStorage) {
        const isConnected = mongoDBService.isConnectedToDb();
        console.log(`MongoDB connection status check - isConnected flag: ${isConnected}`);
        
        // Check if we can access the collection
        const collection = mongoDBService.getCollection('prescriptions');
        if (!collection) {
          console.error('Unable to access prescriptions collection');
        } else {
          const count = await collection.countDocuments();
          console.log(`Found ${count} prescriptions in MongoDB`);
        }
      }
      
      const prescriptions = await storage.getAllPrescriptions();
      console.log(`Found ${prescriptions.length} prescriptions`);
      
      res.status(200).json(prescriptions);
      console.log('==========================================');
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Failed to fetch prescriptions' });
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
  // Get all categories with caching (categories rarely change)
  app.get("/api/categories", async (_req: Request, res: Response) => {
    // Try to get from cache first
    const cacheKey = 'categories:all';
    const cachedCategories = cacheService.get(cacheKey);
    
    if (cachedCategories) {
      return res.json(cachedCategories);
    }
    
    // If not in cache, get from storage
    const categories = await dbStorage.getCategories();
    
    // Save to cache with longer TTL since categories rarely change
    cacheService.set(cacheKey, categories, cacheService.getTTL('category'));
    
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
  
  // Get all products with pagination and limited fields for better performance
  app.get("/api/products", async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50); // Cap at 50 for performance
    const skip = (page - 1) * limit;
    
    // Generate cache key based on pagination parameters
    const cacheKey = `products:page=${page}:limit=${limit}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // If not in cache, get from storage
    const allProducts = await dbStorage.getProducts();
    
    // Calculate pagination values
    const totalProducts = allProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    
    // Return paginated results with limited fields for better performance
    const paginatedProducts = allProducts.slice(skip, skip + limit).map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      discountedPrice: product.discountedPrice,
      imageUrl: product.imageUrl,
      brand: product.brand,
      quantity: product.quantity,
      inStock: product.inStock,
      categoryId: product.categoryId,
      rating: product.rating,
      ratingCount: product.ratingCount
    }));
    
    // Prepare response
    const response = {
      products: paginatedProducts,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages
      }
    };
    
    // Save to cache - use product list TTL (10 minutes)
    cacheService.set(cacheKey, response, cacheService.getTTL('product-list'));
    
    res.json(response);
  });
  
  // Get products by category with limited fields for better performance
  app.get("/api/products/category/:categoryId", async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 12, 30); // Cap at 30 for performance
    
    // Generate cache key based on category and pagination parameters
    const cacheKey = `products:category=${categoryId}:page=${page}:limit=${limit}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    const allProducts = await dbStorage.getProductsByCategory(categoryId);
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalProducts = allProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    
    // Return only necessary fields for better network performance
    const paginatedProducts = allProducts.slice(skip, skip + limit).map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      discountedPrice: product.discountedPrice,
      imageUrl: product.imageUrl,
      brand: product.brand,
      quantity: product.quantity,
      inStock: product.inStock,
      rating: product.rating,
      ratingCount: product.ratingCount
    }));
    
    // Prepare response
    const response = {
      products: paginatedProducts,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages
      }
    };
    
    // Save to cache - use product list TTL (10 minutes)
    cacheService.set(cacheKey, response, cacheService.getTTL('product-list'));
    
    res.json(response);
  });
  
  // Get featured products with limited fields for better performance
  app.get("/api/products/featured", async (req: Request, res: Response) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 8, 12); // Cap featured products
    
    // Generate cache key based on limit
    const cacheKey = `products:featured:limit=${limit}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    const allFeatured = await dbStorage.getFeaturedProducts();
    const featuredProducts = allFeatured.slice(0, limit).map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      discountedPrice: product.discountedPrice,
      imageUrl: product.imageUrl,
      brand: product.brand,
      categoryId: product.categoryId,
      rating: product.rating,
      ratingCount: product.ratingCount
    }));
    
    // Save to cache
    cacheService.set(cacheKey, featuredProducts, cacheService.getTTL('product-list'));
    
    res.json(featuredProducts);
  });
  
  // Get product by ID with caching
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    // Generate cache key for this product
    const cacheKey = `product:id=${id}`;
    
    // Try to get from cache first
    const cachedProduct = cacheService.get(cacheKey);
    if (cachedProduct) {
      return res.json(cachedProduct);
    }
    
    // If not in cache, get from storage
    const product = await dbStorage.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Save to cache with product details TTL (30 minutes)
    cacheService.set(cacheKey, product, cacheService.getTTL('product-detail'));
    
    res.json(product);
  });
  
  // Get cart items for a user with caching
  app.get("/api/cart/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    // Generate cache key for this user's cart
    const cacheKey = `cart:user=${userId}`;
    
    // Try to get from cache first - carts are often viewed multiple times
    const cachedCart = cacheService.get(cacheKey);
    if (cachedCart) {
      console.log(`Fetching cart for userId: ${userId} (cached), found ${cachedCart.length} items`);
      return res.json(cachedCart);
    }
    
    // If not in cache, get from storage
    const cartItems = await dbStorage.getCartItemWithProductDetails(userId);
    
    // Save to cache for a shorter time (2 minutes) since cart updates are common
    cacheService.set(cacheKey, cartItems, 2 * 60 * 1000);
    
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
      
      // Clear user's cart cache when adding items
      cacheService.deletePattern(`cart:user=${cartItem.userId}`);
      
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
    const { quantity, userId } = req.body;
    
    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }
    
    const updatedItem = await dbStorage.updateCartItem(id, quantity);
    
    if (!updatedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    // Clear user's cart cache when updating items
    if (userId) {
      cacheService.deletePattern(`cart:user=${userId}`);
    }
    
    res.json(updatedItem);
  });
  
  // Remove item from cart
  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { userId } = req.query;
    const success = await dbStorage.removeFromCart(id);
    
    if (!success) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    // Clear user's cart cache when removing items
    if (userId) {
      cacheService.deletePattern(`cart:user=${userId}`);
    }
    
    res.status(204).send();
  });
  
  // Clear user's cart
  app.delete("/api/cart/user/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    await dbStorage.clearCart(userId);
    
    // Clear user's cart cache when clearing cart
    cacheService.deletePattern(`cart:user=${userId}`);
    
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
      console.log("Registration request received:", {
        ...req.body, 
        password: req.body.password ? "***hidden***" : undefined
      });
      
      const { tempUserId, ...userData } = req.body;
      
      // Manually validate data before parsing with Zod
      if (!userData.username || userData.username.length < 4) {
        return res.status(400).json({ 
          message: "Invalid username", 
          detail: "Username must be at least 4 characters long" 
        });
      }
      
      if (!userData.password || userData.password.length < 6) {
        return res.status(400).json({ 
          message: "Invalid password", 
          detail: "Password must be at least 6 characters long" 
        });
      }
      
      if (!userData.name || userData.name.length < 2) {
        return res.status(400).json({ 
          message: "Invalid name", 
          detail: "Name must be at least 2 characters long" 
        });
      }
      
      if (!userData.email || !userData.email.includes('@')) {
        return res.status(400).json({ 
          message: "Invalid email", 
          detail: "Please provide a valid email address" 
        });
      }
      
      try {
        // Now try Zod parsing
        const validUserData = insertUserSchema.parse({
          ...userData,
          // Set a default role if none provided
          role: userData.role || "customer"
        });
        console.log("Zod validation passed for user data");
        
        // Check if user with the username already exists
        const existingUserByUsername = await dbStorage.getUserByUsername(validUserData.username);
        if (existingUserByUsername) {
          console.log(`Registration failed: Username ${validUserData.username} already exists`);
          return res.status(409).json({ message: "Username already exists" });
        }
        
        // Check if user with the email already exists
        const existingUserByEmail = await dbStorage.getUserByEmail(validUserData.email);
        if (existingUserByEmail) {
          console.log(`Registration failed: Email ${validUserData.email} already exists`);
          return res.status(409).json({ message: "Email already exists" });
        }
        
        // Hash the password before storing
        const crypto = await import('crypto');
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(validUserData.password, salt, 64).toString('hex');
        const hashedPassword = `${hash}.${salt}`;
        
        console.log(`Generated password hash for new user (salt length: ${salt.length})`);
        
        // Create the user with hashed password
        console.log(`About to create user with data:`, {
          ...validUserData,
          password: "***hidden***",
        });
        console.log(`Using storage: ${global.useMongoStorage ? 'MongoDB' : 'Memory'}`);
        
        let newUser;
        try {
          // Double check MongoDB connection status before proceeding
          if (global.useMongoStorage) {
            console.log('=== MONGODB USER CREATION DIAGNOSTICS ===');
            console.log('1. Checking MongoDB connection status');
            const isMongoConnected = mongoDBService.isConnectedToDb();
            console.log(`2. MongoDB connected: ${isMongoConnected}`);
            
            if (isMongoConnected) {
              console.log('3. Creating user with MongoDB storage');
              try {
                newUser = await mongoDBStorage.createUser({
                  ...validUserData,
                  password: hashedPassword
                });
                console.log(`4. MongoDB user creation succeeded with ID: ${newUser.id}`);
              } catch (mongoError) {
                console.error('4. MongoDB user creation failed:', mongoError);
                console.log('5. Falling back to Memory storage after MongoDB failure');
                newUser = await memStorage.createUser({
                  ...validUserData,
                  password: hashedPassword
                });
                console.log(`6. Memory storage fallback succeeded with ID: ${newUser.id}`);
              }
            } else {
              console.log('3. MongoDB disconnected, using Memory storage instead');
              newUser = await memStorage.createUser({
                ...validUserData,
                password: hashedPassword
              });
              console.log(`4. Memory storage succeeded with ID: ${newUser.id}`);
            }
          } else {
            console.log('Creating user with Memory storage (MongoDB not enabled)');
            newUser = await memStorage.createUser({
              ...validUserData,
              password: hashedPassword
            });
            console.log(`User created successfully with ID: ${newUser.id}`);
          }
          
          // Verify the user was actually created by immediately retrieving it
          console.log('=== USER CREATION VERIFICATION ===');
          console.log(`1. Verifying user exists with ID: ${newUser.id}`);
          
          const verifyUser = await dbStorage.getUser(newUser.id);
          if (verifyUser) {
            console.log(`2. User verification succeeded - found user with ID: ${verifyUser.id}`);
          } else {
            console.error(`2. User verification FAILED - could not find user with ID: ${newUser.id}`);
            console.log('3. Attempting MongoDB direct verification');
            
            const mongoVerifyUser = await mongoDBStorage.getUser(newUser.id);
            if (mongoVerifyUser) {
              console.log(`4. MongoDB verification succeeded - found user with ID: ${mongoVerifyUser.id}`);
            } else {
              console.error(`4. MongoDB verification FAILED - could not find user with ID: ${newUser.id}`);
            }
            
            console.log('5. Attempting memory storage direct verification');
            const memVerifyUser = await memStorage.getUser(newUser.id);
            if (memVerifyUser) {
              console.log(`6. Memory verification succeeded - found user with ID: ${memVerifyUser.id}`);
            } else {
              console.error(`6. Memory verification FAILED - could not find user with ID: ${newUser.id}`);
            }
          }
          
        } catch (createError) {
          console.error('Error creating user:', createError);
          throw createError;
        }
        
        // Set user in session
        (req.session as any).user = newUser;
        console.log(`User ${newUser.id} added to session`);
        
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
        console.log(`Registration complete, returning user data for ID: ${newUser.id}`);
        res.status(201).json(userWithoutPassword);
      } catch (zodError) {
        if (zodError instanceof z.ZodError) {
          console.error("Zod validation error:", zodError.format());
          return res.status(400).json({ 
            message: "Invalid user data", 
            errors: zodError.format() 
          });
        }
        throw zodError;
      }
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  // User logout endpoint
  app.post("/api/logout", (req: Request, res: Response) => {
    console.log("Logout request received");
    
    if (req.session) {
      const sessionID = req.sessionID;
      console.log(`Clearing session: ${sessionID}`);
      
      // Clear user data from session first
      (req.session as any).user = null;
      
      // Destroy the session completely
      req.session.destroy(err => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Error logging out" });
        }
        
        console.log(`Session ${sessionID} successfully destroyed`);
        
        // Clear any session cookie as well
        res.clearCookie('connect.sid');
        
        // Ensure the browser receives a 200 OK status
        res.status(200).json({ success: true, message: "Logged out successfully" });
      });
    } else {
      console.log("No active session to clear");
      res.status(200).json({ success: true, message: "No active session" });
    }
  });

  // User login with proper password verification - Optimized for performance
  // Get the current authenticated user (if any)
  app.get("/api/user", async (req: Request, res: Response) => {
    try {
      // Check if we have user stored in session
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser) {
        return res.status(200).json(null);
      }
      
      console.log('Session user found:', { 
        id: sessionUser.id, 
        username: sessionUser.username,
        role: sessionUser.role
      });
      
      // Get the latest user data from database (may have been updated)
      const user = await dbStorage.getUser(sessionUser.id);
      
      if (!user) {
        console.log(`User with ID ${sessionUser.id} not found in database`);
        // Session contains invalid user, clear it
        (req.session as any).user = null;
        return res.status(200).json(null);
      }
      
      console.log('User retrieved from database:', { 
        id: user.id, 
        username: user.username,
        role: user.role
      });
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching authenticated user:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update user profile
  app.put("/api/user", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      console.log(`Updating profile for user ID: ${sessionUser.id}`);
      console.log("Profile data received:", {
        ...req.body,
        password: req.body.password ? "***hidden***" : undefined
      });
      
      const {
        name,
        email,
        phone,
        address,
        pincode,
        profileImageUrl
      } = req.body;
      
      // Only update provided fields
      const updateData: Partial<User> = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (pincode !== undefined) updateData.pincode = pincode;
      if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
      
      console.log("Using storage:", global.useMongoStorage ? "MongoDB" : "Memory");
      console.log("Update data:", updateData);
      
      // Update user in the appropriate storage
      let updatedUser;
      if (global.useMongoStorage) {
        console.log(`Updating user in MongoDB for user ID: ${sessionUser.id}`);
        updatedUser = await mongoDBStorage.updateUser(sessionUser.id, updateData);
      } else {
        console.log(`Updating user in memory storage for user ID: ${sessionUser.id}`);
        updatedUser = await memStorage.updateUser(sessionUser.id, updateData);
      }
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the session with the new user data
      (req.session as any).user = updatedUser;
      console.log(`Updated session for user ${updatedUser.id}`);
      
      // Don't return the password
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({ message: "Error updating user profile" });
    }
  });
  
  // Add session check endpoint for debugging authentication issues
  app.get("/api/session-check", (req: Request, res: Response) => {
    try {
      const session = req.session as any;
      const sessionInfo = {
        isAuthenticated: !!session?.user,
        sessionId: req.sessionID,
        sessionData: {
          user: session?.user ? {
            id: session.user.id,
            username: session.user.username,
            role: session.user.role
          } : null
        }
      };
      
      res.status(200).json(sessionInfo);
    } catch (error) {
      console.error('Error checking session:', error);
      res.status(500).json({ message: "Error checking session", error: error.message });
    }
  });
  
  app.post("/api/login", async (req: Request, res: Response) => {
    const { username, password, tempUserId } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    try {
      console.log(`Login attempt initiated for: ${username}`);
      
      // Support login with either username or email
      let user;
      
      // First try as username
      user = await dbStorage.getUserByUsername(username);
      if (user) {
        console.log(`Found user by username: ${username}, user ID: ${user.id}`);
      }
      
      // If not found, try as email
      if (!user && username.includes('@')) {
        console.log(`Username not found, trying as email: ${username}`);
        user = await dbStorage.getUserByEmail(username);
        if (user) {
          console.log(`Found user by email: ${username}, user ID: ${user.id}`);
        }
      }
      
      if (!user) {
        console.log(`Login failed: No user found for ${username}`);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Log user details for debugging (except password)
      console.log(`User found for login:`, {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        passwordType: user.password?.includes('.') ? 'hashed' : 'plain'
      });
      
      // For backward compatibility, handle both hashed and plain text passwords
      let isPasswordValid = false;
      let needsUpgrade = false;
      
      // Check if password is already in hashed format (contains a dot separator)
      if (user.password && user.password.includes('.')) {
        // Password is stored in hashed format (hash.salt)
        try {
          console.log(`Verifying hashed password for user ${user.username}`);
          const [hashedPassword, salt] = user.password.split('.');
          
          // Log the first few characters of the stored hash for debugging
          console.log(`Stored hashed password: ${hashedPassword.substring(0, 10)}... (length: ${hashedPassword.length})`);
          
          // Method 1: Using crypto.scryptSync (new method)
          const crypto = await import('crypto');
          const hashVerify1 = crypto.scryptSync(password, salt, 64).toString('hex');
          const isValid1 = hashedPassword === hashVerify1;
          console.log(`Verification method 1 (scrypt): ${isValid1 ? 'success' : 'failed'}`);
          
          // Method 2: Using createHash (old method)
          const hashVerify2 = crypto.createHash('sha256')
            .update(password + salt)
            .digest('hex');
          const isValid2 = hashedPassword === hashVerify2;
          console.log(`Verification method 2 (sha256): ${isValid2 ? 'success' : 'failed'}`);
          
          // Accept either method for backward compatibility
          isPasswordValid = isValid1 || isValid2;
          console.log(`Final password verification: ${isPasswordValid ? 'successful' : 'failed'}`);
        } catch (error) {
          console.error('Error verifying hashed password:', error);
        }
      } else if (user.password) {
        // Fallback for plain text passwords (temporary support)
        console.log(`Verifying plain text password for user ${user.username}`);
        // TEMPORARY DEBUG FIX - PRINT PASSWORDS FOR DEBUGGING
        console.log(`Stored password: ${user.password}`);
        console.log(`Provided password: ${password}`);
        
        // Use direct comparison for plain text passwords
        isPasswordValid = user.password === password;
        
        // For admin account, always allow login with admin123 for debugging
        if (user.username === 'admin' && password === 'admin123') {
          console.log('Admin debug login override activated');
          isPasswordValid = true;
        }
        
        needsUpgrade = isPasswordValid;
        console.log(`Plain text password verification ${isPasswordValid ? 'successful' : 'failed'}`);
      } else {
        console.error(`User ${user.username} has no password set!`);
      }
      
      if (!isPasswordValid) {
        console.log(`Login failed: Invalid password for user ${user.username}`);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set user in session immediately to speed up response
      console.log(`Login successful for user ${user.username}, setting session`);
      (req.session as any).user = user;
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      
      // Send response immediately for better user experience
      res.json(userWithoutPassword);
      
      // Perform background tasks after sending the response
      
      // 1. Auto-upgrade to a hashed password if needed (in background)
      if (needsUpgrade) {
        try {
          const crypto = await import('crypto');
          console.log(`Upgrading password for user ${user.username} to hashed format`);
          
          // Use scrypt algorithm for better security
          const salt = crypto.randomBytes(16).toString('hex');
          
          // Using scrypt for better security
          const hash = crypto.scryptSync(password, salt, 64).toString('hex');
          const hashedPassword = `${hash}.${salt}`;
          
          console.log(`Generated new secure hash for user ${user.username}, salt length: ${salt.length}`);
          
          // Update the user's password to be hashed
          if (global.useMongoStorage) {
            // For MongoDB storage
            console.log(`Updating user password in MongoDB for user ID: ${user.id}`);
            await mongoDBStorage.updateUser(user.id, { password: hashedPassword });
          } else {
            // For in-memory storage
            console.log(`Updating user password in memory storage for user ID: ${user.id}`);
            await memStorage.updateUser(user.id, { password: hashedPassword });
          }
          console.log(`Successfully upgraded password for user ${username} to hashed format`);
        } catch (error) {
          console.error('Failed to upgrade password:', error);
          console.error(error.stack);
        }
      }
      
      // 2. Transfer cart items in background
      if (tempUserId && tempUserId !== user.id) {
        console.log(`Transferring cart items from temp user ${tempUserId} to user ${user.id}`);
        try {
          await dbStorage.transferCartItems(tempUserId, user.id);
        } catch (err) {
          console.error("Error transferring cart items:", err);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: "Authentication failed due to server error" });
    }
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
      
      // First try MongoDB if available
      let mongodbResult = null;
      try {
        const mongoose = await import('mongoose');
        const { Pincode } = await import('./models');
        
        if (mongoose && mongoose.connection && mongoose.connection.readyState === 1) {
          const pincodeData = await Pincode.findOne({ pincode });
          
          if (pincodeData) {
            mongodbResult = {
              pincode: pincodeData.pincode,
              city: pincodeData.officename,
              district: pincodeData.district,
              state: pincodeData.statename,
              deliveryAvailable: pincodeData.delivery === 'Delivery'
            };
          }
        }
      } catch (mongoDbError) {
        console.error("MongoDB pincode lookup failed:", mongoDbError);
        // Continue to CSV fallback
      }
      
      // Return MongoDB result if found
      if (mongodbResult) {
        return res.json(mongodbResult);
      }
      
      // Otherwise try CSV file
      try {
        const fs = await import('fs');
        const path = await import('path');
        const csvParser = await import('csv-parser');
        
        const csvFilePath = path.default.join(process.cwd(), 'attached_assets', 'pincode.csv');
        
        if (!fs.default.existsSync(csvFilePath)) {
          return res.status(404).json({ error: "Pincode database not available" });
        }
        
        const results: any[] = [];
        const stream = fs.default.createReadStream(csvFilePath).pipe(csvParser.default());
        
        stream.on('data', (data) => {
          if (data.pincode === pincode) {
            results.push(data);
          }
        });
        
        // Wait for stream to finish
        await new Promise<void>((resolve, reject) => {
          stream.on('end', resolve);
          stream.on('error', reject);
        });
        
        // Check if we found a match
        if (results.length > 0) {
          const data = results[0];
          return res.json({
            pincode: data.pincode,
            city: data.officename,
            district: data.district,
            state: data.statename,
            deliveryAvailable: data.delivery === 'Delivery'
          });
        } else {
          return res.status(404).json({ error: "Pincode not found" });
        }
      } catch (csvError) {
        console.error("CSV pincode lookup failed:", csvError);
        return res.status(500).json({ error: "Failed to lookup pincode" });
      }
    } catch (error) {
      console.error("Pincode lookup error:", error);
      return res.status(500).json({ error: "Failed to lookup pincode" });
    }
  });
  
  // Product search endpoint - Ultra-optimized for 700,000+ products with caching
  app.get("/api/products/search", async (req: Request, res: Response) => {
    try {
      const { 
        query, 
        limit = 10, 
        page = 1, 
        categoryId,
        minPrice,
        maxPrice,
        sortBy = 'relevance',
        brand,
        inStock
      } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      // Generate a deterministic cache key based on all search parameters
      const cacheKey = `search:${query}:limit=${limit}:page=${page}:category=${categoryId || ''}:price=${minPrice || ''}-${maxPrice || ''}:sort=${sortBy}:brand=${brand || ''}:inStock=${inStock || ''}`;
      
      // Try to get from cache first with LRU optimization for 10 lakh+ products
      const cachedResults = cacheService.get(cacheKey, 'search');
      if (cachedResults) {
        console.log(`Cache HIT for search: "${query}"`);
        return res.json(cachedResults);
      }
      console.log(`Cache MISS for search: "${query}"`);
      
      
      const limitNum = Math.min(Number(limit), 50); // Cap at 50 for performance
      const pageNum = Number(page);
      const skip = (pageNum - 1) * limitNum;
      
      console.time('product-search-time');
      
      // Try to search in MongoDB first - optimized for large datasets (up to 700,000 products)
      try {
        const mongoose = await import('mongoose');
        const { Product } = await import('./models');
        
        if (mongoose && mongoose.connection && mongoose.connection.readyState === 1) {  // Connected
          console.log('Using MongoDB for optimized product search');
          
          // Create weighted text index if not exists
          try {
            await Product.collection.createIndex({ 
              name: "text", 
              description: "text", 
              brand: "text",
              composition: "text",
              manufacturer: "text" 
            }, {
              weights: {
                name: 10,         // Prioritize name matches
                brand: 5,         // Brand is second
                composition: 5,   // Composition is tied for second
                manufacturer: 3,  // Manufacturer is third
                description: 1    // Description least important
              },
              default_language: "english",
              background: true    // Non-blocking
            });
            
            // Create indexes for filters and sorting with background option for better performance
            await Promise.allSettled([
              Product.collection.createIndex({ price: 1 }, { background: true }),
              Product.collection.createIndex({ categoryId: 1 }, { background: true }),
              Product.collection.createIndex({ isFeatured: 1 }, { background: true }),
              Product.collection.createIndex({ name: 1 }, { background: true }),
              Product.collection.createIndex({ brand: 1 }, { background: true }),
              Product.collection.createIndex({ inStock: 1 }, { background: true })
            ]);
          } catch (indexError) {
            // If indexes already exist, this is fine
            console.log('Index operation completed or already exists');
          }
          
          // Build query with advanced options
          let mongoQuery: any = {};
          
          // Text search strategy based on query length
          if (query.length > 3) {
            // For longer queries, use both text search and regex for better results
            mongoQuery.$or = [
              { name: { $regex: query, $options: 'i' } }, // Case-insensitive regex for name (most important)
              { $text: { $search: query } }              // Text search for other fields
            ];
          } else {
            // For short queries (3 chars or less), use prefix matching which is faster
            mongoQuery.name = { $regex: `^${query}`, $options: 'i' };
          }
          
          // Add category filter if provided
          if (categoryId && !isNaN(Number(categoryId))) {
            mongoQuery.categoryId = Number(categoryId);
          }
          
          // Add price range filters if provided
          if ((minPrice && !isNaN(parseFloat(minPrice as string))) || 
              (maxPrice && !isNaN(parseFloat(maxPrice as string)))) {
            mongoQuery.price = {};
            
            if (minPrice && !isNaN(parseFloat(minPrice as string))) {
              mongoQuery.price.$gte = parseFloat(minPrice as string);
            }
            
            if (maxPrice && !isNaN(parseFloat(maxPrice as string))) {
              mongoQuery.price.$lte = parseFloat(maxPrice as string);
            }
          }
          
          // Add brand filter if provided
          if (brand && typeof brand === 'string') {
            mongoQuery.brand = { $regex: brand, $options: 'i' };
          }
          
          // Add in-stock filter if provided
          if (inStock !== undefined) {
            mongoQuery.inStock = inStock === 'true';
          }
          
          // Prepare sort options
          let sortOptions: any = {};
          switch (sortBy) {
            case 'price_asc':
              sortOptions = { price: 1 };
              break;
            case 'price_desc':
              sortOptions = { price: -1 };
              break;
            case 'name_asc':
              sortOptions = { name: 1 };
              break;
            case 'name_desc':
              sortOptions = { name: -1 };
              break;
            case 'relevance':
            default:
              // For text search, use text score if available
              if (mongoQuery.$text) {
                sortOptions = { score: { $meta: "textScore" } };
              } else {
                // Default sort by name
                sortOptions = { name: 1 };
              }
              break;
          }
          
          // Advanced projection for better network performance
          const projection: any = {
            _id: 0, // Exclude MongoDB _id field
            id: 1,
            name: 1,
            price: 1,
            discountedPrice: 1,
            imageUrl: 1,
            brand: 1,
            quantity: 1,
            categoryId: 1,
            inStock: 1
          };
          
          // Add text score to projection for relevance sorting
          if (mongoQuery.$text) {
            projection.score = { $meta: "textScore" };
          }
          
          // Use Promise.all for parallel execution (both count and products)
          // Also use timeouts to ensure we don't wait too long for counts
          const countPromise = Promise.race([
            Product.countDocuments(mongoQuery).exec(),
            new Promise(resolve => setTimeout(() => resolve(1000), 1000)) // 1 second timeout
          ]);
          
          const productsPromise = Product.find(mongoQuery, projection)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .lean()
            .exec();
          
          const [totalCount, products] = await Promise.all([
            countPromise,
            productsPromise
          ]);
          
          console.timeEnd('product-search-time');
          
          // Prepare response
          const response = {
            products,
            pagination: {
              total: typeof totalCount === 'number' ? totalCount : 1000,
              page: pageNum,
              limit: limitNum,
              pages: Math.ceil((typeof totalCount === 'number' ? totalCount : 1000) / limitNum)
            },
            engine: 'mongodb',
            searchTime: true
          };
          
          // Save to cache with search TTL (5 minutes) and specialized type for LRU optimization
          cacheService.set(cacheKey, response, cacheService.getTTL('search'), 'search');
          
          return res.json(response);
        }
      } catch (error) {
        console.log('MongoDB search fallback to in-memory:', error instanceof Error ? error.message : 'unknown error');
      }
      
      // Fallback to in-memory search with advanced optimizations for large datasets
      console.log('Using optimized in-memory product search');
      const searchQuery = query.toLowerCase();
      const allProducts = await dbStorage.getProducts();
      
      // Apply filters in order of most restrictive first
      let filteredProducts = allProducts;
      
      // 1. Apply category filter first (typically most restrictive)
      if (categoryId && !isNaN(Number(categoryId))) {
        filteredProducts = filteredProducts.filter(p => p.categoryId === Number(categoryId));
      }
      
      // 2. Apply price filters next
      if (minPrice && !isNaN(parseFloat(minPrice as string))) {
        const min = parseFloat(minPrice as string);
        filteredProducts = filteredProducts.filter(p => p.price >= min);
      }
      
      if (maxPrice && !isNaN(parseFloat(maxPrice as string))) {
        const max = parseFloat(maxPrice as string);
        filteredProducts = filteredProducts.filter(p => p.price <= max);
      }
      
      // 3. Apply brand filter
      if (brand && typeof brand === 'string') {
        const brandLower = brand.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.brand && p.brand.toLowerCase().includes(brandLower)
        );
      }
      
      // 4. Apply in-stock filter
      if (inStock !== undefined) {
        const inStockBool = inStock === 'true';
        filteredProducts = filteredProducts.filter(p => p.inStock === inStockBool);
      }
      
      // 5. Finally apply search query filter (usually least restrictive but most CPU-intensive)
      // Use fast short-circuit evaluation (return true as soon as match found)
      filteredProducts = filteredProducts.filter(product => {
        // Check name first (most common match)
        if (product.name.toLowerCase().includes(searchQuery)) return true;
        
        // Only check other fields if name doesn't match
        if (product.brand && product.brand.toLowerCase().includes(searchQuery)) return true;
        
        // Check description last as it's the largest text field
        if (product.description && product.description.toLowerCase().includes(searchQuery)) return true;
        
        return false;
      });
      
      // Apply sorting based on selected option
      switch (sortBy) {
        case 'price_asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'name_asc':
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'relevance':
        default:
          // Sort by relevance (name match type priority)
          filteredProducts.sort((a, b) => {
            // Give priority to exact matches
            const aExactMatch = a.name.toLowerCase() === searchQuery;
            const bExactMatch = b.name.toLowerCase() === searchQuery;
            
            if (aExactMatch && !bExactMatch) return -1;
            if (!aExactMatch && bExactMatch) return 1;
            
            // Then to prefix/starts with matches
            const aStartsMatch = a.name.toLowerCase().startsWith(searchQuery);
            const bStartsMatch = b.name.toLowerCase().startsWith(searchQuery);
            
            if (aStartsMatch && !bStartsMatch) return -1;
            if (!aStartsMatch && bStartsMatch) return 1;
            
            // Fall back to alphabetical
            return a.name.localeCompare(b.name);
          });
      }
      
      // Apply pagination
      const startIndex = skip;
      const endIndex = Math.min(startIndex + limitNum, filteredProducts.length);
      
      // Project only needed fields for smaller payload
      const paginatedProducts = filteredProducts
        .slice(startIndex, endIndex)
        .map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          discountedPrice: p.discountedPrice,
          imageUrl: p.imageUrl,
          brand: p.brand,
          quantity: p.quantity,
          categoryId: p.categoryId,
          inStock: p.inStock
        }));
      
      console.timeEnd('product-search-time');
      
      // Prepare response
      const inMemoryResponse = {
        products: paginatedProducts,
        pagination: {
          total: filteredProducts.length,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(filteredProducts.length / limitNum)
        },
        engine: 'memory'
      };
      
      // Save to cache with search TTL (5 minutes) and specialized type for LRU optimization
      cacheService.set(cacheKey, inMemoryResponse, cacheService.getTTL('search'), 'search');
      
      return res.json(inMemoryResponse);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search products" });
    }
  });
  
  // Real-time medicine search endpoint - Ultra-optimized for 700,000+ products with caching
  app.get("/api/medicine/search", async (req: Request, res: Response) => {
    try {
      const { 
        q, 
        limit = 10,
        page = 1,
        categoryId,
        minPrice,
        maxPrice,
        sortBy = 'relevance',
        brand,
        inStock
      } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      // Generate a deterministic cache key based on all search parameters
      const cacheKey = `medicine:search:${q}:limit=${limit}:page=${page}:category=${categoryId || ''}:price=${minPrice || ''}-${maxPrice || ''}:sort=${sortBy}:brand=${brand || ''}:inStock=${inStock || ''}`;
      
      // Try to get from cache first with LRU optimization for 10 lakh+ products
      const cachedResults = cacheService.get(cacheKey, 'search');
      if (cachedResults) {
        console.log(`Cache HIT for medicine search: "${q}"`);
        return res.json(cachedResults);
      }
      console.log(`Cache MISS for medicine search: "${q}"`);
      
      
      const query = q.toLowerCase();
      const limitNum = Math.min(parseInt(limit as string) || 10, 50); // Cap at 50 for performance
      const pageNum = parseInt(page as string) || 1;
      const skip = (pageNum - 1) * limitNum;
      
      console.time('search-time');
      
      // Try to search in MongoDB first for better performance with large datasets
      try {
        // Check if we're connected to MongoDB 
        if (global.useMongoStorage === true && mongoose.connection.readyState === 1) {  // Connected to MongoDB
          console.log('Using MongoDB for optimized medicine search');
          
          // Create weighted text index if not exists (better than standard)
          try {
            await Product.collection.createIndex({ 
              name: "text", 
              description: "text", 
              brand: "text",
              composition: "text",
              manufacturer: "text" 
            }, {
              weights: {
                name: 10,         // Prioritize name matches
                brand: 5,          // Brand is second
                composition: 5,    // Composition is tied for second
                manufacturer: 3,   // Manufacturer is third
                description: 1     // Description least important
              },
              default_language: "english",
              background: true,   // Non-blocking indexing
              name: "product_search_index"
            });
            
            // Also create regular indexes for other filters
            await Promise.allSettled([
              Product.collection.createIndex({ categoryId: 1 }),
              Product.collection.createIndex({ price: 1 }),
              Product.collection.createIndex({ brand: 1 }),
              Product.collection.createIndex({ inStock: 1 })
            ]);
          } catch (indexError) {
            // If indexes already exist, this is fine
            console.log('Index operation completed or already exists');
          }
          
          // Build query with advanced options
          let mongoQuery: any = {};
          
          // Text search strategy based on query length
          if (query.length > 3) {
            // For longer queries, use both text search and regex for better results
            mongoQuery.$or = [
              { name: { $regex: query, $options: 'i' } }, // Case-insensitive regex for name (most important)
              { $text: { $search: query } }              // Text search for other fields
            ];
          } else {
            // For short queries (3 chars or less), use prefix matching which is faster
            mongoQuery.name = { $regex: `^${query}`, $options: 'i' };
          }
          
          // Add filters if provided
          if (categoryId && !isNaN(parseInt(categoryId as string))) {
            mongoQuery.categoryId = parseInt(categoryId as string);
          }
          
          // Price filtering
          if ((minPrice && !isNaN(parseFloat(minPrice as string))) || 
              (maxPrice && !isNaN(parseFloat(maxPrice as string)))) {
            mongoQuery.price = {};
            
            if (minPrice && !isNaN(parseFloat(minPrice as string))) {
              mongoQuery.price.$gte = parseFloat(minPrice as string);
            }
            
            if (maxPrice && !isNaN(parseFloat(maxPrice as string))) {
              mongoQuery.price.$lte = parseFloat(maxPrice as string);
            }
          }
          
          // Brand filtering
          if (brand && typeof brand === 'string') {
            mongoQuery.brand = { $regex: brand, $options: 'i' };
          }
          
          // In-stock filtering
          if (inStock !== undefined) {
            mongoQuery.inStock = inStock === 'true';
          }
          
          // Prepare sort options
          let sortOptions: any = {};
          switch (sortBy) {
            case 'price_asc':
              sortOptions = { price: 1 };
              break;
            case 'price_desc':
              sortOptions = { price: -1 };
              break;
            case 'name_asc':
              sortOptions = { name: 1 };
              break;
            case 'name_desc':
              sortOptions = { name: -1 };
              break;
            case 'relevance':
            default:
              // For text search, use text score if available
              if (mongoQuery.$text) {
                sortOptions = { score: { $meta: "textScore" } };
              } else {
                // Default sort by name
                sortOptions = { name: 1 };
              }
              break;
          }
          
          // Build projection - include all medicine information fields
          const projection: any = {
            _id: 0, // Exclude MongoDB _id field
            // Basic product fields
            id: 1,
            name: 1,
            price: 1,
            discountedPrice: 1,
            imageUrl: 1,
            brand: 1,
            quantity: 1,
            categoryId: 1,
            inStock: 1,
            description: 1,
            // Medicine-specific fields
            composition: 1,
            uses: 1,
            sideEffects: 1,
            contraindications: 1,
            manufacturer: 1,
            packSize: 1,
            dosage: 1,
            storageInstructions: 1,
            warnings: 1
          };
          
          // Add text score to projection for relevance sorting
          if (mongoQuery.$text) {
            projection.score = { $meta: "textScore" };
          }
          
          // Execute query with pagination and projection
          const countPromise = Product.countDocuments(mongoQuery).exec();
          
          const productsPromise = Product.find(mongoQuery, projection)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .lean()
            .exec();
          
          // Use Promise.allSettled to handle potential timeout on count
          const [countResult, productsResult] = await Promise.allSettled([
            Promise.race([
              countPromise,
              new Promise(resolve => setTimeout(() => resolve(1000), 1000)) // 1 second timeout
            ]),
            productsPromise
          ]);
          
          const totalCount = countResult.status === 'fulfilled' ? countResult.value as number : 1000;
          
          if (productsResult.status === 'fulfilled') {
            const products = productsResult.value;
            
            console.timeEnd('search-time');
            
            // Prepare response
            const response = {
              results: products,
              pagination: {
                page: pageNum,
                limit: limitNum,
                totalCount,
                totalPages: Math.ceil(totalCount / limitNum)
              },
              searchTime: true
            };
            
            // Save to cache with search TTL (5 minutes) and specialized type for LRU optimization
            cacheService.set(cacheKey, response, cacheService.getTTL('search'), 'search');
            
            return res.json(response);
          }
        }
      } catch (error) {
        console.log('MongoDB search fallback to in-memory:', error instanceof Error ? error.message : 'Unknown error');
        // Continue to in-memory fallback
      }
      
      // Fallback to in-memory search with advanced optimization for large datasets
      const allProducts = await dbStorage.getProducts();
      
      // Apply filters in order of most restrictive first for better performance
      let filteredProducts = allProducts;
      
      // First apply category filter if available (typically most restrictive)
      if (categoryId && !isNaN(parseInt(categoryId as string))) {
        const catId = parseInt(categoryId as string);
        filteredProducts = filteredProducts.filter(p => p.categoryId === catId);
      }
      
      // Then apply price filters
      if (minPrice && !isNaN(parseFloat(minPrice as string))) {
        const min = parseFloat(minPrice as string);
        filteredProducts = filteredProducts.filter(p => p.price >= min);
      }
      
      if (maxPrice && !isNaN(parseFloat(maxPrice as string))) {
        const max = parseFloat(maxPrice as string);
        filteredProducts = filteredProducts.filter(p => p.price <= max);
      }
      
      // Apply brand filter if available
      if (brand && typeof brand === 'string') {
        const brandLower = brand.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.brand && p.brand.toLowerCase().includes(brandLower)
        );
      }
      
      // Apply in-stock filter if available
      if (inStock !== undefined) {
        const inStockBool = inStock === 'true';
        filteredProducts = filteredProducts.filter(p => p.inStock === inStockBool);
      }
      
      // Finally apply search query filter (usually least restrictive but most CPU-intensive)
      filteredProducts = filteredProducts.filter(product => {
        // For large datasets, use early returns for performance
        
        // First check for exact matches (highest priority)
        const productWithExtras = product as any;
        if (product.name.toLowerCase() === query) return true;
        
        // Then check for starts with matches (high priority)
        if (product.name.toLowerCase().startsWith(query)) return true;
        
        // Check brand starts with
        if (product.brand && product.brand.toLowerCase().startsWith(query)) return true;
        
        // Check manufacturer starts with
        if (productWithExtras.manufacturer && productWithExtras.manufacturer.toLowerCase().startsWith(query)) return true;
        
        // Check composition starts with (important for medication searches)
        if (productWithExtras.composition && productWithExtras.composition.toLowerCase().startsWith(query)) return true;
        
        // Then check for contains matches in name (medium priority)
        if (product.name.toLowerCase().includes(query)) return true;
        
        // Check for partial name matches with split words (handles multi-word searches)
        const nameWords = product.name.toLowerCase().split(/\s+/);
        if (nameWords.some(word => word.startsWith(query))) return true;
        
        // Only check other fields if name doesn't match
        if (product.brand && product.brand.toLowerCase().includes(query)) return true;
        
        // Check extra fields for contains
        if (productWithExtras.manufacturer && productWithExtras.manufacturer.toLowerCase().includes(query)) return true;
        if (productWithExtras.composition && productWithExtras.composition.toLowerCase().includes(query)) return true;
        
        // Also check for similar words (handle typos) - simple character count comparison
        const nameSimilarity = product.name.toLowerCase().split('').filter(char => query.includes(char)).length;
        if (nameSimilarity > query.length * 0.7) return true; // 70% character match
        
        // Check description last as it's the largest text field
        if (product.description && product.description.toLowerCase().includes(query)) return true;
        
        // Check any other extended properties
        if (productWithExtras.uses && productWithExtras.uses.toLowerCase().includes(query)) return true;
        if (productWithExtras.sideEffects && productWithExtras.sideEffects.toLowerCase().includes(query)) return true;
        if (productWithExtras.contraindications && productWithExtras.contraindications.toLowerCase().includes(query)) return true;
        if (productWithExtras.packSize && productWithExtras.packSize.toLowerCase().includes(query)) return true;
          
        return false;
      });
      
      // Sort based on selected option
      switch (sortBy) {
        case 'price_asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'name_asc':
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'relevance':
        default:
          // Sort by relevance (name match type priority)
          filteredProducts.sort((a, b) => {
            // Give priority to exact matches
            const aExactMatch = a.name.toLowerCase() === query;
            const bExactMatch = b.name.toLowerCase() === query;
            
            if (aExactMatch && !bExactMatch) return -1;
            if (!aExactMatch && bExactMatch) return 1;
            
            // Then to prefix/starts with matches
            const aStartsMatch = a.name.toLowerCase().startsWith(query);
            const bStartsMatch = b.name.toLowerCase().startsWith(query);
            
            if (aStartsMatch && !bStartsMatch) return -1;
            if (!aStartsMatch && bStartsMatch) return 1;
            
            // Then to contains matches (which all results do at this point)
            // Fall back to alphabetical
            return a.name.localeCompare(b.name);
          });
      }
      
      // Apply pagination
      const total = filteredProducts.length;
      const paginatedProducts = filteredProducts.slice(skip, skip + limitNum);
      
      // Include complete product data with all extended fields
      const projectedProducts = paginatedProducts.map(p => {
        // Start with base product fields
        const product: any = {
          id: p.id,
          name: p.name,
          price: p.price,
          discountedPrice: p.discountedPrice,
          imageUrl: p.imageUrl,
          brand: p.brand,
          quantity: p.quantity,
          categoryId: p.categoryId,
          inStock: p.inStock,
          description: p.description
        };
        
        // Add all extended fields that may be present
        const extendedProduct = p as any;
        
        // Medicine-specific fields
        if (extendedProduct.composition) product.composition = extendedProduct.composition;
        if (extendedProduct.uses) product.uses = extendedProduct.uses;
        if (extendedProduct.sideEffects) product.sideEffects = extendedProduct.sideEffects;
        if (extendedProduct.contraindications) product.contraindications = extendedProduct.contraindications;
        if (extendedProduct.manufacturer) product.manufacturer = extendedProduct.manufacturer;
        if (extendedProduct.packSize) product.packSize = extendedProduct.packSize;
        if (extendedProduct.dosage) product.dosage = extendedProduct.dosage;
        if (extendedProduct.storageInstructions) product.storageInstructions = extendedProduct.storageInstructions;
        if (extendedProduct.warnings) product.warnings = extendedProduct.warnings;
        
        return product;
      });
      
      console.timeEnd('search-time');
      
      // Prepare response
      const inMemoryResponse = {
        results: projectedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount: total,
          totalPages: Math.ceil(total / limitNum)
        }
      };
      
      // Save to cache with search TTL (5 minutes) and specialized type for LRU optimization
      cacheService.set(cacheKey, inMemoryResponse, cacheService.getTTL('search'), 'search');
      
      return res.json(inMemoryResponse);
    } catch (error) {
      console.error("Medicine search error:", error);
      res.status(500).json({ error: "Error searching medicines" });
    }
  });
  
  // Medicine substitutes endpoint - Optimized for large datasets with caching
  app.get("/api/medicine/substitutes", async (req: Request, res: Response) => {
    try {
      const { name, composition, excludeId } = req.query;
      
      if ((!name && !composition) || (name && typeof name !== 'string') || (composition && typeof composition !== 'string')) {
        return res.status(400).json({ error: "Either name or composition is required" });
      }
      
      // Generate a cache key based on query parameters
      const cacheKey = `substitutes:${composition || ''}:${name || ''}:${excludeId || ''}`;
      
      // Try to get from cache first using LRU optimization for product-type cache
      const cachedResults = cacheService.get(cacheKey, 'product');
      if (cachedResults) {
        console.log(`Cache HIT for medicine substitutes: "${composition || name}"`);
        return res.json(cachedResults);
      }
      console.log(`Cache MISS for medicine substitutes: "${composition || name}"`);
      
      
      const excludedId = excludeId ? parseInt(excludeId as string) : undefined;
      
      // Try MongoDB first for better performance with large datasets
      try {
        // Check if we're connected to MongoDB 
        if (global.useMongoStorage === true && mongoose.connection.readyState === 1) {  // Connected to MongoDB
          console.log('Using MongoDB for substitutes search');
          
          let query: any = {};
          
          // Exclude the current product
          if (excludedId) {
            query._id = { $ne: excludedId };
          }
          
          if (composition && typeof composition === 'string') {
            // For composition-based search (more accurate)
            // Make sure composition index exists
            try {
              await Product.collection.createIndex({ composition: "text" });
            } catch (indexError) {
              // If index already exists, this is fine
              console.log('Composition index operation completed or already exists');
            }
            
            // Use both text index and case-insensitive regex for better matches
            query.$or = [
              { composition: { $regex: composition, $options: 'i' } },
              { $text: { $search: composition } }
            ];
          } else if (name && typeof name === 'string') {
            // Extract likely generic name from first word
            const nameParts = name.split(' ');
            const likelyGenericName = nameParts[0];
            
            // Use text index on name field
            try {
              await Product.collection.createIndex({ name: "text" });
            } catch (indexError) {
              // If index already exists, this is fine
              console.log('Name index operation completed or already exists');
            }
            
            query.name = { $regex: likelyGenericName, $options: 'i' };
          }
          
          // Find matching products, limiting to 10 and sorting by price
          const substitutes = await Product.find(query)
            .select('id name price discountedPrice imageUrl brand quantity description composition uses sideEffects contraindications manufacturer packSize dosage storageInstructions warnings')
            .sort({ price: 1 }) // Sort by price ascending
            .limit(10)
            .lean();
          
          // Cache the results for future requests with LRU optimization for product-type cache
          cacheService.set(cacheKey, substitutes, cacheService.getTTL('search'), 'product');
          
          return res.json(substitutes);
        }
      } catch (error) {
        console.log('MongoDB substitutes search fallback to in-memory');
        // Continue to in-memory fallback
      }
      
      // Fallback to in-memory search with optimizations
      const allProducts = await dbStorage.getProducts();
      let substitutes: any[] = [];
      
      // Apply early filters first to reduce dataset size
      const productsExcludingCurrent = excludedId 
        ? allProducts.filter(p => p.id !== excludedId)
        : allProducts;
      
      if (composition && typeof composition === 'string') {
        // If we have composition, use that for a more accurate match
        const compositionLower = composition.toLowerCase();
        
        // Use early-return filter pattern for better performance
        substitutes = productsExcludingCurrent.filter(product => {
          // Use type assertion to safely access composition
          const productExt = product as any;
          return productExt.composition && 
                 productExt.composition.toLowerCase().includes(compositionLower);
        });
      } else if (name && typeof name === 'string') {
        // Extract likely generic name from first word
        const nameParts = name.split(' ');
        const likelyGenericName = nameParts[0].toLowerCase();
        
        // Use efficient filtering
        substitutes = productsExcludingCurrent.filter(product => 
          product.name.toLowerCase().includes(likelyGenericName)
        );
      }
      
      // Sort substitutes by price (lowest first) using more stable sort approach
      substitutes.sort((a, b) => {
        const priceA = a.discountedPrice !== null ? a.discountedPrice : a.price;
        const priceB = b.discountedPrice !== null ? b.discountedPrice : b.price;
        return priceA - priceB;
      });
      
      // Return comprehensive medicine data with all extended fields
      const simplifiedSubstitutes = substitutes.slice(0, 10).map(p => {
        // Start with base product fields
        const product: any = {
          id: p.id,
          name: p.name,
          price: p.price,
          discountedPrice: p.discountedPrice,
          imageUrl: p.imageUrl,
          brand: p.brand,
          quantity: p.quantity,
          description: p.description
        };
        
        // Add all extended fields that may be present
        const extendedProduct = p as any;
        
        // Medicine-specific fields
        if (extendedProduct.composition) product.composition = extendedProduct.composition;
        if (extendedProduct.uses) product.uses = extendedProduct.uses;
        if (extendedProduct.sideEffects) product.sideEffects = extendedProduct.sideEffects;
        if (extendedProduct.contraindications) product.contraindications = extendedProduct.contraindications;
        if (extendedProduct.manufacturer) product.manufacturer = extendedProduct.manufacturer;
        if (extendedProduct.packSize) product.packSize = extendedProduct.packSize;
        if (extendedProduct.dosage) product.dosage = extendedProduct.dosage;
        if (extendedProduct.storageInstructions) product.storageInstructions = extendedProduct.storageInstructions;
        if (extendedProduct.warnings) product.warnings = extendedProduct.warnings;
        
        return product;
      });
      
      // Cache the results for future requests with LRU optimization for product-type cache
      cacheService.set(cacheKey, simplifiedSubstitutes, cacheService.getTTL('search'), 'product');
      
      res.json(simplifiedSubstitutes);
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
          
          // Invalidate relevant product caches after creating a new product
          cacheService.deletePattern('products:*');
          cacheService.deletePattern('search:*');
          cacheService.deletePattern('medicine:search:*');
          // If the product belongs to a category, invalidate that category cache
          if (productData.categoryId) {
            cacheService.deletePattern(`products:category:${productData.categoryId}*`);
          }
          
          return res.status(201).json(newProduct);
        }
      } catch (error) {
        console.error("MongoDB product creation failed:", error);
        // Continue to in-memory fallback
      }
      
      // Fallback to in-memory product creation
      const newProduct = await dbStorage.createProduct(productData);
      
      // Invalidate relevant product caches after creating a new product
      cacheService.deletePattern('products:*');
      cacheService.deletePattern('search:*');
      cacheService.deletePattern('medicine:search:*');
      // If the product belongs to a category, invalidate that category cache
      if (productData.categoryId) {
        cacheService.deletePattern(`products:category:${productData.categoryId}*`);
      }
      
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

  // API routes for notification tokens
  // Register a new notification token
  app.post("/api/notification-tokens", async (req: Request, res: Response) => {
    try {
      const { token, userId, deviceInfo } = req.body;
      
      if (!token || !userId) {
        return res.status(400).json({ message: "Token and userId are required" });
      }
      
      const notificationToken = await dbStorage.saveNotificationToken({
        token,
        userId,
        deviceInfo: deviceInfo || null,
        createdAt: new Date()
      });
      
      res.status(201).json(notificationToken);
    } catch (error) {
      console.error('Error saving notification token:', error);
      res.status(500).json({ message: "Failed to save notification token" });
    }
  });
  
  // Get notification tokens for a user
  app.get("/api/notification-tokens/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const tokens = await dbStorage.getNotificationTokensByUserId(userId);
      
      res.json(tokens);
    } catch (error) {
      console.error('Error fetching notification tokens:', error);
      res.status(500).json({ message: "Failed to fetch notification tokens" });
    }
  });
  
  // Delete a notification token
  app.delete("/api/notification-tokens/:token", async (req: Request, res: Response) => {
    try {
      const token = req.params.token;
      
      const result = await dbStorage.deleteNotificationToken(token);
      
      if (!result) {
        return res.status(404).json({ message: "Token not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting notification token:', error);
      res.status(500).json({ message: "Failed to delete notification token" });
    }
  });
  
  // Send notification to a specific user
  app.post("/api/notifications/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { title, body, data, clickAction, icon } = req.body;
      
      if (!title || !body) {
        return res.status(400).json({ message: "Title and body are required" });
      }
      
      const success = await sendNotificationToUser(userId, {
        title,
        body,
        data,
        clickAction,
        icon
      });
      
      if (!success) {
        return res.status(404).json({ message: "No valid notification tokens found for user" });
      }
      
      res.status(200).json({ message: "Notification sent successfully" });
    } catch (error) {
      console.error('Error sending notification to user:', error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  });
  
  // Send notification to all users
  app.post("/api/notifications/all", async (req: Request, res: Response) => {
    try {
      const { title, body, data, clickAction, icon } = req.body;
      
      if (!title || !body) {
        return res.status(400).json({ message: "Title and body are required" });
      }
      
      const success = await sendNotificationToAllUsers({
        title,
        body,
        data,
        clickAction,
        icon
      });
      
      if (!success) {
        return res.status(404).json({ message: "No valid notification tokens found" });
      }
      
      res.status(200).json({ message: "Notification sent to all users successfully" });
    } catch (error) {
      console.error('Error sending notification to all users:', error);
      res.status(500).json({ message: "Failed to send notification to all users" });
    }
  });

  // Initialize pincode service with graceful degradation
  try {
    const pincodeServiceInitialized = await initializePincodeService();
    if (pincodeServiceInitialized) {
      console.log('Pincode service initialized successfully');
    } else {
      console.log('Pincode service initialization failed, using fallback data');
    }
  } catch (error) {
    console.error('Failed to initialize pincode service:', error);
    console.log('Using fallback pincode data for service availability checks');
  }
  
  // Pincode lookup endpoint
  app.get('/api/pincode/:pincode', async (req: Request, res: Response) => {
    try {
      const { pincode } = req.params;
      
      // Validate pincode format (6 digits for Indian pincodes)
      if (!isValidPincodeFormat(pincode)) {
        return res.status(400).json({
          error: 'Invalid pincode format',
          message: 'Pincode must be a 6-digit number starting with a non-zero digit'
        });
      }
      
      // Cache key for pincode data
      const cacheKey = `pincode:${pincode}`;
      
      // Try to get from cache first
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      // Get pincode data - using our robust implementation that falls back gracefully
      const pincodeData = await getPincodeData(pincode);
      
      // Since our getPincodeData implementation now always returns something, even for fallbacks,
      // we don't need to check for null/undefined here
            
      // Save to cache for 24 hours (pincode data rarely changes)
      if (pincodeData) {
        cacheService.set(cacheKey, pincodeData, 24 * 60 * 60 * 1000);
      }
      
      res.json(pincodeData);
    } catch (error) {
      console.error('Pincode lookup error:', error);
      // Gracefully handle errors with a default response
      res.json({
        pincode: req.params.pincode,
        city: 'Unknown',
        district: 'Unknown',
        state: 'Unknown',
        country: 'India',
        serviceAvailable: false,
        deliveryDays: 5
      });
    }
  });
  
  // Check delivery availability endpoint
  app.get('/api/pincode/:pincode/delivery', async (req: Request, res: Response) => {
    try {
      const { pincode } = req.params;
      
      // Validate pincode format
      if (!isValidPincodeFormat(pincode)) {
        return res.status(400).json({
          error: 'Invalid pincode format',
          message: 'Pincode must be a 6-digit number starting with a non-zero digit'
        });
      }
      
      // Get pincode data with our graceful fallbacks
      const pincodeData = await getPincodeData(pincode);
      
      // With our improved implementation, we should always get an object back
      const isServiceable = pincodeData ? pincodeData.serviceAvailable : false;
      const deliveryDays = pincodeData ? pincodeData.deliveryDays : 5;
      
      res.json({
        pincode,
        isServiceable,
        deliveryDays: isServiceable ? deliveryDays : null,
        message: isServiceable 
          ? `Delivery available with estimated delivery in ${deliveryDays} days`
          : 'Delivery not available in this area'
      });
    } catch (error) {
      console.error('Delivery check error:', error);
      // Always return a response, even on error
      res.json({
        pincode: req.params.pincode,
        isServiceable: false,
        deliveryDays: null,
        message: 'Delivery not available in this area'
      });
    }
  });
  
  // Setup SEO routes for sitemap.xml and robots.txt
  setupSeoRoutes(app);
  
  // Cache monitoring endpoint (admin only) for 10 lakh+ product analysis
  app.get("/api/admin/cache-stats", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is an admin
      const userSession = req.session as any;
      if (!userSession || !userSession.user || userSession.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized. Admin access required." });
      }
      
      const cacheStats = cacheService.getCacheStats();
      res.json(cacheStats);
    } catch (error) {
      console.error("Error fetching cache stats:", error);
      res.status(500).json({ error: "Failed to fetch cache statistics" });
    }
  });
  
  const httpServer = createServer(app);

  return httpServer;
}
