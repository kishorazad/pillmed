/**
 * Test script for admin sales dashboard access
 */
import fetch from 'node-fetch';
import fetchCookie from 'node-fetch-cookies';

async function testAdminSalesDashboard() {
  console.log('Testing admin sales dashboard access...');
  
  // Create a cookie jar to store and send cookies between requests
  const cookieJar = createCookieJar();
  
  try {
    // Admin credentials
    const credentials = {
      username: 'admin',
      password: 'admin123' // Using the correct password from the logs
    };
    
    console.log(`Step 1: Login with username: ${credentials.username}`);
    
    // Login and store cookies
    const loginResponse = await fetch(cookieJar, 'http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    console.log(`Login status: ${loginResponse.status}`);
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginResponse.status !== 200) {
      console.log('Login failed. Testing sales dashboard without authentication...');
    } else {
      console.log('Login successful!');
    }
    
    // Now try to access the product demand endpoint
    console.log('\nStep 2: Accessing sales dashboard product demand data...');
    const demandResponse = await fetch(cookieJar, 'http://localhost:5000/api/admin/products', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Product demand endpoint status: ${demandResponse.status}`);
    
    try {
      const demandData = await demandResponse.json();
      console.log(`Received ${demandData.length || 0} products with sales data`);
      if (demandData.length > 0) {
        console.log('First product sample:', demandData[0]);
      } else if (demandData.message) {
        console.log('Response message:', demandData.message);
      }
    } catch (error) {
      console.log('Error parsing product demand response');
    }
    
    // Access the sales stats endpoint
    console.log('\nStep 3: Accessing sales dashboard stats data...');
    const statsResponse = await fetch(cookieJar, 'http://localhost:5000/api/admin/stats', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Sales stats endpoint status: ${statsResponse.status}`);
    
    try {
      const statsData = await statsResponse.json();
      console.log('Sales stats response:', statsData);
    } catch (error) {
      console.log('Error parsing sales stats response');
    }
    
    // Access the sales data endpoint
    console.log('\nStep 4: Accessing sales data...');
    const salesResponse = await fetch(cookieJar, 'http://localhost:5000/api/admin/sales', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Sales data endpoint status: ${salesResponse.status}`);
    
    try {
      const salesData = await salesResponse.json();
      console.log(`Received ${salesData.length || 0} sales records`);
      if (salesData.length > 0) {
        console.log('First sales record sample:', salesData[0]);
      } else if (salesData.message) {
        console.log('Response message:', salesData.message);
      }
    } catch (error) {
      console.log('Error parsing sales data response');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testAdminSalesDashboard();