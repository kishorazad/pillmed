/**
 * Test MongoDB storage directly to verify user existence and auth
 */
import { MongoClient } from 'mongodb';

async function testMongoDBDirectly() {
  console.log('Testing MongoDB storage directly...');
  
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not set');
    return;
  }
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB directly');
    
    const db = client.db('pillnow');
    console.log('Database: pillnow');
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name).join(', '));
    
    // Find test user with email
    const usersCollection = db.collection('users');
    console.log('Users collection exists:', !!usersCollection);
    
    // Count total users
    const userCount = await usersCollection.countDocuments();
    console.log(`Total users in MongoDB: ${userCount}`);
    
    // Find our test user
    const testUser = await usersCollection.findOne({ email: 'brizkishor.azad@gmail.com' });
    if (testUser) {
      console.log('✅ Test user found in MongoDB:', {
        id: testUser._id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role,
        status: testUser.status
      });
    } else {
      console.log('❌ Test user not found in MongoDB');
      
      // List all users to debug
      console.log('\nListing all users in MongoDB:');
      const users = await usersCollection.find().limit(10).toArray();
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`, {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        });
      });
    }
    
    // Test storage.getUserByEmail implementation directly
    console.log('\nTesting getUserByEmail directly:');
    const userByEmail = await usersCollection.findOne({ email: 'brizkishor.azad@gmail.com' });
    console.log('Direct query result:', userByEmail ? true : false);
    
  } catch (error) {
    console.error('Error testing MongoDB storage directly:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

testMongoDBDirectly();