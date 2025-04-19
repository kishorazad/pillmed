/**
 * Mock Email Service
 * 
 * This service simulates email sending for development and testing purposes.
 * In a production environment, this would be replaced with a real email service like SendGrid.
 */

// Storage for OTPs with email as the key
interface OtpRecord {
  otp: string;
  expiresAt: Date;
  purpose: 'password-reset' | 'email-verification';
}

class MockEmailService {
  private otpStorage: Map<string, OtpRecord> = new Map();

  /**
   * Generate a random OTP code
   * @param length Length of the OTP (default: 6)
   * @returns OTP string
   */
  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      otp += digits[randomIndex];
    }
    
    return otp;
  }

  /**
   * Simulate sending an email
   * @param to Recipient email address
   * @param subject Email subject
   * @param text Plain text email content
   * @param html HTML email content (optional)
   * @returns Promise resolving to true if successful
   */
  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    console.log(`===== MOCK EMAIL =====`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log(`=====================`);
    
    return true;
  }

  /**
   * Send a password reset OTP via email
   * @param email Recipient email address
   * @returns Promise resolving to the generated OTP
   */
  async sendPasswordResetOTP(email: string): Promise<string> {
    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // OTP expires in 15 minutes
    
    // Store OTP for verification later
    this.otpStorage.set(email, {
      otp,
      expiresAt,
      purpose: 'password-reset'
    });
    
    const subject = 'PillNow Password Reset OTP';
    const text = `Your one-time password (OTP) for resetting your PillNow account password is: ${otp}. This code will expire in 15 minutes.`;
    
    await this.sendEmail(email, subject, text);
    
    return otp;
  }

  /**
   * Verify an OTP for a specific email and purpose
   * @param email Email address
   * @param otp OTP to verify
   * @param purpose Purpose of the OTP
   * @returns Boolean indicating if the OTP is valid
   */
  verifyOTP(email: string, otp: string, purpose: 'password-reset' | 'email-verification'): boolean {
    const record = this.otpStorage.get(email);
    
    if (!record) {
      return false;
    }
    
    // Check if OTP has expired
    if (new Date() > record.expiresAt) {
      this.otpStorage.delete(email);
      return false;
    }
    
    // Check if OTP matches and the purpose is correct
    if (record.otp === otp && record.purpose === purpose) {
      // OTP used successfully, remove it
      this.otpStorage.delete(email);
      return true;
    }
    
    return false;
  }
}

// Export a singleton instance
export const mockEmailService = new MockEmailService();

// Helper functions that match the SendGrid interface
export function generateOTP(length: number = 6): string {
  return mockEmailService.generateOTP(length);
}

export async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
  return mockEmailService.sendEmail(to, subject, text, html);
}

export async function sendPasswordResetOTP(email: string): Promise<string> {
  return mockEmailService.sendPasswordResetOTP(email);
}