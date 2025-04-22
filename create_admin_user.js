import { MongoClient } from "mongodb";
import { scryptSync, randomBytes } from "crypto";

// Function to hash password with salt
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

async function createAdminUser() {
  // Set your admin credentials here
  const adminUsername = "admin2"; // Change this to your desired username
  const adminPassword = "admin123"; // Change this to your desired password
  const adminEmail = "admin2@pillnow.com"; // Change this to your desired email
  const adminName = "Administrator 2"; // Change this to your desired name
  
  const uri = process.env.MONGODB_URI;
  
  try {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log("Connected successfully to MongoDB");
    const database = client.db("pillnow");
    const users = database.collection("users");
    
    // Check if username already exists
    const existingUser = await users.findOne({ username: adminUsername });
    
    if (existingUser) {
      console.log(`Username ${adminUsername} already exists. Please choose a different username.`);
      await client.close();
      return;
    }
    
    // Hash the password
    const hashedPassword = hashPassword(adminPassword);
    
    // Create the admin user
    const result = await users.insertOne({
      username: adminUsername,
      password: hashedPassword,
      role: "admin", // or "subadmin" if creating a subadmin
      email: adminEmail,
      name: adminName,
      createdAt: new Date()
    });
    
    if (result.insertedId) {
      console.log(`New admin user created successfully.`);
      console.log(`Username: ${adminUsername}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Role: admin`);
    } else {
      console.log("Failed to create new admin user");
    }
    
    await client.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

createAdminUser();