/**
 * Direct test of admin login to verify password handling is working correctly
 */

import axios from 'axios';

const baseUrl = 'http://localhost:5000';
const email = 'admin@pillnow.com';
const password = 'admin';

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    const response = await axios.post(`${baseUrl}/api/auth/login`, {
      email,
      password
    });
    
    console.log('Login successful!');
    console.log('Admin user data:', response.data);
    return true;
  } catch (error) {
    console.error('Admin login failed:');
    if (error.response) {
      console.error('Status code:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

// Run the test
testAdminLogin();