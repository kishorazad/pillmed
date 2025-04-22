import { Resend } from 'resend';

async function testResendEmail() {
  console.log("Testing Resend Email Service...");
  
  // Check if RESEND_API_KEY is available
  if (!process.env.RESEND_API_KEY) {
    console.error("ERROR: RESEND_API_KEY environment variable is not set");
    return;
  }
  
  console.log("RESEND_API_KEY is available");
  console.log(`API Key starts with: ${process.env.RESEND_API_KEY.substring(0, 3)}...`);
  
  // Initialize Resend client
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    // Test recipient and content
    const toEmail = "delivered@resend.dev"; // Using Resend's testing email address
    const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev"; // Using Resend's default sender or custom one
    
    console.log(`Sending test email from ${fromEmail} to ${toEmail}...`);
    
    // Send test email
    const data = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: "PillNow Email Test",
      text: "This is a test email from PillNow application to verify the Resend API integration.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h1 style="color: #FF8F00;">PillNow Email Test</h1>
          <p>This is a test email from PillNow application to verify the Resend API integration.</p>
          <p>If you're seeing this, the email service is working correctly!</p>
          <p>Time sent: ${new Date().toISOString()}</p>
        </div>
      `,
    });
    
    console.log("Email sent successfully!");
    if (data && typeof data === 'object' && 'id' in data) {
      console.log(`Resend Email ID: ${data.id}`);
    } else {
      console.log("Data received:", data);
    }
  } catch (error) {
    console.error("Error sending email via Resend:");
    console.error(error);
    
    // Show more detailed error information
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
    }
  }
}

// Run the test function
testResendEmail();