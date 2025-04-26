import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { importMedicinesFromCSV } from "./csv-import";
import { importMedicinesFromExcel } from "./excel-import";
import { mongoDBStorage } from './mongodb-storage';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { optimizeDatabaseForLargeDatasets } from './index-optimizer';
import { mongoDBService } from './services/mongodb-service';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

console.log("✅ ENV CHECK");
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "Loaded" : "Missing");
console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "Loaded" : "Missing");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });


console.log("✅ OPENAI_API_KEY:", process.env.OPENAI_API_KEY);
console.log("✅ MONGODB_URI:", process.env.MONGODB_URI);
console.log("🔐 OPENAI KEY DETECTED?:", process.env.OPENAI_API_KEY !== undefined);

// Session configuration
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set in environment variables');
}

// Add TypeScript definitions to global
declare global {
  var useMongoStorage: boolean;
}

// MongoDB Connection and Optimization Logic
async function initializeMongoDB() {
  try {
    const isMongoConnected = await mongoDBService.connect();
    
    if (isMongoConnected) {
      global.useMongoStorage = true;
      console.log('Using MongoDB for database operations');
      
      // Optimize database for large datasets
      try {
        await optimizeDatabaseForLargeDatasets();
        console.log('Database optimized for large datasets (up to 700,000 products)');
      } catch (optimizationError) {
        console.error('Failed to optimize MongoDB:', optimizationError.message);
      }
    } else {
      global.useMongoStorage = false;
      console.log('Using in-memory storage for database operations');
    }
  } catch (error) {
    global.useMongoStorage = false;
    console.error('MongoDB connection error:', error);
    console.log('Using in-memory storage for database operations');
  }
}

// Data Import Logic with Fallbacks
async function importMedicineData() {
  try {
    const excelSuccess = await importMedicinesFromExcel();
    if (excelSuccess) {
      console.log('Imported medicine data from Excel successfully');
      return;
    }
    console.error('Failed to import medicine data from Excel, trying CSV');

    const csvSuccess = await importMedicinesFromCSV();
    if (csvSuccess) {
      console.log('Imported medicine data from CSV successfully');
      return;
    }
    console.warn('Warning: Could not import medicine data from either Excel or CSV');
  } catch (error) {
    console.error('Error during data import:', error);
  }
}

// Session Store Setup
async function setupSessionStore() {
  let sessionStore;
  if (process.env.MONGODB_URI) {
    try {
      sessionStore = MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        dbName: 'pillnow',
        collectionName: 'sessions',
        ttl: 7 * 24 * 60 * 60, // 7 days
        autoRemove: 'native',
        touchAfter: 1 * 3600, // Refresh session once per hour
        crypto: {
          secret: sessionSecret, // Session encryption
        },
      });
      console.log('✅ MongoDB session store successfully initialized');
    } catch (error) {
      console.error('Failed to initialize MongoDB session store:', error);
      console.log('⚠️ Falling back to memory session store');
      sessionStore = undefined; // Fall back to memory store
    }
  } else {
    console.log('⚠️ No MONGODB_URI found. Using memory session store.');
  }
  return sessionStore;
}

(async () => {
  // Initialize MongoDB and import data
  await initializeMongoDB();
  await importMedicineData();

  // Initialize express app
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Setup session store (MongoDB or memory)
  const sessionStore = await setupSessionStore();

  // Session configuration
  const sessionConfig: session.SessionOptions = {
    name: 'pillnow.sid',
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    rolling: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax', 
      path: '/', 
    },
  };
  app.use(session(sessionConfig));

  // Logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // Register routes and setup server
  const server = await registerRoutes(app);
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Set up Vite for development
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start the server
  const port = 5000;
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`Serving on port ${port}`);
  });
})();
