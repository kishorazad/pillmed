import { MailService } from '@sendgrid/mail';
import { Resend } from 'resend';

// Initialize SendGrid client
const mailService = new MailService();

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Set SendGrid API key if available
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
} else if (!process.env.RESEND_API_KEY) {
  console.warn('Neither SENDGRID_API_KEY nor RESEND_API_KEY found. Email functionality will not work.');
}

/**
 * Send an email using either Resend or SendGrid
 * @param to Recipient email address
 * @param subject Email subject
 * @param text Plain text email content
 * @param html HTML email content (optional)
 * @returns Promise resolving to true if successful
 */
export async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
  try {
    const fromEmail = process.env.EMAIL_FROM || 'no-reply@pillnow.com';
    
    // Try sending with Resend first if configured
    if (process.env.RESEND_API_KEY) {
      try {
        // Use Resend's test email in development environment (required by Resend for unverified domains)
        const recipient = process.env.NODE_ENV === 'production' ? to : 'delivered@resend.dev';
        
        // If using test recipient, log the original intended recipient for reference
        if (recipient !== to) {
          console.log(`Email would be sent to: ${to} (using test recipient in development: ${recipient})`);
        }
        
        const data = await resend.emails.send({
          from: fromEmail,
          to: recipient,
          subject,
          text,
          html: html || text,
        });
        
        console.log(`Email sent successfully with Resend to ${to}`);
        // Optional ID logging if available
        if (data && typeof data === 'object' && 'id' in data) {
          console.log(`Resend Email ID: ${data.id}`);
        }
        return true;
      } catch (resendError) {
        console.error('Error sending email via Resend:', resendError);
        
        // Fall back to SendGrid if available
        if (process.env.SENDGRID_API_KEY) {
          return sendWithSendGrid(to, subject, text, html, fromEmail);
        }
        return false;
      }
    } 
    // Use SendGrid if Resend is not configured
    else if (process.env.SENDGRID_API_KEY) {
      return sendWithSendGrid(to, subject, text, html, fromEmail);
    } 
    else {
      console.error('Cannot send email: Neither RESEND_API_KEY nor SENDGRID_API_KEY configured');
      return false;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send an email using SendGrid (helper function)
 */
async function sendWithSendGrid(to: string, subject: string, text: string, html: string | undefined, fromEmail: string): Promise<boolean> {
  try {
    await mailService.send({
      to,
      from: fromEmail, 
      subject,
      text,
      html: html || text
    });
    
    console.log(`Email sent successfully with SendGrid to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
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
      <h2 style="color: #FF8F00; text-align: center;">PillNow Password Reset</h2>
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

/**
 * Send login OTP email
 * @param email Recipient email address
 * @param otp OTP code for login verification
 * @returns Promise resolving to true if successful
 */
export async function sendLoginOTP(email: string, otp: string): Promise<boolean> {
  const subject = 'PillNow Login Verification Code';
  const text = `Your verification code for logging into your PillNow account is: ${otp}. This code will expire in 10 minutes. If you did not attempt to log in, please ignore this email or contact our support team.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="background-color: #FF8F00; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Login Verification</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Hello,</p>
        <p>You're trying to log in to your PillNow account. For your security, we need to verify it's really you.</p>
        
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
          <p style="margin: 0 0 10px; font-size: 16px;">Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #FF8F00; margin: 10px 0;">
            ${otp}
          </div>
          <p style="margin: 10px 0 0; font-size: 14px; color: #666;">Code expires in 10 minutes</p>
        </div>
        
        <p>If you didn't request this code, you can safely ignore this email.</p>
        
        <p style="margin-top: 30px; margin-bottom: 5px;">Stay healthy,</p>
        <p style="margin-top: 0;"><strong>The PillNow Team</strong></p>
      </div>
      
      <div style="background-color: #f2f2f2; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} PillNow. All rights reserved.</p>
        <p>This email was sent to ${email}</p>
      </div>
    </div>
  `;
  
  return sendEmail(email, subject, text, html);
}

/**
 * Send welcome email to newly registered users
 * @param email Recipient email address
 * @param name User's name
 * @returns Promise resolving to true if successful
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const subject = 'Welcome to PillNow - Your Healthcare Partner';
  const text = `
    Welcome to PillNow, ${name}!
    
    Thank you for creating an account with us. We're excited to help you with all your healthcare needs.
    
    With your PillNow account, you can:
    - Order prescription and OTC medicines for delivery
    - Book doctor appointments
    - Schedule lab tests
    - Track your medication and health records
    - Get personalized health advice
    
    If you have any questions or need assistance, our customer support team is available 24/7.
    
    Thank you for choosing PillNow!
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="background-color: #FF8F00; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to PillNow!</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Hello ${name},</p>
        <p>Thank you for creating an account with PillNow. We're excited to be your partner in healthcare!</p>
        
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h3 style="color: #FF8F00; margin-top: 0;">With your PillNow account, you can:</h3>
          <ul style="padding-left: 20px; margin-bottom: 0;">
            <li style="margin-bottom: 10px;">Order prescription and OTC medicines for delivery</li>
            <li style="margin-bottom: 10px;">Book doctor appointments and video consultations</li>
            <li style="margin-bottom: 10px;">Schedule lab tests and health check-ups</li>
            <li style="margin-bottom: 10px;">Track your medication and health records</li>
            <li style="margin-bottom: 0;">Get personalized health advice and reminders</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://pillnow.com/explore" style="background-color: #FF8F00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Explore PillNow</a>
        </div>
        
        <p>If you have any questions or need assistance, our customer support team is available 24/7 at <a href="mailto:support@pillnow.com" style="color: #FF8F00; text-decoration: none;">support@pillnow.com</a> or <a href="tel:+918888888888" style="color: #FF8F00; text-decoration: none;">+91 8888 888 888</a>.</p>
        
        <p style="margin-top: 30px; margin-bottom: 5px;">We're glad to have you with us!</p>
        <p style="margin-top: 0;"><strong>The PillNow Team</strong></p>
      </div>
      
      <div style="background-color: #f2f2f2; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} PillNow. All rights reserved.</p>
        <p>This email was sent to ${email}</p>
      </div>
    </div>
  `;
  
  return sendEmail(email, subject, text, html);
}

/**
 * Send an order confirmation email
 * @param email Recipient email address
 * @param orderData Order information
 * @returns Promise resolving to true if successful
 */
/**
 * Send an order confirmation email
 * @param email Recipient email address
 * @param orderData Order information
 * @returns Promise resolving to true if successful
 */
/**
 * Send a password reset confirmation email
 * @param email Recipient email address
 * @returns Promise resolving to true if successful
 */
export async function sendPasswordResetConfirmation(email: string): Promise<boolean> {
  const subject = 'Your PillNow Password Has Been Reset';
  const text = `
    Your PillNow account password has been successfully reset.
    
    If you did not make this change, please contact our support team immediately at support@pillnow.com.
    
    Thank you for using PillNow!
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="background-color: #FF8F00; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset Complete</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Hello,</p>
        <p>Your PillNow account password has been successfully reset.</p>
        
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
          <p style="margin: 10px 0; font-size: 16px;">If you did not make this change, please contact our support team immediately.</p>
        </div>
        
        <p style="margin-top: 30px; margin-bottom: 5px;">Stay healthy,</p>
        <p style="margin-top: 0;"><strong>The PillNow Team</strong></p>
      </div>
      
      <div style="background-color: #f2f2f2; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} PillNow. All rights reserved.</p>
        <p>This email was sent to ${email}</p>
      </div>
    </div>
  `;
  
  return sendEmail(email, subject, text, html);
}

export async function sendOrderConfirmation(email: string, orderData: any): Promise<boolean> {
  const subject = 'Your PillNow Order Confirmation';
  
  // Create text version for fallback
  const text = `
    Thank you for your order with PillNow!
    
    Order Number: ${orderData.orderNumber || 'N/A'}
    Estimated Delivery: ${orderData.estimatedDelivery || 'Within 2-3 business days'}
    
    Items:
    ${orderData.items?.map((item: any) => `- ${item.name} (Qty: ${item.quantity}) - ₹${item.price}`).join('\n') || 'No items'}
    
    Subtotal: ₹${orderData.subtotal || '0'}
    Shipping: ₹${orderData.shipping || '0'}
    Tax: ₹${orderData.tax || '0'}
    Total: ₹${orderData.total || '0'}
    
    Shipping Address:
    ${orderData.address || 'No address provided'}
    
    You can track your order at pillnow.com/orders/${orderData.orderNumber || '#'}
    
    Thank you for choosing PillNow for your healthcare needs!
  `;
  
  // Create HTML version with improved styling
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="background-color: #FF8F00; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Order Confirmation</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Dear ${orderData.customerName || 'Valued Customer'},</p>
        <p>Thank you for your order with PillNow! We're working on processing your order and will notify you once it ships.</p>
        
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Order Number: ${orderData.orderNumber || 'N/A'}</p>
          <p style="margin: 5px 0 0;">Estimated Delivery: ${orderData.estimatedDelivery || 'Within 2-3 business days'}</p>
        </div>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Order Summary</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee; color: #666;">
            <th style="text-align: left; padding: 10px 5px;">Item</th>
            <th style="text-align: center; padding: 10px 5px;">Qty</th>
            <th style="text-align: right; padding: 10px 5px;">Price</th>
          </tr>
          
          ${orderData.items?.map((item: any) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 5px;">${item.name}</td>
              <td style="text-align: center; padding: 10px 5px;">${item.quantity}</td>
              <td style="text-align: right; padding: 10px 5px;">₹${item.price}</td>
            </tr>
          `).join('') || '<tr><td colspan="3" style="padding: 10px 5px;">No items</td></tr>'}
          
          <tr>
            <td colspan="2" style="text-align: right; padding: 10px 5px; font-weight: bold;">Subtotal:</td>
            <td style="text-align: right; padding: 10px 5px;">₹${orderData.subtotal || '0'}</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: right; padding: 10px 5px; font-weight: bold;">Shipping:</td>
            <td style="text-align: right; padding: 10px 5px;">₹${orderData.shipping || '0'}</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: right; padding: 10px 5px; font-weight: bold;">Tax:</td>
            <td style="text-align: right; padding: 10px 5px;">₹${orderData.tax || '0'}</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: right; padding: 10px 5px; font-weight: bold; font-size: 16px;">Total:</td>
            <td style="text-align: right; padding: 10px 5px; font-weight: bold; font-size: 16px;">₹${orderData.total || '0'}</td>
          </tr>
        </table>
        
        <div style="margin: 25px 0;">
          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Shipping Information</h3>
          <p style="white-space: pre-line; margin-top: 10px;">${orderData.address || 'No address provided'}</p>
        </div>
        
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
          <p style="margin: 0;">Track your order at: <a href="https://pillnow.com/orders/${orderData.orderNumber || '#'}" style="color: #FF8F00; text-decoration: none; font-weight: bold;">pillnow.com/orders/${orderData.orderNumber || '#'}</a></p>
        </div>
        
        <p>If you have any questions about your order, please email us at <a href="mailto:support@pillnow.com" style="color: #FF8F00; text-decoration: none;">support@pillnow.com</a> or call us at <a href="tel:+918888888888" style="color: #FF8F00; text-decoration: none;">+91 8888 888 888</a>.</p>
        
        <p>Thank you for choosing PillNow for your healthcare needs!</p>
        
        <p style="margin-top: 30px; margin-bottom: 5px;">Best regards,</p>
        <p style="margin-top: 0;"><strong>The PillNow Team</strong></p>
      </div>
      
      <div style="background-color: #f2f2f2; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} PillNow. All rights reserved.</p>
        <p>This email was sent to ${email}</p>
      </div>
    </div>
  `;
  
  return sendEmail(email, subject, text, html);
}

/**
 * Send appointment confirmation email
 * @param email Recipient email address
 * @param appointmentData Appointment information
 * @returns Promise resolving to true if successful
 */
export async function sendAppointmentConfirmation(email: string, appointmentData: any): Promise<boolean> {
  const subject = 'Your PillNow Doctor Appointment Confirmation';
  
  // Format date and time
  const appointmentDate = appointmentData.date ? new Date(appointmentData.date) : null;
  const formattedDate = appointmentDate ? 
    appointmentDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 
    'Date not specified';
  
  const formattedTime = appointmentDate ? 
    appointmentDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 
    'Time not specified';
  
  // Create text version for fallback
  const text = `
    Your Doctor Appointment has been confirmed with PillNow!
    
    Booking ID: ${appointmentData.bookingId || 'N/A'}
    Doctor: ${appointmentData.doctorName || 'Not specified'} ${appointmentData.doctorSpecialty ? `(${appointmentData.doctorSpecialty})` : ''}
    Date: ${formattedDate}
    Time: ${formattedTime}
    
    ${appointmentData.isVideoConsultation ? 'This is a video consultation. Please login 5 minutes before your scheduled time.' : 'This is an in-person appointment.'}
    
    Address:
    ${appointmentData.clinicName || ''}
    ${appointmentData.address || 'Address not provided'}
    
    Please bring:
    - Any previous medical reports
    - List of current medications
    - Your ID proof
    ${appointmentData.additionalInstructions ? `\nAdditional instructions:\n${appointmentData.additionalInstructions}` : ''}
    
    Need to reschedule or cancel? Please do so at least 24 hours in advance to avoid cancellation fees.
    
    Thank you for choosing PillNow for your healthcare needs!
  `;
  
  // Create HTML version with improved styling
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="background-color: #FF8F00; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Appointment Confirmed</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Dear ${appointmentData.patientName || 'Patient'},</p>
        <p>Your appointment has been successfully booked with PillNow! Below are the details of your appointment.</p>
        
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px;">Booking ID:</td>
              <td style="padding: 8px 0;">${appointmentData.bookingId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Doctor:</td>
              <td style="padding: 8px 0;">
                <span style="font-weight: bold;">${appointmentData.doctorName || 'Not specified'}</span>
                ${appointmentData.doctorSpecialty ? `<span style="color: #666; font-size: 14px;">(${appointmentData.doctorSpecialty})</span>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Date:</td>
              <td style="padding: 8px 0;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Time:</td>
              <td style="padding: 8px 0;">${formattedTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Type:</td>
              <td style="padding: 8px 0;">${appointmentData.isVideoConsultation ? 
                '<span style="color: #2b7dc0;">Video Consultation</span>' : 
                '<span>In-Person Appointment</span>'}</td>
            </tr>
          </table>
        </div>
        
        ${appointmentData.isVideoConsultation ? `
          <div style="border-left: 4px solid #2b7dc0; padding: 15px; background-color: #f0f7ff; margin: 20px 0; border-radius: 0 4px 4px 0;">
            <h3 style="margin-top: 0; margin-bottom: 10px; color: #2b7dc0;">Video Consultation Instructions</h3>
            <p style="margin-bottom: 0;">Please login to your PillNow account <strong>5 minutes</strong> before your scheduled appointment time. You will see a "Join Consultation" button that will become active at that time.</p>
          </div>
        ` : `
          <div style="margin: 20px 0;">
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Clinic Address</h3>
            <p style="font-weight: bold; margin-bottom: 5px;">${appointmentData.clinicName || ''}</p>
            <p style="white-space: pre-line; margin-top: 0;">${appointmentData.address || 'Address not provided'}</p>
          </div>
        `}
        
        <div style="margin: 25px 0;">
          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Please Bring</h3>
          <ul style="padding-left: 20px; margin-bottom: 0;">
            <li style="margin-bottom: 8px;">Any previous medical reports</li>
            <li style="margin-bottom: 8px;">List of current medications</li>
            <li style="margin-bottom: 8px;">Your ID proof</li>
          </ul>
        </div>
        
        ${appointmentData.additionalInstructions ? `
          <div style="margin: 25px 0;">
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Additional Instructions</h3>
            <p style="white-space: pre-line;">${appointmentData.additionalInstructions}</p>
          </div>
        ` : ''}
        
        <div style="border: 1px solid #eee; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Need to reschedule or cancel?</h3>
          <p style="margin-bottom: 10px;">Please do so at least 24 hours in advance to avoid cancellation fees.</p>
          <div style="text-align: center;">
            <a href="https://pillnow.com/appointments/${appointmentData.bookingId || '#'}" style="background-color: #FF8F00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Manage Your Appointment</a>
          </div>
        </div>
        
        <p>If you have any questions, please call us at <a href="tel:+918888888888" style="color: #FF8F00; text-decoration: none;">+91 8888 888 888</a> or email <a href="mailto:care@pillnow.com" style="color: #FF8F00; text-decoration: none;">care@pillnow.com</a>.</p>
        
        <p style="margin-top: 30px; margin-bottom: 5px;">Wishing you good health,</p>
        <p style="margin-top: 0;"><strong>The PillNow Team</strong></p>
      </div>
      
      <div style="background-color: #f2f2f2; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} PillNow. All rights reserved.</p>
        <p>This email was sent to ${email}</p>
      </div>
    </div>
  `;
  
  return sendEmail(email, subject, text, html);
}