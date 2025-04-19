// Script to create a missing user in MongoDB
import mongoose from 'mongoose';
import crypto from 'crypto';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pillnow';

// Function to hash password (copy from existing code for consistency)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${hash}.${salt}`;
}

async function createMissingUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      dbName: 'pillnow'
    });
    
    console.log('Connected to MongoDB. Creating User schema...');
    
    // Define the User schema
    const userSchema = new mongoose.Schema({
      numericId: { type: Number, unique: true, sparse: true },
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: null },
      address: { type: String, default: null },
      pincode: { type: String, default: null },
      role: { type: String, default: 'customer' },
      profileImageUrl: { type: String, default: null }
    }, { timestamps: true });
    
    // Create the User model
    const User = mongoose.model('User', userSchema);
    
    // Check if the user already exists
    const existingUser = await User.findOne({ username: 'brijkishor' });
    if (existingUser) {
      console.log('User "brijkishor" already exists in the database with ID:', existingUser._id);
      console.log('User details:', existingUser);
      await mongoose.disconnect();
      return;
    }
    
    // Create the new user
    const newUser = new User({
      numericId: Math.floor(Math.random() * 1000) + 100, // Generate a random numeric ID
      username: 'brijkishor',
      password: hashPassword('password123'), // Use a secure password
      name: 'Brij Kishor',
      email: 'brijkishor@example.com',
      phone: '9876543210',
      address: '123 Main Street, City',
      pincode: '110001',
      role: 'customer'
    });
    
    // Save the user to the database
    const savedUser = await newUser.save();
    console.log('User "brijkishor" created successfully with ID:', savedUser._id);
    console.log('User details:', savedUser);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating user:', error);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from MongoDB:', disconnectError);
    }
  }
}

// Execute the function
createMissingUser();