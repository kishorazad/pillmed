import { MongoClient, ObjectId } from "mongodb";
import { scryptSync, randomBytes } from "crypto";

// Function to hash password with salt
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

async function listAllUsersAndFixAdmin() {
  const uri = process.env.MONGODB_URI;
  
  try {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log("Connected successfully to MongoDB");
    const database = client.db("pillnow");
    const users = database.collection("users");
    
    // List all users to debug
    console.log("Listing all users in the database:");
    const allUsers = await users.find({}).toArray();
    
    console.log(`Found ${allUsers.length} users:`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}, Role: ${user.role}, Email: ${user.email || 'N/A'}`);
    });
    
    // Find admin user by role
    const adminUsers = await users.find({ role: "admin" }).toArray();
    
    if (adminUsers.length === 0) {
      console.log("No admin users found. Creating a new admin user...");
      
      // Define admin credentials
      const adminUsername = "admin";
      const adminPassword = "admin123";
      const hashedPassword = hashPassword(adminPassword);
      
      // Create new admin user
      const result = await users.insertOne({
        username: adminUsername,
        password: hashedPassword,
        role: "admin",
        email: "admin@pillnow.com",
        name: "Administrator",
        createdAt: new Date()
      });
      
      if (result.insertedId) {
        console.log(`New admin user created successfully.`);
        console.log(`Username: ${adminUsername}, Password: ${adminPassword}`);
      } else {
        console.log("Failed to create new admin user");
      }
    } else {
      console.log(`Found ${adminUsers.length} admin users. Resetting passwords for all admins...`);
      
      // Reset password for all admin users
      const adminPassword = "admin123";
      const hashedPassword = hashPassword(adminPassword);
      
      for (const admin of adminUsers) {
        const updateResult = await users.updateOne(
          { _id: admin._id },
          { $set: { 
              password: hashedPassword,
              username: admin.username === "papaji" ? "admin" : admin.username // Rename papaji to admin if exists
            } 
          }
        );
        
        if (updateResult.modifiedCount === 1) {
          console.log(`Password reset successful for admin: ${admin.username}`);
          console.log(`New credentials: Username: ${admin.username === "papaji" ? "admin" : admin.username}, Password: ${adminPassword}`);
        } else {
          console.log(`Failed to reset password for admin: ${admin.username}`);
        }
      }
    }
    
    // Also make sure there is a fallback subadmin user
    const subadminUsers = await users.find({ role: "subadmin" }).toArray();
    
    if (subadminUsers.length === 0) {
      console.log("No subadmin users found. Creating a new subadmin user...");
      
      // Define subadmin credentials
      const subadminUsername = "subadmin";
      const subadminPassword = "subadmin123";
      const hashedPassword = hashPassword(subadminPassword);
      
      // Create new subadmin user
      const result = await users.insertOne({
        username: subadminUsername,
        password: hashedPassword,
        role: "subadmin",
        email: "subadmin@pillnow.com",
        name: "Sub Administrator",
        createdAt: new Date()
      });
      
      if (result.insertedId) {
        console.log(`New subadmin user created successfully.`);
        console.log(`Username: ${subadminUsername}, Password: ${subadminPassword}`);
      } else {
        console.log("Failed to create new subadmin user");
      }
    }
    
    await client.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error updating admin credentials:", error);
  }
}

console.log("Starting admin credentials fix script...");
listAllUsersAndFixAdmin();