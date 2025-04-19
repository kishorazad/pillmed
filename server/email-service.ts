import { MailService } from '@sendgrid/mail';

// Initialize SendGrid client
const mailService = new MailService();

// Set API key if available
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not found. Email functionality will not work.');
}

/**
 * Send an email using SendGrid
 * @param to Recipient email address
 * @param subject Email subject
 * @param text Plain text email content
 * @param html HTML email content (optional)
 * @returns Promise resolving to true if successful
 */
export async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('Cannot send email: SENDGRID_API_KEY not configured');
      return false;
    }

    const fromEmail = process.env.EMAIL_FROM || 'no-reply@pillnow.com';
    
    await mailService.send({
      to,
      from: fromEmail, 
      subject,
      text,
      html: html || text
    });
    
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Generate a random OTP code
 * @param length Length of the OTP (default: 6)
 * @returns OTP string
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
}

/**
 * Send an OTP email for password reset
 * @param email Recipient email address
 * @param otp OTP code
 * @returns Promise resolving to true if successful
 */
export async function sendPasswordResetOTP(email: string, otp: string): Promise<boolean> {
  const subject = 'PillNow Password Reset OTP';
  const text = `Your one-time password (OTP) for resetting your PillNow account password is: ${otp}. This code will expire in 15 minutes. If you did not request this reset, please ignore this email.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #FF5F1F; text-align: center;">PillNow Password Reset</h2>
      <p>Dear user,</p>
      <p>We received a request to reset your password for your PillNow account.</p>
      <p>Your one-time password (OTP) is:</p>
      <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0; border-radius: 4px;">
        ${otp}
      </div>
      <p>This code will expire in <strong>15 minutes</strong>.</p>
      <p>If you did not request this password reset, please ignore this email or contact our support team if you have concerns.</p>
      <p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">
        &copy; ${new Date().getFullYear()} PillNow. All rights reserved.
      </p>
    </div>
  `;
  
  return sendEmail(email, subject, text, html);
}