/**
 * Test the storage wrapper to check if it's properly returning users from MongoDB
 */
import { storage as memStorage } from './server/storage';
import { mongoDBStorage } from './server/mongodb-storage';
import { mongoDBService } from './server/services/mongodb-service';

async function testStorageWrapper() {
  console.log('Testing storage wrapper...');
  console.log('========================================');
  
  try {
    // Test MongoDB connection first
    console.log('MongoDB connection test:');
    const isConnected = await mongoDBService.connect();
    console.log(`MongoDB connected: ${isConnected}`);
    
    // Set global useMongoStorage flag (has to be on global)
    global.useMongoStorage = true;
    console.log(`Set global.useMongoStorage = ${global.useMongoStorage}`);
    
    // Test MongoDB storage directly
    console.log('\nTesting mongoDBStorage.getUserByEmail:');
    const mongoUser = await mongoDBStorage.getUserByEmail('brizkishor.azad@gmail.com');
    console.log('MongoDB storage result:', mongoUser ? {
      id: mongoUser.id,
      username: mongoUser.username,
      email: mongoUser.email,
      role: mongoUser.role
    } : 'User not found');
    
    // Test in-memory storage
    console.log('\nTesting memStorage.getUserByEmail:');
    const memUser = await memStorage.getUserByEmail('brizkishor.azad@gmail.com');
    console.log('In-memory storage result:', memUser ? {
      id: memUser.id,
      username: memUser.username,
      email: memUser.email,
      role: memUser.role
    } : 'User not found');
    
    // Test auth routes storage reference
    console.log('\nTesting storage from auth-routes:');
    // Import separately to get a fresh reference
    const { storage: authStorage } = await import('./server/storage');
    
    // Log what type of storage it is
    console.log('Auth storage type:', authStorage.constructor.name);
    
    const authUser = await authStorage.getUserByEmail('brizkishor.azad@gmail.com');
    console.log('Auth storage result:', authUser ? {
      id: authUser.id,
      username: authUser.username,
      email: authUser.email,
      role: authUser.role
    } : 'User not found');
    
    // Test memory storage with the MongoDB storage implementation's method
    console.log('\nTesting with direct MongoDB query:');
    try {
      const collection = mongoDBService.getCollection('users');
      if (collection) {
        const directUser = await collection.findOne({ email: 'brizkishor.azad@gmail.com' });
        console.log('Direct MongoDB query result:', directUser ? {
          id: directUser._id || directUser.id,
          username: directUser.username,
          email: directUser.email,
          role: directUser.role
        } : 'User not found');
      } else {
        console.log('Users collection not available');
      }
    } catch (e) {
      console.error('Direct MongoDB query error:', e);
    }
    
    console.log('========================================');
  } catch (error) {
    console.error('Error during storage wrapper test:', error);
  }
}

testStorageWrapper();