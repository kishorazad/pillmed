import { IStorage } from './storage';
import { mongoDBService } from './services/mongodb-service';
import { ObjectId } from 'mongodb';
import {
  User, Category, Product, CartItem, Order, Article, 
  Testimonial, HealthPackage, LabTest, HealthTip, FAQ,
  Prescription, OTPRecord, Session, Review, Address,
  Device, RecentSearch, WishlistItem, DoctorInfo, Hospital,
  HealthQuery, PaymentMethod, Notification, Coupon,
  MedicineReminder, HealthRecord, Appointment, RefillRequest,
  EmergencyContact, HealthInsurance, ReferralCode, DeliveryTimeSlot
} from '@shared/schema';

/**
 * MongoDB implementation of storage service
 * Stores all data in MongoDB collections
 */
class MongoDBStorage implements IStorage {
  private readonly collections = {
    users: 'users',
    categories: 'categories',
    products: 'products',
    cartItems: 'cartItems',
    orders: 'orders',
    articles: 'articles',
    testimonials: 'testimonials',
    healthPackages: 'healthPackages',
    labTests: 'labTests',
    healthTips: 'healthTips',
    faqs: 'faqs',
    prescriptions: 'prescriptions',
    otpRecords: 'otpRecords',
    sessions: 'sessions',
    reviews: 'reviews',
    addresses: 'addresses',
    devices: 'devices',
    recentSearches: 'recentSearches',
    wishlistItems: 'wishlistItems',
    doctorInfo: 'doctorInfo',
    hospitals: 'hospitals',
    healthQueries: 'healthQueries',
    paymentMethods: 'paymentMethods',
    notifications: 'notifications',
    coupons: 'coupons',
    medicineReminders: 'medicineReminders',
    healthRecords: 'healthRecords',
    appointments: 'appointments',
    refillRequests: 'refillRequests',
    emergencyContacts: 'emergencyContacts',
    healthInsurance: 'healthInsurance',
    referralCodes: 'referralCodes',
    deliveryTimeSlots: 'deliveryTimeSlots'
  };

  constructor() {
    this.initializeConnection();
  }

  // Initialize MongoDB connection
  private async initializeConnection() {
    try {
      await mongoDBService.connect();
    } catch (error) {
      console.error('Failed to initialize MongoDB connection:', error);
      console.warn('Falling back to in-memory storage');
    }
  }

  // Helper to check MongoDB connection and log appropriately
  private isConnected(collectionName: string): boolean {
    const isConnected = mongoDBService.isConnectedToDb();
    if (!isConnected) {
      console.warn(`MongoDB not connected. Falling back to in-memory storage for ${collectionName} operation.`);
    }
    return isConnected;
  }

  // ---------- User Management ----------

  async getUser(id: number): Promise<User | undefined> {
    if (!this.isConnected(this.collections.users)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.users);
    if (!collection) return undefined;

    const user = await collection.findOne({ id: id });
    return user as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.isConnected(this.collections.users)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.users);
    if (!collection) return undefined;

    const user = await collection.findOne({ username: username });
    return user as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!this.isConnected(this.collections.users)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.users);
    if (!collection) return undefined;

    const user = await collection.findOne({ email: email });
    return user as User | undefined;
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    if (!this.isConnected(this.collections.users)) {
      throw new Error('MongoDB not connected for user creation'); // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.users);
    if (!collection) throw new Error('Failed to get users collection');

    // Generate a numeric ID for compatibility with in-memory storage
    const lastUser = await collection.find().sort({ id: -1 }).limit(1).toArray();
    const id = lastUser.length > 0 ? lastUser[0].id + 1 : 1;

    const newUser = { ...user, id };
    
    await collection.insertOne(newUser);
    return newUser as User;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    if (!this.isConnected(this.collections.users)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.users);
    if (!collection) return undefined;

    const result = await collection.findOneAndUpdate(
      { id: id },
      { $set: userData },
      { returnDocument: 'after' }
    );

    return result as User | undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    if (!this.isConnected(this.collections.users)) {
      return false; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.users);
    if (!collection) return false;

    const result = await collection.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.isConnected(this.collections.users)) {
      return []; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.users);
    if (!collection) return [];

    const users = await collection.find().toArray();
    return users as User[];
  }

  // ---------- OTP Records ----------

  async createOtpRecord(email: string, otp: string, expiresAt: Date): Promise<void> {
    if (!this.isConnected(this.collections.otpRecords)) {
      return; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.otpRecords);
    if (!collection) return;

    // First, delete any existing OTP records for this email
    await collection.deleteMany({ email: email });

    // Then create a new OTP record
    const otpRecord: OTPRecord = {
      email: email,
      otp: otp,
      expiresAt: expiresAt,
      verified: false
    };

    await collection.insertOne(otpRecord);
  }

  async getOtpRecord(email: string): Promise<OTPRecord | undefined> {
    if (!this.isConnected(this.collections.otpRecords)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.otpRecords);
    if (!collection) return undefined;

    const otpRecord = await collection.findOne({ email: email });
    return otpRecord as OTPRecord | undefined;
  }

  async updateOtpRecord(email: string, updates: Partial<OTPRecord>): Promise<boolean> {
    if (!this.isConnected(this.collections.otpRecords)) {
      return false; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.otpRecords);
    if (!collection) return false;

    const result = await collection.updateOne(
      { email: email },
      { $set: updates }
    );

    return result.modifiedCount === 1;
  }

  async deleteOtpRecord(email: string): Promise<boolean> {
    if (!this.isConnected(this.collections.otpRecords)) {
      return false; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.otpRecords);
    if (!collection) return false;

    const result = await collection.deleteOne({ email: email });
    return result.deletedCount === 1;
  }

  // ---------- Sessions ----------

  // The session methods will be implemented when integrating a SessionStore

  // Additional methods for other collections will be added as needed
}

// Create and export the MongoDB storage instance
export const mongoDBStorage = new MongoDBStorage();