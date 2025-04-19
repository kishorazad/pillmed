import express, { Request, Response } from 'express';
import { mongoDBStorage } from './mongodb-storage';
import { IStorage } from './storage';
import { z } from 'zod';

const router = express.Router();

// Get all customers with pagination and search
router.get('/', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    
    // Get all users
    const allUsers = await storage.getUsers();
    
    // Filter only customers
    const allCustomers = allUsers.filter(user => user.role === 'customer');
    
    // Filter customers based on search
    const filteredCustomers = allCustomers.filter(customer => {
      // Search by name, username, email, or phone
      const matchesSearch = search ? 
        (customer.name?.toLowerCase().includes(search.toLowerCase()) || 
         customer.username.toLowerCase().includes(search.toLowerCase()) || 
         customer.email.toLowerCase().includes(search.toLowerCase()) ||
         (customer.phone && customer.phone.includes(search))) : true;
      
      return matchesSearch;
    });
    
    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
    
    // Calculate total pages
    const totalPages = Math.ceil(filteredCustomers.length / limit);
    
    // Return paginated results
    res.json({
      customers: paginatedCustomers,
      totalCustomers: filteredCustomers.length,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({ message: 'Error getting customers' });
  }
});

// Get customer details by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    const customerId = parseInt(req.params.id);
    
    // Get customer
    const customer = await storage.getUser(customerId);
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    if (customer.role !== 'customer') {
      return res.status(400).json({ message: "User is not a customer" });
    }
    
    // Get customer's orders (if any)
    const orders = await storage.getOrdersByUserId(customerId);
    
    // Get customer's cart (if any)
    const cart = await storage.getCartItems(customerId);
    
    // Calculate customer stats
    const totalSpent = orders.reduce((total, order) => total + order.totalAmount, 0);
    const orderCount = orders.length;
    const cartSize = cart.length;
    
    // Get all unique medicine IDs from orders
    const medicineIds = new Set<number>();
    for (const order of orders) {
      const orderItems = await storage.getOrderItems(order.id);
      for (const item of orderItems) {
        medicineIds.add(item.productId);
      }
    }
    
    // Get medicine details
    const medicines = [];
    for (const medicineId of medicineIds) {
      const medicine = await storage.getProduct(medicineId);
      if (medicine) {
        // Count frequency of purchases
        let frequency = 0;
        let lastPurchased = null;
        
        for (const order of orders) {
          const orderItems = await storage.getOrderItems(order.id);
          const medicineItems = orderItems.filter(item => item.productId === medicineId);
          frequency += medicineItems.length;
          
          if (medicineItems.length > 0) {
            const orderDate = new Date(order.createdAt);
            if (!lastPurchased || orderDate > new Date(lastPurchased)) {
              lastPurchased = order.createdAt;
            }
          }
        }
        
        medicines.push({
          id: medicine.id,
          name: medicine.name,
          category: medicine.categoryId, // Ideally, we'd resolve the category name here
          frequency,
          lastPurchased: lastPurchased || new Date()
        });
      }
    }
    
    // Get recent activity (for now, just order history)
    const recentActivity = orders.slice(0, 5).map(order => ({
      action: `Placed order #${order.id} for ₹${order.totalAmount}`,
      timestamp: order.createdAt
    }));
    
    // Get top categories
    const categories = {};
    for (const medicine of medicines) {
      categories[medicine.category] = (categories[medicine.category] || 0) + 1;
    }
    
    const topCategories = Object.entries(categories)
      .map(([id, count]) => ({ id: parseInt(id), count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(async ({ id, count }) => {
        const category = await storage.getCategoryById(id);
        return {
          id,
          name: category?.name || `Category ${id}`,
          count
        };
      });
    
    // Return combined customer data
    res.json({
      ...customer,
      stats: {
        totalSpent,
        orderCount,
        cartSize
      },
      orders,
      medicines,
      cart,
      recentActivity,
      topCategories: await Promise.all(topCategories)
    });
  } catch (error) {
    console.error('Error getting customer details:', error);
    res.status(500).json({ message: 'Error getting customer details' });
  }
});

// Create a new customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    // Validate request body
    const customerSchema = z.object({
      username: z.string().min(3, { message: "Username must be at least 3 characters" }),
      name: z.string().optional(),
      email: z.string().email({ message: "Please enter a valid email address" }),
      password: z.string().min(6, { message: "Password must be at least 6 characters" }),
      role: z.literal('customer'),
      phone: z.string().optional(),
      address: z.string().optional(),
      pincode: z.string().optional(),
    });
    
    const validatedData = customerSchema.parse(req.body);
    
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
    
    // Create the customer
    const newCustomer = await storage.createUser({
      ...validatedData,
      password: hashedPassword
    });
    
    // Return the new customer without password
    const { password, ...customerWithoutPassword } = newCustomer;
    res.status(201).json(customerWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid customer data", errors: error.format() });
    }
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Error creating customer' });
  }
});

// Update a customer
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    const customerId = parseInt(req.params.id);
    
    // Check if customer exists
    const existingUser = await storage.getUser(customerId);
    if (!existingUser) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    if (existingUser.role !== 'customer') {
      return res.status(400).json({ message: "User is not a customer" });
    }
    
    // Validate request body
    const updateSchema = z.object({
      username: z.string().min(3).optional(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
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
    
    // Update the customer
    const updatedCustomer = await storage.updateUser(customerId, updateData);
    
    if (!updatedCustomer) {
      return res.status(500).json({ message: "Failed to update customer" });
    }
    
    // Return the updated customer without password
    const { password, ...customerWithoutPassword } = updatedCustomer;
    res.json(customerWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid customer data", errors: error.format() });
    }
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Error updating customer' });
  }
});

// Delete a customer
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    const customerId = parseInt(req.params.id);
    
    // Check if customer exists
    const existingUser = await storage.getUser(customerId);
    if (!existingUser) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    if (existingUser.role !== 'customer') {
      return res.status(400).json({ message: "User is not a customer" });
    }
    
    // Delete the customer
    const deleted = await storage.deleteUser(customerId);
    
    if (!deleted) {
      return res.status(500).json({ message: "Failed to delete customer" });
    }
    
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer' });
  }
});

export default router;