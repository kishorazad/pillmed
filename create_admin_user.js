/**
 * Script to create an admin user if one doesn't exist
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

async function createAdminUser() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db(dbName);
    const users = database.collection('users');
    
    // Check if admin user exists
    const adminUser = await users.findOne({ email: 'admin@pillnow.com' });
    
    if (adminUser) {
      console.log('Admin user exists:', adminUser);
      
      // Update the admin user's password
      const hashedPassword = hashPassword('admin');
      const result = await users.updateOne(
        { email: 'admin@pillnow.com' },
        { $set: { password: hashedPassword } }
      );
      
      console.log('Admin password updated:', result.modifiedCount > 0);
    } else {
      // Create admin user
      const adminUser = {
        id: 1,
        username: 'admin',
        password: hashPassword('admin'),
        name: 'Admin User',
        email: 'admin@pillnow.com',
        phone: '1234567890',
        role: 'admin',
        status: 'active',
        profileImageUrl: null,
        createdAt: new Date()
      };
      
      const result = await users.insertOne(adminUser);
      console.log('Admin user created:', result.insertedId);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

createAdminUser();