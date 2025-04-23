/**
 * Test script to verify admin login through the front-end interface
 * This stores cookies and verifies a protected admin route
 */

import axios from 'axios';
import { writeFileSync, readFileSync } from 'fs';

const baseUrl = 'http://localhost:5000';
const adminEmail = 'admin@pillnow.info'; // Updated admin email
const password = 'admin123'; // New password set in the reset process
const cookieFile = './cookies.txt';

// Create a function to manage cookies
function saveCookies(cookies) {
  writeFileSync(cookieFile, cookies);
  console.log('Cookies saved to', cookieFile);
}

function loadCookies() {
  try {
    return readFileSync(cookieFile, 'utf8');
  } catch (error) {
    return '';
  }
}

// Create a new axios instance with cookie handling
const client = axios.create({
  baseURL: baseUrl,
  withCredentials: true
});

// Add interceptors to manage cookies
client.interceptors.request.use(config => {
  const cookies = loadCookies();
  if (cookies) {
    config.headers.Cookie = cookies;
  }
  return config;
});

client.interceptors.response.use(response => {
  const setCookies = response.headers['set-cookie'];
  if (setCookies) {
    saveCookies(setCookies.join('; '));
  }
  return response;
});

async function testAdminInterfaceLogin() {
  try {
    console.log('Testing admin login through front-end interface...');
    
    // Step 1: Log in and store cookies
    const loginResponse = await client.post('/api/auth/login', {
      email: adminEmail,
      password: password
    });
    
    console.log('\nLOGIN SUCCESSFUL! ✅');
    console.log('User data:', loginResponse.data.username);
    console.log('Role:', loginResponse.data.role);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: First check the current user session
    console.log('\nVerifying user session...');
    const userResponse = await client.get('/api/user');
    console.log('Session user data:', userResponse.data);
    
    // Step 3: Access a protected admin route
    console.log('\nAccessing protected admin route...');
    // Try a different admin endpoint that we know exists
    const adminDashboardResponse = await client.get('/api/admin/users');
    
    console.log('ADMIN ROUTE ACCESS SUCCESSFUL! ✅');
    console.log('Dashboard data received');
    
    console.log('\nVERIFICATION COMPLETE: Admin interface login works correctly');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error('\nADMIN INTERFACE LOGIN TEST FAILED');
    if (error.response) {
      console.error('Status code:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAdminInterfaceLogin();