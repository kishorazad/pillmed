import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { MongoClient, ObjectId } from 'mongodb';
import {
  User,
  Category,
  Product,
  CartItem,
  Article,
  Testimonial,
  LabTest,
  HealthTip
} from '../models';

const uri = "mongodb://localhost:27017/medadock";
const client = new MongoClient(uri);
let db: any;

const connectToMongoDB = async () => {
  try {
    await client.connect();
    db = client.db('medadock');
    console.log('Connected to MongoDB database');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

const seedMedicinesFromCSV = async () => {
  try {
    // First, make sure we have categories
    const categories = await Category.find();
    if (categories.length === 0) {
      console.log('Seeding categories...');
      await seedCategories();
    }

    // Get category IDs
    const allCategories = await Category.find();
    const categoryMap = new Map();
    allCategories.forEach(cat => {
      categoryMap.set(cat.name, cat._id);
    });

    // Check if we have existing medicines
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log(`Already have ${existingProducts} medicines in database. Skipping import.`);
      return;
    }

    const results: any[] = [];
    const csvFilePath = path.join(process.cwd(), 'attached_assets', '[March 25 Updated] Medicines and OTC samples - Medicines.csv');
    
    console.log('Reading CSV from:', csvFilePath);
    
    // Read the CSV file
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          console.log(`CSV parsing complete. Found ${results.length} medicines.`);
          
          try {
            const medicineData = results.map(item => {
              // Determine category based on primary use or medicine type
              let categoryId;
              
              // Default category mapping logic
              if (item.primary_use && item.primary_use.toLowerCase().includes('pregnancy')) {
                categoryId = categoryMap.get('Pregnancy & Maternal Care');
              } else if (item.salt_composition && (
                  item.salt_composition.toLowerCase().includes('amox') || 
                  item.salt_composition.toLowerCase().includes('clav') ||
                  item.salt_composition.toLowerCase().includes('cefixime')
                )) {
                categoryId = categoryMap.get('Antibiotics & Infections');
              } else if (item.primary_use && (
                  item.primary_use.toLowerCase().includes('pain') || 
                  item.primary_use.toLowerCase().includes('fever')
                )) {
                categoryId = categoryMap.get('Pain & Fever');
              } else if (item.primary_use && (
                  item.primary_use.toLowerCase().includes('diabetes') || 
                  item.primary_use.toLowerCase().includes('sugar')
                )) {
                categoryId = categoryMap.get('Diabetes & Metabolic');
              } else if (item.primary_use && (
                  item.primary_use.toLowerCase().includes('anxiety') || 
                  item.primary_use.toLowerCase().includes('depression') ||
                  item.primary_use.toLowerCase().includes('mental')
                )) {
                categoryId = categoryMap.get('Mental Health');
              } else if (item.primary_use && (
                  item.primary_use.toLowerCase().includes('skin') || 
                  item.primary_use.toLowerCase().includes('acne')
                )) {
                categoryId = categoryMap.get('Skin Care');
              } else {
                // Assign a random category if we can't determine
                const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
                categoryId = randomCategory._id;
              }
              
              // Calculate discounted price (10-20% off)
              const price = item.mrp ? parseFloat(item.mrp) : Math.floor(Math.random() * 500) + 100;
              const discountPercent = Math.floor(Math.random() * 10) + 10;
              const discountedPrice = Math.floor(price * (1 - discountPercent / 100));

              return {
                name: item.Product_Name,
                description: `${item.salt_composition} - ${item.introduction ? item.introduction.substring(0, 200) + '...' : 'No description available'}`,
                price: price,
                discountedPrice: discountedPrice,
                imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',  // Default image
                categoryId: categoryId,
                brand: item.Marketer_Manufacturer,
                inStock: true,
                quantity: item.Package || item.Packaging_Detail || 'Strip of 10 Tablets',
                rating: (Math.random() * 2 + 3).toFixed(1),  // Random rating between 3 and 5
                ratingCount: Math.floor(Math.random() * 300) + 50,  // Random rating count
                isFeatured: Math.random() > 0.7,  // About 30% of products are featured
                
                // Additional fields from CSV
                productId: item.Product_ID,
                saltComposition: item.salt_composition,
                medicineType: item.medicine_type,
                introduction: item.introduction,
                benefits: item.benefits,
                howToUse: item.how_to_use,
                safetyAdvice: item.safety_advise,
                ifMiss: item.if_miss,
                packageDetail: item.Packaging_Detail,
                mrp: item.mrp ? parseFloat(item.mrp) : null,
                prescriptionRequired: item.prescription_required === 'Yes',
                primaryUse: item.primary_use,
                storage: item.storage,
                commonSideEffect: item.common_side_effect,
                alcoholInteraction: item.alcoholInteraction,
                pregnancyInteraction: item.pregnancyInteraction,
                lactationInteraction: item.lactationInteraction,
                manufacturerAddress: item.MANUFACTURER_ADDRESS,
                countryOfOrigin: item.country_of_origin
              };
            });
            
            // Insert the medicine data into MongoDB
            const insertResult = await Product.insertMany(medicineData);
            console.log(`Imported ${insertResult.length} medicines to MongoDB.`);
            resolve(insertResult);
          } catch (error) {
            console.error("Error inserting medicines:", error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error("Error reading CSV:", error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error seeding medicines from CSV:', error);
    throw error;
  }
};

const seedCategories = async () => {
  try {
    const categories = [
      { name: 'Pregnancy & Maternal Care', description: 'Medications for expecting mothers and maternal health', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae' },
      { name: 'Antibiotics & Infections', description: 'Medications treating bacterial and other infections', imageUrl: 'https://images.unsplash.com/photo-1576671234524-ed58c95eab38' },
      { name: 'Pain & Fever', description: 'Relief medications for pain, inflammation and fever', imageUrl: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8' },
      { name: 'Diabetes & Metabolic', description: 'Medications for diabetes and metabolic conditions', imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2' },
      { name: 'Mental Health', description: 'Medications for anxiety, depression and other mental health conditions', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b' },
      { name: 'Skin Care', description: 'Topical medications for skin conditions and infections', imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e' }
    ];
    
    const categoryResults = await Category.insertMany(categories);
    console.log(`Inserted ${categoryResults.length} categories`);
    return categoryResults;
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

const seedUsers = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log(`Already have ${existingUsers} users in database. Skipping user seeding.`);
      return;
    }
    
    const usersData = [
      {
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '1234567890',
        address: '123 Test Street, Test City',
        pincode: '110001',
        role: 'customer',
        profileImageUrl: null
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        phone: '0987654321',
        address: '456 Admin Street, Admin City',
        pincode: '110002',
        role: 'admin',
        profileImageUrl: null
      },
      {
        username: 'doctor1',
        email: 'doctor@example.com',
        password: 'doctor123',
        name: 'Dr. John Smith',
        phone: '5554443333',
        address: '789 Doctor Avenue, Medical City',
        pincode: '110003',
        role: 'doctor',
        profileImageUrl: null
      },
      {
        username: 'pharmacy1',
        email: 'pharmacy@example.com',
        password: 'pharmacy123',
        name: 'City Pharmacy',
        phone: '1112223333',
        address: '101 Health Street, Pharma City',
        pincode: '110004',
        role: 'pharmacy',
        profileImageUrl: null
      }
    ];
    
    const userResults = await User.insertMany(usersData);
    console.log(`Inserted ${userResults.length} users`);
    return userResults;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

const seedTestimonials = async () => {
  try {
    const existingTestimonials = await Testimonial.countDocuments();
    if (existingTestimonials > 0) {
      console.log(`Already have ${existingTestimonials} testimonials in database. Skipping seeding.`);
      return;
    }
    
    const testimonialsData = [
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
    
    const testimonialResults = await Testimonial.insertMany(testimonialsData);
    console.log(`Inserted ${testimonialResults.length} testimonials`);
    return testimonialResults;
  } catch (error) {
    console.error('Error seeding testimonials:', error);
    throw error;
  }
};

const seedLabTests = async () => {
  try {
    const existingLabTests = await LabTest.countDocuments();
    if (existingLabTests > 0) {
      console.log(`Already have ${existingLabTests} lab tests in database. Skipping seeding.`);
      return;
    }
    
    const labTestsData = [
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
    
    const labTestResults = await LabTest.insertMany(labTestsData);
    console.log(`Inserted ${labTestResults.length} lab tests`);
    return labTestResults;
  } catch (error) {
    console.error('Error seeding lab tests:', error);
    throw error;
  }
};

const seedHealthTips = async () => {
  try {
    const existingHealthTips = await HealthTip.countDocuments();
    if (existingHealthTips > 0) {
      console.log(`Already have ${existingHealthTips} health tips in database. Skipping seeding.`);
      return;
    }
    
    const healthTipsData = [
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
    
    const healthTipResults = await HealthTip.insertMany(healthTipsData);
    console.log(`Inserted ${healthTipResults.length} health tips`);
    return healthTipResults;
  } catch (error) {
    console.error('Error seeding health tips:', error);
    throw error;
  }
};

const seedArticles = async () => {
  try {
    const existingArticles = await Article.countDocuments();
    if (existingArticles > 0) {
      console.log(`Already have ${existingArticles} articles in database. Skipping seeding.`);
      return;
    }
    
    const articlesData = [
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
    
    const articleResults = await Article.insertMany(articlesData);
    console.log(`Inserted ${articleResults.length} articles`);
    return articleResults;
  } catch (error) {
    console.error('Error seeding articles:', error);
    throw error;
  }
};

const initializeDatabase = async () => {
  try {
    await connectToMongoDB();
    await seedUsers();
    await seedCategories();
    await seedMedicinesFromCSV();
    await seedTestimonials();
    await seedLabTests();
    await seedHealthTips();
    await seedArticles();
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export {
  connectToMongoDB,
  seedMedicinesFromCSV,
  seedCategories,
  seedUsers,
  seedTestimonials,
  seedLabTests,
  seedHealthTips,
  seedArticles,
  initializeDatabase
};