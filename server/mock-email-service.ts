/**
 * Mock Email Service
 * 
 * This service simulates email sending functionality for development purposes.
 * In a production environment, this would be replaced with a real email service
 * like SendGrid, Mailgun, or Amazon SES.
 */

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class MockEmailService {
  /**
   * Simulates sending an email
   * @param options Email options including recipient, subject, and content
   * @returns Promise that resolves with success status
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Log the email details to the console instead of actually sending
      console.log('\n=== MOCK EMAIL SERVICE ===');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('Content:');
      console.log(options.text || options.html);
      console.log('=========================\n');
      
      // Simulate a small delay as real email services aren't instantaneous
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return true;
    } catch (error) {
      console.error('Mock email service error:', error);
      return false;
    }
  }

  /**
   * Sends an OTP (One-Time Password) email
   * @param email Recipient's email address
   * @param otp The one-time password
   * @returns Promise that resolves with success status
   */
  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    const subject = 'PillNow: Your Password Reset OTP';
    const text = `
      Hello,
      
      You have requested to reset your password for your PillNow account.
      
      Your One-Time Password (OTP) is: ${otp}
      
      This OTP will expire in 10 minutes.
      
      If you did not request a password reset, please ignore this email.
      
      Best regards,
      The PillNow Team
    `;
    
    return await this.sendEmail({
      to: email,
      subject,
      text
    });
  }

  /**
   * Sends a password reset confirmation email
   * @param email Recipient's email address
   * @returns Promise that resolves with success status
   */
  async sendPasswordResetConfirmation(email: string): Promise<boolean> {
    const subject = 'PillNow: Password Reset Successful';
    const text = `
      Hello,
      
      Your password for PillNow has been successfully reset.
      
      If you did not perform this action, please contact our support team immediately.
      
      Best regards,
      The PillNow Team
    `;
    
    return await this.sendEmail({
      to: email,
      subject,
      text
    });
  }
}

// Export a singleton instance
export const mockEmailService = new MockEmailService();