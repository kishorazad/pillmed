/**
 * Detailed Email Testing Script
 * 
 * This script tests the email functionality with detailed logging to help
 * troubleshoot issues with the Resend API integration.
 */

import fetch from 'node-fetch';

// Config
const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'test@example.com'; // Replace with a real email if needed

async function testEmailInDetail() {
  console.log('=== DETAILED EMAIL SERVICE TEST ===');
  console.log(`Testing email delivery with Resend`);
  console.log(`Test email recipient: ${TEST_EMAIL}`);
  console.log('-----------------------------------');
  
  try {
    // Test password reset email (OTP)
    console.log('\n1. Testing password reset OTP email...');
    
    // Generate a random 6-digit OTP for testing
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated test OTP: ${otp}`);
    
    // Call the backend API to send a password reset email
    const resetResponse = await fetch(`${BASE_URL}/api/password-reset/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_EMAIL
      })
    });
    
    // Log detailed response information
    console.log(`Response status: ${resetResponse.status}`);
    console.log(`Response status text: ${resetResponse.statusText}`);
    
    const resetResponseHeaders = {};
    resetResponse.headers.forEach((value, key) => {
      resetResponseHeaders[key] = value;
    });
    console.log('Response headers:', resetResponseHeaders);
    
    const resetData = await resetResponse.json();
    console.log('Response body:', resetData);
    
    if (!resetResponse.ok) {
      console.error('ERROR: Password reset email request failed!');
    } else {
      console.log('Password reset email request successful!');
    }
    
    // Test welcome email
    console.log('\n2. Testing welcome email...');
    const welcomeResponse = await fetch(`${BASE_URL}/api/test-welcome-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        name: 'Test User'
      })
    });
    
    // Log detailed response information
    console.log(`Response status: ${welcomeResponse.status}`);
    console.log(`Response status text: ${welcomeResponse.statusText}`);
    
    const welcomeResponseHeaders = {};
    welcomeResponse.headers.forEach((value, key) => {
      welcomeResponseHeaders[key] = value;
    });
    console.log('Response headers:', welcomeResponseHeaders);
    
    let welcomeData;
    try {
      welcomeData = await welcomeResponse.json();
      console.log('Response body:', welcomeData);
    } catch (e) {
      console.log('Response body is not valid JSON:', await welcomeResponse.text());
    }
    
    if (!welcomeResponse.ok) {
      console.error('ERROR: Welcome email request failed!');
    } else {
      console.log('Welcome email request successful!');
    }
    
    // Test password reset confirmation email
    console.log('\n3. Testing password reset confirmation email...');
    const confirmResponse = await fetch(`${BASE_URL}/api/test-password-reset-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_EMAIL
      })
    });
    
    // Log detailed response information
    console.log(`Response status: ${confirmResponse.status}`);
    console.log(`Response status text: ${confirmResponse.statusText}`);
    
    const confirmResponseHeaders = {};
    confirmResponse.headers.forEach((value, key) => {
      confirmResponseHeaders[key] = value;
    });
    console.log('Response headers:', confirmResponseHeaders);
    
    let confirmData;
    try {
      confirmData = await confirmResponse.json();
      console.log('Response body:', confirmData);
    } catch (e) {
      console.log('Response body is not valid JSON:', await confirmResponse.text());
    }
    
    if (!confirmResponse.ok) {
      console.error('ERROR: Password reset confirmation email request failed!');
    } else {
      console.log('Password reset confirmation email request successful!');
    }
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Password Reset OTP Email: ${resetResponse.ok ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Welcome Email: ${welcomeResponse.ok ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Password Reset Confirmation Email: ${confirmResponse.ok ? '✅ SUCCESS' : '❌ FAILED'}`);
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testEmailInDetail();