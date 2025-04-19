// Script to add all required users to the MongoDB database
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Function to hash password securely
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

// All required user accounts to create or update
const requiredUsers = [
  // Admin users
  { id: 1, username: 'admin', email: 'admin@pillnow.com', name: 'Admin User', role: 'admin', password: 'admin123' },
  { id: 2, username: 'subadmin', email: 'subadmin@pillnow.com', name: 'Sub Admin', role: 'admin', password: 'subadmin123' },
  
  // Chemist/Pharmacy users
  { id: 3, username: 'chemist1', email: 'chemist1@pillnow.com', name: 'Chemist One', role: 'chemist', password: 'chemist123' },
  { id: 4, username: 'pharmacy1', email: 'pharmacy1@pillnow.com', name: 'Pharmacy One', role: 'chemist', password: 'pharmacy123' },
  
  // Hospital users
  { id: 5, username: 'hospital1', email: 'hospital1@pillnow.com', name: 'Hospital Admin', role: 'hospital', password: 'hospital123' },
  { id: 6, username: 'hospital2', email: 'hospital2@pillnow.com', name: 'Hospital Two', role: 'hospital', password: 'hospital123' },
  
  // Lab users
  { id: 7, username: 'laboratory1', email: 'laboratory1@pillnow.com', name: 'Lab Tech One', role: 'laboratory', password: 'lab123' },
  { id: 8, username: 'laboratory2', email: 'laboratory2@pillnow.com', name: 'Lab Tech Two', role: 'laboratory', password: 'lab123' },
  
  // Doctor users
  { id: 9, username: 'doctor1', email: 'doctor1@pillnow.com', name: 'Dr. Smith', role: 'doctor', password: 'doctor123' },
  { id: 10, username: 'doctor2', email: 'doctor2@pillnow.com', name: 'Dr. Johnson', role: 'doctor', password: 'doctor123' },
  
  // Nurse users
  { id: 11, username: 'nurse1', email: 'nurse1@pillnow.com', name: 'Nurse One', role: 'nurse', password: 'nurse123' },
  
  // Delivery users
  { id: 12, username: 'delivery1', email: 'delivery1@pillnow.com', name: 'Delivery One', role: 'delivery', password: 'delivery123' },
  
  // Normal users
  { id: 13, username: 'user1', email: 'user1@example.com', name: 'Regular User', role: 'user', password: 'user123' },
  { id: 14, username: 'testuser123', email: 'test@example.com', name: 'Test User', role: 'user', password: 'test1234' }
];

async function createAllUsers() {
  console.log('=== PillNow User Creation Script ===');
  console.log(`MongoDB URI: ${mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Mask credentials in logging
  console.log(`Total users to process: ${requiredUsers.length}`);
  
  const client = new MongoClient(mongoURI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db('pillnow');
    const usersCollection = db.collection('users');
    
    // Check existing users
    const existingUsers = await usersCollection.find({}).toArray();
    console.log(`Found ${existingUsers.length} existing users in the database`);
    
    // Display existing users
    if (existingUsers.length > 0) {
      console.log('Existing users:');
      existingUsers.forEach(user => {
        console.log(`- ${user.username} (${user.role || 'no role'}) [ID: ${user.id}]`);
      });
    }
    
    // Process each required user
    let created = 0;
    let updated = 0;
    
    for (const user of requiredUsers) {
      // Check if user already exists by username or ID
      const existingUser = await usersCollection.findOne({ 
        $or: [
          { username: user.username },
          { id: user.id }
        ] 
      });
      
      if (existingUser) {
        console.log(`Updating user: ${user.username} (${user.role}) [ID: ${user.id}]`);
        
        // Update the existing user
        const hashedPassword = hashPassword(user.password);
        await usersCollection.updateOne(
          { _id: existingUser._id },
          { 
            $set: { 
              id: user.id, // Ensure ID is consistent
              password: hashedPassword,
              email: user.email,
              name: user.name,
              role: user.role,
              updatedAt: new Date()
            } 
          }
        );
        
        updated++;
        console.log(`✓ Updated user ${user.username}`);
      } else {
        console.log(`Creating new user: ${user.username} (${user.role}) [ID: ${user.id}]`);
        
        // Hash the password
        const hashedPassword = hashPassword(user.password);
        
        // Create the new user
        await usersCollection.insertOne({
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        created++;
        console.log(`✓ Created user ${user.username} with ID ${user.id}`);
      }
    }
    
    // Verify all users after creation/update
    const finalUsers = await usersCollection.find({}).toArray();
    console.log('\nVerification results:');
    console.log(`Total users in database: ${finalUsers.length}`);
    console.log(`Users created: ${created}`);
    console.log(`Users updated: ${updated}`);
    
    // Verify all required users exist
    const missingUsers = [];
    for (const required of requiredUsers) {
      const found = finalUsers.some(u => u.username === required.username);
      if (!found) {
        missingUsers.push(required.username);
      }
    }
    
    if (missingUsers.length === 0) {
      console.log('✓ All required users exist in the database');
    } else {
      console.log(`❌ Missing users: ${missingUsers.join(', ')}`);
    }
    
    console.log('\nUser creation/update completed');
    
  } catch (error) {
    console.error('Error creating/updating users:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Execute the function
createAllUsers();