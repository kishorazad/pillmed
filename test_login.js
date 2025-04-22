/**
 * Test script to verify the login functionality
 */
import fetch from 'node-fetch';
import { mongoDBService } from './server/services/mongodb-service';

async function testLogin() {
  console.log('Testing login functionality...');
  
  try {
    // First, set the global.useMongoStorage flag
    global.useMongoStorage = true;
  
    // Connect to MongoDB
    await mongoDBService.connect();
    console.log('MongoDB connected');
    
    // Test credentials
    const username = 'admin';
    const password = 'Admin@123';
    
    console.log(`\nAttempting to login with username: ${username}`);
    
    // Call the login endpoint
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    if (response.status === 200) {
      console.log('✅ Login successful');
    } else {
      console.log('❌ Login failed');
    }
    
    // Now test OTP login
    console.log('\nTesting OTP login flow...');
    const testEmail = 'brizkishor.azad@gmail.com';
    
    console.log(`\nRequesting login OTP for email: ${testEmail}`);
    const otpResponse = await fetch('http://localhost:5000/api/auth/request-login-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const otpData = await otpResponse.json();
    console.log(`Status: ${otpResponse.status}`);
    console.log('Response:', otpData);
    
    if (otpResponse.status === 200) {
      console.log('✅ OTP request successful');
      
      if (otpData.testOtp) {
        console.log(`🔑 Generated OTP: ${otpData.testOtp}`);
        
        // Now try to verify the OTP
        console.log('\nVerifying the OTP...');
        const verifyResponse = await fetch('http://localhost:5000/api/auth/verify-login-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: testEmail, 
            otp: otpData.testOtp 
          })
        });
        
        const verifyData = await verifyResponse.json();
        console.log(`Status: ${verifyResponse.status}`);
        console.log('Response:', verifyData);
        
        if (verifyResponse.status === 200) {
          console.log('✅ OTP verification successful');
        } else {
          console.log('❌ OTP verification failed');
        }
      }
    } else {
      console.log('❌ OTP request failed');
    }
    
  } catch (error) {
    console.error('Login test error:', error);
  }
}

// Run the test
testLogin();