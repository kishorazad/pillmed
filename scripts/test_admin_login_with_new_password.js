/**
 * Test script to verify login with updated admin credentials
 */

import axios from 'axios';

const baseUrl = 'http://localhost:5000';
const adminEmail = 'admin@pillnow.info'; // Updated admin email
const password = 'admin123'; // New password set in the reset process

async function testAdminLogin() {
  try {
    console.log('Testing admin login with updated credentials...');
    
    const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
      email: adminEmail,
      password: password
    });
    
    console.log('\nLOGIN SUCCESSFUL! ✅');
    console.log('User data:', loginResponse.data.username);
    console.log('Role:', loginResponse.data.role);
    console.log('Email:', loginResponse.data.email);
    
    console.log('\nVERIFICATION COMPLETE: Admin credentials updated successfully');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error('\nLOGIN TEST FAILED');
    if (error.response) {
      console.error('Status code:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAdminLogin();