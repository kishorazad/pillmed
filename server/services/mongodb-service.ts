import { MongoClient, Db, Collection } from 'mongodb';

// Singleton for MongoDB connection
class MongoDBService {
  private static instance: MongoDBService;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collections: { [key: string]: Collection } = {};
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): MongoDBService {
    if (!MongoDBService.instance) {
      MongoDBService.instance = new MongoDBService();
    }
    return MongoDBService.instance;
  }

  /**
   * Initialize the MongoDB connection
   */
  public async connect(): Promise<boolean> {
    try {
      if (!process.env.MONGODB_URI) {
        console.error('MongoDB URI is not defined in environment variables');
        return false;
      }

      console.log('Connecting to MongoDB...');
      this.client = new MongoClient(process.env.MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db('pillnow'); // Use pillnow as the database name
      this.isConnected = true;
      console.log('Connected to MongoDB successfully');
      return true;
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get a specific collection with caching
   */
  public getCollection(name: string): Collection | null {
    if (!this.isConnected || !this.db) {
      console.warn(`Cannot get collection ${name}: Not connected to MongoDB`);
      return null;
    }

    if (!this.collections[name]) {
      this.collections[name] = this.db.collection(name);
    }
    
    return this.collections[name];
  }

  /**
   * Check if the connection is established
   */
  public isConnectedToDb(): boolean {
    console.log(`MongoDB connection status check - isConnected flag: ${this.isConnected}`);
    console.log(`MongoDB client exists: ${!!this.client}`);
    console.log(`MongoDB database exists: ${!!this.db}`);
    if (this.client && !this.isConnected) {
      console.log('Connection flag is false but client exists. This could indicate a stale connection.');
    }
    return this.isConnected;
  }

  /**
   * Close the MongoDB connection
   */
  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('MongoDB connection closed');
    }
  }
}

// Export the singleton instance
export const mongoDBService = MongoDBService.getInstance();