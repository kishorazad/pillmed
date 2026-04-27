import { MongoClient } from "mongodb";
import { scryptSync, timingSafeEqual } from "crypto";

// Function to verify password against hashed password with salt
function verifyPassword(password, hashedPassword) {
  const [hash, salt] = hashedPassword.split('.');
  const hashBuffer = Buffer.from(hash, 'hex');
  const suppliedHashBuffer = scryptSync(password, salt, 64);
  
  return timingSafeEqual(hashBuffer, suppliedHashBuffer);
}

async function testAdminLogin() {
  const uri = process.env.MONGODB_URI;
  const testCredentials = [
    { username: "admin", password: "admin123" },
    { username: "brijpapa", password: "admin123" },
    { username: "brij1992", password: "admin123" },
    { username: "subadmin", password: "subadmin123" }
  ];
  
  try {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log("Connected successfully to MongoDB");
    const database = client.db("pillnow");
    const users = database.collection("users");
    
    for (const cred of testCredentials) {
      console.log(`\nTesting login for username: ${cred.username}`);
      
      // Find user by username
      const user = await users.findOne({ username: cred.username });
      
      if (!user) {
        console.log(`❌ User not found with username: ${cred.username}`);
        continue;
      }
      
      console.log(`User found: ${user.username}, Role: ${user.role}`);
      
      // Verify password
      const passwordMatch = verifyPassword(cred.password, user.password);
      
      if (passwordMatch) {
        console.log(`✅ Password verification successful for ${user.username}`);
      } else {
        console.log(`❌ Password verification failed for ${user.username}`);
        // Print the first few characters of the stored hash for debugging
        console.log(`Stored password hash (first 20 chars): ${user.password.substring(0, 20)}...`);
      }
    }
    
    await client.close();
    console.log("\nMongoDB connection closed");
  } catch (error) {
    console.error("Error testing admin login:", error);
  }
}

console.log("Starting admin login test...");
testAdminLogin();