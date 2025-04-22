/**
 * Create a test user for API testing
 */
import { MongoClient } from 'mongodb';
import { createHash, randomBytes, scryptSync } from 'crypto';

// Helper function to hash a password
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

async function createTestUser() {
  console.log('Creating test user for API testing...');
  
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not set');
    return;
  }
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('pillnow');
    const usersCollection = db.collection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: 'brizkishor.azad@gmail.com' });
    
    if (existingUser) {
      console.log('Test user already exists, updating password');
      
      const result = await usersCollection.updateOne(
        { email: 'brizkishor.azad@gmail.com' },
        { 
          $set: { 
            password: hashPassword('testing123'),
            updated_at: new Date()
          }
        }
      );
      
      console.log(`User updated: ${result.modifiedCount} document updated`);
    } else {
      // Create new test user
      const newUser = {
        username: 'testuser',
        name: 'Test User',
        email: 'brizkishor.azad@gmail.com',
        phone: '+919876543210',
        password: hashPassword('testing123'),
        role: 'customer',
        provider: 'email',
        created_at: new Date(),
        updated_at: new Date(),
        status: 'active'
      };
      
      const result = await usersCollection.insertOne(newUser);
      console.log(`User created with ID: ${result.insertedId}`);
    }
    
    // Verify user exists
    const user = await usersCollection.findOne({ email: 'brizkishor.azad@gmail.com' });
    console.log('Test user details:', {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    });
    
    console.log('Test credentials:');
    console.log('Email: brizkishor.azad@gmail.com');
    console.log('Password: testing123');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

createTestUser();