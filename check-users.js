import { MongoClient } from 'mongodb';
import { randomBytes, scryptSync } from 'crypto';

// Helper function to hash a password
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

// Helper function to verify a password
function verifyPassword(password, hashedPassword) {
  try {
    const [hash, salt] = hashedPassword.split('.');
    const hashVerify = scryptSync(password, salt, 64).toString('hex');
    return hash === hashVerify;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

async function checkUsers() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable not set');
    return;
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('pillnow');
    const users = db.collection('users');
    
    // List all users
    const allUsers = await users.find({}).toArray();
    console.log(`Found ${allUsers.length} users in the database`);
    
    allUsers.forEach(user => {
      console.log(`User: ${user.username}, Role: ${user.role}, Password format: ${user.password.includes('.') ? 'Hashed' : 'Plain'}`);
    });
    
    // Update predefined users with correct passwords
    const userCredentials = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'user1', password: 'password123', role: 'customer' },
      { username: 'doctor1', password: 'doctor123', role: 'doctor' },
      { username: 'pharmacy1', password: 'pharmacy123', role: 'pharmacy' },
      { username: 'chemist1', password: 'chemist123', role: 'chemist' },
      { username: 'lab1', password: 'lab123', role: 'laboratory' },
      { username: 'hospital1', password: 'hospital123', role: 'hospital' }
    ];
    
    // Create or update these users
    let created = 0;
    let updated = 0;
    
    for (const credentials of userCredentials) {
      const user = await users.findOne({ username: credentials.username });
      
      if (user) {
        // Update the user's password if needed
        const hashedPassword = hashPassword(credentials.password);
        await users.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        console.log(`Updated password for ${credentials.username}`);
        updated++;
      } else {
        // Create the user if they don't exist
        const newUser = {
          username: credentials.username,
          password: hashPassword(credentials.password),
          name: credentials.username,
          email: `${credentials.username}@example.com`,
          role: credentials.role,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await users.insertOne(newUser);
        console.log(`Created user ${credentials.username} with role ${credentials.role}`);
        created++;
      }
    }
    
    console.log(`Summary: Created ${created} users, updated ${updated} users`);
    
  } catch (error) {
    console.error('Error checking/updating users:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

checkUsers().catch(console.error);