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
    console.log(`Checking MongoDB connection for collection: ${collectionName}`);
    console.log(`Current global.useMongoStorage value: ${global.useMongoStorage}`);
    
    const isConnected = mongoDBService.isConnectedToDb();
    console.log(`MongoDB service reports connection status: ${isConnected}`);
    
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

  async updateUserPassword(id: number, password: string): Promise<User | undefined> {
    if (!this.isConnected(this.collections.users)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.users);
    if (!collection) return undefined;

    const result = await collection.findOneAndUpdate(
      { id: id },
      { $set: { password } },
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
  
  async getUsers(): Promise<User[]> {
    // Alias for getAllUsers to match the IStorage interface
    return this.getAllUsers();
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

  // ---------- Product Management ----------

  async getProducts(): Promise<Product[]> {
    if (!this.isConnected(this.collections.products)) {
      return []; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.products);
    if (!collection) return [];

    const products = await collection.find().toArray();
    return products as Product[];
  }

  async getProductById(id: number): Promise<Product | undefined> {
    if (!this.isConnected(this.collections.products)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.products);
    if (!collection) return undefined;

    const product = await collection.findOne({ id: id });
    return product as Product | undefined;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    if (!this.isConnected(this.collections.products)) {
      return []; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.products);
    if (!collection) return [];

    const products = await collection.find({ categoryId: categoryId }).toArray();
    return products as Product[];
  }

  async getFeaturedProducts(): Promise<Product[]> {
    if (!this.isConnected(this.collections.products)) {
      return []; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.products);
    if (!collection) return [];

    const products = await collection.find({ isFeatured: true }).toArray();
    return products as Product[];
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    if (!this.isConnected(this.collections.products)) {
      throw new Error('MongoDB not connected for product creation'); // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.products);
    if (!collection) throw new Error('Failed to get products collection');

    // Generate a numeric ID for compatibility with in-memory storage
    const lastProduct = await collection.find().sort({ id: -1 }).limit(1).toArray();
    const id = lastProduct.length > 0 ? lastProduct[0].id + 1 : 1;

    const newProduct = { ...product, id };
    
    await collection.insertOne(newProduct);
    return newProduct as Product;
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    if (!this.isConnected(this.collections.products)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.products);
    if (!collection) return undefined;

    const result = await collection.findOneAndUpdate(
      { id: id },
      { $set: productData },
      { returnDocument: 'after' }
    );

    return result as Product | undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    if (!this.isConnected(this.collections.products)) {
      return false; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.products);
    if (!collection) return false;

    const result = await collection.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  // ---------- Category Management ----------

  async getCategories(): Promise<Category[]> {
    if (!this.isConnected(this.collections.categories)) {
      return []; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.categories);
    if (!collection) return [];

    const categories = await collection.find().toArray();
    return categories as Category[];
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    if (!this.isConnected(this.collections.categories)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.categories);
    if (!collection) return undefined;

    const category = await collection.findOne({ id: id });
    return category as Category | undefined;
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    if (!this.isConnected(this.collections.categories)) {
      throw new Error('MongoDB not connected for category creation'); // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.categories);
    if (!collection) throw new Error('Failed to get categories collection');

    // Generate a numeric ID for compatibility with in-memory storage
    const lastCategory = await collection.find().sort({ id: -1 }).limit(1).toArray();
    const id = lastCategory.length > 0 ? lastCategory[0].id + 1 : 1;

    const newCategory = { ...category, id };
    
    await collection.insertOne(newCategory);
    return newCategory as Category;
  }

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined> {
    if (!this.isConnected(this.collections.categories)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.categories);
    if (!collection) return undefined;

    const result = await collection.findOneAndUpdate(
      { id: id },
      { $set: categoryData },
      { returnDocument: 'after' }
    );

    return result as Category | undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    if (!this.isConnected(this.collections.categories)) {
      return false; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.categories);
    if (!collection) return false;

    const result = await collection.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  // ---------- Cart Management ----------

  async getCartItems(userId: number): Promise<CartItem[]> {
    if (!this.isConnected(this.collections.cartItems)) {
      return []; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.cartItems);
    if (!collection) return [];

    const cartItems = await collection.find({ userId: userId }).toArray();
    return cartItems as CartItem[];
  }

  async getCartItemWithProductDetails(userId: number): Promise<any[]> {
    if (!this.isConnected(this.collections.cartItems)) {
      return []; // Will fall back to in-memory storage
    }

    const cartCollection = mongoDBService.getCollection(this.collections.cartItems);
    const productCollection = mongoDBService.getCollection(this.collections.products);
    if (!cartCollection || !productCollection) return [];

    const cartItems = await cartCollection.find({ userId: userId }).toArray();
    const cartItemsWithDetails = [];

    for (const item of cartItems) {
      const product = await productCollection.findOne({ id: item.productId });
      if (product) {
        cartItemsWithDetails.push({
          ...item,
          product
        });
      }
    }

    return cartItemsWithDetails;
  }

  async addToCart(cartItem: Omit<CartItem, 'id'>): Promise<CartItem> {
    if (!this.isConnected(this.collections.cartItems)) {
      throw new Error('MongoDB not connected for cart item creation'); // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.cartItems);
    if (!collection) throw new Error('Failed to get cart items collection');

    // Check if the item already exists in the cart
    const existingItem = await collection.findOne({ 
      userId: cartItem.userId,
      productId: cartItem.productId
    });

    if (existingItem) {
      // Update the quantity of the existing item
      const result = await collection.findOneAndUpdate(
        { id: existingItem.id },
        { $set: { quantity: existingItem.quantity + cartItem.quantity } },
        { returnDocument: 'after' }
      );
      return result as CartItem;
    } else {
      // Generate a numeric ID for compatibility with in-memory storage
      const lastCartItem = await collection.find().sort({ id: -1 }).limit(1).toArray();
      const id = lastCartItem.length > 0 ? lastCartItem[0].id + 1 : 1;

      const newCartItem = { ...cartItem, id };
      
      await collection.insertOne(newCartItem);
      return newCartItem as CartItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    if (!this.isConnected(this.collections.cartItems)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.cartItems);
    if (!collection) return undefined;

    const result = await collection.findOneAndUpdate(
      { id: id },
      { $set: { quantity } },
      { returnDocument: 'after' }
    );

    return result as CartItem | undefined;
  }

  async removeFromCart(id: number): Promise<boolean> {
    if (!this.isConnected(this.collections.cartItems)) {
      return false; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.cartItems);
    if (!collection) return false;

    const result = await collection.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  async clearCart(userId: number): Promise<boolean> {
    if (!this.isConnected(this.collections.cartItems)) {
      return false; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.cartItems);
    if (!collection) return false;

    const result = await collection.deleteMany({ userId: userId });
    return result.deletedCount > 0;
  }

  async transferCartItems(fromUserId: number, toUserId: number): Promise<boolean> {
    if (!this.isConnected(this.collections.cartItems)) {
      return false; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.cartItems);
    if (!collection) return false;

    const cartItems = await collection.find({ userId: fromUserId }).toArray();
    
    if (cartItems.length === 0) {
      return true; // No items to transfer
    }

    // Update userId of all cart items
    const updateResult = await collection.updateMany(
      { userId: fromUserId },
      { $set: { userId: toUserId } }
    );

    return updateResult.modifiedCount > 0;
  }
  
  // ---------- Notification Token Management ----------
  
  async saveNotificationToken(token: NotificationToken): Promise<NotificationToken> {
    if (!this.isConnected(this.collections.notificationTokens)) {
      throw new Error('MongoDB not connected for notification token creation'); // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.notificationTokens);
    if (!collection) throw new Error('Failed to get notification tokens collection');

    // Check if the token already exists
    const existingToken = await collection.findOne({ token: token.token });
    
    if (existingToken) {
      // Update the existing token
      await collection.updateOne(
        { token: token.token },
        { $set: token }
      );
      
      return token;
    } else {
      // Generate a numeric ID for compatibility with in-memory storage
      const lastToken = await collection.find().sort({ id: -1 }).limit(1).toArray();
      const id = lastToken.length > 0 ? lastToken[0].id + 1 : 1;

      const newToken = { ...token, id };
      
      await collection.insertOne(newToken);
      return newToken;
    }
  }

  async getNotificationTokensByUserId(userId: number): Promise<NotificationToken[]> {
    if (!this.isConnected(this.collections.notificationTokens)) {
      return []; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.notificationTokens);
    if (!collection) return [];

    const tokens = await collection.find({ userId: userId }).toArray();
    return tokens as NotificationToken[];
  }

  async deleteNotificationToken(token: string): Promise<boolean> {
    if (!this.isConnected(this.collections.notificationTokens)) {
      return false; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.notificationTokens);
    if (!collection) return false;

    const result = await collection.deleteOne({ token: token });
    return result.deletedCount === 1;
  }

  // ---------- Sessions ----------

  // The session methods will be implemented when integrating a SessionStore

  // Additional methods for other collections will be added as needed
}

// Create and export the MongoDB storage instance
export const mongoDBStorage = new MongoDBStorage();