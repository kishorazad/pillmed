/**
 * Script to check users in the MongoDB database
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

function verifyPassword(password, hashedPassword) {
  const [hash, salt] = hashedPassword.split('.');
  const hashVerify = crypto
    .scryptSync(password, salt, 64)
    .toString('hex');
  return hash === hashVerify;
}

async function checkUsers() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db(dbName);
    const users = database.collection('users');
    
    // Find all users
    const allUsers = await users.find({}).toArray();
    console.log(`Found ${allUsers.length} users in the database`);
    
    // Check admin user
    const adminUser = await users.findOne({ email: 'admin@pillnow.com' });
    if (adminUser) {
      console.log('\nAdmin User:');
      console.log({
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        passwordLength: adminUser.password ? adminUser.password.length : 0
      });
      
      // Test admin password
      const testPassword = 'admin';
      const passwordValid = verifyPassword(testPassword, adminUser.password);
      console.log(`Admin password '${testPassword}' is valid:`, passwordValid);
    } else {
      console.log('Admin user not found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

checkUsers();