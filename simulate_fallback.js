/**
 * Test script to simulate the fallback process between email providers
 */

const nodemailer = require('nodemailer');
const { exec } = require('child_process');

// Function to test email sending with simulated Resend failure
async function simulateFallbackToZohoMail() {
  console.log('Simulating email fallback to ZohoMail...');

  // Create a fake REST endpoint that simulates a failing Resend API
  const http = require('http');
  const server = http.createServer((req, res) => {
    console.log('Simulated Resend API call received');
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: { 
        message: 'Simulated Resend failure',
        statusCode: 403
      } 
    }));
  });

  // Start the server on a test port
  const TEST_PORT = 5789;
  server.listen(TEST_PORT, '127.0.0.1');
  console.log(`Test server running on port ${TEST_PORT}`);

  try {
    // Create a temporary env file with modified RESEND_API_URL to point to our test server
    const fs = require('fs');
    fs.writeFileSync('.env.test-fallback', `
RESEND_API_KEY=test_api_key
RESEND_API_URL=http://127.0.0.1:${TEST_PORT}
ZOHOMAIL_USERNAME=${process.env.ZOHOMAIL_USERNAME || 'support@pillnow.info'}
ZOHOMAIL_PASSWORD=${process.env.ZOHOMAIL_PASSWORD || ''}
ZOHOMAIL_HOST=${process.env.ZOHOMAIL_HOST || 'smtp.zoho.in'}
ZOHOMAIL_PORT=${process.env.ZOHOMAIL_PORT || '465'}
    `);

    // Run a test script with the modified environment
    console.log('Running test with simulated Resend failure...');
    exec('NODE_ENV=test-fallback node -e "require(\'dotenv\').config({path: \'.env.test-fallback\'}); const { sendEmail } = require(\'./server/email-service\'); sendEmail(\'brizkishor.azad@gmail.com\', \'Test Fallback Email\', \'Testing email fallback\').then(result => console.log(\'Email sent:\', result)).catch(err => console.error(\'Error:\', err))"', 
      (error, stdout, stderr) => {
        console.log('Test output:', stdout);
        if (stderr) console.error('Test errors:', stderr);
        
        // Clean up
        server.close();
        fs.unlinkSync('.env.test-fallback');
        console.log('Test completed and cleaned up');
      }
    );
  } catch (error) {
    console.error('Error in test setup:', error);
  }
}

simulateFallbackToZohoMail();