/**
 * Test script to verify the Forgot Password functionality
 * This tests the /api/auth/forgot-password endpoint with MongoDB storage
 */
import fetch from 'node-fetch';
import { mongoDBService } from './server/services/mongodb-service';

async function testForgotPassword() {
  console.log('Testing Forgot Password with real user email...');

  // First, set the global.useMongoStorage flag
  global.useMongoStorage = true;
  
  try {
    // Get MongoDB connection
    await mongoDBService.connect();
    console.log('MongoDB connected');

    // Use email from test user
    const email = 'brizkishor.azad@gmail.com';
    
    // Check if user exists in MongoDB directly
    const usersCollection = mongoDBService.getCollection('users');
    const user = await usersCollection.findOne({ email });
    
    if (user) {
      console.log(`✅ Found user in MongoDB: ${user.username} (${user.email})`);
    } else {
      console.log('❌ User not found in MongoDB');
    }
    
    // Call the forgot password endpoint
    console.log(`\nCalling forgot password endpoint for email: ${email}`);
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    if (response.status === 200) {
      console.log('✅ Password reset request sent successfully');
      if (data.testOtp) {
        console.log(`🔑 OTP Code: ${data.testOtp}`);
      }
    } else {
      console.log('❌ Password reset request failed');
    }
    
    console.log('\nNow testing with incorrect email');
    const wrongResponse = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'wrong@example.com' })
    });
    
    const wrongData = await wrongResponse.json();
    console.log(`Status: ${wrongResponse.status}`);
    console.log('Response:', wrongData);
    
    if (wrongResponse.status === 200) {
      console.log('✅ Got successful response for non-existent user (expected for security)');
    } else {
      console.log('❌ Unexpected error response for non-existent user');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testForgotPassword();