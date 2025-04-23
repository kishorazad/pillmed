import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  pincode: text("pincode"),
  city: text("city"),
  state: text("state"),
  role: text("role").default("customer"), // customer, admin, pharmacy, doctor, laboratory
  status: text("status").default("active"), // active, pending, suspended
  profileImageUrl: text("profile_image_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  pincode: true,
  city: true,
  state: true,
  role: true,
  status: true,
  profileImageUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Table for notification tokens (FCM)
export const notificationTokens = pgTable("notification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  deviceInfo: text("device_info"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertNotificationTokenSchema = createInsertSchema(notificationTokens).pick({
  userId: true,
  token: true,
  deviceInfo: true
});

export type InsertNotificationToken = z.infer<typeof insertNotificationTokenSchema>;
export type NotificationToken = typeof notificationTokens.$inferSelect;

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).pick({
  userId: true,
  token: true,
  expiresAt: true
});

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  imageUrl: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  discountedPrice: doublePrecision("discounted_price"),
  imageUrl: text("image_url"),
  categoryId: integer("category_id").notNull(),
  brand: text("brand"),
  inStock: boolean("in_stock").default(true),
  quantity: text("quantity").notNull(),
  rating: doublePrecision("rating"),
  ratingCount: integer("rating_count"),
  isFeatured: boolean("is_featured").default(false),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  discountedPrice: true,
  imageUrl: true,
  categoryId: true,
  brand: true,
  inStock: true,
  quantity: true,
  rating: true,
  ratingCount: true,
  isFeatured: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true,
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles).pick({
  title: true,
  content: true,
  imageUrl: true,
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  initials: text("initials"),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).pick({
  name: true,
  content: true,
  rating: true,
  initials: true,
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

export const labTests = pgTable("lab_tests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  discountedPrice: doublePrecision("discounted_price"),
  testCount: integer("test_count"),
});

export const insertLabTestSchema = createInsertSchema(labTests).pick({
  name: true,
  description: true,
  price: true,
  discountedPrice: true,
  testCount: true,
});

export type InsertLabTest = z.infer<typeof insertLabTestSchema>;
export type LabTest = typeof labTests.$inferSelect;

// Doctor related schemas
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  specialization: text("specialization").notNull(),
  experience: integer("experience").notNull(),
  qualification: text("qualification").notNull(),
  about: text("about"),
  consultationFee: doublePrecision("consultation_fee").notNull(),
  availableDays: text("available_days").notNull(),
  availableTimeStart: text("available_time_start").notNull(),
  availableTimeEnd: text("available_time_end").notNull(),
  rating: doublePrecision("rating"),
  ratingCount: integer("rating_count"),
  isVerified: boolean("is_verified").default(false),
});

export const insertDoctorSchema = createInsertSchema(doctors).pick({
  userId: true,
  specialization: true,
  experience: true,
  qualification: true,
  about: true,
  consultationFee: true,
  availableDays: true,
  availableTimeStart: true,
  availableTimeEnd: true,
  rating: true,
  ratingCount: true,
  isVerified: true,
});

export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;

// Pharmacy related schemas
export const pharmacies = pgTable("pharmacies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  licenseNumber: text("license_number").notNull(),
  establishmentYear: integer("establishment_year"),
  operatingHours: text("operating_hours"),
  isVerified: boolean("is_verified").default(false),
});

export const insertPharmacySchema = createInsertSchema(pharmacies).pick({
  userId: true,
  licenseNumber: true,
  establishmentYear: true,
  operatingHours: true,
  isVerified: true,
});

export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type Pharmacy = typeof pharmacies.$inferSelect;

// Laboratory related schemas
export const laboratories = pgTable("laboratories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  licenseNumber: text("license_number").notNull(),
  facilities: text("facilities"),
  establishmentYear: integer("establishment_year"),
  operatingHours: text("operating_hours"),
  isVerified: boolean("is_verified").default(false),
});

export const insertLaboratorySchema = createInsertSchema(laboratories).pick({
  userId: true,
  licenseNumber: true,
  facilities: true,
  establishmentYear: true,
  operatingHours: true,
  isVerified: true,
});

export type InsertLaboratory = z.infer<typeof insertLaboratorySchema>;
export type Laboratory = typeof laboratories.$inferSelect;

// Doctor Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  status: text("status").default("pending"), // pending, confirmed, completed, cancelled
  symptoms: text("symptoms"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  userId: true,
  doctorId: true,
  appointmentDate: true,
  status: true,
  symptoms: true,
  notes: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Laboratory Test Bookings
export const labBookings = pgTable("lab_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  labTestId: integer("lab_test_id").notNull(),
  laboratoryId: integer("laboratory_id"),
  bookingDate: timestamp("booking_date").notNull(),
  status: text("status").default("pending"), // pending, confirmed, completed, cancelled
  patientName: text("patient_name").notNull(),
  patientAge: integer("patient_age").notNull(),
  patientGender: text("patient_gender").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLabBookingSchema = createInsertSchema(labBookings).pick({
  userId: true,
  labTestId: true,
  laboratoryId: true,
  bookingDate: true,
  status: true,
  patientName: true,
  patientAge: true,
  patientGender: true,
});

export type InsertLabBooking = z.infer<typeof insertLabBookingSchema>;
export type LabBooking = typeof labBookings.$inferSelect;

// Orders (for tracking product purchases)
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderDate: timestamp("order_date").defaultNow(),
  status: text("status").default("pending"), // pending, processing, shipped, delivered, cancelled
  totalAmount: doublePrecision("total_amount").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  trackingNumber: text("tracking_number"),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  orderDate: true,
  status: true,
  totalAmount: true,
  shippingAddress: true,
  paymentMethod: true,
  trackingNumber: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items (individual products in an order)
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Health Tips
export const healthTips = pgTable("health_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const insertHealthTipSchema = createInsertSchema(healthTips).pick({
  title: true,
  content: true,
  category: true,
  imageUrl: true
});

export type InsertHealthTip = z.infer<typeof insertHealthTipSchema>;
export type HealthTip = typeof healthTips.$inferSelect;

// OTP Records for password reset and verification
export interface OTPRecord {
  email: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
}

// Session record for authentication
export interface Session {
  id: string;
  userId: number;
  createdAt: Date | null;
  expiresAt: Date | null;
  data: any;
}
