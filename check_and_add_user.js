// Script to check for a user by email and create one if not found
import { storage } from './server/storage.js';
import crypto from 'crypto';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

async function checkAndAddUser() {
  const email = 'brizkishor.azad@gmail.com';
  try {
    console.log(`Checking for user with email: ${email}`);
    const user = await storage.getUserByEmail(email);
    
    if (user) {
      console.log('User found:', user);
      return;
    }
    
    console.log('User not found, creating new user account');
    const newUser = {
      username: 'brizkishor',
      email: email,
      password: hashPassword('password123'),
      name: 'Brijkishor Azad',
      role: 'customer',
      phone: '9876543210',
      address: 'Test Address',
      pincode: '110001',
      profileImageUrl: null
    };
    
    const createdUser = await storage.createUser(newUser);
    console.log('User created successfully:', createdUser);
  } catch (error) {
    console.error('Error checking/creating user:', error);
  }
}

checkAndAddUser();