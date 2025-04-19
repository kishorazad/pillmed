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
    pharmacyInventory: 'pharmacyInventory',
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
}

// Create and export the MongoDB storage instance
export const mongoDBStorage = new MongoDBStorage();