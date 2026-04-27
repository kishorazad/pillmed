import { MongoClient } from "mongodb";

async function updateUserRole() {
  const uri = process.env.MONGODB_URI;
  
  try {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log("Connected successfully to MongoDB");
    const database = client.db("pillnow");
    const users = database.collection("users");
    
    // Find mamta user
    const user = await users.findOne({ username: "mamta" });
    
    if (!user) {
      console.log("User 'mamta' not found in database");
      return;
    }
    
    console.log("Found user:", user.username, "with ID:", user.id);
    
    // Update user's role to 'admin'
    const result = await users.updateOne(
      { username: "mamta" },
      { $set: { role: "admin" } }
    );
    
    if (result.modifiedCount === 1) {
      console.log("User role successfully updated to 'admin'");
      
      // Verify the update
      const updatedUser = await users.findOne({ username: "mamta" });
      console.log("Updated user details:", {
        username: updatedUser.username,
        id: updatedUser.id,
        role: updatedUser.role
      });
    } else {
      console.log("Failed to update user role");
    }
    
    await client.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error updating user role:", error);
  }
}

updateUserRole();