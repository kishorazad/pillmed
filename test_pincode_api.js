/**
 * Test script to verify the Pincode API is working
 */
import fetch from 'node-fetch';

async function testPincodeAPI() {
  try {
    console.log('Testing pincode API with coordinates for Delhi...');
    
    const response = await fetch('http://localhost:5000/api/pincode?lat=28.6139&lng=77.2090');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Pincode API response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.pincode) {
      console.log(`✅ Success! Pincode detected: ${data.pincode} for ${data.city || 'unknown location'}`);
      console.log(`Source: ${data.source}`);
      return true;
    } else {
      console.log('❌ Failed to detect pincode from the coordinates');
      return false;
    }
  } catch (error) {
    console.error('Error testing pincode API:', error.message);
    return false;
  }
}

// Self-executing async function
(async () => {
  const result = await testPincodeAPI();
  console.log(`Test ${result ? 'PASSED' : 'FAILED'}`);
  process.exit(result ? 0 : 1);
})();