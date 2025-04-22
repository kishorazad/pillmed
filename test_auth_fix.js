/**
 * Test script to verify and fix the login functionality
 */
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

// Test credentials for a known user
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'admin123';

// MongoDB connection credentials
const mongoUri = process.env.MONGODB_URI;
const dbName = 'pillnow';

async function testLogin() {
  try {
    console.log('====== TESTING LOGIN FUNCTIONALITY ======');
    
    // First check MongoDB connection
    console.log('1. Testing MongoDB connection...');
    const client = new MongoClient(mongoUri);
    try {
      await client.connect();
      console.log('✅ MongoDB connection successful');
      
      // Check if test user exists
      const db = client.db(dbName);
      const users = db.collection('users');
      const testUser = await users.findOne({ username: TEST_USERNAME });
      
      if (testUser) {
        console.log(`✅ Test user found: ${TEST_USERNAME} (ID: ${testUser.id})`);
      } else {
        console.log(`⚠️ Test user not found: ${TEST_USERNAME}`);
        console.log('Creating test user...');
        // Implementation for creating a test user would go here
      }
    } catch (mongoError) {
      console.error('❌ MongoDB connection failed:', mongoError.message);
    } finally {
      await client.close();
    }
    
    // Test the login API
    console.log('\n2. Testing login API...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: TEST_USERNAME,
        password: TEST_PASSWORD
      }),
      redirect: 'manual'
    });
    
    // Output response details
    console.log(`Login API response status: ${loginResponse.status}`);
    console.log('Login API response headers:');
    loginResponse.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    // Check for session cookie
    const cookies = loginResponse.headers.get('set-cookie');
    if (cookies) {
      console.log('✅ Session cookie found:', cookies);
    } else {
      console.log('❌ No session cookie in response');
    }
    
    const loginData = await loginResponse.json();
    console.log('Login API response body:', JSON.stringify(loginData, null, 2));
    
    if (loginResponse.status === 200 && loginData.id) {
      console.log('✅ Login API test passed');
      
      // Test the /api/user endpoint with the session cookie
      console.log('\n3. Testing /api/user endpoint to verify session...');
      const userResponse = await fetch('http://localhost:5000/api/user', {
        headers: {
          'Cookie': cookies
        }
      });
      
      console.log(`User API response status: ${userResponse.status}`);
      
      if (userResponse.status === 200) {
        const userData = await userResponse.json();
        console.log('User API response body:', JSON.stringify(userData, null, 2));
        console.log('✅ User API test passed');
      } else {
        console.log('❌ User API test failed');
      }
    } else {
      console.log('❌ Login API test failed');
    }
    
    console.log('\n====== TEST COMPLETE ======');
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testLogin();