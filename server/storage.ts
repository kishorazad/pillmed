import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  categories, type Category, type InsertCategory,
  cartItems, type CartItem, type InsertCartItem,
  articles, type Article, type InsertArticle,
  testimonials, type Testimonial, type InsertTestimonial,
  labTests, type LabTest, type InsertLabTest,
  doctors, type Doctor, type InsertDoctor,
  pharmacies, type Pharmacy, type InsertPharmacy,
  laboratories, type Laboratory, type InsertLaboratory,
  appointments, type Appointment, type InsertAppointment,
  labBookings, type LabBooking, type InsertLabBooking,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  healthTips, type HealthTip, type InsertHealthTip,
  notificationTokens, type NotificationToken, type InsertNotificationToken
} from "@shared/schema";

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Notification related methods
  saveNotificationToken(token: InsertNotificationToken): Promise<NotificationToken>;
  getNotificationTokensByUserId(userId: number): Promise<NotificationToken[]>;
  deleteNotificationToken(token: string): Promise<boolean>;
  
  // Product related methods
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Category related methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Cart related methods
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItemWithProductDetails(userId: number): Promise<any[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  transferCartItems(fromUserId: number, toUserId: number): Promise<boolean>;
  
  // Article related methods
  getArticles(): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  
  // Testimonial related methods
  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Lab test related methods
  getLabTests(): Promise<LabTest[]>;
  createLabTest(labTest: InsertLabTest): Promise<LabTest>;
  updateLabTest(id: number, labTest: Partial<InsertLabTest>): Promise<LabTest | undefined>;
  deleteLabTest(id: number): Promise<boolean>;
  
  // Doctor related methods
  getDoctors(): Promise<Doctor[]>;
  getDoctorById(id: number): Promise<Doctor | undefined>;
  getDoctorWithUserDetails(id: number): Promise<any | undefined>;
  getAllDoctorsWithUserDetails(): Promise<any[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: number, doctor: Partial<InsertDoctor>): Promise<Doctor | undefined>;
  
  // Pharmacy related methods
  getPharmacies(): Promise<Pharmacy[]>;
  getPharmacyById(id: number): Promise<Pharmacy | undefined>;
  getPharmacyWithUserDetails(id: number): Promise<any | undefined>;
  getAllPharmaciesWithUserDetails(): Promise<any[]>;
  createPharmacy(pharmacy: InsertPharmacy): Promise<Pharmacy>;
  updatePharmacy(id: number, pharmacy: Partial<InsertPharmacy>): Promise<Pharmacy | undefined>;
  
  // Laboratory related methods
  getLaboratories(): Promise<Laboratory[]>;
  getLaboratoryById(id: number): Promise<Laboratory | undefined>;
  getLaboratoryWithUserDetails(id: number): Promise<any | undefined>;
  getAllLaboratoriesWithUserDetails(): Promise<any[]>;
  createLaboratory(laboratory: InsertLaboratory): Promise<Laboratory>;
  updateLaboratory(id: number, laboratory: Partial<InsertLaboratory>): Promise<Laboratory | undefined>;
  
  // Appointment related methods
  getAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: number): Promise<Appointment | undefined>;
  getAppointmentsByUser(userId: number): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  
  // Lab Booking related methods
  getLabBookings(): Promise<LabBooking[]>;
  getLabBookingById(id: number): Promise<LabBooking | undefined>;
  getLabBookingsByUser(userId: number): Promise<LabBooking[]>;
  getLabBookingsByLaboratory(laboratoryId: number): Promise<LabBooking[]>;
  createLabBooking(labBooking: InsertLabBooking): Promise<LabBooking>;
  updateLabBookingStatus(id: number, status: string): Promise<LabBooking | undefined>;
  
  // Order related methods
  getOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Item related methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Health Tips related methods
  getHealthTips(): Promise<HealthTip[]>;
  getHealthTipById(id: number): Promise<HealthTip | undefined>;
  getRandomHealthTip(): Promise<HealthTip | undefined>;
  createHealthTip(healthTip: InsertHealthTip): Promise<HealthTip>;
  updateHealthTip(id: number, healthTip: Partial<InsertHealthTip>): Promise<HealthTip | undefined>;
  deleteHealthTip(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private cartItems: Map<number, CartItem>;
  private articles: Map<number, Article>;
  private testimonials: Map<number, Testimonial>;
  private labTests: Map<number, LabTest>;
  private doctors: Map<number, Doctor>;
  private pharmacies: Map<number, Pharmacy>;
  private laboratories: Map<number, Laboratory>;
  private appointments: Map<number, Appointment>;
  private labBookings: Map<number, LabBooking>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private healthTips: Map<number, HealthTip>;
  private notificationTokens: Map<number, NotificationToken>;
  
  currentUserId: number;
  currentProductId: number;
  currentCategoryId: number;
  currentCartItemId: number;
  currentArticleId: number;
  currentTestimonialId: number;
  currentLabTestId: number;
  currentDoctorId: number;
  currentPharmacyId: number;
  currentLaboratoryId: number;
  currentAppointmentId: number;
  currentLabBookingId: number;
  currentOrderId: number;
  currentOrderItemId: number;
  currentHealthTipId: number;
  currentNotificationTokenId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.cartItems = new Map();
    this.articles = new Map();
    this.testimonials = new Map();
    this.labTests = new Map();
    this.doctors = new Map();
    this.pharmacies = new Map();
    this.laboratories = new Map();
    this.appointments = new Map();
    this.labBookings = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.healthTips = new Map();
    this.notificationTokens = new Map();
    
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCategoryId = 1;
    this.currentCartItemId = 1;
    this.currentArticleId = 1;
    this.currentTestimonialId = 1;
    this.currentLabTestId = 1;
    this.currentDoctorId = 1;
    this.currentPharmacyId = 1;
    this.currentLaboratoryId = 1;
    this.currentAppointmentId = 1;
    this.currentLabBookingId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentHealthTipId = 1;
    this.currentNotificationTokenId = 1;
    
    // Initialize with seed data
    this.seedData();
  }

  private seedData() {
    // Seed users with explicit IDs
    const usersData = [
      {
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '1234567890',
        address: '123 Test Street, Test City',
        role: 'customer',
        pincode: '110001',
        profileImageUrl: null
      },
      {
        id: 2,
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        phone: '0987654321',
        address: '456 Admin Street, Admin City',
        role: 'admin',
        pincode: '110002',
        profileImageUrl: null
      },
      {
        id: 3,
        username: 'doctor1',
        email: 'doctor@example.com',
        password: 'doctor123',
        name: 'Dr. John Smith',
        phone: '5554443333',
        address: '789 Doctor Avenue, Medical City',
        role: 'doctor',
        pincode: '110003',
        profileImageUrl: null
      },
      {
        id: 4,
        username: 'pharmacy1',
        email: 'pharmacy@example.com',
        password: 'pharmacy123',
        name: 'City Pharmacy',
        phone: '1112223333',
        address: '101 Health Street, Pharma City',
        role: 'pharmacy',
        pincode: '110004',
        profileImageUrl: null
      }
    ];
    
    // Directly set the users with their explicit IDs
    usersData.forEach(user => {
      this.users.set(user.id, user as User);
    });
    
    // Update the current user ID counter
    this.currentUserId = 5;
    
    // Seed categories
    const categoriesData: InsertCategory[] = [
      { name: 'Pregnancy & Maternal Care', description: 'Medications for expecting mothers and maternal health', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae' },
      { name: 'Antibiotics & Infections', description: 'Medications treating bacterial and other infections', imageUrl: 'https://images.unsplash.com/photo-1576671234524-ed58c95eab38' },
      { name: 'Pain & Fever', description: 'Relief medications for pain, inflammation and fever', imageUrl: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8' },
      { name: 'Diabetes & Metabolic', description: 'Medications for diabetes and metabolic conditions', imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2' },
      { name: 'Mental Health', description: 'Medications for anxiety, depression and other mental health conditions', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b' },
      { name: 'Skin Care', description: 'Topical medications for skin conditions and infections', imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e' }
    ];
    
    categoriesData.forEach(category => {
      this.createCategory(category);
    });
    
    // Seed products with real medicine data
    const productsData: InsertProduct[] = [
      {
        name: '1 AL AX 5mg/75mg Capsule',
        description: 'Levocetirizine (5mg) + Ambroxol (75mg) - In Cough 1 AL AX 5mg/75mg Capsule gives relief from cough by loosening thick mucus and making it easier to cough it out.',
        price: 320,
        discountedPrice: 280,
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88',
        categoryId: 3,
        brand: 'FDC Ltd',
        inStock: true,
        quantity: 'Strip of 10 Capsules',
        rating: 4.5,
        ratingCount: 120,
        isFeatured: true
      },
      {
        name: '1 Nvp Tablet',
        description: 'Doxylamine (20mg) + Vitamin B6 (Pyridoxine) (20mg) + Folic Acid (5mg) - In Treatment of Nausea and vomiting in pregnancy.',
        price: 220,
        discountedPrice: 185,
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',
        categoryId: 1,
        brand: 'Gynofem Healthcare Pvt. Ltd.',
        inStock: true,
        quantity: 'Strip of 10 Tablets',
        rating: 4.2,
        ratingCount: 85,
        isFeatured: true
      },
      {
        name: '1 Oxytime + Ointment',
        description: 'Ofloxacin (0.75% w/v) + Ornidazole (2% w/v) + Itraconazole (1% w/v) + Clobetasol (0.05% w/v) - In Skin infections treatment.',
        price: 250,
        discountedPrice: 199,
        imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b4123a21',
        categoryId: 2,
        brand: 'Medrix Labs Private Limited',
        inStock: true,
        quantity: 'Tube of 15g',
        rating: 4.7,
        ratingCount: 208,
        isFeatured: true
      },
      {
        name: '10 D 10% Injection',
        description: 'Dextrose (10% w/v) - In Short term fluid replacement after trauma.',
        price: 899,
        discountedPrice: 799,
        imageUrl: 'https://images.unsplash.com/photo-1576671234524-ed58c95eab38',
        categoryId: 2,
        brand: 'Otsuka Pharmaceutical India Pvt Ltd',
        inStock: true,
        quantity: 'Injection',
        rating: 4.4,
        ratingCount: 156,
        isFeatured: true
      },
      {
        name: '10 LI 20 Tablet',
        description: 'Teneligliptin (20mg) - Used to treat type 2 diabetes mellitus together with a healthy diet and regular exercise to control blood sugar levels.',
        price: 429,
        discountedPrice: 299,
        imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2',
        categoryId: 4,
        brand: 'Apex Laboratories Pvt Ltd',
        inStock: true,
        quantity: 'Strip of 10 Tablets',
        rating: 4.6,
        ratingCount: 324,
        isFeatured: true
      },
      {
        name: '10 PM Tablet',
        description: 'Sildenafil (25mg) - In Treatment of Erectile dysfunction',
        price: 299,
        discountedPrice: 249,
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        categoryId: 5,
        brand: 'Hallmark Formulations Pharmaceuticals',
        inStock: true,
        quantity: 'Strip of 4 Tablets',
        rating: 4.3,
        ratingCount: 98,
        isFeatured: false
      },
      {
        name: '1000 Para Tablet',
        description: 'Paracetamol (1000mg) - In Pain relief common painkiller used to treat aches and pains.',
        price: 150,
        discountedPrice: 120,
        imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2',
        categoryId: 3,
        brand: 'RPG Life Sciences Ltd',
        inStock: true,
        quantity: 'Strip of 10 Tablets',
        rating: 4.8,
        ratingCount: 450,
        isFeatured: true
      },
      {
        name: '100mg/325mg/250mg Tablet',
        description: 'Aceclofenac (100mg) + Paracetamol (325mg) + Chlorzoxazone (250mg) - In Treatment of Muscular pain',
        price: 199,
        discountedPrice: 160,
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88',
        categoryId: 3,
        brand: 'Aden Healthcare',
        inStock: true,
        quantity: 'Strip of 10 Tablets',
        rating: 4.4,
        ratingCount: 210,
        isFeatured: true
      },
      {
        name: '2 Calm 0.25mg/20mg Tablet',
        description: 'Alprazolam (0.25mg) + Propranolol (20mg) - In Anxiety disorder treatment',
        price: 290,
        discountedPrice: 230,
        imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2',
        categoryId: 5,
        brand: 'Zoic Lifesciences',
        inStock: true,
        quantity: 'Strip of 10 Tablets',
        rating: 4.5,
        ratingCount: 180,
        isFeatured: true
      },
      {
        name: '2 Clav 500mg/125mg Tablet',
        description: 'Amoxycillin (500mg) + Clavulanic Acid (125mg) - In Treatment of Bacterial infections',
        price: 350,
        discountedPrice: 280,
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',
        categoryId: 2,
        brand: 'Octavia Labs Pvt Ltd.',
        inStock: true,
        quantity: 'Strip of 6 Tablets',
        rating: 4.7,
        ratingCount: 320,
        isFeatured: true
      },
      {
        name: '2 Crine 100mcg Tablet',
        description: 'Thyroxine (100mcg) - Used to treat an underactive thyroid gland (hypothyroidism)',
        price: 180,
        discountedPrice: 155,
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        categoryId: 1,
        brand: 'Captab Biotec',
        inStock: true,
        quantity: 'Strip of 10 Tablets',
        rating: 4.6,
        ratingCount: 290,
        isFeatured: false
      },
      {
        name: '2 Dep 20mg Tablet',
        description: 'Duloxetine (20mg) - In Treatment of Stress urinary incontinence',
        price: 300,
        discountedPrice: 250,
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',
        categoryId: 4,
        brand: 'Orchid Chemicals & Pharmaceuticals Ltd',
        inStock: true,
        quantity: 'Strip of 10 Tablets',
        rating: 4.2,
        ratingCount: 160,
        isFeatured: false
      }
    ];
    
    productsData.forEach(product => {
      this.createProduct(product);
    });

    // Seed articles
    const articlesData: InsertArticle[] = [
      {
        title: 'The Importance of a Balanced Diet',
        content: 'Learn about how a balanced diet contributes to overall health and wellbeing, and discover tips for maintaining healthy eating habits.',
        imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71'
      },
      {
        title: 'Exercise Tips for Busy Professionals',
        content: 'Discover effective exercise routines that can be incorporated into even the busiest schedules, helping you stay fit despite time constraints.',
        imageUrl: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c'
      },
      {
        title: 'Managing Stress in Modern Life',
        content: 'Explore effective techniques for managing stress and anxiety in today\'s fast-paced world, and learn how to prioritize your mental wellbeing.',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'
      }
    ];
    
    articlesData.forEach(article => {
      this.createArticle(article);
    });

    // Seed testimonials
    const testimonialsData: InsertTestimonial[] = [
      {
        name: 'Rajesh Singh',
        content: 'I\'ve been using Medadock for ordering my monthly medicines for over a year now. The service is prompt, and the discounts help me save a lot on my recurring medical expenses.',
        rating: 5,
        initials: 'RS'
      },
      {
        name: 'Anjali Patel',
        content: 'The lab test service is excellent! They came to my home for sample collection, and I received the reports on the same day. Very convenient for busy professionals like me.',
        rating: 4,
        initials: 'AP'
      },
      {
        name: 'Varun Kumar',
        content: 'I consulted with a doctor through the app when I was traveling and couldn\'t visit a clinic. The video consultation was smooth, and I got the prescription digitally. Really helpful service!',
        rating: 5,
        initials: 'VK'
      }
    ];
    
    testimonialsData.forEach(testimonial => {
      this.createTestimonial(testimonial);
    });

    // Seed lab tests
    const labTestsData: InsertLabTest[] = [
      {
        name: 'Complete Body Checkup',
        description: 'Includes 70+ tests',
        price: 3999,
        discountedPrice: 1999,
        testCount: 70
      },
      {
        name: 'Diabetes Screening',
        description: 'Includes 15+ tests',
        price: 1499,
        discountedPrice: 799,
        testCount: 15
      },
      {
        name: 'Women\'s Health',
        description: 'Includes 40+ tests',
        price: 2999,
        discountedPrice: 1599,
        testCount: 40
      }
    ];
    
    labTestsData.forEach(labTest => {
      this.createLabTest(labTest);
    });
    
    // Seed health tips
    const healthTipsData: InsertHealthTip[] = [
      {
        title: "Stay Hydrated Throughout the Day",
        content: "Drink at least 8 glasses of water daily to maintain proper hydration. Water helps regulate body temperature, keeps joints lubricated, prevents infections, delivers nutrients to cells, and keeps organs functioning properly.",
        category: "Hydration",
        imageUrl: "https://images.unsplash.com/photo-1546842931-886c185b4c8c"
      },
      {
        title: "Importance of Regular Exercise",
        content: "Aim for at least 30 minutes of moderate physical activity each day. Regular exercise improves cardiovascular health, strengthens muscles, enhances mental wellbeing, and reduces the risk of chronic diseases.",
        category: "Exercise",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b"
      },
      {
        title: "Get Enough Quality Sleep",
        content: "Adults should aim for 7-9 hours of quality sleep each night. Good sleep improves concentration, productivity, immune function, and helps maintain a healthy weight.",
        category: "Sleep",
        imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55"
      },
      {
        title: "Add More Vegetables to Your Diet",
        content: "Try to include vegetables in at least two meals per day. Vegetables are packed with essential vitamins, minerals, and antioxidants that help protect against chronic diseases and support overall health.",
        category: "Nutrition",
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999"
      },
      {
        title: "Practice Mindful Breathing",
        content: "Take 5 minutes daily to practice deep, mindful breathing. This simple practice can reduce stress, lower blood pressure, and improve mental clarity and focus.",
        category: "Mental Health",
        imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773"
      },
      {
        title: "Limit Processed Foods",
        content: "Reduce consumption of highly processed foods that are often high in sugar, unhealthy fats, and sodium. Choose whole, unprocessed foods whenever possible for better nutrition and health.",
        category: "Nutrition",
        imageUrl: "https://images.unsplash.com/photo-1511909525232-61113c912358"
      },
      {
        title: "Take Regular Breaks From Screens",
        content: "Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. This helps reduce eye strain and fatigue from prolonged screen time.",
        category: "Eye Health",
        imageUrl: "https://images.unsplash.com/photo-1581290141480-8b007f94642f"
      }
    ];
    
    healthTipsData.forEach(healthTip => {
      this.createHealthTip(healthTip);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  // Get all users
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isFeatured
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async getCartItemWithProductDetails(userId: number): Promise<any[]> {
    const cartItems = await this.getCartItems(userId);
    return Promise.all(
      cartItems.map(async (item) => {
        const product = await this.getProductById(item.productId);
        return {
          ...item,
          product,
        };
      })
    );
  }
  
  // Method to transfer cart items from one user to another (guest to authenticated)
  async transferCartItems(fromUserId: number, toUserId: number): Promise<boolean> {
    console.log(`Starting cart transfer from user ${fromUserId} to user ${toUserId}`);
    
    // Get all cart items from the source user
    const sourceCartItems = await this.getCartItems(fromUserId);
    console.log(`Found ${sourceCartItems.length} items in cart for source user ${fromUserId}`);
    
    if (sourceCartItems.length === 0) {
      console.log('No items to transfer, cart transfer complete');
      return true;
    }
    
    // For each item, add it to the target user's cart and remove from source
    for (const item of sourceCartItems) {
      console.log(`Transferring item ${item.id} (product: ${item.productId}, quantity: ${item.quantity})`);
      
      try {
        // Add to target user's cart
        const newItem = await this.addToCart({
          userId: toUserId,
          productId: item.productId,
          quantity: item.quantity
        });
        console.log(`Added to target user's cart as item ${newItem.id}`);
        
        // Remove from source user's cart
        await this.removeFromCart(item.id);
        console.log(`Removed item ${item.id} from source user's cart`);
      } catch (error) {
        console.error(`Error transferring cart item ${item.id}:`, error);
      }
    }
    
    const finalCartItems = await this.getCartItems(toUserId);
    console.log(`Cart transfer complete. Target user ${toUserId} now has ${finalCartItems.length} items`);
    
    return true;
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if this product is already in the cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId
    );

    if (existingItem) {
      // Update the quantity instead of adding a new item
      return this.updateCartItem(existingItem.id, existingItem.quantity + insertCartItem.quantity) as Promise<CartItem>;
    }

    // Add new item to cart
    const id = this.currentCartItemId++;
    const cartItem: CartItem = { ...insertCartItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (cartItem) {
      const updatedItem = { ...cartItem, quantity };
      this.cartItems.set(id, updatedItem);
      return updatedItem;
    }
    return undefined;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
    
    userCartItems.forEach(item => {
      this.cartItems.delete(item.id);
    });
    
    return true;
  }
  
  async transferCartItems(fromUserId: number, toUserId: number): Promise<boolean> {
    const fromUserCartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === fromUserId
    );
    
    if (fromUserCartItems.length === 0) {
      // No items to transfer
      return false;
    }
    
    // Copy items from source user to destination user
    for (const item of fromUserCartItems) {
      await this.addToCart({
        userId: toUserId,
        productId: item.productId,
        quantity: item.quantity
      });
    }
    
    // Clear the source user's cart
    await this.clearCart(fromUserId);
    
    return true;
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = { 
      ...order, 
      id,
      status: order.status || 'processing',
      orderDate: order.orderDate || new Date(),
      trackingNumber: order.trackingNumber || null
    };
    
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    
    if (!order) {
      return undefined;
    }
    
    const updatedOrder = {
      ...order,
      status
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order Item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const newOrderItem: OrderItem = {
      ...orderItem,
      id
    };
    
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  // Article methods
  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.currentArticleId++;
    const now = new Date();
    const article: Article = { ...insertArticle, id, createdAt: now };
    this.articles.set(id, article);
    return article;
  }

  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.currentTestimonialId++;
    const testimonial: Testimonial = { ...insertTestimonial, id };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  // Lab test methods
  async getLabTests(): Promise<LabTest[]> {
    return Array.from(this.labTests.values());
  }

  async createLabTest(insertLabTest: InsertLabTest): Promise<LabTest> {
    const id = this.currentLabTestId++;
    const labTest: LabTest = { ...insertLabTest, id };
    this.labTests.set(id, labTest);
    return labTest;
  }

  // Health tip methods
  async getHealthTips(): Promise<HealthTip[]> {
    return Array.from(this.healthTips.values());
  }

  async getHealthTipById(id: number): Promise<HealthTip | undefined> {
    return this.healthTips.get(id);
  }

  async getRandomHealthTip(): Promise<HealthTip | undefined> {
    const healthTips = Array.from(this.healthTips.values());
    if (healthTips.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * healthTips.length);
    return healthTips[randomIndex];
  }

  async createHealthTip(insertHealthTip: InsertHealthTip): Promise<HealthTip> {
    const id = this.currentHealthTipId++;
    const now = new Date();
    const healthTip: HealthTip = { ...insertHealthTip, id, createdAt: now };
    this.healthTips.set(id, healthTip);
    return healthTip;
  }

  async updateHealthTip(id: number, updateHealthTip: Partial<InsertHealthTip>): Promise<HealthTip | undefined> {
    const healthTip = this.healthTips.get(id);
    if (!healthTip) return undefined;
    
    const updatedHealthTip = { ...healthTip, ...updateHealthTip };
    this.healthTips.set(id, updatedHealthTip);
    return updatedHealthTip;
  }

  async deleteHealthTip(id: number): Promise<boolean> {
    return this.healthTips.delete(id);
  }

  // Notification token methods
  async saveNotificationToken(insertToken: InsertNotificationToken): Promise<NotificationToken> {
    // Check if token already exists
    for (const [id, token] of this.notificationTokens.entries()) {
      if (token.token === insertToken.token) {
        // Update existing token
        const updatedToken = { ...token, ...insertToken };
        this.notificationTokens.set(id, updatedToken);
        return updatedToken;
      }
    }
    
    // Create new token
    const id = this.currentNotificationTokenId++;
    const now = new Date();
    const notificationToken: NotificationToken = { 
      ...insertToken, 
      id, 
      createdAt: now 
    };
    this.notificationTokens.set(id, notificationToken);
    return notificationToken;
  }

  async getNotificationTokensByUserId(userId: number): Promise<NotificationToken[]> {
    const tokens: NotificationToken[] = [];
    for (const token of this.notificationTokens.values()) {
      if (token.userId === userId) {
        tokens.push(token);
      }
    }
    return tokens;
  }

  async deleteNotificationToken(tokenValue: string): Promise<boolean> {
    for (const [id, token] of this.notificationTokens.entries()) {
      if (token.token === tokenValue) {
        return this.notificationTokens.delete(id);
      }
    }
    return false;
  }
}

export const storage = new MemStorage();
