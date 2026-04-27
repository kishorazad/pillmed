/**
 * Script to check the email suppression list and email events in MongoDB
 */
import { MongoClient } from 'mongodb';

async function checkSuppressionList() {
  try {
    console.log('Connecting to MongoDB...');
    const uri = process.env.MONGODB_URI || 'mongodb+srv://brijkishorazad:brijeshazad123@cluster0.ncw79xh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log('Connected successfully to MongoDB');
    
    const database = client.db('pillnow');
    
    // Check email suppression list
    console.log('\n=== EMAIL SUPPRESSION LIST ===');
    const suppressionCollection = database.collection('email_suppression_list');
    const suppressionList = await suppressionCollection.find({}).toArray();
    
    if (suppressionList.length === 0) {
      console.log('No entries in the suppression list');
    } else {
      suppressionList.forEach((entry, index) => {
        console.log(`[${index + 1}] Email: ${entry.email}`);
        console.log(`    Reason: ${entry.reason}`);
        console.log(`    Added: ${entry.timestamp}`);
        console.log(`    Active: ${entry.active}`);
        console.log('------------------------');
      });
    }
    
    // Check email events
    console.log('\n=== EMAIL EVENTS ===');
    const eventsCollection = database.collection('email_events');
    const events = await eventsCollection.find({}).sort({ timestamp: -1 }).limit(10).toArray();
    
    if (events.length === 0) {
      console.log('No email events recorded');
    } else {
      events.forEach((event, index) => {
        console.log(`[${index + 1}] Type: ${event.type}`);
        console.log(`    To: ${event.data.to}`);
        console.log(`    Subject: ${event.data.subject || 'N/A'}`);
        console.log(`    Time: ${event.timestamp}`);
        console.log(`    Processed: ${event.processed}`);
        console.log('------------------------');
      });
    }
    
    await client.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSuppressionList();