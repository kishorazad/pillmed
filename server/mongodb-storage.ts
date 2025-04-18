import mongoose from 'mongoose';
import { IStorage, memStorage } from './storage';
import { 
  User, 
  Category, 
  Product, 
  CartItem, 
  Article,
  Testimonial,
  LabTest,
  Doctor,
  Pharmacy,
  Laboratory,
  Appointment,
  LabBooking,
  Order,
  OrderItem,
  HealthTip
} from './models';
import { 
  User as UserType,
  Category as CategoryType,
  Product as ProductType,
  CartItem as CartItemType,
  Article as ArticleType,
  Testimonial as TestimonialType,
  LabTest as LabTestType,
  Doctor as DoctorType,
  Pharmacy as PharmacyType,
  Laboratory as LaboratoryType,
  Appointment as AppointmentType,
  LabBooking as LabBookingType,
  Order as OrderType,
  OrderItem as OrderItemType,
  HealthTip as HealthTipType,
  InsertUser,
  InsertCategory,
  InsertProduct,
  InsertCartItem,
  InsertArticle,
  InsertTestimonial,
  InsertLabTest,
  InsertDoctor,
  InsertPharmacy,
  InsertLaboratory,
  InsertAppointment,
  InsertLabBooking,
  InsertOrder,
  InsertOrderItem,
  InsertHealthTip
} from '@shared/schema';
import { initializeDatabase } from './services/mongodb-service';

export class MongoDBStorage implements IStorage {
  
  constructor() {
    // Connect to MongoDB and initialize database
    this.initialize();
  }

  private async initialize() {
    try {
      await initializeDatabase();
    } catch (error) {
      console.log('Failed to initialize MongoDB database, using in-memory storage');
    }
  }

  // User methods
  async getUser(id: number): Promise<UserType | undefined> {
    try {
      // Try to find by _id field first (which could be MongoDB's ObjectId)
      let user = await User.findById(id).lean();
      
      // If not found, try to find a user where id field matches
      if (!user) {
        user = await User.findOne({ id }).lean();
      }
      
      return user ? this.convertToUserType(user) : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<UserType | undefined> {
    try {
      const user = await User.findOne({ username }).lean();
      return user ? this.convertToUserType(user) : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<UserType> {
    try {
      const newUser = new User(user);
      const savedUser = await newUser.save();
      return this.convertToUserType(savedUser.toObject());
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUsersByRole(role: string): Promise<UserType[]> {
    try {
      const users = await User.find({ role }).lean();
      return users.map(user => this.convertToUserType(user));
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<UserType | undefined> {
    try {
      const updatedUser = await User.findByIdAndUpdate(id, user, { new: true }).lean();
      return updatedUser ? this.convertToUserType(updatedUser) : undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  // Product methods
  async getProducts(): Promise<ProductType[]> {
    try {
      const products = await Product.find().lean();
      return products.map(product => this.convertToProductType(product));
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async getProductById(id: number): Promise<ProductType | undefined> {
    try {
      const product = await Product.findById(id).lean();
      return product ? this.convertToProductType(product) : undefined;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return undefined;
    }
  }

  async getProductsByCategory(categoryId: number): Promise<ProductType[]> {
    try {
      const products = await Product.find({ categoryId }).lean();
      return products.map(product => this.convertToProductType(product));
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  }

  async getFeaturedProducts(): Promise<ProductType[]> {
    try {
      const products = await Product.find({ isFeatured: true }).lean();
      return products.map(product => this.convertToProductType(product));
    } catch (error) {
      console.error('Error getting featured products:', error);
      return [];
    }
  }

  async createProduct(product: InsertProduct): Promise<ProductType> {
    try {
      const newProduct = new Product(product);
      const savedProduct = await newProduct.save();
      return this.convertToProductType(savedProduct.toObject());
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<ProductType | undefined> {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true }).lean();
      return updatedProduct ? this.convertToProductType(updatedProduct) : undefined;
    } catch (error) {
      console.error('Error updating product:', error);
      return undefined;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const result = await Product.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // Category methods
  async getCategories(): Promise<CategoryType[]> {
    try {
      const categories = await Category.find().lean();
      return categories.map(category => this.convertToCategoryType(category));
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async getCategoryById(id: number): Promise<CategoryType | undefined> {
    try {
      const category = await Category.findById(id).lean();
      return category ? this.convertToCategoryType(category) : undefined;
    } catch (error) {
      console.error('Error getting category by ID:', error);
      return undefined;
    }
  }

  async createCategory(category: InsertCategory): Promise<CategoryType> {
    try {
      const newCategory = new Category(category);
      const savedCategory = await newCategory.save();
      return this.convertToCategoryType(savedCategory.toObject());
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<CategoryType | undefined> {
    try {
      const updatedCategory = await Category.findByIdAndUpdate(id, category, { new: true }).lean();
      return updatedCategory ? this.convertToCategoryType(updatedCategory) : undefined;
    } catch (error) {
      console.error('Error updating category:', error);
      return undefined;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const result = await Category.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItemType[]> {
    try {
      const cartItems = await CartItem.find({ userId }).lean();
      return cartItems.map(item => this.convertToCartItemType(item));
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  }

  async getCartItemWithProductDetails(userId: number): Promise<any[]> {
    try {
      const cartItems = await CartItem.find({ userId }).lean();
      return Promise.all(cartItems.map(async (item) => {
        const product = await Product.findById(item.productId).lean();
        return {
          ...this.convertToCartItemType(item),
          product: product ? this.convertToProductType(product) : null
        };
      }));
    } catch (error) {
      console.error('Error getting cart items with product details:', error);
      return [];
    }
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItemType> {
    try {
      // Check if this product is already in the cart
      const existingItem = await CartItem.findOne({
        userId: cartItem.userId,
        productId: cartItem.productId
      }).lean();

      if (existingItem) {
        // Update the quantity instead of adding a new item
        const updatedItem = await CartItem.findByIdAndUpdate(
          existingItem._id,
          { $inc: { quantity: cartItem.quantity } },
          { new: true }
        ).lean();
        return this.convertToCartItemType(updatedItem);
      }

      // Add new item to cart
      const newCartItem = new CartItem(cartItem);
      const savedCartItem = await newCartItem.save();
      return this.convertToCartItemType(savedCartItem.toObject());
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItemType | undefined> {
    try {
      const updatedCartItem = await CartItem.findByIdAndUpdate(
        id,
        { quantity },
        { new: true }
      ).lean();
      return updatedCartItem ? this.convertToCartItemType(updatedCartItem) : undefined;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return undefined;
    }
  }

  async removeFromCart(id: number): Promise<boolean> {
    try {
      const result = await CartItem.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  async clearCart(userId: number): Promise<boolean> {
    try {
      const result = await CartItem.deleteMany({ userId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  // Article methods
  async getArticles(): Promise<ArticleType[]> {
    try {
      const articles = await Article.find().lean();
      return articles.map(article => this.convertToArticleType(article));
    } catch (error) {
      console.error('Error getting articles:', error);
      return [];
    }
  }

  async createArticle(article: InsertArticle): Promise<ArticleType> {
    try {
      const newArticle = new Article(article);
      const savedArticle = await newArticle.save();
      return this.convertToArticleType(savedArticle.toObject());
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<ArticleType | undefined> {
    try {
      const updatedArticle = await Article.findByIdAndUpdate(id, article, { new: true }).lean();
      return updatedArticle ? this.convertToArticleType(updatedArticle) : undefined;
    } catch (error) {
      console.error('Error updating article:', error);
      return undefined;
    }
  }

  async deleteArticle(id: number): Promise<boolean> {
    try {
      const result = await Article.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting article:', error);
      return false;
    }
  }

  // Testimonial methods
  async getTestimonials(): Promise<TestimonialType[]> {
    try {
      const testimonials = await Testimonial.find().lean();
      return testimonials.map(testimonial => this.convertToTestimonialType(testimonial));
    } catch (error) {
      console.error('Error getting testimonials:', error);
      return [];
    }
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<TestimonialType> {
    try {
      const newTestimonial = new Testimonial(testimonial);
      const savedTestimonial = await newTestimonial.save();
      return this.convertToTestimonialType(savedTestimonial.toObject());
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  // Lab test methods
  async getLabTests(): Promise<LabTestType[]> {
    try {
      const labTests = await LabTest.find().lean();
      return labTests.map(labTest => this.convertToLabTestType(labTest));
    } catch (error) {
      console.error('Error getting lab tests:', error);
      return [];
    }
  }

  async createLabTest(labTest: InsertLabTest): Promise<LabTestType> {
    try {
      const newLabTest = new LabTest(labTest);
      const savedLabTest = await newLabTest.save();
      return this.convertToLabTestType(savedLabTest.toObject());
    } catch (error) {
      console.error('Error creating lab test:', error);
      throw error;
    }
  }

  async updateLabTest(id: number, labTest: Partial<InsertLabTest>): Promise<LabTestType | undefined> {
    try {
      const updatedLabTest = await LabTest.findByIdAndUpdate(id, labTest, { new: true }).lean();
      return updatedLabTest ? this.convertToLabTestType(updatedLabTest) : undefined;
    } catch (error) {
      console.error('Error updating lab test:', error);
      return undefined;
    }
  }

  async deleteLabTest(id: number): Promise<boolean> {
    try {
      const result = await LabTest.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting lab test:', error);
      return false;
    }
  }

  // Doctor methods
  async getDoctors(): Promise<DoctorType[]> {
    try {
      const doctors = await Doctor.find().lean();
      return doctors.map(doctor => this.convertToDoctorType(doctor));
    } catch (error) {
      console.error('Error getting doctors:', error);
      return [];
    }
  }

  async getDoctorById(id: number): Promise<DoctorType | undefined> {
    try {
      const doctor = await Doctor.findById(id).lean();
      return doctor ? this.convertToDoctorType(doctor) : undefined;
    } catch (error) {
      console.error('Error getting doctor by ID:', error);
      return undefined;
    }
  }

  async getDoctorWithUserDetails(id: number): Promise<any | undefined> {
    try {
      const doctor = await Doctor.findById(id).lean();
      if (!doctor) return undefined;
      
      const user = await User.findById(doctor.userId).lean();
      return {
        ...this.convertToDoctorType(doctor),
        user: user ? this.convertToUserType(user) : null
      };
    } catch (error) {
      console.error('Error getting doctor with user details:', error);
      return undefined;
    }
  }

  async getAllDoctorsWithUserDetails(): Promise<any[]> {
    try {
      const doctors = await Doctor.find().lean();
      return Promise.all(doctors.map(async (doctor) => {
        const user = await User.findById(doctor.userId).lean();
        return {
          ...this.convertToDoctorType(doctor),
          user: user ? this.convertToUserType(user) : null
        };
      }));
    } catch (error) {
      console.error('Error getting all doctors with user details:', error);
      return [];
    }
  }

  async createDoctor(doctor: InsertDoctor): Promise<DoctorType> {
    try {
      const newDoctor = new Doctor(doctor);
      const savedDoctor = await newDoctor.save();
      return this.convertToDoctorType(savedDoctor.toObject());
    } catch (error) {
      console.error('Error creating doctor:', error);
      throw error;
    }
  }

  async updateDoctor(id: number, doctor: Partial<InsertDoctor>): Promise<DoctorType | undefined> {
    try {
      const updatedDoctor = await Doctor.findByIdAndUpdate(id, doctor, { new: true }).lean();
      return updatedDoctor ? this.convertToDoctorType(updatedDoctor) : undefined;
    } catch (error) {
      console.error('Error updating doctor:', error);
      return undefined;
    }
  }

  // Pharmacy methods
  async getPharmacies(): Promise<PharmacyType[]> {
    try {
      const pharmacies = await Pharmacy.find().lean();
      return pharmacies.map(pharmacy => this.convertToPharmacyType(pharmacy));
    } catch (error) {
      console.error('Error getting pharmacies:', error);
      return [];
    }
  }

  async getPharmacyById(id: number): Promise<PharmacyType | undefined> {
    try {
      const pharmacy = await Pharmacy.findById(id).lean();
      return pharmacy ? this.convertToPharmacyType(pharmacy) : undefined;
    } catch (error) {
      console.error('Error getting pharmacy by ID:', error);
      return undefined;
    }
  }

  async getPharmacyWithUserDetails(id: number): Promise<any | undefined> {
    try {
      const pharmacy = await Pharmacy.findById(id).lean();
      if (!pharmacy) return undefined;
      
      const user = await User.findById(pharmacy.userId).lean();
      return {
        ...this.convertToPharmacyType(pharmacy),
        user: user ? this.convertToUserType(user) : null
      };
    } catch (error) {
      console.error('Error getting pharmacy with user details:', error);
      return undefined;
    }
  }

  async getAllPharmaciesWithUserDetails(): Promise<any[]> {
    try {
      const pharmacies = await Pharmacy.find().lean();
      return Promise.all(pharmacies.map(async (pharmacy) => {
        const user = await User.findById(pharmacy.userId).lean();
        return {
          ...this.convertToPharmacyType(pharmacy),
          user: user ? this.convertToUserType(user) : null
        };
      }));
    } catch (error) {
      console.error('Error getting all pharmacies with user details:', error);
      return [];
    }
  }

  async createPharmacy(pharmacy: InsertPharmacy): Promise<PharmacyType> {
    try {
      const newPharmacy = new Pharmacy(pharmacy);
      const savedPharmacy = await newPharmacy.save();
      return this.convertToPharmacyType(savedPharmacy.toObject());
    } catch (error) {
      console.error('Error creating pharmacy:', error);
      throw error;
    }
  }

  async updatePharmacy(id: number, pharmacy: Partial<InsertPharmacy>): Promise<PharmacyType | undefined> {
    try {
      const updatedPharmacy = await Pharmacy.findByIdAndUpdate(id, pharmacy, { new: true }).lean();
      return updatedPharmacy ? this.convertToPharmacyType(updatedPharmacy) : undefined;
    } catch (error) {
      console.error('Error updating pharmacy:', error);
      return undefined;
    }
  }

  // Laboratory methods
  async getLaboratories(): Promise<LaboratoryType[]> {
    try {
      const laboratories = await Laboratory.find().lean();
      return laboratories.map(laboratory => this.convertToLaboratoryType(laboratory));
    } catch (error) {
      console.error('Error getting laboratories:', error);
      return [];
    }
  }

  async getLaboratoryById(id: number): Promise<LaboratoryType | undefined> {
    try {
      const laboratory = await Laboratory.findById(id).lean();
      return laboratory ? this.convertToLaboratoryType(laboratory) : undefined;
    } catch (error) {
      console.error('Error getting laboratory by ID:', error);
      return undefined;
    }
  }

  async getLaboratoryWithUserDetails(id: number): Promise<any | undefined> {
    try {
      const laboratory = await Laboratory.findById(id).lean();
      if (!laboratory) return undefined;
      
      const user = await User.findById(laboratory.userId).lean();
      return {
        ...this.convertToLaboratoryType(laboratory),
        user: user ? this.convertToUserType(user) : null
      };
    } catch (error) {
      console.error('Error getting laboratory with user details:', error);
      return undefined;
    }
  }

  async getAllLaboratoriesWithUserDetails(): Promise<any[]> {
    try {
      const laboratories = await Laboratory.find().lean();
      return Promise.all(laboratories.map(async (laboratory) => {
        const user = await User.findById(laboratory.userId).lean();
        return {
          ...this.convertToLaboratoryType(laboratory),
          user: user ? this.convertToUserType(user) : null
        };
      }));
    } catch (error) {
      console.error('Error getting all laboratories with user details:', error);
      return [];
    }
  }

  async createLaboratory(laboratory: InsertLaboratory): Promise<LaboratoryType> {
    try {
      const newLaboratory = new Laboratory(laboratory);
      const savedLaboratory = await newLaboratory.save();
      return this.convertToLaboratoryType(savedLaboratory.toObject());
    } catch (error) {
      console.error('Error creating laboratory:', error);
      throw error;
    }
  }

  async updateLaboratory(id: number, laboratory: Partial<InsertLaboratory>): Promise<LaboratoryType | undefined> {
    try {
      const updatedLaboratory = await Laboratory.findByIdAndUpdate(id, laboratory, { new: true }).lean();
      return updatedLaboratory ? this.convertToLaboratoryType(updatedLaboratory) : undefined;
    } catch (error) {
      console.error('Error updating laboratory:', error);
      return undefined;
    }
  }

  // Appointment methods
  async getAppointments(): Promise<AppointmentType[]> {
    try {
      const appointments = await Appointment.find().lean();
      return appointments.map(appointment => this.convertToAppointmentType(appointment));
    } catch (error) {
      console.error('Error getting appointments:', error);
      return [];
    }
  }

  async getAppointmentById(id: number): Promise<AppointmentType | undefined> {
    try {
      const appointment = await Appointment.findById(id).lean();
      return appointment ? this.convertToAppointmentType(appointment) : undefined;
    } catch (error) {
      console.error('Error getting appointment by ID:', error);
      return undefined;
    }
  }

  async getAppointmentsByUser(userId: number): Promise<AppointmentType[]> {
    try {
      const appointments = await Appointment.find({ userId }).lean();
      return appointments.map(appointment => this.convertToAppointmentType(appointment));
    } catch (error) {
      console.error('Error getting appointments by user:', error);
      return [];
    }
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<AppointmentType[]> {
    try {
      const appointments = await Appointment.find({ doctorId }).lean();
      return appointments.map(appointment => this.convertToAppointmentType(appointment));
    } catch (error) {
      console.error('Error getting appointments by doctor:', error);
      return [];
    }
  }

  async createAppointment(appointment: InsertAppointment): Promise<AppointmentType> {
    try {
      const newAppointment = new Appointment(appointment);
      const savedAppointment = await newAppointment.save();
      return this.convertToAppointmentType(savedAppointment.toObject());
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointmentStatus(id: number, status: string): Promise<AppointmentType | undefined> {
    try {
      const updatedAppointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true }).lean();
      return updatedAppointment ? this.convertToAppointmentType(updatedAppointment) : undefined;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return undefined;
    }
  }

  // Lab Booking methods
  async getLabBookings(): Promise<LabBookingType[]> {
    try {
      const labBookings = await LabBooking.find().lean();
      return labBookings.map(labBooking => this.convertToLabBookingType(labBooking));
    } catch (error) {
      console.error('Error getting lab bookings:', error);
      return [];
    }
  }

  async getLabBookingById(id: number): Promise<LabBookingType | undefined> {
    try {
      const labBooking = await LabBooking.findById(id).lean();
      return labBooking ? this.convertToLabBookingType(labBooking) : undefined;
    } catch (error) {
      console.error('Error getting lab booking by ID:', error);
      return undefined;
    }
  }

  async getLabBookingsByUser(userId: number): Promise<LabBookingType[]> {
    try {
      const labBookings = await LabBooking.find({ userId }).lean();
      return labBookings.map(labBooking => this.convertToLabBookingType(labBooking));
    } catch (error) {
      console.error('Error getting lab bookings by user:', error);
      return [];
    }
  }

  async getLabBookingsByLaboratory(laboratoryId: number): Promise<LabBookingType[]> {
    try {
      const labBookings = await LabBooking.find({ laboratoryId }).lean();
      return labBookings.map(labBooking => this.convertToLabBookingType(labBooking));
    } catch (error) {
      console.error('Error getting lab bookings by laboratory:', error);
      return [];
    }
  }

  async createLabBooking(labBooking: InsertLabBooking): Promise<LabBookingType> {
    try {
      const newLabBooking = new LabBooking(labBooking);
      const savedLabBooking = await newLabBooking.save();
      return this.convertToLabBookingType(savedLabBooking.toObject());
    } catch (error) {
      console.error('Error creating lab booking:', error);
      throw error;
    }
  }

  async updateLabBookingStatus(id: number, status: string): Promise<LabBookingType | undefined> {
    try {
      const updatedLabBooking = await LabBooking.findByIdAndUpdate(id, { status }, { new: true }).lean();
      return updatedLabBooking ? this.convertToLabBookingType(updatedLabBooking) : undefined;
    } catch (error) {
      console.error('Error updating lab booking status:', error);
      return undefined;
    }
  }

  // Order methods
  async getOrders(): Promise<OrderType[]> {
    try {
      const orders = await Order.find().lean();
      return orders.map(order => this.convertToOrderType(order));
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  async getOrderById(id: number): Promise<OrderType | undefined> {
    try {
      const order = await Order.findById(id).lean();
      return order ? this.convertToOrderType(order) : undefined;
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return undefined;
    }
  }

  async getOrdersByUser(userId: number): Promise<OrderType[]> {
    try {
      const orders = await Order.find({ userId }).lean();
      return orders.map(order => this.convertToOrderType(order));
    } catch (error) {
      console.error('Error getting orders by user:', error);
      return [];
    }
  }

  async createOrder(order: InsertOrder): Promise<OrderType> {
    try {
      const newOrder = new Order(order);
      const savedOrder = await newOrder.save();
      return this.convertToOrderType(savedOrder.toObject());
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<OrderType | undefined> {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true }).lean();
      return updatedOrder ? this.convertToOrderType(updatedOrder) : undefined;
    } catch (error) {
      console.error('Error updating order status:', error);
      return undefined;
    }
  }

  // Order Item methods
  async getOrderItems(orderId: number): Promise<OrderItemType[]> {
    try {
      const orderItems = await OrderItem.find({ orderId }).lean();
      return orderItems.map(orderItem => this.convertToOrderItemType(orderItem));
    } catch (error) {
      console.error('Error getting order items:', error);
      return [];
    }
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItemType> {
    try {
      const newOrderItem = new OrderItem(orderItem);
      const savedOrderItem = await newOrderItem.save();
      return this.convertToOrderItemType(savedOrderItem.toObject());
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }

  // Health Tips methods
  async getHealthTips(): Promise<HealthTipType[]> {
    try {
      const healthTips = await HealthTip.find().lean();
      return healthTips.map(healthTip => this.convertToHealthTipType(healthTip));
    } catch (error) {
      console.error('Error getting health tips:', error);
      return [];
    }
  }

  async getHealthTipById(id: number): Promise<HealthTipType | undefined> {
    try {
      const healthTip = await HealthTip.findById(id).lean();
      return healthTip ? this.convertToHealthTipType(healthTip) : undefined;
    } catch (error) {
      console.error('Error getting health tip by ID:', error);
      return undefined;
    }
  }

  async getRandomHealthTip(): Promise<HealthTipType | undefined> {
    try {
      const count = await HealthTip.countDocuments();
      if (count === 0) return undefined;
      
      const random = Math.floor(Math.random() * count);
      const healthTip = await HealthTip.findOne().skip(random).lean();
      return healthTip ? this.convertToHealthTipType(healthTip) : undefined;
    } catch (error) {
      console.error('Error getting random health tip:', error);
      return undefined;
    }
  }

  async createHealthTip(healthTip: InsertHealthTip): Promise<HealthTipType> {
    try {
      const newHealthTip = new HealthTip(healthTip);
      const savedHealthTip = await newHealthTip.save();
      return this.convertToHealthTipType(savedHealthTip.toObject());
    } catch (error) {
      console.error('Error creating health tip:', error);
      throw error;
    }
  }

  async updateHealthTip(id: number, healthTip: Partial<InsertHealthTip>): Promise<HealthTipType | undefined> {
    try {
      const updatedHealthTip = await HealthTip.findByIdAndUpdate(id, healthTip, { new: true }).lean();
      return updatedHealthTip ? this.convertToHealthTipType(updatedHealthTip) : undefined;
    } catch (error) {
      console.error('Error updating health tip:', error);
      return undefined;
    }
  }

  async deleteHealthTip(id: number): Promise<boolean> {
    try {
      const result = await HealthTip.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting health tip:', error);
      return false;
    }
  }

  // Helper methods to convert MongoDB documents to our schema types
  private convertToUserType(user: any): UserType {
    // Make sure MongoDB documents are properly converted
    if (!user) return null;
    
    // Handle case where user document might not have proper _id
    const id = user._id ? 
              (typeof user._id === 'object' ? user._id.toString() : user._id) : 
              (user.id ? user.id : null);
              
    if (!id) {
      console.warn('Warning: User document missing both _id and id fields');
    }
    
    return {
      id: id,
      username: user.username,
      email: user.email,
      password: user.password,
      name: user.name,
      phone: user.phone || null,
      address: user.address || null,
      pincode: user.pincode || null,
      role: user.role || 'customer',
      profileImageUrl: user.profileImageUrl || null
    };
  }

  private convertToProductType(product: any): ProductType {
    if (!product) return null;
    
    // Handle MongoDB ObjectId conversion safely
    const id = product._id ? 
              (typeof product._id === 'object' ? product._id.toString() : product._id) : 
              (product.id ? product.id : null);
              
    // Handle categoryId which might be ObjectId or Number
    const categoryId = product.categoryId ? 
                     (typeof product.categoryId === 'object' ? product.categoryId.toString() : product.categoryId) : 
                     null;
    
    if (!id) {
      console.warn('Warning: Product document missing both _id and id fields');
    }
    
    return {
      id: id,
      name: product.name,
      description: product.description || null,
      price: product.price,
      discountedPrice: product.discountedPrice || null,
      imageUrl: product.imageUrl || null,
      categoryId: categoryId,
      brand: product.brand || null,
      inStock: product.inStock !== undefined ? product.inStock : true,
      quantity: product.quantity,
      rating: product.rating || null,
      ratingCount: product.ratingCount || null,
      isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
      // Include medicine-specific fields
      composition: product.composition || null,
      uses: product.uses || null,
      sideEffects: product.sideEffects || null,
      contraindications: product.contraindications || null,
      manufacturer: product.manufacturer || null,
      packSize: product.packSize || null
    };
  }

  private convertToCategoryType(category: any): CategoryType {
    return {
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl
    };
  }

  private convertToCartItemType(cartItem: any): CartItemType {
    return {
      id: cartItem._id.toString(),
      userId: cartItem.userId.toString(),
      productId: cartItem.productId.toString(),
      quantity: cartItem.quantity
    };
  }

  private convertToArticleType(article: any): ArticleType {
    return {
      id: article._id.toString(),
      title: article.title,
      content: article.content,
      imageUrl: article.imageUrl,
      createdAt: article.createdAt
    };
  }

  private convertToTestimonialType(testimonial: any): TestimonialType {
    return {
      id: testimonial._id.toString(),
      name: testimonial.name,
      content: testimonial.content,
      rating: testimonial.rating,
      initials: testimonial.initials
    };
  }

  private convertToLabTestType(labTest: any): LabTestType {
    return {
      id: labTest._id.toString(),
      name: labTest.name,
      description: labTest.description,
      price: labTest.price,
      discountedPrice: labTest.discountedPrice,
      testCount: labTest.testCount
    };
  }

  private convertToDoctorType(doctor: any): DoctorType {
    return {
      id: doctor._id.toString(),
      userId: doctor.userId.toString(),
      specialization: doctor.specialization,
      experience: doctor.experience,
      qualification: doctor.qualification,
      bio: doctor.bio,
      availableDays: doctor.availableDays,
      availableTimeStart: doctor.availableTimeStart,
      availableTimeEnd: doctor.availableTimeEnd,
      consultationFee: doctor.consultationFee,
      rating: doctor.rating,
      ratingCount: doctor.ratingCount,
      isAvailable: doctor.isAvailable
    };
  }

  private convertToPharmacyType(pharmacy: any): PharmacyType {
    return {
      id: pharmacy._id.toString(),
      userId: pharmacy.userId.toString(),
      license: pharmacy.license,
      address: pharmacy.address,
      city: pharmacy.city,
      state: pharmacy.state,
      pincode: pharmacy.pincode,
      phone: pharmacy.phone,
      openingTime: pharmacy.openingTime,
      closingTime: pharmacy.closingTime,
      isOpen: pharmacy.isOpen,
      rating: pharmacy.rating,
      ratingCount: pharmacy.ratingCount
    };
  }

  private convertToLaboratoryType(laboratory: any): LaboratoryType {
    return {
      id: laboratory._id.toString(),
      userId: laboratory.userId.toString(),
      license: laboratory.license,
      address: laboratory.address,
      city: laboratory.city,
      state: laboratory.state,
      pincode: laboratory.pincode,
      phone: laboratory.phone,
      openingTime: laboratory.openingTime,
      closingTime: laboratory.closingTime,
      isOpen: laboratory.isOpen,
      rating: laboratory.rating,
      ratingCount: laboratory.ratingCount
    };
  }

  private convertToAppointmentType(appointment: any): AppointmentType {
    return {
      id: appointment._id.toString(),
      userId: appointment.userId.toString(),
      doctorId: appointment.doctorId.toString(),
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
      symptoms: appointment.symptoms,
      notes: appointment.notes,
      prescriptionUrl: appointment.prescriptionUrl,
      createdAt: appointment.createdAt
    };
  }

  private convertToLabBookingType(labBooking: any): LabBookingType {
    return {
      id: labBooking._id.toString(),
      userId: labBooking.userId.toString(),
      laboratoryId: labBooking.laboratoryId.toString(),
      labTestId: labBooking.labTestId.toString(),
      bookingDate: labBooking.bookingDate,
      bookingTime: labBooking.bookingTime,
      status: labBooking.status,
      notes: labBooking.notes,
      reportUrl: labBooking.reportUrl,
      createdAt: labBooking.createdAt
    };
  }

  private convertToOrderType(order: any): OrderType {
    return {
      id: order._id.toString(),
      userId: order.userId.toString(),
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt
    };
  }

  private convertToOrderItemType(orderItem: any): OrderItemType {
    return {
      id: orderItem._id.toString(),
      orderId: orderItem.orderId.toString(),
      productId: orderItem.productId.toString(),
      quantity: orderItem.quantity,
      price: orderItem.price
    };
  }

  private convertToHealthTipType(healthTip: any): HealthTipType {
    return {
      id: healthTip._id.toString(),
      title: healthTip.title,
      content: healthTip.content,
      category: healthTip.category,
      imageUrl: healthTip.imageUrl,
      createdAt: healthTip.createdAt
    };
  }
}

export const mongoDBStorage = new MongoDBStorage();