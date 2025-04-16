import mongoose from 'mongoose';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/medadock');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, default: null },
  address: { type: String, default: null },
  pincode: { type: String, default: null },
  role: { type: String, default: 'customer' },
  profileImageUrl: { type: String, default: null }
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: null },
  imageUrl: { type: String, default: null }
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: null },
  price: { type: Number, required: true },
  discountedPrice: { type: Number, default: null },
  imageUrl: { type: String, default: null },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, default: null },
  inStock: { type: Boolean, default: true },
  quantity: { type: String, required: true },
  rating: { type: Number, default: null },
  ratingCount: { type: Number, default: null },
  isFeatured: { type: Boolean, default: false },
  // Additional fields from CSV
  productId: { type: String, default: null },
  saltComposition: { type: String, default: null },
  medicineType: { type: String, default: null },
  introduction: { type: String, default: null },
  benefits: { type: String, default: null },
  howToUse: { type: String, default: null },
  safetyAdvice: { type: String, default: null },
  ifMiss: { type: String, default: null },
  packageDetail: { type: String, default: null },
  mrp: { type: Number, default: null },
  prescriptionRequired: { type: Boolean, default: false },
  primaryUse: { type: String, default: null },
  storage: { type: String, default: null },
  commonSideEffect: { type: String, default: null },
  alcoholInteraction: { type: String, default: null },
  pregnancyInteraction: { type: String, default: null },
  lactationInteraction: { type: String, default: null },
  manufacturerAddress: { type: String, default: null },
  countryOfOrigin: { type: String, default: null }
});

// CartItem Schema
const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 }
});

// Article Schema
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Testimonial Schema
const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, required: true },
  initials: { type: String, default: null }
});

// LabTest Schema
const labTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: null },
  price: { type: Number, required: true },
  discountedPrice: { type: Number, default: null },
  testCount: { type: Number, default: null }
});

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String, required: true },
  experience: { type: Number, default: 0 },
  qualification: { type: String, required: true },
  bio: { type: String, default: null },
  availableDays: { type: [String], default: [] },
  availableTimeStart: { type: String, default: null },
  availableTimeEnd: { type: String, default: null },
  consultationFee: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true }
});

// Pharmacy Schema
const pharmacySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  license: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true },
  openingTime: { type: String, default: null },
  closingTime: { type: String, default: null },
  isOpen: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
});

// Laboratory Schema
const laboratorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  license: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true },
  openingTime: { type: String, default: null },
  closingTime: { type: String, default: null },
  isOpen: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
});

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  status: { type: String, default: 'pending' },
  symptoms: { type: String, default: null },
  notes: { type: String, default: null },
  prescriptionUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// LabBooking Schema
const labBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  laboratoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Laboratory', required: true },
  labTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest', required: true },
  bookingDate: { type: Date, required: true },
  bookingTime: { type: String, required: true },
  status: { type: String, default: 'pending' },
  notes: { type: String, default: null },
  reportUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  shippingAddress: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// OrderItem Schema
const orderItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

// HealthTip Schema
const healthTipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: null },
  imageUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);
const CartItem = mongoose.model('CartItem', cartItemSchema);
const Article = mongoose.model('Article', articleSchema);
const Testimonial = mongoose.model('Testimonial', testimonialSchema);
const LabTest = mongoose.model('LabTest', labTestSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);
const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
const Laboratory = mongoose.model('Laboratory', laboratorySchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const LabBooking = mongoose.model('LabBooking', labBookingSchema);
const Order = mongoose.model('Order', orderSchema);
const OrderItem = mongoose.model('OrderItem', orderItemSchema);
const HealthTip = mongoose.model('HealthTip', healthTipSchema);

export {
  connectDB,
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
};