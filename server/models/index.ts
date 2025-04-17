import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: null },
  address: { type: String, default: null },
  pincode: { type: String, default: null },
  role: { type: String, default: 'customer' },
  profileImageUrl: { type: String, default: null }
}, { timestamps: true });

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, default: null },
  description: { type: String, default: null },
  price: { type: Number, required: true },
  discountedPrice: { type: Number, default: null },
  imageUrl: { type: String, default: null },
  categoryId: { type: Number, required: true },
  inStock: { type: Boolean, default: true },
  quantity: { type: String, required: true },
  rating: { type: Number, default: null },
  ratingCount: { type: Number, default: null },
  isFeatured: { type: Boolean, default: false },
  // Additional fields for medicines
  composition: { type: String, default: null },
  uses: { type: String, default: null },
  sideEffects: { type: String, default: null },
  contraindications: { type: String, default: null },
  manufacturer: { type: String, default: null },
  packSize: { type: String, default: null }
}, { timestamps: true });

// Add text index for fast search
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  brand: 'text', 
  composition: 'text',
  manufacturer: 'text'
}, {
  weights: {
    name: 10,
    brand: 5,
    composition: 3,
    description: 1
  }
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: null },
  imageUrl: { type: String, default: null },
}, { timestamps: true });

// Cart Item Schema
const cartItemSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  productId: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
}, { timestamps: true });

// Article Schema
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Testimonial Schema
const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  content: { type: String, required: true },
  initials: { type: String, default: null },
});

// Lab Test Schema
const labTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: null },
  price: { type: Number, required: true },
  discountedPrice: { type: Number, default: null },
  testCount: { type: Number, default: null },
});

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  qualification: { type: String, required: true },
  about: { type: String, default: null },
  consultationFee: { type: Number, required: true },
  availableDays: { type: String, required: true },
  availableTimeStart: { type: String, required: true },
  availableTimeEnd: { type: String, required: true },
  rating: { type: Number, default: null },
  ratingCount: { type: Number, default: null },
  isVerified: { type: Boolean, default: false },
});

// Pharmacy Schema
const pharmacySchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  licenseNumber: { type: String, required: true },
  establishmentYear: { type: Number, default: null },
  operatingHours: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
});

// Laboratory Schema
const laboratorySchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  licenseNumber: { type: String, required: true },
  establishmentYear: { type: Number, default: null },
  operatingHours: { type: String, default: null },
  facilities: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
});

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  doctorId: { type: Number, required: true },
  appointmentDate: { type: Date, required: true },
  symptoms: { type: String, default: null },
  notes: { type: String, default: null },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

// Lab Booking Schema
const labBookingSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  labTestId: { type: Number, required: true },
  laboratoryId: { type: Number, default: null },
  bookingDate: { type: Date, required: true },
  patientName: { type: String, required: true },
  patientAge: { type: Number, required: true },
  patientGender: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: 'pending' },
  trackingNumber: { type: String, default: null },
});

// Order Item Schema
const orderItemSchema = new mongoose.Schema({
  orderId: { type: Number, required: true },
  productId: { type: Number, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

// Health Tip Schema
const healthTipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String, default: null },
  category: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Pincode Schema
const pincodeSchema = new mongoose.Schema({
  pincode: { type: String, required: true, unique: true },
  officename: { type: String, required: true },
  divisionname: { type: String, default: null },
  regionname: { type: String, default: null },
  circlename: { type: String, default: null },
  district: { type: String, default: null },
  statename: { type: String, default: null },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  delivery: { type: String, default: 'Delivery' },
});

// Create and export models
export const User = mongoose.model('User', userSchema);
export const Product = mongoose.model('Product', productSchema);
export const Category = mongoose.model('Category', categorySchema);
export const CartItem = mongoose.model('CartItem', cartItemSchema);
export const Article = mongoose.model('Article', articleSchema);
export const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export const LabTest = mongoose.model('LabTest', labTestSchema);
export const Doctor = mongoose.model('Doctor', doctorSchema);
export const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
export const Laboratory = mongoose.model('Laboratory', laboratorySchema);
export const Appointment = mongoose.model('Appointment', appointmentSchema);
export const LabBooking = mongoose.model('LabBooking', labBookingSchema);
export const Order = mongoose.model('Order', orderSchema);
export const OrderItem = mongoose.model('OrderItem', orderItemSchema);
export const HealthTip = mongoose.model('HealthTip', healthTipSchema);
export const Pincode = mongoose.model('Pincode', pincodeSchema);