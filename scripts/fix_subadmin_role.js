import { MongoClient, ObjectId } from "mongodb";
import { scryptSync, randomBytes } from "crypto";

// Function to hash password with salt
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

async function fixSubadminRole() {
  const uri = process.env.MONGODB_URI;
  
  try {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log("Connected successfully to MongoDB");
    const database = client.db("pillnow");
    const users = database.collection("users");
    
    // Find the subadmin user by username
    const subadminUser = await users.findOne({ username: "subadmin" });
    
    if (!subadminUser) {
      console.log("No user with username 'subadmin' found");
      return;
    }
    
    console.log(`Found subadmin user: ${subadminUser.username}, Current Role: ${subadminUser.role}`);
    
    // Update the role to subadmin if it's not already
    if (subadminUser.role !== "subadmin") {
      console.log(`Updating role from ${subadminUser.role} to 'subadmin'`);
      
      // Reset password while we're at it
      const subadminPassword = "subadmin123";
      const hashedPassword = hashPassword(subadminPassword);
      
      const result = await users.updateOne(
        { _id: subadminUser._id },
        { $set: { 
            role: "subadmin",
            password: hashedPassword
          } 
        }
      );
      
      if (result.modifiedCount === 1) {
        console.log(`Subadmin role and password updated successfully`);
        console.log(`Username: subadmin, Password: ${subadminPassword}`);
      } else {
        console.log(`Failed to update subadmin role`);
      }
    } else {
      console.log("Subadmin user already has the correct role. Resetting password only.");
      
      // Reset password
      const subadminPassword = "subadmin123";
      const hashedPassword = hashPassword(subadminPassword);
      
      const result = await users.updateOne(
        { _id: subadminUser._id },
        { $set: { password: hashedPassword } }
      );
      
      if (result.modifiedCount === 1) {
        console.log(`Subadmin password updated successfully`);
        console.log(`Username: subadmin, Password: ${subadminPassword}`);
      } else {
        console.log(`Failed to update subadmin password`);
      }
    }
    
    await client.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error updating subadmin role:", error);
  }
}

console.log("Starting subadmin role fix script...");
fixSubadminRole();