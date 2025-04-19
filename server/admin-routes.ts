import express, { Request, Response } from 'express';
import { mongoDBStorage } from './mongodb-storage';
import { IStorage } from './storage';
import { z } from 'zod';
import { apiRequest } from './utils/api-util';
import adminCustomerRoutes from './admin-customer-routes';
import adminPharmacyRoutes from './admin-pharmacy-routes';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: Function) => {
  const sessionUser = (req.session as any)?.user;
  
  if (!sessionUser) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  // Check if user has admin role
  if (sessionUser.role !== 'admin' && sessionUser.role !== 'subadmin') {
    return res.status(403).json({ message: "Access denied. Admin role required." });
  }
  
  next();
};

// Apply admin check middleware to all routes
router.use(isAdmin);

// Get admin dashboard stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    // Get total users count
    const users = await storage.getUsers();
    const totalUsers = users.length;
    
    // Count users by role
    const userCounts = users.reduce((acc: Record<string, number>, user) => {
      const role = user.role || 'customer';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    
    // Get total products count
    const products = await storage.getProducts();
    const totalProducts = products.length;
    
    // Get products with low stock
    const lowStockProducts = products.filter(p => p.inStock === false || (p.stockQuantity !== undefined && p.stockQuantity < 10)).length;
    
    // Get recent orders (dummy data for now)
    const recentOrders = [
      { id: 'ORD-2023-0001', userId: 3, amount: 1240, date: '2025-04-19', status: 'Delivered' },
      { id: 'ORD-2023-0002', userId: 4, amount: 890, date: '2025-04-18', status: 'Shipped' },
      { id: 'ORD-2023-0003', userId: 5, amount: 2300, date: '2025-04-18', status: 'Processing' },
      { id: 'ORD-2023-0004', userId: 6, amount: 750, date: '2025-04-17', status: 'Delivered' },
      { id: 'ORD-2023-0005', userId: 7, amount: 1600, date: '2025-04-17', status: 'Delivered' },
    ];
    
    // Map user IDs to names in recent orders
    const ordersWithUserNames = await Promise.all(recentOrders.map(async (order) => {
      const user = await storage.getUser(order.userId);
      return {
        ...order,
        user: user ? user.name || user.username : 'Unknown User'
      };
    }));
    
    // Get top selling medicines (dummy data for now)
    const topMedicines = [
      { id: 1, name: 'Paracetamol 500mg', orders: 140 },
      { id: 2, name: 'Amoxicillin 250mg', orders: 112 },
      { id: 3, name: 'Montelukast 10mg', orders: 95 },
      { id: 4, name: 'Lisinopril 20mg', orders: 87 },
      { id: 5, name: 'Atorvastatin 40mg', orders: 76 },
    ];
    
    // Return stats
    res.json({
      totalUsers,
      userCounts,
      totalProducts,
      lowStockProducts,
      outOfStockProducts: products.filter(p => p.inStock === false).length,
      recentOrders: ordersWithUserNames,
      topMedicines,
      totalOrders: 1452, // Dummy data
      totalRevenue: 1243540, // Dummy data
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Error getting admin stats' });
  }
});

// Get all users with pagination and filtering
router.get('/users', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const role = req.query.role as string || '';
    
    // Get all users
    const allUsers = await storage.getUsers();
    
    // Filter users based on search and role
    const filteredUsers = allUsers.filter(user => {
      // Search by name, username, or email
      const matchesSearch = search ? 
        (user.name?.toLowerCase().includes(search.toLowerCase()) || 
         user.username.toLowerCase().includes(search.toLowerCase()) || 
         user.email.toLowerCase().includes(search.toLowerCase())) : true;
      
      // Filter by role
      const matchesRole = role && role !== 'all' ? user.role === role : true;
      
      return matchesSearch && matchesRole;
    });
    
    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Return paginated results
    res.json({
      total: filteredUsers.length,
      page,
      limit,
      users: paginatedUsers,
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Error getting users' });
  }
});

// Get user statistics by role
router.get('/user-stats', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    // Get all users
    const users = await storage.getUsers();
    
    // Count users by role
    const roleCounts = users.reduce((acc: Record<string, number>, user) => {
      const role = user.role || 'customer';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {
      admin: 0,
      subadmin: 0,
      chemist: 0,
      doctor: 0,
      hospital: 0,
      laboratory: 0,
      customer: 0,
      nurse: 0,
      delivery: 0
    });
    
    // Return stats
    res.json({
      total: users.length,
      roleCounts
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Error getting user stats' });
  }
});

// Create a new user (admin function)
router.post('/users', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    // Validate request body
    const userSchema = z.object({
      username: z.string().min(3, { message: "Username must be at least 3 characters" }),
      name: z.string().min(2, { message: "Name must be at least 2 characters" }),
      email: z.string().email({ message: "Please enter a valid email address" }),
      password: z.string().min(6, { message: "Password must be at least 6 characters" }),
      role: z.string().nonempty({ message: "Please select a role" }),
      phone: z.string().optional(),
      address: z.string().optional(),
      pincode: z.string().optional(),
      // The active flag can be sent from the client to determine the initial status
      active: z.boolean().optional(),
      // Or the status can be sent directly
      status: z.enum(['active', 'pending', 'suspended']).optional(),
    });
    
    const validatedData = userSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(validatedData.email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }
    
    // Hash the password
    const crypto = await import('crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(validatedData.password, salt, 64).toString('hex');
    const hashedPassword = `${hash}.${salt}`;
    
    // Create the user
    const newUser = await storage.createUser({
      ...validatedData,
      password: hashedPassword
    });
    
    // Return the new user without password
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid user data", errors: error.format() });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Update a user
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    const userId = parseInt(req.params.id);
    
    // Check if user exists
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Validate request body
    const updateSchema = z.object({
      username: z.string().min(3).optional(),
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      role: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      pincode: z.string().optional(),
    });
    
    const validatedData = updateSchema.parse(req.body);
    
    // If updating username, check if new username already exists
    if (validatedData.username && validatedData.username !== existingUser.username) {
      const userWithSameUsername = await storage.getUserByUsername(validatedData.username);
      if (userWithSameUsername) {
        return res.status(409).json({ message: "Username already exists" });
      }
    }
    
    // If updating email, check if new email already exists
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const userWithSameEmail = await storage.getUserByEmail(validatedData.email);
      if (userWithSameEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }
    
    // Hash the password if it's being updated
    let updateData: any = { ...validatedData };
    if (validatedData.password) {
      const crypto = await import('crypto');
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.scryptSync(validatedData.password, salt, 64).toString('hex');
      const hashedPassword = `${hash}.${salt}`;
      updateData.password = hashedPassword;
    }
    
    // Update the user
    const updatedUser = await storage.updateUser(userId, updateData);
    
    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update user" });
    }
    
    // Return the updated user without password
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid user data", errors: error.format() });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete a user
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    const userId = parseInt(req.params.id);
    
    // Check if user exists
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Prevent deleting your own account
    const sessionUser = (req.session as any)?.user;
    if (sessionUser.id === userId) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    
    // Delete the user
    const deleted = await storage.deleteUser(userId);
    
    if (!deleted) {
      return res.status(500).json({ message: "Failed to delete user" });
    }
    
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Perform bulk actions on users
router.post('/users/bulk-action', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    // Validate request body
    const bulkActionSchema = z.object({
      action: z.string().nonempty(),
      userIds: z.array(z.number()),
    });
    
    const { action, userIds } = bulkActionSchema.parse(req.body);
    
    // Prevent actions on your own account
    const sessionUser = (req.session as any)?.user;
    if (userIds.includes(sessionUser.id)) {
      return res.status(400).json({ message: "Cannot perform bulk actions on your own account" });
    }
    
    // Perform the requested action
    if (action === 'delete') {
      // Delete multiple users
      const results = await Promise.all(userIds.map(async (id) => {
        return await storage.deleteUser(id);
      }));
      
      const successCount = results.filter(Boolean).length;
      
      res.json({ 
        success: true, 
        message: `Deleted ${successCount} of ${userIds.length} users successfully` 
      });
    } else if (action === 'changeRole') {
      // This would require additional parameters like new role
      res.status(400).json({ message: "Role change requires specifying the new role" });
    } else if (action === 'sendEmail') {
      // This would integrate with email service
      res.status(400).json({ message: "Email sending not implemented yet" });
    } else {
      res.status(400).json({ message: "Unsupported bulk action" });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request data", errors: error.format() });
    }
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Error performing bulk action' });
  }
});

// Get product analytics
router.get('/analytics/products', async (req: Request, res: Response) => {
  try {
    // This would typically fetch data from database and analytics services
    // For now, we'll return dummy data as placeholder
    
    res.json({
      metrics: {
        totalSales: 1248760,
        totalOrders: 3542,
        averageOrderValue: 352.27,
        conversionRate: 2.8,
        totalRevenue: 8765432,
        totalProfit: 3245678,
        totalProducts: 12578,
        lowStockProducts: 32,
        outOfStockProducts: 8,
      },
      salesTrend: [
        { date: '2025-03-01', sales: 4000 },
        { date: '2025-03-05', sales: 3000 },
        { date: '2025-03-10', sales: 2000 },
        { date: '2025-03-15', sales: 2780 },
        { date: '2025-03-20', sales: 1890 },
        { date: '2025-03-25', sales: 2390 },
        { date: '2025-04-01', sales: 3490 },
        { date: '2025-04-05', sales: 3200 },
        { date: '2025-04-10', sales: 2800 },
        { date: '2025-04-15', sales: 3300 },
        { date: '2025-04-19', sales: 3700 },
      ],
      categoryDistribution: [
        { name: 'Antibiotics', value: 20 },
        { name: 'Pain Relief', value: 18 },
        { name: 'Vitamins', value: 15 },
        { name: 'Skin Care', value: 12 },
        { name: 'Diabetes', value: 10 },
        { name: 'Others', value: 25 },
      ],
    });
  } catch (error) {
    console.error('Error getting product analytics:', error);
    res.status(500).json({ message: 'Error getting product analytics' });
  }
});

// Get top selling products
router.get('/analytics/top-products', async (req: Request, res: Response) => {
  try {
    // This would typically fetch data from database and analytics services
    // For now, we'll return dummy data as placeholder
    
    res.json({
      products: [
        { id: 1, name: 'Paracetamol 500mg', sales: 412, revenue: 15650, inStock: true, growth: 12.5 },
        { id: 2, name: 'Amoxicillin 500mg', sales: 387, revenue: 24815, inStock: true, growth: 8.7 },
        { id: 3, name: 'Metformin 500mg', sales: 356, revenue: 18340, inStock: true, growth: -5.2 },
        { id: 4, name: 'Atorvastatin 10mg', sales: 312, revenue: 21654, inStock: true, growth: 15.3 },
        { id: 5, name: 'Lisinopril 20mg', sales: 298, revenue: 17450, inStock: false, growth: 6.8 },
        { id: 6, name: 'Omeprazole 40mg', sales: 276, revenue: 13800, inStock: true, growth: -2.1 },
        { id: 7, name: 'Sertraline 50mg', sales: 268, revenue: 18760, inStock: true, growth: 9.4 },
        { id: 8, name: 'Albuterol Inhaler', sales: 245, revenue: 29400, inStock: true, growth: 22.7 },
        { id: 9, name: 'Levothyroxine 50mcg', sales: 232, revenue: 11600, inStock: false, growth: 1.3 },
        { id: 10, name: 'Clopidogrel 75mg', sales: 218, revenue: 16350, inStock: true, growth: 4.6 },
      ]
    });
  } catch (error) {
    console.error('Error getting top products:', error);
    res.status(500).json({ message: 'Error getting top products' });
  }
});

// Get inventory status
router.get('/analytics/inventory-status', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    // Get all products
    const products = await storage.getProducts();
    
    // Count inventory status
    const inStock = products.filter(p => p.inStock !== false).length;
    const outOfStock = products.filter(p => p.inStock === false).length;
    
    // For low stock, we'll identify products with stock < 10 (if stockQuantity exists)
    const lowStockProducts = products
      .filter(p => p.inStock !== false && (p.stockQuantity !== undefined && p.stockQuantity < 10))
      .map(p => ({
        id: p.id,
        name: p.name,
        sku: `SKU-${p.id}`, // Generate a mock SKU
        category: p.category || 'General',
        stock: p.stockQuantity || 'Low',
        price: p.price
      }))
      .slice(0, 10); // Only return top 10 for the UI
    
    // Create status distribution for pie chart
    const statusDistribution = [
      { status: 'In Stock', count: inStock - lowStockProducts.length },
      { status: 'Low Stock', count: lowStockProducts.length },
      { status: 'Out of Stock', count: outOfStock }
    ];
    
    res.json({
      lowStockProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStock,
      inStockCount: inStock - lowStockProducts.length,
      totalProducts: products.length,
      statusDistribution
    });
  } catch (error) {
    console.error('Error getting inventory status:', error);
    res.status(500).json({ message: 'Error getting inventory status' });
  }
});

// Add more admin routes as needed

// Mount the customer management routes as a sub-router
router.use('/customers', adminCustomerRoutes);

// Mount the pharmacy management routes as a sub-router
router.use('/pharmacies', adminPharmacyRoutes);

export default router;