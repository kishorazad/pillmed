/**
 * Tests each email provider directly to verify fallback chain
 */
import * as emailService from './server/email-service.js';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

async function testEmailProviders() {
  console.log('Testing direct access to each email provider...');
  
  // 1. Test direct Zoho Mail sending
  try {
    console.log('\n--- Testing ZohoMail directly ---');
    
    if (!process.env.ZOHOMAIL_USERNAME || !process.env.ZOHOMAIL_PASSWORD) {
      console.error('❌ ZohoMail credentials not available');
    } else {
      const transporter = nodemailer.createTransport({
        host: process.env.ZOHOMAIL_HOST || 'smtp.zoho.in',
        port: parseInt(process.env.ZOHOMAIL_PORT || '465'),
        secure: true,
        auth: {
          user: process.env.ZOHOMAIL_USERNAME,
          pass: process.env.ZOHOMAIL_PASSWORD
        }
      });
      
      console.log('Created ZohoMail transporter directly');
      
      const info = await transporter.sendMail({
        from: process.env.ZOHOMAIL_USERNAME,
        to: 'brizkishor.azad@gmail.com',
        subject: 'Direct ZohoMail Test',
        text: 'Testing ZohoMail directly.',
        html: '<p>Testing ZohoMail directly.</p>'
      });
      
      console.log('✅ Direct ZohoMail test successful');
      console.log('Message ID:', info.messageId);
    }
  } catch (error) {
    console.error('❌ Error in direct ZohoMail test:', error);
  }
  
  // 2. Check if we can modify exports or internal state
  try {
    console.log('\n--- Testing access to internal email service state ---');
    console.log(`Current resendInitialized: ${emailService.resendInitialized}`);
    console.log(`Current sendgridInitialized: ${emailService.sendgridInitialized}`);
    console.log(`Current zohomailInitialized: ${emailService.zohomailInitialized}`);
    
    console.log('Original sendWithZohoMail function available:', !!emailService.sendWithZohoMail);
  } catch (error) {
    console.error('❌ Error accessing email service state:', error);
  }
  
  // 3. Create a test email
  try {
    console.log('\n--- Testing email creation ---');
    const testEmail = {
      to: 'brizkishor.azad@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email content.',
      html: '<p>This is a test email HTML content.</p>'
    };
    console.log('Created test email object:', testEmail);
  } catch (error) {
    console.error('❌ Error creating test email:', error);
  }
}

testEmailProviders();