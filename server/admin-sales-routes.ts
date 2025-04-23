import express, { Request, Response } from 'express';
import { IStorage } from './storage';
import { mongoDBStorage } from './mongodb-storage';
import session from 'express-session';

// Add custom properties to session
declare module 'express-session' {
  interface Session {
    user?: any;
    passport?: {
      user: any;
    };
  }
}

// Extend the Express Request interface to include our custom properties
declare global {
  namespace Express {
    interface Request {
      adminUser?: any;
    }
  }
}

// Define types for the orders with items
interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

interface SalesOrder {
  id: number;
  userId: number;
  orderDate: Date | null;
  status: string | null;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber: string | null;
  items?: OrderItem[];
  createdAt?: Date; // Some orders might have this instead of orderDate
}

// Define the sales data item interface for type safety
interface SalesDataItem {
  orderId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  revenue: number;
  date: string; // Date in YYYY-MM-DD format
  category?: string; // Category might not be available for all products
}

const router = express.Router();

// Ensure only admins can access these routes
async function isAdminOrSubadmin(req: Request, res: Response, next: Function) {
  // Check for session data which indicates a user is logged in
  if (!req.session) {
    return res.status(401).json({ message: 'Authentication required - No session' });
  }
  
  try {
    // The session might store user data differently than the standard passport approach
    const user = req.session.user || req.session?.passport?.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required - No user in session' });
    }
    
    // Log the user data to help with debugging
    console.log('Session user data for admin route:', user);
    
    // Fetch user details from database if we only have an ID
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    // Get the user object or ID depending on how it's stored
    const userId = typeof user === 'object' ? user.id : user;
    
    // Get the complete user object from storage
    const userDetails = await storage.getUser(userId);
    
    if (!userDetails) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (userDetails.role !== 'admin' && userDetails.role !== 'subadmin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Store the user details in request for later use
    req.adminUser = userDetails;
    next();
  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
}

// Get all products with enhanced details
router.get('/products', isAdminOrSubadmin, async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    // Get products from storage
    const products = await storage.getProducts();
    
    // Get sales data to enhance product information
    const allOrders = await storage.getAllOrders() as SalesOrder[];
    
    // Calculate sales metrics for each product
    const productSalesMap = new Map();
    
    allOrders.forEach(order => {
      // Skip orders without items
      if (!order.items || !Array.isArray(order.items)) return;
      
      order.items.forEach(item => {
        const productId = item.productId;
        const quantity = item.quantity || 1;
        const price = item.price || 0;
        const revenue = price * quantity;
        
        if (productSalesMap.has(productId)) {
          const current = productSalesMap.get(productId);
          productSalesMap.set(productId, {
            totalSales: current.totalSales + quantity,
            salesRevenue: current.salesRevenue + revenue
          });
        } else {
          productSalesMap.set(productId, {
            totalSales: quantity,
            salesRevenue: revenue
          });
        }
      });
    });
    
    // Enhance products with sales data
    const enhancedProducts = products.map(product => {
      const salesData = productSalesMap.get(product.id);
      return {
        ...product,
        totalSales: salesData?.totalSales || 0,
        salesRevenue: salesData?.salesRevenue || 0
      };
    });
    
    res.json(enhancedProducts);
  } catch (error) {
    console.error('Error fetching enhanced products:', error);
    res.status(500).json({ message: 'Failed to fetch products data' });
  }
});

// Get sales data for analytics
router.get('/sales', isAdminOrSubadmin, async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    const timeRange = req.query.timeRange ? parseInt(req.query.timeRange as string) : 30;
    
    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);
    
    // Get all orders within the date range
    const allOrders = await storage.getAllOrders() as SalesOrder[];
    
    // Get all products for reference
    const products = await storage.getProducts();
    const productsById = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {} as { [key: number]: any });
    
    // Transform orders into sales data
    const salesData = [];
    
    allOrders.forEach(order => {
      // Skip orders without items or outside date range
      if (!order.items || !Array.isArray(order.items)) return;
      
      // Handle date carefully to avoid type errors
      const dateValue = order.orderDate || (order.createdAt ? order.createdAt : new Date());
      const orderDate = new Date(dateValue);
      if (orderDate < startDate || orderDate > endDate) return;
      
      order.items.forEach(item => {
        const product = productsById[item.productId];
        if (!product) return;
        
        salesData.push({
          orderId: order.id,
          productId: item.productId,
          productName: product.name,
          price: item.price || product.price,
          quantity: item.quantity || 1,
          revenue: (item.price || product.price) * (item.quantity || 1),
          date: orderDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
          category: product.category
        });
      });
    });
    
    res.json(salesData);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ message: 'Failed to fetch sales data' });
  }
});

// Get overall sales stats
router.get('/stats', isAdminOrSubadmin, async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    // Get all orders
    const allOrders = await storage.getAllOrders() as SalesOrder[];
    
    // Calculate basic metrics
    const totalRevenue = allOrders.reduce((sum, order) => {
      return sum + (order.totalAmount || 0);
    }, 0);
    
    const totalOrders = allOrders.length;
    
    // Get all products
    const products = await storage.getProducts();
    
    // Count products with low stock (using inStock property)
    const lowStockProducts = products.filter(product => product.inStock === false).length;
    
    // Calculate sales by category
    const categoryMap = new Map();
    const productSalesMap = new Map();
    
    // Process orders to calculate sales by product
    allOrders.forEach(order => {
      if (!order.items || !Array.isArray(order.items)) return;
      
      order.items.forEach(item => {
        const productId = item.productId;
        const quantity = item.quantity || 1;
        
        if (productSalesMap.has(productId)) {
          productSalesMap.set(productId, productSalesMap.get(productId) + quantity);
        } else {
          productSalesMap.set(productId, quantity);
        }
      });
    });
    
    // Process products to calculate sales by category
    products.forEach(product => {
      // Use categoryId and map to a category name if needed
      const categoryId = product.categoryId || 0;
      const categoryName = `Category ${categoryId}`; // Simplified for now
      const sales = productSalesMap.get(product.id) || 0;
      
      if (categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, categoryMap.get(categoryName) + sales);
      } else {
        categoryMap.set(categoryName, sales);
      }
    });
    
    // Convert maps to arrays for the response
    const categorySales = Array.from(categoryMap.entries()).map(([category, sales]) => ({
      category,
      sales
    }));
    
    // Get top selling products
    const productSales = Array.from(productSalesMap.entries())
      .map(([productId, sales]) => {
        const product = products.find(p => p.id === productId);
        return {
          productId,
          productName: product ? product.name : `Product #${productId}`,
          sales
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
    
    res.json({
      totalRevenue,
      totalOrders,
      lowStockProducts,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      categorySales,
      topSellingProducts: productSales
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ message: 'Failed to fetch sales statistics' });
  }
});

export default router;