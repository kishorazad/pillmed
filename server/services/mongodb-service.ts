import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { 
  User, Product, Category, CartItem, Article, 
  Testimonial, LabTest, Doctor, Pharmacy, Laboratory,
  Appointment, LabBooking, Order, OrderItem, HealthTip, Pincode
} from '../models';

// MongoDB connection URL with additional configuration parameters
// Use environment variable for MongoDB connection string to avoid hardcoding credentials
// IMPORTANT: Only use MONGODB_URI for MongoDB connections; DATABASE_URL is for PostgreSQL
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.log('No MongoDB connection URL provided. Using in-memory storage instead.');
}

// Make sure we specify the database name in the connection string
// Use 'pillnow' as the database name since that's where our data is stored
const dbName = 'pillnow';

// Flag to track if MongoDB is available
let mongoDbAvailable = false;

// MongoDB connection needs to have network access from all IPs (0.0.0.0/0) in the MongoDB Atlas dashboard
// Go to: Network Access > Add IP Address > Allow Access from Anywhere (0.0.0.0/0)

export const connectToDatabase = async (retries = 5) => {
  console.log('Attempting to connect to MongoDB...');

  // Only use MONGODB_URI for MongoDB connections, not DATABASE_URL 
  // DATABASE_URL is for PostgreSQL connections and will cause errors if used with MongoDB
  const connectionString = process.env.MONGODB_URI;

  // If there's no MongoDB connection string, gracefully fallback to in-memory storage
  if (!connectionString) {
    console.log('No MongoDB URI provided. Using in-memory storage instead.');
    return false;
  }

  // Verify the connection string format to prevent attempted connections with invalid URIs
  if (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')) {
    console.error('Invalid MongoDB connection string format. Must start with mongodb:// or mongodb+srv://');
    console.log('Using in-memory storage for database operations');
    return false;
  }

  // Log the MongoDB URI with masked password for debugging
  const uriWithoutPassword = connectionString.replace(
    /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
    (match, srv, username) => `mongodb${srv || ''}://${username}:****@`
  );
  console.log(`Using MongoDB URI: ${uriWithoutPassword}`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Connect with a timeout to avoid slow connections
      const connectionOptions = {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,  // Force IPv4
        dbName: dbName  // Use explicitly defined database name
      };

      console.log(`MongoDB connection attempt ${attempt} with database name: ${dbName}`);

      await mongoose.connect(connectionString, connectionOptions);

      console.log('Connected to MongoDB successfully');
      mongoDbAvailable = true;
      return true;
    } catch (error: any) {
      console.error(`MongoDB connection attempt ${attempt} failed: ${error.message}`);

      // Check for specific error types and log more details
      if (error.name === 'MongoServerSelectionError') {
        console.error('Server selection error - check if MongoDB server is running and network connectivity');
      } else if (error.name === 'MongoNetworkError') {
        console.error('Network error - check connectivity and MongoDB URI');
      } else if (error.message && error.message.includes('bad auth')) {
        console.error('Authentication failed - check username, password and authentication database');
      }

      if (attempt === retries) {
        console.error('MongoDB connection error: Cannot connect to MongoDB - using in-memory storage');
        console.log('Using in-memory storage for database operations');
        mongoDbAvailable = false;
        return false;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  return false;
};

// Seed data function for initial data
export const seedData = async () => {
  try {
    // Check if we already have users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding users...');

      // Create demo users
      const users = [
        {
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

      for (const user of users) {
        await User.create(user);
      }
      console.log('Users seeded successfully');
    }

    // Check if we already have categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('Seeding categories...');

      // Create medicine categories
      const categories = [
        { name: 'Pregnancy & Maternal Care', description: 'Medications for expecting mothers and maternal health', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae' },
        { name: 'Antibiotics & Infections', description: 'Medications treating bacterial and other infections', imageUrl: 'https://images.unsplash.com/photo-1576671234524-ed58c95eab38' },
        { name: 'Pain & Fever', description: 'Relief medications for pain, inflammation and fever', imageUrl: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8' },
        { name: 'Diabetes & Metabolic', description: 'Medications for diabetes and metabolic conditions', imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2' },
        { name: 'Mental Health', description: 'Medications for anxiety, depression and other mental health conditions', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b' },
        { name: 'Skin Care', description: 'Topical medications for skin conditions and infections', imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e' }
      ];

      for (const category of categories) {
        await Category.create(category);
      }
      console.log('Categories seeded successfully');
    }

    return true;
  } catch (error: any) {
    console.error('Error seeding data:', error.message || error);
    return false;
  }
};

// Import medicines from CSV 
export const importMedicinesFromCSV = async () => {
  try {
    console.log("Starting CSV import process...");

    // Check how many products we already have
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 10) {
      console.log(`Already have ${existingProducts} products in database. Skipping import.`);
      return true;
    }

    // Get all categories first
    const categories = await Category.find();
    const categoryMap = new Map();

    categories.forEach(cat => {
      categoryMap.set(cat.name, cat._id);
    });

    // Create categories if needed
    if (categories.length === 0) {
      console.error("No categories found. Please seed categories first.");
      return false;
    }

    const results: any[] = [];
    const csvFilePath = path.join(process.cwd(), 'attached_assets', '[March 25 Updated] Medicines and OTC samples - Medicines.csv');

    console.log('Reading CSV from:', csvFilePath);

    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found at ${csvFilePath}`);
      return false;
    }

    // Read the CSV file and return promise
    return new Promise<boolean>((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          console.log(`CSV parsing complete. Found ${results.length} medicines.`);

          try {
            // First 50 products only to avoid overwhelming the system
            const medicineData = results.slice(0, 50).map(item => {
              // Determine category based on primary use or medicine type
              let categoryId;
              const primaryUse = item.primary_use || '';
              const saltComposition = item.salt_composition || '';

              // Default category mapping logic
              if (primaryUse.toLowerCase().includes('pregnancy')) {
                categoryId = categoryMap.get('Pregnancy & Maternal Care');
              } else if (saltComposition.toLowerCase().includes('amox') || 
                         saltComposition.toLowerCase().includes('clav') ||
                         saltComposition.toLowerCase().includes('cefixime')) {
                categoryId = categoryMap.get('Antibiotics & Infections');
              } else if (primaryUse.toLowerCase().includes('pain') || 
                         primaryUse.toLowerCase().includes('fever') ||
                         primaryUse.toLowerCase().includes('relief')) {
                categoryId = categoryMap.get('Pain & Fever');
              } else if (primaryUse.toLowerCase().includes('diabetes') || 
                         primaryUse.toLowerCase().includes('sugar') ||
                         primaryUse.toLowerCase().includes('metabolic')) {
                categoryId = categoryMap.get('Diabetes & Metabolic');
              } else if (primaryUse.toLowerCase().includes('anxiety') || 
                         primaryUse.toLowerCase().includes('depression') ||
                         primaryUse.toLowerCase().includes('mental')) {
                categoryId = categoryMap.get('Mental Health');
              } else if (primaryUse.toLowerCase().includes('skin') || 
                         primaryUse.toLowerCase().includes('acne') ||
                         primaryUse.toLowerCase().includes('rash')) {
                categoryId = categoryMap.get('Skin Care');
              } else {
                // If we can't determine a category, assign to Pain & Fever as default
                categoryId = categoryMap.get('Pain & Fever');
              }

              // Calculate discounted price (10-20% off)
              const price = Number(item.mrp) || Math.floor(Math.random() * 500) + 100;
              const discountPercent = Math.floor(Math.random() * 10) + 10;
              const discountedPrice = Math.floor(price * (1 - discountPercent / 100));

              // Format medication name
              const productName = item.Product_Name || item.Product_ID || 'Medicine ' + (Math.random() * 1000).toFixed(0);

              // Create description from salt composition and introduction
              const descriptionParts = [];
              if (saltComposition) descriptionParts.push(saltComposition);
              if (item.introduction) {
                const intro = item.introduction.substring(0, 200);
                descriptionParts.push(intro + (item.introduction.length > 200 ? '...' : ''));
              }

              const description = descriptionParts.join(' - ') || 'No description available';

              return {
                name: productName,
                description: description,
                price: price,
                discountedPrice: discountedPrice,
                imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',  // Default image
                categoryId: categoryId,
                brand: item.Marketer_Manufacturer || 'Generic',
                inStock: true,
                quantity: item.Package || item.Packaging_Detail || 'Strip of 10 Tablets',
                rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),  // Random rating between 3 and 5
                ratingCount: Math.floor(Math.random() * 300) + 50,  // Random rating count
                isFeatured: Math.random() > 0.7,  // About 30% of products are featured
                composition: saltComposition || null,
                uses: item.primary_use || null,
                manufacturer: item.Marketer_Manufacturer || null,
                packSize: item.Package || item.Packaging_Detail || null
              };
            });

            // Add medicines one by one to avoid overwhelming the system
            console.log(`Importing ${medicineData.length} medicine products...`);

            for (const medicine of medicineData) {
              try {
                await Product.create(medicine);
              } catch (error) {
                console.error(`Error importing medicine ${medicine.name}:`, error);
              }
            }

            console.log("Medicine import from CSV completed successfully");
            resolve(true);
          } catch (error) {
            console.error("Error processing CSV data:", error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error("Error reading CSV:", error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error importing medicines from CSV:', error);
    return false;
  }
};

// Import pincodes from CSV
export const importPincodesFromCSV = async () => {
  try {
    console.log("Starting Pincode CSV import process...");

    // Check how many pincodes we already have
    const existingPincodes = await Pincode.countDocuments();
    if (existingPincodes > 10) {
      console.log(`Already have ${existingPincodes} pincodes in database. Skipping import.`);
      return true;
    }

    const results: any[] = [];
    const csvFilePath = path.join(process.cwd(), 'attached_assets', 'pincode.csv');

    console.log('Reading Pincode CSV from:', csvFilePath);

    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`Pincode CSV file not found at ${csvFilePath}`);
      return false;
    }

    // Read the CSV file
    return new Promise<boolean>((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          console.log(`Pincode CSV parsing complete. Found ${results.length} pincodes.`);

          try {
            // First 1000 pincodes only to avoid overwhelming the system
            const pincodeData = results.slice(0, 1000).map(item => ({
              pincode: item.pincode,
              officename: item.officename,
              divisionname: item.divisionname,
              regionname: item.regionname,
              circlename: item.circlename,
              district: item.district,
              statename: item.statename,
              latitude: parseFloat(item.latitude) || null,
              longitude: parseFloat(item.longitude) || null,
              delivery: item.delivery
            }));

            // Batch insert pincodes
            if (pincodeData.length > 0) {
              try {
                await Pincode.insertMany(pincodeData, { ordered: false });
                console.log(`Imported ${pincodeData.length} pincodes successfully`);
              } catch (error) {
                // Some pincodes might be duplicates, but that's OK
                console.log(`Imported pincodes with some duplicates skipped`);
              }
            }

            console.log("Pincode import from CSV completed");
            resolve(true);
          } catch (error) {
            console.error("Error processing pincode CSV data:", error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error("Error reading pincode CSV:", error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error importing pincodes from CSV:', error);
    return false;
  }
};

// Initialize the database with seed data and imports
export const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    const connected = await connectToDatabase();
    mongoDbAvailable = connected;

    if (!connected) {
      // Simple error message with no details to avoid cluttering logs
      console.log('Using in-memory storage instead of MongoDB');
      // We'll return false but not throw an error so the application can continue
      return false;
    }

    // Seed basic data - only if MongoDB is available
    if (mongoDbAvailable) {
      const seeded = await seedData();
      if (!seeded) {
        console.log('Failed to seed data, but continuing with existing data');
      }

      // Import medicines from CSV
      await importMedicinesFromCSV();

      // Import pincodes from CSV
      await importPincodesFromCSV();
    }

    return true;
  } catch (error) {
    // Simplified error message
    console.error('Error initializing database, using in-memory storage');
    mongoDbAvailable = false;
    // Return false but don't throw to allow the application to continue with PostgreSQL
    return false;
  }
};

export default {
  connectToDatabase,
  seedData,
  importMedicinesFromCSV,
  importPincodesFromCSV,
  initializeDatabase
};