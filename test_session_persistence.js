/**
 * Session Persistence Test Script
 * 
 * This script tests the login session persistence by:
 * 1. Logging in with test credentials
 * 2. Checking the session immediately after login
 * 3. Making multiple subsequent requests to verify session persistence
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'admin123';

async function testSessionPersistence() {
  console.log('=== SESSION PERSISTENCE TEST ===');
  console.log('Testing login and session persistence with MongoDB store');
  console.log(`Using test account: ${TEST_USERNAME}`);
  console.log('-----------------------------------');
  
  let cookies = '';
  let userId = null;
  
  try {
    // Step 1: Login to get session cookie
    console.log('\n1. Attempting login...');
    const loginResponse = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: TEST_USERNAME,
        password: TEST_PASSWORD
      })
    });
    
    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      throw new Error(`Login failed with status ${loginResponse.status}: ${JSON.stringify(error)}`);
    }
    
    // Extract and log cookies
    const loginCookieHeader = loginResponse.headers.get('set-cookie');
    if (loginCookieHeader) {
      cookies = loginCookieHeader;
      console.log('Received cookies:', cookies);
    } else {
      console.warn('WARNING: No cookies received from login response!');
    }
    
    // Parse user data
    const userData = await loginResponse.json();
    console.log('Login successful:', {
      id: userData.id,
      username: userData.username,
      role: userData.role
    });
    userId = userData.id;
    
    // Step 2: Check session status immediately after login
    console.log('\n2. Checking session status immediately after login...');
    const sessionCheckResponse = await fetch(`${BASE_URL}/api/session-check`, {
      headers: {
        'Cookie': cookies
      }
    });
    
    if (!sessionCheckResponse.ok) {
      const error = await sessionCheckResponse.json();
      throw new Error(`Session check failed with status ${sessionCheckResponse.status}: ${JSON.stringify(error)}`);
    }
    
    const sessionStatus = await sessionCheckResponse.json();
    console.log('Session check result:', sessionStatus);
    
    if (!sessionStatus.isAuthenticated) {
      console.error('ERROR: Session not authenticated immediately after login!');
    } else {
      console.log('Success: Session authenticated with user ID:', sessionStatus.sessionData.user.id);
    }
    
    // Step 3: Get user data to verify session persistence
    console.log('\n3. Fetching user data to verify session persistence...');
    const userResponse = await fetch(`${BASE_URL}/api/user`, {
      headers: {
        'Cookie': cookies
      }
    });
    
    if (!userResponse.ok) {
      const error = await userResponse.json();
      throw new Error(`User data fetch failed with status ${userResponse.status}: ${JSON.stringify(error)}`);
    }
    
    const user = await userResponse.json();
    if (!user) {
      console.error('ERROR: User data is null despite being logged in!');
    } else {
      console.log('Success: User data retrieved successfully:', {
        id: user.id,
        username: user.username,
        role: user.role
      });
    }
    
    // Step 4: Make a second user data request to confirm persistent session
    console.log('\n4. Making second user data request to confirm session persistence...');
    const secondUserResponse = await fetch(`${BASE_URL}/api/user`, {
      headers: {
        'Cookie': cookies
      }
    });
    
    if (!secondUserResponse.ok) {
      const error = await secondUserResponse.json();
      throw new Error(`Second user fetch failed with status ${secondUserResponse.status}: ${JSON.stringify(error)}`);
    }
    
    const secondUser = await secondUserResponse.json();
    if (!secondUser) {
      console.error('ERROR: Session lost after second request!');
    } else {
      console.log('Success: Session persisted through second request:', {
        id: secondUser.id,
        username: secondUser.username,
        role: secondUser.role
      });
    }
    
    console.log('\n=== TEST SUMMARY ===');
    if (sessionStatus.isAuthenticated && user && secondUser) {
      console.log('✅ Session persistence test PASSED! Session maintained across multiple requests.');
    } else {
      console.log('❌ Session persistence test FAILED! See errors above.');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

// Run the test
testSessionPersistence();