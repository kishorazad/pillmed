import fetch from 'node-fetch';
import { storage } from './storage';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  clickAction?: string;
  icon?: string;
}

/**
 * Sends a push notification to a specific user
 * @param userId User ID to send notification to
 * @param notification Notification payload (title, body, data)
 * @returns Promise resolving to success status
 */
export async function sendNotificationToUser(
  userId: number, 
  notification: NotificationPayload
): Promise<boolean> {
  try {
    // Get all tokens for the user
    const tokens = await storage.getNotificationTokensByUserId(userId);
    
    if (!tokens || tokens.length === 0) {
      console.log(`No notification tokens found for user ${userId}`);
      return false;
    }
    
    // Send to each token
    const results = await Promise.all(tokens.map(token => 
      sendPushNotification(token.token, notification)
    ));
    
    // Return true if at least one notification was sent successfully
    return results.some(result => result);
  } catch (error) {
    console.error('Error sending notification to user:', error);
    return false;
  }
}

/**
 * Sends a push notification to all users
 * @param notification Notification payload (title, body, data)
 * @returns Promise resolving to success status
 */
export async function sendNotificationToAllUsers(
  notification: NotificationPayload
): Promise<boolean> {
  try {
    // You would need a method to get all tokens, this is a simplified example
    const usersWithTokens = await storage.getUsers();  // Assuming this exists
    
    // Send to each user
    const results = await Promise.all(
      usersWithTokens.map(user => sendNotificationToUser(user.id, notification))
    );
    
    // Return true if at least one notification was sent successfully
    return results.some(result => result);
  } catch (error) {
    console.error('Error sending notification to all users:', error);
    return false;
  }
}

/**
 * Send a push notification to a specific FCM token using Firebase API
 * @param token FCM token to send to
 * @param notification Notification payload
 * @returns Promise resolving to success status
 */
async function sendPushNotification(
  token: string, 
  notification: NotificationPayload
): Promise<boolean> {
  try {
    // Check for Firebase Server Key
    const firebaseServerKey = process.env.FIREBASE_SERVER_KEY;
    if (!firebaseServerKey) {
      console.error('FIREBASE_SERVER_KEY environment variable is not set');
      return false;
    }
    
    // Prepare notification message
    const message = {
      to: token,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/logo.png',
        click_action: notification.clickAction || '/'
      },
      data: notification.data || {}
    };
    
    // Send to Firebase Cloud Messaging API
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${firebaseServerKey}`
      },
      body: JSON.stringify(message)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error sending push notification:', result);
      return false;
    }
    
    // Check for invalid tokens in the response
    if (result.failure === 1) {
      // This token is invalid or has been revoked
      if (result.results?.[0]?.error === 'NotRegistered') {
        // Clean up the invalid token from our database
        await storage.deleteNotificationToken(token);
        console.log(`Removed invalid token ${token}`);
      }
      return false;
    }
    
    console.log('Push notification sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}