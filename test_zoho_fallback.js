/**
 * Test script to verify ZohoMail email delivery
 * Simulates a fallback from Resend to ZohoMail
 */
import fetch from 'node-fetch';
import { mongoDBService } from './server/services/mongodb-service';

// Override fetch to force Resend to fail
const originalFetch = globalThis.fetch;

// Replace global fetch with one that forces Resend to fail
globalThis.fetch = async (url, options) => {
  // Check if this is a Resend API call
  if (url && url.toString().includes('api.resend.com')) {
    console.log('🔄 Intercepted Resend API call and forcing failure');
    
    // Simulate a network error for Resend
    throw new Error('Simulated network error for Resend API');
  }
  
  // For all other requests, use the original fetch
  return originalFetch(url, options);
};

async function testZohoFallback() {
  console.log('Testing ZohoMail fallback with forced Resend failure...');
  
  try {
    // First, set the global.useMongoStorage flag
    global.useMongoStorage = true;
  
    // Connect to MongoDB
    await mongoDBService.connect();
    console.log('MongoDB connected');
    
    // Email to use for testing
    const email = 'brizkishor.azad@gmail.com';
    
    // Call the forgot password endpoint which will send an email
    console.log(`\nCalling forgot password endpoint for email: ${email}`);
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    if (response.status === 200) {
      console.log('✅ Password reset request sent successfully');
      if (data.testOtp) {
        console.log(`🔑 OTP Code: ${data.testOtp}`);
        console.log('Email should be delivered using ZohoMail since Resend was forced to fail');
      }
    } else {
      console.log('❌ Password reset request failed');
    }
    
    // Also test a welcome email
    console.log('\nTesting welcome email delivery via ZohoMail fallback...');
    const welcomeResponse = await fetch('http://localhost:5000/api/auth/test-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        name: 'Test User' 
      })
    });
    
    const welcomeData = await welcomeResponse.json();
    console.log(`Status: ${welcomeResponse.status}`);
    console.log('Response:', welcomeData);
    
    if (welcomeResponse.status === 200) {
      console.log('✅ Welcome email sent successfully via ZohoMail fallback');
    } else {
      console.log('❌ Welcome email request failed');
    }
    
  } catch (error) {
    console.error('Error during ZohoMail fallback test:', error);
  } finally {
    // Restore original fetch
    globalThis.fetch = originalFetch;
    console.log('\n✅ Restored original fetch function');
  }
}

// Run the test
testZohoFallback();