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

// Session configuration
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set in environment variables');
}

// Add TypeScript definitions to global
declare global {
  var useMongoStorage: boolean;
}

// Use IIFE to immediately execute async code
(async () => {
  try {
    // Use the MongoDB connection from mongodb-service.ts
    const isMongoConnected = await mongoDBService.connect();
    
    // Force MongoDB storage to be used if connected
    if (isMongoConnected) {
      global.useMongoStorage = true;
      console.log('Using MongoDB for database operations');
      
      // Optimize database for large datasets (up to 700,000 products)
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
  
  // Import data regardless of MongoDB connection status
  try {
    const excelSuccess = await importMedicinesFromExcel();
    if (excelSuccess) {
      console.log('Imported medicine data from Excel successfully');
    }
  } catch (excelError) {
    console.error('Failed to import medicine data from Excel, trying CSV');
    
    // If Excel import failed, try CSV
    try {
      const csvSuccess = await importMedicinesFromCSV();
      if (csvSuccess === true) {
        console.log('Imported medicine data from CSV successfully');
      }
    } catch (csvError) {
      console.error('Failed to import medicine data from CSV');
      console.warn('Warning: Could not import medicine data from either Excel or CSV');
    }
  }
})();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session store based on MongoDB availability
let sessionStore;
if (process.env.MONGODB_URI) {
  try {
    // Force MongoDB session store usage regardless of global.useMongoStorage
    sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      dbName: 'pillnow',
      collectionName: 'sessions',
      ttl: 7 * 24 * 60 * 60, // 7 days in seconds
      autoRemove: 'native',
      touchAfter: 1 * 3600, // Refresh session once per hour for better security
      crypto: {
        secret: sessionSecret // Use the same secret for additional encryption
      }
    });
    console.log('✅ MongoDB session store successfully initialized');
  } catch (error) {
    console.error('Failed to initialize MongoDB session store:', error);
    console.log('⚠️ Falling back to memory session store');
  }
} else {
  // Fallback to memory store (not recommended for production)
  console.log('⚠️ Memory session store initialized (sessions will be lost on server restart)');
}

const sessionConfig: session.SessionOptions = {
  name: 'pillnow.sid', // Custom session ID name for better security
  secret: sessionSecret,
  resave: true, // Keep true to ensure session is saved on each request
  saveUninitialized: true, // Changed to true to help with initial session establishment
  store: sessionStore,
  rolling: true, // Reset maxAge on every response
  cookie: {
    secure: false, // Allow non-HTTPS during development
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for better user experience
    sameSite: 'lax', // Protects against CSRF
    path: '/' // Ensure cookie is available across all routes
  }
};

// Apply session middleware
app.use(session(sessionConfig));

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

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
