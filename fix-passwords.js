import { MongoClient } from 'mongodb';
import { randomBytes, scryptSync } from 'crypto';

// Helper function to hash a password - same as in auth-routes.ts
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

async function fixPasswords() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('pillnow');
    const usersCollection = db.collection('users');
    
    // Get all users
    const users = await usersCollection.find().toArray();
    console.log(`Found ${users.length} users to update`);
    
    const passwordMap = {
      'admin': 'admin123',
      'user1': 'password123', 
      'doctor1': 'doctor123',
      'pharmacy1': 'pharmacy123',
      'chemist1': 'chemist123',
      'lab1': 'lab123',
      'hospital1': 'hospital123',
      'brijkishor': 'brijkishor'
    };
    
    // Update each user with a hashed password
    let updated = 0;
    for (const user of users) {
      // Check if this user has a known password in our map
      const plainPassword = passwordMap[user.username];
      
      if (plainPassword) {
        const hashedPassword = hashPassword(plainPassword);
        
        // Update the user in the database
        const result = await usersCollection.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`Updated password for ${user.username}`);
          updated++;
        }
      } else {
        console.log(`Skipping ${user.username} - no password mapping found`);
      }
    }
    
    console.log(`Updated passwords for ${updated} users`);
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

fixPasswords().catch(console.error);