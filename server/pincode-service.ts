/**
 * Pincode Service
 * 
 * This service provides functions for:
 * - Validating Indian pincodes
 * - Retrieving location data from pincodes
 * - Checking delivery availability in service areas
 * - Setting estimated delivery times based on pincode
 */

import { MongoClient, Collection, Db } from 'mongodb';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { db } from './db';

// Pincode data model
export interface PincodeData {
  pincode: string;
  city: string;
  district: string;
  state: string;
  country: string;
  serviceAvailable: boolean;
  deliveryDays: number;
}

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let pincodeCollection: Collection | null = null;

// Service areas where delivery is available
// This could be extended with more detailed rules in a real app
const SERVICE_AREAS = [
  // Major metros with fast delivery
  { state: 'Delhi', deliveryDays: 1 },
  { state: 'Maharashtra', city: 'Mumbai', deliveryDays: 1 },
  { state: 'Karnataka', city: 'Bengaluru', deliveryDays: 1 },
  { state: 'Telangana', city: 'Hyderabad', deliveryDays: 1 },
  { state: 'Tamil Nadu', city: 'Chennai', deliveryDays: 1 },
  { state: 'West Bengal', city: 'Kolkata', deliveryDays: 1 },
  
  // Other major cities with fast delivery
  { state: 'Gujarat', city: 'Ahmedabad', deliveryDays: 2 },
  { state: 'Uttar Pradesh', city: 'Lucknow', deliveryDays: 2 },
  { state: 'Rajasthan', city: 'Jaipur', deliveryDays: 2 },
  { state: 'Punjab', city: 'Chandigarh', deliveryDays: 2 },
  
  // All other service areas with standard delivery time
  { state: 'Madhya Pradesh', deliveryDays: 3 },
  { state: 'Kerala', deliveryDays: 3 },
  { state: 'Andhra Pradesh', deliveryDays: 3 },
  { state: 'Haryana', deliveryDays: 3 },
  { state: 'Bihar', deliveryDays: 4 },
  { state: 'Odisha', deliveryDays: 4 },
  { state: 'Assam', deliveryDays: 5 },
  { state: 'Jharkhand', deliveryDays: 4 },
  { state: 'Uttarakhand', deliveryDays: 4 },
  { state: 'Himachal Pradesh', deliveryDays: 5 },
  { state: 'Goa', deliveryDays: 3 },
  { state: 'Puducherry', deliveryDays: 3 },
  { state: 'Chhattisgarh', deliveryDays: 4 },
];

// Initialize MongoDB connection
export async function initializePincodeService() {
  try {
    if (!mongoClient) {
      const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      mongoClient = new MongoClient(mongoUrl);
      await mongoClient.connect();
      mongoDb = mongoClient.db('pillnow');
      pincodeCollection = mongoDb.collection('pincodes');
      
      // Check if pincodes are already loaded
      const count = await pincodeCollection.countDocuments();
      if (count === 0) {
        await importPincodes();
      }
      
      console.log('Pincode service initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize pincode service:', error);
    throw error;
  }
}

// Import pincodes from CSV file
async function importPincodes() {
  try {
    const csvFilePath = path.join(__dirname, '../attached_assets/pincode.csv');
    const pincodes: PincodeData[] = [];
    
    // Read CSV file and parse data
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          const pincode: PincodeData = {
            pincode: row.pincode,
            city: row.city || row.officename,
            district: row.district || row.Districtname,
            state: row.state || row.statename,
            country: 'India',
            serviceAvailable: checkServiceAvailability(row.state, row.city),
            deliveryDays: getDeliveryDays(row.state, row.city)
          };
          pincodes.push(pincode);
        })
        .on('end', async () => {
          if (pincodes.length > 0 && pincodeCollection) {
            await pincodeCollection.insertMany(pincodes);
            console.log(`Imported ${pincodes.length} pincodes from CSV`);
          }
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error importing pincodes:', error);
    // Create a default set of pincodes for major cities
    await createDefaultPincodes();
  }
}

// Create default pincodes for major cities if import fails
async function createDefaultPincodes() {
  try {
    if (!pincodeCollection) return;
    
    const defaultPincodes: PincodeData[] = [
      {
        pincode: '110001',
        city: 'New Delhi',
        district: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        serviceAvailable: true,
        deliveryDays: 1
      },
      {
        pincode: '400001',
        city: 'Mumbai',
        district: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        serviceAvailable: true,
        deliveryDays: 1
      },
      {
        pincode: '560001',
        city: 'Bengaluru',
        district: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        serviceAvailable: true,
        deliveryDays: 1
      },
      {
        pincode: '500001',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        serviceAvailable: true,
        deliveryDays: 1
      },
      {
        pincode: '700001',
        city: 'Kolkata',
        district: 'Kolkata',
        state: 'West Bengal',
        country: 'India',
        serviceAvailable: true,
        deliveryDays: 1
      }
    ];
    
    await pincodeCollection.insertMany(defaultPincodes);
    console.log('Created default pincodes for major cities');
  } catch (error) {
    console.error('Error creating default pincodes:', error);
  }
}

// Check if a pincode exists in database
export async function getPincodeData(pincode: string): Promise<PincodeData | null> {
  try {
    if (!pincodeCollection) {
      await initializePincodeService();
    }
    
    if (!pincodeCollection) {
      throw new Error('Pincode collection not initialized');
    }
    
    const result = await pincodeCollection.findOne({ pincode });
    if (result) {
      return result as unknown as PincodeData;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding pincode:', error);
    return null;
  }
}

// Check if delivery is available in a given area
function checkServiceAvailability(state: string, city: string): boolean {
  // Check if location is in our service areas
  return SERVICE_AREAS.some(area => {
    if (area.city) {
      // Match both state and city if city is specified
      return area.state === state && area.city === city;
    } else {
      // Match just state if no city is specified
      return area.state === state;
    }
  });
}

// Get estimated delivery days for a location
function getDeliveryDays(state: string, city: string): number {
  // Find matching service area
  const area = SERVICE_AREAS.find(area => {
    if (area.city) {
      return area.state === state && area.city === city;
    } else {
      return area.state === state;
    }
  });
  
  // Return delivery days or default to 5 days
  return area ? area.deliveryDays : 5;
}

// Validate a pincode format (6 digits for Indian pincodes)
export function isValidPincodeFormat(pincode: string): boolean {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
}

// Check if a pincode is serviceable
export async function isServiceablePincode(pincode: string): Promise<boolean> {
  const pincodeData = await getPincodeData(pincode);
  return pincodeData ? pincodeData.serviceAvailable : false;
}

// Get delivery estimate for a pincode
export async function getDeliveryEstimate(pincode: string): Promise<number> {
  const pincodeData = await getPincodeData(pincode);
  return pincodeData ? pincodeData.deliveryDays : 5; // Default to 5 days
}