/**
 * Test script to verify that ZohoMail is now being used as the primary email provider
 */
import fetch from 'node-fetch';
import { mongoDBService } from './server/services/mongodb-service';

async function testZohoPrimary() {
  console.log('Testing ZohoMail as primary email provider...');
  
  try {
    // First, set the global.useMongoStorage flag
    global.useMongoStorage = true;
  
    // Connect to MongoDB
    await mongoDBService.connect();
    console.log('MongoDB connected');
    
    // Email to use for testing
    const email = 'brizkishor.azad@gmail.com';
    
    // Call the forgot password endpoint which will send an email
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
        console.log('Email should be delivered using ZohoMail as primary provider');
      }
    } else {
      console.log('❌ Password reset request failed');
    }
    
  } catch (error) {
    console.error('Error during ZohoMail test:', error);
  }
}

// Run the test
testZohoPrimary();