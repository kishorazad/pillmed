/**
 * Script to fix admin user credentials for the PillNow platform
 */

import { MongoClient } from 'mongodb';
import crypto from 'crypto';

const uri = process.env.MONGODB_URI || 'mongodb+srv://brijkishorazad:u6w2inq13CaOzzMO@cluster0.ncw79xh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'pillnow';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString('hex');
  return `${hash}.${salt}`;
}

async function listAllUsersAndFixAdmin() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db(dbName);
    const users = database.collection('users');
    
    // List all users
    console.log('Listing all users:');
    const allUsers = await users.find({}).toArray();
    
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}): role=${user.role || 'none'}`);
    });
    
    // Find the admin user by role
    const adminUser = allUsers.find(user => user.role === 'admin');
    
    if (adminUser) {
      console.log('\nAdmin user found:');
      console.log(`Username: ${adminUser.username}, Email: ${adminUser.email}`);
      
      // Update the admin user's email and password
      const hashedPassword = hashPassword('admin');
      const result = await users.updateOne(
        { _id: adminUser._id },
        { 
          $set: { 
            password: hashedPassword,
            email: 'admin@pillnow.com'
          } 
        }
      );
      
      console.log('Admin credentials updated:', result.modifiedCount > 0);
    } else {
      // Create a new admin user with a unique username
      const adminUser = {
        id: Math.floor(Math.random() * 10000) + 1000, // Random ID to avoid conflicts
        username: 'pillnow_admin',
        password: hashPassword('admin'),
        name: 'Admin User',
        email: 'admin@pillnow.info', // Using the provided email address
        phone: '1234567890',
        role: 'admin',
        status: 'active',
        profileImageUrl: null,
        createdAt: new Date()
      };
      
      const result = await users.insertOne(adminUser);
      console.log('New admin user created:', result.acknowledged);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

listAllUsersAndFixAdmin();