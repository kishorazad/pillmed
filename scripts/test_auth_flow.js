/**
 * Test script for auth flow integration
 */
import axios from 'axios';

async function testAuthFlow() {
  console.log('Testing auth flow integration...');
  
  try {
    // 1. Test password reset request (forgot password)
    console.log('\n--- Testing forgot password flow ---');
    const resetResponse = await axios.post('http://localhost:5000/api/auth/forgot-password', {
      email: 'brizkishor.azad@gmail.com'
    });
    
    console.log(`Status: ${resetResponse.status}`);
    console.log('Response:', resetResponse.data);
    
    // Success is status 200, even if message is generic for security reasons
    if (resetResponse.status === 200) {
      console.log('✅ Password reset request sent successfully');
      console.log('Note: For security reasons, the API returns a generic success message');
      console.log('whether or not the email exists in the system');
    } else {
      console.log('❌ Password reset request failed with server error');
    }
    
    // 2. Test user existence - create a more direct check for testing
    console.log('\n--- Testing if user exists (for testing only) ---');
    try {
      const checkUserResponse = await axios.post('http://localhost:5000/api/auth/check-email', {
        email: 'brizkishor.azad@gmail.com'
      });
      
      console.log(`Status: ${checkUserResponse.status}`);
      
      if (checkUserResponse.data && checkUserResponse.data.exists) {
        console.log('✅ User exists in the system');
      } else {
        console.log('❓ User may not exist in the system');
      }
    } catch (checkError) {
      console.log('❓ Could not verify if user exists:', checkError.response?.data || checkError.message);
    }
    
    // 3. Test login (commented out since it requires valid credentials)
    /* 
    console.log('\n--- Testing login flow ---');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'brizkishor.azad@gmail.com',
        password: 'testpassword123'
      });
      
      console.log(`Status: ${loginResponse.status}`);
      console.log('Response:', loginResponse.data);
      
      if (loginResponse.status === 200 && loginResponse.data.user) {
        console.log('✅ Login successful');
      } else {
        console.log('❌ Login failed');
      }
    } catch (loginError) {
      console.error('Login error:', loginError.response?.data || loginError.message);
    }
    */
    
  } catch (error) {
    console.error('Error during auth flow test:', error.response?.data || error.message);
  }
}

testAuthFlow();