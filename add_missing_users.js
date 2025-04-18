// Script to add missing users to the database
import crypto from 'crypto';
import { MongoClient } from 'mongodb';

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pillnow';

// Function to hash password securely
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

// Required user accounts to create or update
const requiredUsers = [
  { id: 3, username: 'chemist1', email: 'chemist@example.com', name: 'Chemist User', role: 'chemist', password: 'chemist123' },
  { id: 5, username: 'hospital1', email: 'hospital@example.com', name: 'Hospital Admin', role: 'hospital', password: 'hospital123' },
  { id: 6, username: 'laboratory1', email: 'lab@example.com', name: 'Lab Tech', role: 'laboratory', password: 'lab123' },
];

async function createMissingUsers() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Check existing users
    const existingUsers = await usersCollection.find({}).toArray();
    console.log(`Found ${existingUsers.length} existing users`);
    
    // Display existing users
    existingUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role})`);
    });
    
    // Add or update each required user
    for (const user of requiredUsers) {
      // Check if user already exists by username
      const existingUser = await usersCollection.findOne({ 
        $or: [
          { username: user.username },
          { id: user.id }
        ] 
      });
      
      if (existingUser) {
        console.log(`User ${user.username} already exists with ID ${existingUser.id}, updating password...`);
        
        // Update the existing user's password
        const hashedPassword = hashPassword(user.password);
        await usersCollection.updateOne(
          { _id: existingUser._id },
          { 
            $set: { 
              password: hashedPassword,
              email: user.email,
              name: user.name,
              role: user.role
            } 
          }
        );
        
        console.log(`Updated user ${user.username}`);
      } else {
        console.log(`Creating new user: ${user.username} with role ${user.role}`);
        
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
          createdAt: new Date()
        });
        
        console.log(`Created user ${user.username} with ID ${user.id}`);
      }
    }
    
    console.log('User creation/update completed successfully');
    
  } catch (error) {
    console.error('Error creating/updating users:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Execute the function
createMissingUsers();