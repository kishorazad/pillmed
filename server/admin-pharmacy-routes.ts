import express, { Request, Response } from 'express';
import { mongoDBStorage } from './mongodb-storage';
import { IStorage } from './storage';
import { z } from 'zod';

const router = express.Router();

// Get all pharmacies with pagination and search
router.get('/', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';
    
    // Get all users with pharmacy role
    const allUsers = await storage.getUsers();
    const allPharmacies = allUsers.filter(user => user.role === 'pharmacy' || user.role === 'chemist');
    
    // Filter pharmacies based on search and status
    const filteredPharmacies = allPharmacies.filter(pharmacy => {
      // Search by name, username, email, or phone
      const matchesSearch = search ? 
        (pharmacy.name?.toLowerCase().includes(search.toLowerCase()) || 
         pharmacy.username.toLowerCase().includes(search.toLowerCase()) || 
         pharmacy.email.toLowerCase().includes(search.toLowerCase()) ||
         (pharmacy.phone && pharmacy.phone.includes(search)) ||
         (pharmacy.pharmacyDetails?.pharmacyName?.toLowerCase().includes(search.toLowerCase()))) : true;
      
      // Filter by status
      const matchesStatus = status ? pharmacy.status === status : true;
      
      return matchesSearch && matchesStatus;
    });
    
    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPharmacies = filteredPharmacies.slice(startIndex, endIndex);
    
    // Calculate total pages
    const totalPages = Math.ceil(filteredPharmacies.length / limit);
    
    // Return paginated results
    res.json({
      pharmacies: paginatedPharmacies,
      totalPharmacies: filteredPharmacies.length,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error getting pharmacies:', error);
    res.status(500).json({ message: 'Error getting pharmacies' });
  }
});

// Get pharmacy details by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    const pharmacyId = parseInt(req.params.id);
    
    // Get pharmacy
    const pharmacy = await storage.getUser(pharmacyId);
    
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }
    
    if (pharmacy.role !== 'pharmacy' && pharmacy.role !== 'chemist') {
      return res.status(400).json({ message: "User is not a pharmacy" });
    }
    
    // Get pharmacy's inventory (if any)
    const inventory = await storage.getPharmacyInventory(pharmacyId);
    
    // Get pharmacy's orders (if any)
    const orders = await storage.getPharmacyOrders(pharmacyId);
    
    // Get pending prescriptions for this pharmacy
    const pendingPrescriptions = await storage.getPendingPrescriptions(pharmacyId);
    
    // Calculate pharmacy stats
    const totalSales = orders.reduce((total, order) => total + order.totalAmount, 0);
    const orderCount = orders.length;
    const pendingOrderCount = orders.filter(order => order.status === 'pending').length;
    const fulfilledOrderCount = orders.filter(order => order.status === 'completed' || order.status === 'delivered').length;
    
    // Return combined pharmacy data
    res.json({
      ...pharmacy,
      stats: {
        totalSales,
        orderCount,
        pendingOrderCount,
        fulfilledOrderCount,
        inventoryCount: inventory.length,
        pendingPrescriptionsCount: pendingPrescriptions.length
      },
      inventory,
      orders,
      pendingPrescriptions
    });
  } catch (error) {
    console.error('Error getting pharmacy details:', error);
    res.status(500).json({ message: 'Error getting pharmacy details' });
  }
});

// Register a new pharmacy
router.post('/', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    // Validate request body
    const pharmacySchema = z.object({
      username: z.string().min(3, { message: "Username must be at least 3 characters" }),
      name: z.string().min(2, { message: "Name must be at least 2 characters" }),
      email: z.string().email({ message: "Please enter a valid email address" }),
      password: z.string().min(6, { message: "Password must be at least 6 characters" }),
      role: z.enum(['pharmacy', 'chemist']),
      phone: z.string().min(10).optional(),
      address: z.string().optional(),
      pincode: z.string().optional(),
      pharmacyDetails: z.object({
        pharmacyName: z.string().min(2, { message: "Pharmacy name must be at least 2 characters" }),
        licenseNumber: z.string().min(5, { message: "License number must be at least 5 characters" }),
        licenseExpiryDate: z.string().optional(),
        ownerName: z.string().optional(),
        pharmacistName: z.string().optional(),
        pharmacistRegistrationNumber: z.string().optional(),
        gstNumber: z.string().optional(),
        establishmentYear: z.string().optional(),
        workingHours: z.string().optional(),
        deliveryOptions: z.array(z.string()).optional(),
        acceptsInsurance: z.boolean().optional(),
        hasHomeDelivery: z.boolean().optional(),
        hasPrescriptionFilling: z.boolean().optional()
      }).optional(),
      status: z.enum(['pending', 'approved', 'rejected', 'suspended']).default('pending')
    });
    
    const validatedData = pharmacySchema.parse(req.body);
    
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
    
    // Create the pharmacy user
    const newPharmacy = await storage.createUser({
      ...validatedData,
      password: hashedPassword
    });
    
    // Return the new pharmacy without password
    const { password, ...pharmacyWithoutPassword } = newPharmacy;
    res.status(201).json(pharmacyWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid pharmacy data", errors: error.format() });
    }
    console.error('Error creating pharmacy:', error);
    res.status(500).json({ message: 'Error creating pharmacy' });
  }
});

// Update a pharmacy
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    const pharmacyId = parseInt(req.params.id);
    
    // Check if pharmacy exists
    const existingPharmacy = await storage.getUser(pharmacyId);
    if (!existingPharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }
    
    if (existingPharmacy.role !== 'pharmacy' && existingPharmacy.role !== 'chemist') {
      return res.status(400).json({ message: "User is not a pharmacy" });
    }
    
    // Validate request body
    const updateSchema = z.object({
      username: z.string().min(3).optional(),
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      phone: z.string().min(10).optional(),
      address: z.string().optional(),
      pincode: z.string().optional(),
      pharmacyDetails: z.object({
        pharmacyName: z.string().min(2).optional(),
        licenseNumber: z.string().min(5).optional(),
        licenseExpiryDate: z.string().optional(),
        ownerName: z.string().optional(),
        pharmacistName: z.string().optional(),
        pharmacistRegistrationNumber: z.string().optional(),
        gstNumber: z.string().optional(),
        establishmentYear: z.string().optional(),
        workingHours: z.string().optional(),
        deliveryOptions: z.array(z.string()).optional(),
        acceptsInsurance: z.boolean().optional(),
        hasHomeDelivery: z.boolean().optional(),
        hasPrescriptionFilling: z.boolean().optional()
      }).optional(),
      status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional()
    });
    
    const validatedData = updateSchema.parse(req.body);
    
    // If updating username, check if new username already exists
    if (validatedData.username && validatedData.username !== existingPharmacy.username) {
      const userWithSameUsername = await storage.getUserByUsername(validatedData.username);
      if (userWithSameUsername) {
        return res.status(409).json({ message: "Username already exists" });
      }
    }
    
    // If updating email, check if new email already exists
    if (validatedData.email && validatedData.email !== existingPharmacy.email) {
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
    
    // Update the pharmacy
    const updatedPharmacy = await storage.updateUser(pharmacyId, updateData);
    
    if (!updatedPharmacy) {
      return res.status(500).json({ message: "Failed to update pharmacy" });
    }
    
    // Return the updated pharmacy without password
    const { password, ...pharmacyWithoutPassword } = updatedPharmacy;
    res.json(pharmacyWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid pharmacy data", errors: error.format() });
    }
    console.error('Error updating pharmacy:', error);
    res.status(500).json({ message: 'Error updating pharmacy' });
  }
});

// Update pharmacy status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    const pharmacyId = parseInt(req.params.id);
    
    // Check if pharmacy exists
    const existingPharmacy = await storage.getUser(pharmacyId);
    if (!existingPharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }
    
    if (existingPharmacy.role !== 'pharmacy' && existingPharmacy.role !== 'chemist') {
      return res.status(400).json({ message: "User is not a pharmacy" });
    }
    
    // Validate request body
    const statusSchema = z.object({
      status: z.enum(['pending', 'approved', 'rejected', 'suspended'])
    });
    
    const { status } = statusSchema.parse(req.body);
    
    // Update the pharmacy status
    const updatedPharmacy = await storage.updateUser(pharmacyId, { status });
    
    if (!updatedPharmacy) {
      return res.status(500).json({ message: "Failed to update pharmacy status" });
    }
    
    // Return success response
    res.json({ 
      message: `Pharmacy status updated to ${status}`,
      id: pharmacyId,
      status 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid status", errors: error.format() });
    }
    console.error('Error updating pharmacy status:', error);
    res.status(500).json({ message: 'Error updating pharmacy status' });
  }
});

// Delete a pharmacy
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    const pharmacyId = parseInt(req.params.id);
    
    // Check if pharmacy exists
    const existingPharmacy = await storage.getUser(pharmacyId);
    if (!existingPharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }
    
    if (existingPharmacy.role !== 'pharmacy' && existingPharmacy.role !== 'chemist') {
      return res.status(400).json({ message: "User is not a pharmacy" });
    }
    
    // Delete the pharmacy
    const deleted = await storage.deleteUser(pharmacyId);
    
    if (!deleted) {
      return res.status(500).json({ message: "Failed to delete pharmacy" });
    }
    
    // Return success response
    res.json({ success: true, message: "Pharmacy deleted successfully" });
  } catch (error) {
    console.error('Error deleting pharmacy:', error);
    res.status(500).json({ message: 'Error deleting pharmacy' });
  }
});

// Get pharmacy inventory
router.get('/:id/inventory', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    const pharmacyId = parseInt(req.params.id);
    
    // Check if pharmacy exists
    const existingPharmacy = await storage.getUser(pharmacyId);
    if (!existingPharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }
    
    if (existingPharmacy.role !== 'pharmacy' && existingPharmacy.role !== 'chemist') {
      return res.status(400).json({ message: "User is not a pharmacy" });
    }
    
    // Get inventory for this pharmacy
    const inventory = await storage.getPharmacyInventory(pharmacyId);
    
    // Return inventory
    res.json(inventory);
  } catch (error) {
    console.error('Error getting pharmacy inventory:', error);
    res.status(500).json({ message: 'Error getting pharmacy inventory' });
  }
});

// Get pharmacy orders
router.get('/:id/orders', async (req: Request, res: Response) => {
  try {
    const storage: IStorage = global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
    
    const pharmacyId = parseInt(req.params.id);
    
    // Check if pharmacy exists
    const existingPharmacy = await storage.getUser(pharmacyId);
    if (!existingPharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }
    
    if (existingPharmacy.role !== 'pharmacy' && existingPharmacy.role !== 'chemist') {
      return res.status(400).json({ message: "User is not a pharmacy" });
    }
    
    // Get orders for this pharmacy
    const orders = await storage.getPharmacyOrders(pharmacyId);
    
    // Return orders
    res.json(orders);
  } catch (error) {
    console.error('Error getting pharmacy orders:', error);
    res.status(500).json({ message: 'Error getting pharmacy orders' });
  }
});

export default router;