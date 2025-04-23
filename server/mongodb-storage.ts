import { IStorage, SeoSettings, SeoAnalytics } from './storage';
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
    pharmacyInventory: 'pharmacyInventory',
    prescriptions: 'prescriptions',
    otpRecords: 'otpRecords',
    passwordResetTokens: 'passwordResetTokens',
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
    // We can't use async/await in constructor, so we need to handle the Promise
    this.initializeConnection().catch(error => {
      console.error('Error during MongoDB connection initialization:', error);
    });
    
    // To ensure MongoDB connection is retried periodically if it fails initially
    setInterval(() => {
      // Check connection status and reconnect if needed
      if (!mongoDBService.isConnectedToDb()) {
        console.log('Periodic MongoDB connection check - attempting reconnection');
        this.initializeConnection().catch(error => {
          console.error('Error during periodic MongoDB reconnection:', error);
        });
      }
    }, 60000); // Check every minute
  }

  // Initialize MongoDB connection
  private async initializeConnection() {
    try {
      // First check if the MongoDB service is already connected
      const isAlreadyConnected = mongoDBService.isConnectedToDb();
      console.log(`MongoDB storage initialization - Already connected: ${isAlreadyConnected}`);
      
      if (!isAlreadyConnected) {
        // Explicitly connect again
        console.log('MongoDB not connected. Attempting connection...');
        const connected = await mongoDBService.connect();
        console.log(`MongoDB connection attempt result: ${connected}`);
        
        if (connected) {
          console.log('MongoDB successfully connected in MongoDBStorage initialization');
          // Create a document in users collection to verify database write access
          try {
            const usersCollection = mongoDBService.getCollection(this.collections.users);
            if (usersCollection) {
              // Only perform this check if not already in the collection
              const connectionTest = await usersCollection.findOne({ username: '__connection_test__' });
              if (!connectionTest) {
                await usersCollection.insertOne({
                  id: -999,
                  username: '__connection_test__',
                  password: 'test',
                  name: 'Connection Test',
                  email: 'test@example.com'
                });
                console.log('MongoDB connection verified with successful write test');
              } else {
                console.log('MongoDB connection verified - test record exists');
              }
            }
          } catch (writeError) {
            console.error('Failed to write to MongoDB:', writeError);
          }
        }
      }
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
    console.log(`Attempting to create user in MongoDB: ${user.username}`);
    
    try {
      // Reconnect MongoDB if needed
      if (!mongoDBService.isConnectedToDb()) {
        console.log('MongoDB connection lost. Attempting to reconnect before user creation...');
        await this.initializeConnection();
      }

      if (!this.isConnected(this.collections.users)) {
        console.error('MongoDB not connected for user creation after reconnection attempt');
        throw new Error('MongoDB not connected for user creation'); // Will fall back to in-memory storage
      }

      const collection = mongoDBService.getCollection(this.collections.users);
      if (!collection) {
        console.error('Failed to get users collection from MongoDB');
        throw new Error('Failed to get users collection');
      }

      // Check if user already exists to avoid duplicates
      console.log(`Checking if user with username '${user.username}' already exists in MongoDB`);
      const existingUser = await collection.findOne({ 
        $or: [
          { username: user.username }, 
          { email: user.email }
        ]
      });
      
      // Log incoming user data for debugging
      console.log('Raw user data before processing:', {
        ...user,
        password: '[REDACTED]'
      });
      
      // Set proper status based on active flag if provided
      if ('active' in user && typeof user.active === 'boolean') {
        console.log(`Converting 'active' flag (${user.active}) to status value`);
        user.status = user.active ? 'active' : 'pending';
        // Remove the active flag as it's not part of our User schema
        delete (user as any).active;
      } else if (!user.status) {
        // Default status if neither active nor status is provided
        console.log('No status or active flag provided, setting default status to active');
        user.status = 'active';
      } else {
        console.log(`Using provided status value: ${user.status}`);
      }
      
      // Ensure status is a valid value
      if (!['active', 'pending', 'suspended'].includes(user.status)) {
        console.log(`Invalid status value: ${user.status}, setting to default 'active'`);
        user.status = 'active';
      }
      
      console.log('Final user data after status processing:', {
        ...user,
        password: '[REDACTED]'
      });
      
      if (existingUser) {
        console.log(`User already exists in MongoDB: ${JSON.stringify(existingUser)}`);
        throw new Error(`User with username '${user.username}' or email '${user.email}' already exists`);
      }

      // Generate a numeric ID for compatibility with in-memory storage
      console.log('Generating unique ID for new user');
      const lastUser = await collection.find().sort({ id: -1 }).limit(1).toArray();
      const id = lastUser.length > 0 ? lastUser[0].id + 1 : 1;
      console.log(`Generated ID: ${id} for user ${user.username}`);
      
      // Make sure role is set, default to 'customer' if not specified
      const userData = { ...user };
      if (!userData.role) {
        console.log(`Setting default role 'customer' for user ${user.username}`);
        userData.role = 'customer';
      }

      const newUser = { ...userData, id };
      
      console.log(`Inserting new user into MongoDB: ${JSON.stringify(newUser)}`);
      const result = await collection.insertOne(newUser);
      
      if (result.acknowledged) {
        console.log(`User successfully created in MongoDB with ID: ${id}`);
        return newUser as User;
      } else {
        console.error('MongoDB insert operation was not acknowledged');
        throw new Error('Failed to insert user - operation not acknowledged');
      }
    } catch (error) {
      console.error('Error creating user in MongoDB:', error);
      throw error; // Rethrow to allow fallback to in-memory storage
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    if (!this.isConnected(this.collections.users)) {
      console.warn(`MongoDB not connected for updateUser(${id}). Will fall back to in-memory storage.`);
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.users);
    if (!collection) {
      console.error('MongoDB collection not available for updateUser');
      return undefined;
    }

    console.log(`Updating user in MongoDB for user ID: ${id}`);
    console.log(`Update data:`, JSON.stringify(userData));
    
    // Ensure phone is stored as string
    const processedUserData = { ...userData };
    if (processedUserData.phone !== undefined) {
      processedUserData.phone = String(processedUserData.phone);
      console.log(`Processed phone number: ${processedUserData.phone}`);
    }

    try {
      const result = await collection.findOneAndUpdate(
        { id: id },
        { $set: processedUserData },
        { returnDocument: 'after' }
      );

      if (!result) {
        console.error(`MongoDB updateUser: No document found or updated with ID: ${id}`);
        return undefined;
      }

      console.log(`MongoDB updateUser: Successfully updated user with ID: ${id}`);
      // Log the updated document to verify phone number
      console.log(`Updated user document:`, JSON.stringify({
        ...result,
        password: "[REDACTED]"
      }));
      
      return result as User;
    } catch (error) {
      console.error(`MongoDB updateUser error for user ID ${id}:`, error);
      return undefined;
    }
  }

  async updateUserPassword(id: number, password: string): Promise<User | undefined> {
    if (!this.isConnected(this.collections.users)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.users);
    if (!collection) return undefined;

    console.log(`Updating password for user ID: ${id}`);
    console.log(`New hashed password format: ${password}`);

    try {
      const result = await collection.findOneAndUpdate(
        { id: id },
        { $set: { password } },
        { returnDocument: 'after' }
      );

      console.log(`Password updated successfully for user ID: ${id}`);
      return result as User | undefined;
    } catch (error) {
      console.error(`Error updating password for user ID ${id}:`, error);
      return undefined;
    }
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
  
  // ---------- Password Reset Token Methods ----------
  
  async savePasswordResetToken(data: {
    userId: number;
    token: string;
    expiresAt: Date;
    used: boolean;
  }): Promise<any> {
    if (!this.isConnected(this.collections.passwordResetTokens)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.passwordResetTokens);
    if (!collection) return undefined;

    const tokenData = {
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      used: data.used,
      createdAt: new Date()
    };

    const result = await collection.insertOne(tokenData);
    if (result.acknowledged) {
      return tokenData;
    }
    return undefined;
  }

  async getPasswordResetToken(token: string): Promise<any> {
    if (!this.isConnected(this.collections.passwordResetTokens)) {
      return undefined; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.passwordResetTokens);
    if (!collection) return undefined;

    const resetToken = await collection.findOne({ token: token });
    return resetToken;
  }

  async invalidatePasswordResetToken(token: string): Promise<boolean> {
    if (!this.isConnected(this.collections.passwordResetTokens)) {
      return false; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.passwordResetTokens);
    if (!collection) return false;

    const result = await collection.updateOne(
      { token: token },
      { $set: { used: true } }
    );

    return result.modifiedCount === 1;
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

  // ---------- Pharmacy Inventory ----------

  async getPharmacyInventory(pharmacyId: number): Promise<any[]> {
    if (!this.isConnected(this.collections.pharmacyInventory)) {
      return []; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.pharmacyInventory);
    if (!collection) return [];

    // Get inventory with product details
    const inventory = await collection.find({ pharmacyId }).toArray();
    
    // Enrich with product details if available
    const productsCollection = mongoDBService.getCollection(this.collections.products);
    if (productsCollection) {
      // Add product details to each inventory item
      for (const item of inventory) {
        if (item.productId) {
          const product = await productsCollection.findOne({ id: item.productId });
          if (product) {
            item.product = {
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              brand: product.brand,
              quantity: product.quantity
            };
          }
        }
      }
    }

    return inventory;
  }

  async updatePharmacyInventory(pharmacyId: number, productId: number, updates: any): Promise<any> {
    if (!this.isConnected(this.collections.pharmacyInventory)) {
      return null; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.pharmacyInventory);
    if (!collection) return null;

    // Check if this inventory item exists
    const existingItem = await collection.findOne({ pharmacyId, productId });
    
    if (existingItem) {
      // Update existing inventory item
      const result = await collection.findOneAndUpdate(
        { pharmacyId, productId },
        { $set: updates },
        { returnDocument: 'after' }
      );
      return result;
    } else {
      // Create new inventory item
      const newItem = {
        pharmacyId,
        productId,
        quantity: updates.quantity || 0,
        price: updates.price || 0,
        status: updates.status || 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(newItem);
      if (result.acknowledged) {
        return newItem;
      }
      return null;
    }
  }

  // ---------- Orders ----------
  // Get all orders for analytics and sales dashboard
  async getAllOrders(): Promise<Order[]> {
    try {
      console.log('MongoDB: Fetching all orders for sales dashboard analysis');
      if (!this.isConnected(this.collections.orders)) {
        console.log('MongoDB: Not connected to orders collection');
        return [];
      }
      
      const collection = mongoDBService.getCollection(this.collections.orders);
      const orders = await collection.find({}).toArray();
      
      // Get all order items
      const orderItems = await this.getAllOrderItems();
      
      // Map order items to respective orders
      const ordersWithItems = orders.map(order => {
        const items = orderItems.filter(item => item.orderId === order.id);
        return {
          ...order,
          items
        };
      });
      
      console.log(`MongoDB: Found ${ordersWithItems.length} orders with items data`);
      return ordersWithItems;
    } catch (error) {
      console.error('MongoDB: Error fetching all orders:', error);
      return [];
    }
  }
  
  // Get all order items for analytics purposes
  async getAllOrderItems(): Promise<any[]> {
    try {
      if (!this.isConnected('orderItems')) {
        return [];
      }
      
      const collection = mongoDBService.getCollection('orderItems');
      return await collection.find({}).toArray();
    } catch (error) {
      console.error('MongoDB: Error fetching all order items:', error);
      return [];
    }
  }

  // ---------- Pharmacy Orders ----------

  async getPharmacyOrders(pharmacyId: number): Promise<any[]> {
    if (!this.isConnected(this.collections.orders)) {
      return []; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.orders);
    if (!collection) return [];

    // Get orders assigned to this pharmacy
    const orders = await collection.find({ pharmacyId }).toArray();
    
    // Enrich with customer details
    const usersCollection = mongoDBService.getCollection(this.collections.users);
    if (usersCollection) {
      for (const order of orders) {
        if (order.customerId) {
          const customer = await usersCollection.findOne({ id: order.customerId });
          if (customer) {
            order.customerName = customer.name || customer.username;
            order.customerPhone = customer.phone;
            order.customerAddress = customer.address;
            order.customerPincode = customer.pincode;
          }
        }
      }
    }
    
    // Get order items
    const orderItemsCollection = mongoDBService.getCollection('orderItems');
    if (orderItemsCollection) {
      for (const order of orders) {
        const items = await orderItemsCollection.find({ orderId: order.id }).toArray();
        order.items = items;
      }
    }

    return orders;
  }

  // ---------- Prescriptions ----------

  async getPendingPrescriptions(pharmacyId: number): Promise<any[]> {
    if (!this.isConnected(this.collections.prescriptions)) {
      return []; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.prescriptions);
    if (!collection) return [];

    // Get pending prescriptions for this pharmacy
    const prescriptions = await collection.find({ 
      pharmacyId, 
      status: 'pending'
    }).toArray();
    
    // Enrich with customer details
    const usersCollection = mongoDBService.getCollection(this.collections.users);
    if (usersCollection) {
      for (const prescription of prescriptions) {
        if (prescription.customerId) {
          const customer = await usersCollection.findOne({ id: prescription.customerId });
          if (customer) {
            prescription.customerName = customer.name || customer.username;
            prescription.customerPhone = customer.phone;
          }
        }
      }
    }

    return prescriptions;
  }

  async getAllPrescriptions(): Promise<any[]> {
    if (!this.isConnected(this.collections.prescriptions)) {
      return []; // Will fall back to in-memory storage
    }
    
    const collection = mongoDBService.getCollection(this.collections.prescriptions);
    if (!collection) return [];
    
    try {
      // Fetch all prescriptions from MongoDB
      const prescriptions = await collection.find().sort({ uploadDate: -1 }).toArray();
      console.log(`Found ${prescriptions.length} prescriptions in MongoDB`);
      
      // Enrich with user details
      const usersCollection = mongoDBService.getCollection(this.collections.users);
      if (usersCollection) {
        for (const prescription of prescriptions) {
          if (prescription.userId) {
            const user = await usersCollection.findOne({ id: prescription.userId });
            if (user) {
              prescription.userFullName = user.name || user.username;
              prescription.userPhone = user.phone;
              prescription.userEmail = user.email;
            }
          }
        }
      }
      
      return prescriptions;
    } catch (error) {
      console.error('Error fetching prescriptions from MongoDB:', error);
      return [];
    }
  }
  
  async updatePrescriptionStatus(prescriptionId: number, status: string, pharmacyId: number): Promise<any> {
    if (!this.isConnected(this.collections.prescriptions)) {
      return null; // Will fall back to in-memory storage
    }

    const collection = mongoDBService.getCollection(this.collections.prescriptions);
    if (!collection) return null;

    // Update prescription status
    const result = await collection.findOneAndUpdate(
      { id: prescriptionId, pharmacyId },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
          verifiedBy: pharmacyId
        } 
      },
      { returnDocument: 'after' }
    );

    // If prescription is approved and linked to an order, update the order status as well
    if (status === 'approved' && result && result.orderId) {
      const ordersCollection = mongoDBService.getCollection(this.collections.orders);
      if (ordersCollection) {
        await ordersCollection.updateOne(
          { id: result.orderId },
          { 
            $set: { 
              prescriptionVerified: true,
              status: 'processing',
              updatedAt: new Date()
            } 
          }
        );
      }
    }

    return result;
  }

  // Additional methods for other collections will be added as needed

  // SEO related methods
  async getSeoSettings(): Promise<SeoSettings | undefined> {
    try {
      const db = client.db("pillnow");
      const settingsCollection = db.collection("seo_settings");
      const settings = await settingsCollection.findOne({ _id: "global" });
      
      if (settings) {
        // Remove _id from the result
        const { _id, ...seoSettings } = settings;
        return seoSettings as SeoSettings;
      }
      
      return undefined;
    } catch (error) {
      console.error("Error getting SEO settings:", error);
      return undefined;
    }
  }

  async saveSeoSettings(settings: SeoSettings): Promise<SeoSettings> {
    try {
      const db = client.db("pillnow");
      const settingsCollection = db.collection("seo_settings");
      
      // Use upsert to create or update document with _id: "global"
      await settingsCollection.updateOne(
        { _id: "global" },
        { $set: settings },
        { upsert: true }
      );
      
      return settings;
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      throw error;
    }
  }

  async getSeoAnalytics(): Promise<SeoAnalytics | undefined> {
    try {
      const db = client.db("pillnow");
      const analyticsCollection = db.collection("seo_analytics");
      const analytics = await analyticsCollection.findOne({ _id: "latest" });
      
      if (analytics) {
        // Remove _id from the result
        const { _id, ...seoAnalytics } = analytics;
        return seoAnalytics as SeoAnalytics;
      }
      
      return undefined;
    } catch (error) {
      console.error("Error getting SEO analytics:", error);
      return undefined;
    }
  }

  async saveSeoAnalytics(analytics: SeoAnalytics): Promise<SeoAnalytics> {
    try {
      const db = client.db("pillnow");
      const analyticsCollection = db.collection("seo_analytics");
      
      // Save current analytics as historical entry
      if (await this.getSeoAnalytics()) {
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        await analyticsCollection.updateOne(
          { _id: "latest" },
          { $set: { historical_date: currentDate } }
        );
        await analyticsCollection.updateOne(
          { _id: "latest" },
          { $rename: { '_id': 'id' } }
        );
        await analyticsCollection.updateOne(
          { id: "latest" },
          { $set: { _id: currentDate } }
        );
        await analyticsCollection.updateOne(
          { _id: currentDate },
          { $unset: { id: "" } }
        );
      }
      
      // Save new analytics as latest
      await analyticsCollection.updateOne(
        { _id: "latest" },
        { $set: analytics },
        { upsert: true }
      );
      
      return analytics;
    } catch (error) {
      console.error("Error saving SEO analytics:", error);
      throw error;
    }
  }

  // Doctor & Appointment related methods
  async getDoctor(doctorId: string | number): Promise<any> {
    try {
      const numericId = typeof doctorId === 'string' ? parseInt(doctorId, 10) : doctorId;
      
      // First, try to get from the doctorInfo collection
      if (!this.isConnected(this.collections.doctorInfo)) {
        console.error('MongoDB not connected or doctorInfo collection not available');
        return null;
      }
      
      const doctorsCollection = mongoDBService.getCollection(this.collections.doctorInfo);
      if (doctorsCollection) {
        const doctor = await doctorsCollection.findOne({ id: numericId });
        if (doctor) {
          return doctor;
        }
      }
      
      // If not found, check users collection with role = 'doctor'
      if (!this.isConnected(this.collections.users)) {
        console.error('MongoDB not connected or users collection not available');
        return null;
      }
      
      const usersCollection = mongoDBService.getCollection(this.collections.users);
      if (usersCollection) {
        const user = await usersCollection.findOne({ 
          id: numericId,
          role: 'doctor'
        });
        
        if (user) {
          // Add default data for demonstration purposes
          return {
            ...user,
            specialty: user.specialty || 'General Physician',
            clinicName: user.clinicName || 'PillNow Medical Center',
            clinicAddress: user.address || 'Medical District, Mumbai',
            consultationFee: user.consultationFee || 500
          };
        }
      }
      
      console.error(`Doctor with ID ${doctorId} not found in any collection`);
      return null;
    } catch (error) {
      console.error(`Error getting doctor with ID ${doctorId}:`, error);
      return null;
    }
  }
  
  async getDoctorAvailabilityForDate(doctorId: string | number, date: string): Promise<any[]> {
    try {
      const numericId = typeof doctorId === 'string' ? parseInt(doctorId, 10) : doctorId;
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const selectedDayName = dayNames[dayOfWeek];
      
      // Get doctor information
      const doctor = await this.getDoctor(numericId);
      if (!doctor) {
        console.error(`Doctor with ID ${doctorId} not found`);
        return [];
      }
      
      // Check if doctor is available on this day
      let availableDays = [];
      if (doctor.availableDays) {
        if (typeof doctor.availableDays === 'string') {
          availableDays = doctor.availableDays.split(',').map(day => day.trim());
        } else if (Array.isArray(doctor.availableDays)) {
          availableDays = doctor.availableDays;
        }
      } else {
        // Default availability for demonstration
        availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      }
      
      if (!availableDays.includes(selectedDayName)) {
        return []; // Doctor not available on this day
      }
      
      // Get all appointments for this doctor on this date
      if (!this.isConnected(this.collections.appointments)) {
        console.error('MongoDB not connected or appointments collection not available');
        return [];
      }
      
      const appointmentsCollection = mongoDBService.getCollection(this.collections.appointments);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      let bookedTimes: string[] = [];
      
      if (appointmentsCollection) {
        const appointments = await appointmentsCollection.find({
          doctorId: numericId,
          appointmentDate: {
            $gte: startOfDay,
            $lte: endOfDay
          },
          status: { $nin: ['cancelled'] }
        }).toArray();
        
        bookedTimes = appointments.map((appointment: any) => {
          const appointmentDate = new Date(appointment.appointmentDate);
          return `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`;
        });
      }
      
      // Generate time slots based on doctor's schedule
      const timeSlots = [];
      
      // Default time range if not specified
      const startTime = doctor.availableTimeStart || '09:00';
      const endTime = doctor.availableTimeEnd || '17:00';
      
      const [startHour, startMinute] = startTime.split(':').map(part => parseInt(part, 10));
      const [endHour, endMinute] = endTime.split(':').map(part => parseInt(part, 10));
      
      const slotDurationMinutes = 30; // 30-minute slots
      
      let currentTime = new Date();
      currentTime.setHours(startHour, startMinute, 0, 0);
      
      const endTimeObj = new Date();
      endTimeObj.setHours(endHour, endMinute, 0, 0);
      
      while (currentTime < endTimeObj) {
        const timeStr = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
        
        // Check if this slot is already booked
        const isAvailable = !bookedTimes.includes(timeStr);
        
        timeSlots.push({
          time: timeStr,
          available: isAvailable
        });
        
        // Move to next slot
        currentTime.setMinutes(currentTime.getMinutes() + slotDurationMinutes);
      }
      
      return timeSlots;
    } catch (error) {
      console.error(`Error getting availability for doctor ${doctorId} on ${date}:`, error);
      return [];
    }
  }
  
  async checkSlotAvailability(doctorId: string | number, date: string, time: string): Promise<boolean> {
    try {
      const numericId = typeof doctorId === 'string' ? parseInt(doctorId, 10) : doctorId;
      const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
      
      const appointmentDateTime = new Date(date);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      // Buffer time (10 minutes before and after)
      const startBuffer = new Date(appointmentDateTime);
      startBuffer.setMinutes(startBuffer.getMinutes() - 10);
      
      const endBuffer = new Date(appointmentDateTime);
      endBuffer.setMinutes(endBuffer.getMinutes() + 40); // 30 min appointment + 10 min buffer
      
      if (!this.isConnected(this.collections.appointments)) {
        console.error('MongoDB not connected or appointments collection not available');
        return false; // If we can't check, assume not available
      }
      
      const appointmentsCollection = mongoDBService.getCollection(this.collections.appointments);
      if (!appointmentsCollection) {
        return false; // If we can't check, assume not available
      }
      
      // Check for existing appointments in this time range
      const existingAppointment = await appointmentsCollection.findOne({
        doctorId: numericId,
        appointmentDate: {
          $gte: startBuffer,
          $lte: endBuffer
        },
        status: { $nin: ['cancelled'] }
      });
      
      return !existingAppointment; // Available if no appointment found
    } catch (error) {
      console.error(`Error checking slot availability:`, error);
      return false; // If error, assume not available
    }
  }
  
  async createAppointment(appointmentData: any): Promise<any> {
    try {
      if (!this.isConnected(this.collections.appointments)) {
        console.error('MongoDB not connected or appointments collection not available');
        throw new Error('MongoDB not connected or appointments collection not available');
      }
      
      const appointmentsCollection = mongoDBService.getCollection(this.collections.appointments);
      if (!appointmentsCollection) {
        throw new Error('Appointments collection not available');
      }
      
      // Generate an ID for the new appointment
      const lastAppointment = await appointmentsCollection.findOne({}, { sort: { id: -1 } });
      const newId = (lastAppointment?.id || 0) + 1;
      
      // Parse time and construct appointment date
      const [hours, minutes] = appointmentData.time.split(':').map(part => parseInt(part, 10));
      const appointmentDateTime = new Date(appointmentData.date);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      // Create appointment object
      const appointment = {
        id: newId,
        userId: typeof appointmentData.patientId === 'string' 
          ? parseInt(appointmentData.patientId, 10) 
          : appointmentData.patientId,
        doctorId: typeof appointmentData.doctorId === 'string' 
          ? parseInt(appointmentData.doctorId, 10) 
          : appointmentData.doctorId,
        patientName: appointmentData.patientName,
        patientEmail: appointmentData.patientEmail,
        patientPhone: appointmentData.patientPhone,
        appointmentDate: appointmentDateTime,
        status: appointmentData.status || 'confirmed',
        isVideoConsultation: appointmentData.isVideoConsultation || false,
        symptoms: appointmentData.symptoms || '',
        notes: appointmentData.notes || '',
        createdAt: new Date(),
        bookingTime: appointmentData.bookingTime ? new Date(appointmentData.bookingTime) : new Date()
      };
      
      // Insert into database
      await appointmentsCollection.insertOne(appointment);
      
      console.log(`Appointment ${newId} created successfully`);
      return appointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }
  
  async getAppointment(appointmentId: string): Promise<any> {
    try {
      const numericId = parseInt(appointmentId, 10);
      
      if (!this.isConnected(this.collections.appointments)) {
        console.error('MongoDB not connected or appointments collection not available');
        return null;
      }
      
      const appointmentsCollection = mongoDBService.getCollection(this.collections.appointments);
      if (!appointmentsCollection) {
        return null;
      }
      
      const appointment = await appointmentsCollection.findOne({ id: numericId });
      return appointment;
    } catch (error) {
      console.error(`Error getting appointment ${appointmentId}:`, error);
      return null;
    }
  }
  
  async getDoctorAppointments(doctorId: string | number): Promise<any[]> {
    try {
      const numericId = typeof doctorId === 'string' ? parseInt(doctorId, 10) : doctorId;
      
      if (!this.isConnected(this.collections.appointments)) {
        console.error('MongoDB not connected or appointments collection not available');
        return [];
      }
      
      const appointmentsCollection = mongoDBService.getCollection(this.collections.appointments);
      if (!appointmentsCollection) {
        return [];
      }
      
      const appointments = await appointmentsCollection.find({
        doctorId: numericId
      }).sort({ appointmentDate: -1 }).toArray();
      
      return appointments;
    } catch (error) {
      console.error(`Error getting appointments for doctor ${doctorId}:`, error);
      return [];
    }
  }
  
  async getPatientAppointments(patientId: string | number): Promise<any[]> {
    try {
      const numericId = typeof patientId === 'string' ? parseInt(patientId, 10) : patientId;
      
      if (!this.isConnected(this.collections.appointments)) {
        console.error('MongoDB not connected or appointments collection not available');
        return [];
      }
      
      const appointmentsCollection = mongoDBService.getCollection(this.collections.appointments);
      if (!appointmentsCollection) {
        return [];
      }
      
      const appointments = await appointmentsCollection.find({
        userId: numericId
      }).sort({ appointmentDate: -1 }).toArray();
      
      return appointments;
    } catch (error) {
      console.error(`Error getting appointments for patient ${patientId}:`, error);
      return [];
    }
  }
  
  async updateAppointmentStatus(appointmentId: string, status: string, cancellationReason?: string): Promise<any> {
    try {
      const numericId = parseInt(appointmentId, 10);
      
      if (!this.isConnected(this.collections.appointments)) {
        console.error('MongoDB not connected or appointments collection not available');
        throw new Error('MongoDB not connected or appointments collection not available');
      }
      
      const appointmentsCollection = mongoDBService.getCollection(this.collections.appointments);
      if (!appointmentsCollection) {
        throw new Error('Appointments collection not available');
      }
      
      const updateData: any = { status };
      if (cancellationReason && status === 'cancelled') {
        updateData.cancellationReason = cancellationReason;
      }
      
      const result = await appointmentsCollection.findOneAndUpdate(
        { id: numericId },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result.value;
    } catch (error) {
      console.error(`Error updating appointment ${appointmentId} status:`, error);
      throw error;
    }
  }
  
  async rescheduleAppointment(appointmentId: string, date: string, time: string): Promise<any> {
    try {
      const numericId = parseInt(appointmentId, 10);
      
      if (!this.isConnected(this.collections.appointments)) {
        console.error('MongoDB not connected or appointments collection not available');
        throw new Error('MongoDB not connected or appointments collection not available');
      }
      
      const appointmentsCollection = mongoDBService.getCollection(this.collections.appointments);
      if (!appointmentsCollection) {
        throw new Error('Appointments collection not available');
      }
      
      // Parse time and construct appointment date
      const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
      const appointmentDateTime = new Date(date);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      const result = await appointmentsCollection.findOneAndUpdate(
        { id: numericId },
        { 
          $set: { 
            appointmentDate: appointmentDateTime,
            status: 'rescheduled',
            rescheduledAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );
      
      return result.value;
    } catch (error) {
      console.error(`Error rescheduling appointment ${appointmentId}:`, error);
      throw error;
    }
  }
}

// Create and export the MongoDB storage instance
export const mongoDBStorage = new MongoDBStorage();