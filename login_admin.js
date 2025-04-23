/**
 * Simple script to test admin login
 */
import fetch from 'node-fetch';

async function loginAsAdmin() {
  console.log('Attempting to login as admin...');
  
  try {
    // Admin credentials
    const credentials = {
      username: 'admin',
      password: 'Admin@123'
    };
    
    // Send login request
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      redirect: 'manual'
    });
    
    const responseStatus = response.status;
    console.log(`Login status: ${responseStatus}`);
    
    try {
      const data = await response.json();
      console.log('Response:', data);
    } catch (error) {
      console.log('No JSON response body');
      console.log('Headers:', response.headers);
    }
    
    // Test sales dashboard endpoint
    console.log('\nTesting sales dashboard endpoint...');
    const dashboardResponse = await fetch('http://localhost:5000/api/admin/sales-dashboard/product-demand', {
      headers: { 'Cookie': response.headers.get('set-cookie') }
    });
    
    console.log(`Sales dashboard status: ${dashboardResponse.status}`);
    try {
      const dashboardData = await dashboardResponse.json();
      console.log('Sales dashboard response:', dashboardData);
    } catch (error) {
      console.log('No JSON response body for dashboard');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

loginAsAdmin();