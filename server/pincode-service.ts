import { MongoClient } from 'mongodb';
import { readFile } from 'fs/promises';
import path from 'path';
import csv from 'csv-parser';
import { Readable } from 'stream';

interface PincodeData {
  pincode: string;
  district: string;
  state: string;
  country: string;
  city: string;
  deliveryAvailable: boolean;
}

/**
 * Service for pincode-related operations
 * Uses MongoDB with CSV fallback for Indian pincodes
 */
class PincodeService {
  private mongoClient: MongoClient;
  private readonly DATABASE_NAME = 'pillnow';
  private readonly COLLECTION_NAME = 'pincodes';
  private initialized: boolean = false;
  
  constructor() {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable not set');
    }
    this.mongoClient = new MongoClient(process.env.MONGODB_URI);
  }
  
  /**
   * Initialize the pincode service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await this.mongoClient.connect();
      
      // Check if pincodes collection already has data
      const count = await this.mongoClient
        .db(this.DATABASE_NAME)
        .collection(this.COLLECTION_NAME)
        .countDocuments();
      
      if (count === 0) {
        // Import pincodes from CSV if collection is empty
        await this.importPincodesFromCsv();
      }
      
      // Create index on pincode field for faster lookups
      await this.mongoClient
        .db(this.DATABASE_NAME)
        .collection(this.COLLECTION_NAME)
        .createIndex({ pincode: 1 });
      
      this.initialized = true;
      console.log('Pincode service initialized');
    } catch (error) {
      console.error('Failed to initialize pincode service:', error);
      throw error;
    }
  }
  
  /**
   * Import pincodes from CSV file
   */
  private async importPincodesFromCsv(): Promise<void> {
    try {
      console.log('Starting Pincode CSV import process...');
      
      // Read the CSV file
      const csvPath = path.resolve('./attached_assets/pincode.csv');
      const csvData = await readFile(csvPath, 'utf-8');
      
      // Parse the CSV data
      const pincodes: PincodeData[] = [];
      await new Promise<void>((resolve, reject) => {
        const stream = Readable.from(csvData);
        stream
          .pipe(csv())
          .on('data', (row: any) => {
            // Transform CSV row to PincodeData
            const pincodeData: PincodeData = {
              pincode: row.pincode || '',
              district: row.district || '',
              state: row.state || '',
              country: 'India',
              city: row.city || row.district || '',
              deliveryAvailable: true // Default to true, can be customized
            };
            pincodes.push(pincodeData);
          })
          .on('end', () => {
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });
      
      // Insert parsed pincodes into MongoDB
      if (pincodes.length > 0) {
        await this.mongoClient
          .db(this.DATABASE_NAME)
          .collection(this.COLLECTION_NAME)
          .insertMany(pincodes);
        
        console.log(`Imported ${pincodes.length} pincodes to database`);
      } else {
        console.log('No pincodes found in CSV file');
      }
    } catch (error) {
      console.error('Error importing pincodes from CSV:', error);
      throw error;
    }
  }
  
  /**
   * Get pincode data by pincode
   */
  async getPincodeData(pincode: string): Promise<PincodeData | null> {
    try {
      await this.initialize();
      
      const pincodeData = await this.mongoClient
        .db(this.DATABASE_NAME)
        .collection(this.COLLECTION_NAME)
        .findOne({ pincode });
      
      if (!pincodeData) {
        console.log(`Pincode ${pincode} not found in database`);
        return null;
      }
      
      return pincodeData as PincodeData;
    } catch (error) {
      console.error(`Error getting data for pincode ${pincode}:`, error);
      return null;
    }
  }
  
  /**
   * Check if delivery is available for a pincode
   */
  async isDeliveryAvailable(pincode: string): Promise<boolean> {
    try {
      const pincodeData = await this.getPincodeData(pincode);
      return !!pincodeData?.deliveryAvailable;
    } catch (error) {
      console.error(`Error checking delivery availability for pincode ${pincode}:`, error);
      return false;
    }
  }
}

// Singleton instance
export const pincodeService = new PincodeService();