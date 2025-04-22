// Direct test for ZohoMail functionality
import nodemailer from 'nodemailer';

async function testZohoMailDirect() {
  console.log('Testing ZohoMail directly...');
  
  if (!process.env.ZOHOMAIL_USERNAME || !process.env.ZOHOMAIL_PASSWORD) {
    console.error('❌ ZOHOMAIL_USERNAME or ZOHOMAIL_PASSWORD not set');
    return;
  }

  console.log(`ZOHOMAIL_USERNAME: ${process.env.ZOHOMAIL_USERNAME}`);
  console.log(`ZOHOMAIL_PASSWORD: ${process.env.ZOHOMAIL_PASSWORD ? '[set]' : '[not set]'}`);
  console.log(`ZOHOMAIL_HOST: ${process.env.ZOHOMAIL_HOST || 'smtp.zoho.com'}`);
  console.log(`ZOHOMAIL_PORT: ${process.env.ZOHOMAIL_PORT || '465'}`);
  
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHOMAIL_HOST || 'smtp.zoho.com',
      port: parseInt(process.env.ZOHOMAIL_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.ZOHOMAIL_USERNAME,
        pass: process.env.ZOHOMAIL_PASSWORD
      }
    });

    console.log('ZohoMail transporter created');
    
    // Verify connection
    await transporter.verify();
    console.log('ZohoMail connection verified');
    
    // Send test email
    const info = await transporter.sendMail({
      from: process.env.ZOHOMAIL_USERNAME,
      to: 'brizkishor.azad@gmail.com',
      subject: 'Direct ZohoMail Test',
      text: 'This is a direct test of ZohoMail functionality.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #FF8F00; text-align: center;">Direct ZohoMail Test</h2>
          <p>This is a direct test of ZohoMail functionality, bypassing the email service.</p>
          <p>If you received this email, it means the ZohoMail configuration is working correctly!</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} PillNow. All rights reserved.</p>
        </div>
      `
    });
    
    console.log('✅ Direct ZohoMail test successful!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error in direct ZohoMail test:', error);
  }
}

testZohoMailDirect();