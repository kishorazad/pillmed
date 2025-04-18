const { MongoClient } = require('mongodb'); 

async function createChemist() { 
  const client = new MongoClient(process.env.MONGODB_URI); 
  try {
    await client.connect(); 
    const db = client.db('pillnow'); 
    
    const chemist = { 
      username: 'chemist1', 
      password: 'chemist123', 
      name: 'City Chemist', 
      email: 'chemist@example.com', 
      phone: '9998887777', 
      address: '202 Medicine Street, Pharma City', 
      pincode: '110005', 
      role: 'chemist', 
      profileImageUrl: null, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    }; 
    
    const result = await db.collection('users').insertOne(chemist); 
    console.log('Chemist user created with ID:', result.insertedId); 
  } catch (err) { 
    console.error('Error creating chemist user:', err); 
  } finally {
    await client.close(); 
  }
} 

createChemist().catch(console.error);
