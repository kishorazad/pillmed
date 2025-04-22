import fetch from 'node-fetch';

async function testApplicationConnectivity() {
  try {
    console.log('Starting application connectivity tests...');
    
    // Test 1: Session check
    console.log('\n--- Test 1: Session Check ---');
    const sessionResponse = await fetch('http://localhost:5000/api/session-check');
    const sessionData = await sessionResponse.json();
    console.log('Session check response:', sessionData);
    
    // Test 2: Login functionality
    console.log('\n--- Test 2: Login Functionality ---');
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    // Test 3: Email functionality
    console.log('\n--- Test 3: Email Functionality ---');
    const emailResponse = await fetch('http://localhost:5000/api/test-welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });
    const emailData = await emailResponse.json();
    console.log('Email test response:', emailData);
    
    console.log('\nAll connectivity tests completed.');
  } catch (error) {
    console.error('Connectivity test error:', error);
  }
}

testApplicationConnectivity();