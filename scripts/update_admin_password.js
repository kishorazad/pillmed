import { MongoClient } from "mongodb";
import { scryptSync, randomBytes } from "crypto";

// Function to hash password with salt
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

async function updateAdminPassword() {
  const uri = process.env.MONGODB_URI;
  // Change this to your desired new password
  const newPassword = "admin456"; // Changing from admin123 to admin456
  
  try {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log("Connected successfully to MongoDB");
    const database = client.db("pillnow");
    const users = database.collection("users");
    
    // Find admin user by username "papaji"
    const user = await users.findOne({ username: "papaji" });
    
    if (!user) {
      console.log("Admin user not found in database");
      // Try finding by role instead
      const adminByRole = await users.findOne({ role: "admin" });
      
      if (!adminByRole) {
        console.log("No admin users found in the database");
        return;
      }
      
      console.log("Found admin by role:", adminByRole.username);
      
      // Hash the new password
      const hashedPassword = hashPassword(newPassword);
      
      // Update admin's password
      const result = await users.updateOne(
        { _id: adminByRole._id },
        { $set: { password: hashedPassword } }
      );
      
      if (result.modifiedCount === 1) {
        console.log(`Admin password successfully updated for ${adminByRole.username}`);
        console.log(`New password is: ${newPassword}`);
      } else {
        console.log("Failed to update admin password");
      }
      
      return;
    }
    
    console.log("Found admin user:", user.username);
    
    // Hash the new password
    const hashedPassword = hashPassword(newPassword);
    
    // Update admin's password
    const result = await users.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    if (result.modifiedCount === 1) {
      console.log(`Admin password successfully updated for ${user.username}`);
      console.log(`New password is: ${newPassword}`);
    } else {
      console.log("Failed to update admin password");
    }
    
    await client.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error updating admin password:", error);
  }
}

updateAdminPassword();