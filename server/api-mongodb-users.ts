import { Router, Request, Response } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const router = Router();
const scryptAsync = promisify(scrypt);

// Helper functions
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// MongoDB connection
const getMongoClient = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  console.log("MongoDB connection status check - isConnected flag:", global.mongoClient?.topology?.isConnected());
  console.log("MongoDB client exists:", !!global.mongoClient);
  console.log("MongoDB database exists:", !!global.mongoDb);

  if (global.mongoClient && global.mongoDb) {
    return { client: global.mongoClient, db: global.mongoDb };
  }

  try {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('pillnow');
    
    global.mongoClient = client;
    global.mongoDb = db;
    
    console.log("Connected to MongoDB successfully");
    return { client, db };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

// API Routes
// GET /api/admin/mongodb-users - Get all users with pagination and filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { client, db } = await getMongoClient();
    const usersCollection = db.collection('users');
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const search = req.query.search as string;
    const role = req.query.role as string;
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    // Get total count for pagination
    const totalUsers = await usersCollection.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);
    
    // Get users with pagination
    const users = await usersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    res.json({
      users,
      totalUsers,
      currentPage: page,
      totalPages,
      limit
    });
  } catch (error) {
    console.error('Error fetching MongoDB users:', error);
    res.status(500).json({ error: 'Failed to fetch users from MongoDB' });
  }
});

// POST /api/admin/mongodb-users - Create a new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { client, db } = await getMongoClient();
    const usersCollection = db.collection('users');
    
    const { username, email, password, ...userData } = req.body;
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this username or email already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user
    const newUser = {
      ...userData,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await usersCollection.insertOne(newUser);
    
    if (result.acknowledged) {
      // Return the user without password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json({ 
        ...userWithoutPassword, 
        _id: result.insertedId 
      });
    } else {
      throw new Error('Failed to insert user into MongoDB');
    }
  } catch (error) {
    console.error('Error creating MongoDB user:', error);
    res.status(500).json({ error: 'Failed to create user in MongoDB' });
  }
});

// GET /api/admin/mongodb-users/:id - Get a user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { client, db } = await getMongoClient();
    const usersCollection = db.collection('users');
    
    const userId = req.params.id;
    
    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching MongoDB user:', error);
    res.status(500).json({ error: 'Failed to fetch user from MongoDB' });
  }
});

// PUT /api/admin/mongodb-users/:id - Update a user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { client, db } = await getMongoClient();
    const usersCollection = db.collection('users');
    
    const userId = req.params.id;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    // Remove _id if present in the update data
    if (updateData._id) {
      delete updateData._id;
    }
    
    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    // Check if updating password
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fetch and return updated user
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found after update' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating MongoDB user:', error);
    res.status(500).json({ error: 'Failed to update user in MongoDB' });
  }
});

// DELETE /api/admin/mongodb-users/:id - Delete a user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { client, db } = await getMongoClient();
    const usersCollection = db.collection('users');
    
    const userId = req.params.id;
    
    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting MongoDB user:', error);
    res.status(500).json({ error: 'Failed to delete user from MongoDB' });
  }
});

// PATCH /api/admin/mongodb-users/:id/status - Update user status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { client, db } = await getMongoClient();
    const usersCollection = db.collection('users');
    
    const userId = req.params.id;
    const { status } = req.body;
    
    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    // Validate status
    const validStatuses = ['active', 'inactive', 'pending', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: active, inactive, pending, suspended' 
      });
    }
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { status, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating MongoDB user status:', error);
    res.status(500).json({ error: 'Failed to update user status in MongoDB' });
  }
});

export default router;