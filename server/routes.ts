import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage"; // Use the in-memory storage implementation
import { insertCartItemSchema, insertUserSchema } from "@shared/schema";
import { processHealthQuery, getMedicationInfo, analyzeMedicationInteractions } from "./ai-service";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Data will be imported from CSV in index.ts
  // Get all categories
  app.get("/api/categories", async (_req: Request, res: Response) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });
  
  // Get category by ID
  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const category = await storage.getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  });
  
  // Get all products
  app.get("/api/products", async (_req: Request, res: Response) => {
    const products = await storage.getProducts();
    res.json(products);
  });
  
  // Get products by category
  app.get("/api/products/category/:categoryId", async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    const products = await storage.getProductsByCategory(categoryId);
    res.json(products);
  });
  
  // Get featured products
  app.get("/api/products/featured", async (_req: Request, res: Response) => {
    const products = await storage.getFeaturedProducts();
    res.json(products);
  });
  
  // Get product by ID
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  });
  
  // Get cart items for a user
  app.get("/api/cart/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const cartItems = await storage.getCartItemWithProductDetails(userId);
    res.json(cartItems);
  });
  
  // Add item to cart
  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      const cartItem = insertCartItemSchema.parse(req.body);
      const newCartItem = await storage.addToCart(cartItem);
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
    
    const updatedItem = await storage.updateCartItem(id, quantity);
    
    if (!updatedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    res.json(updatedItem);
  });
  
  // Remove item from cart
  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.removeFromCart(id);
    
    if (!success) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    res.status(204).send();
  });
  
  // Clear user's cart
  app.delete("/api/cart/user/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    await storage.clearCart(userId);
    res.status(204).send();
  });
  
  // Get all articles
  app.get("/api/articles", async (_req: Request, res: Response) => {
    const articles = await storage.getArticles();
    res.json(articles);
  });
  
  // Get all testimonials
  app.get("/api/testimonials", async (_req: Request, res: Response) => {
    const testimonials = await storage.getTestimonials();
    res.json(testimonials);
  });
  
  // Get all lab tests
  app.get("/api/lab-tests", async (_req: Request, res: Response) => {
    const labTests = await storage.getLabTests();
    res.json(labTests);
  });
  
  // Get all health tips
  app.get("/api/health-tips", async (_req: Request, res: Response) => {
    try {
      const healthTips = await storage.getHealthTips();
      res.json(healthTips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch health tips" });
    }
  });
  
  // Get random health tip
  app.get("/api/health-tips/random", async (_req: Request, res: Response) => {
    try {
      const healthTip = await storage.getRandomHealthTip();
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
      
      const healthTip = await storage.getHealthTipById(id);
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
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with the username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
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
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
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

  const httpServer = createServer(app);

  return httpServer;
}
