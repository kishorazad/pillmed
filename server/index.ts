import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { importMedicinesFromCSV } from "./csv-import";
import { importMedicinesFromExcel } from "./excel-import";
import { mongoDBStorage } from './mongodb-storage';
import session from 'express-session';
import mongoose from 'mongoose';

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || 'medadock-secret-key';

// Add TypeScript definitions to global
declare global {
  var useMongoStorage: boolean;
}

// Connect to MongoDB or fallback to in-memory storage
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user1:password123@cluster0.mongodb.net/medadockdb';

// Try connecting to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    
    global.useMongoStorage = true;
    
    // After MongoDB connection is established, import medicines
    return importMedicinesFromExcel();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error, falling back to in-memory storage:', err.message);
    console.log('Using in-memory storage');
    
    global.useMongoStorage = false;
    
    // Use Excel import for in-memory storage too
    return importMedicinesFromExcel();
  })
  .then((success) => {
    if (success) {
      console.log('Imported medicine data from Excel successfully');
    } else {
      // Fall back to CSV
      return importMedicinesFromCSV();
    }
  })
  .catch(err => {
    console.error('Failed to import medicine data from Excel, trying CSV:', err);
    return importMedicinesFromCSV();
  })
  .then((success) => {
    if (success) {
      console.log('Imported medicine data from CSV successfully');
    }
  })
  .catch(err => {
    console.error('Failed to import medicine data from both Excel and CSV:', err);
  });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use memory session store
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));
console.log('Memory session store initialized');

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
