import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { importMedicinesFromCSV } from "./csv-import";
import { initializeDatabase } from './services/mongodb-service';
import session from 'express-session';
import connectMongo from 'connect-mongo';

// MongoDB Session Store
const MongoStore = connectMongo;
const sessionSecret = process.env.SESSION_SECRET || 'medadock-secret-key';

// Try to connect to MongoDB and initialize the database
// If that fails, fall back to in-memory storage
initializeDatabase().then(() => {
  console.log('MongoDB database initialized successfully');
}).catch(err => {
  console.error('Failed to initialize MongoDB database', err);
  // Fall back to in-memory storage and import medicines
  importMedicinesFromCSV().then(() => {
    console.log('Imported medicine data to in-memory storage successfully');
  }).catch(err => {
    console.error('Failed to import medicine data to in-memory storage:', err);
  });
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add session middleware with MongoDB store
try {
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/medadock';
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
      mongoUrl: mongoUrl,
      autoRemove: 'interval',
      autoRemoveInterval: 60, // In minutes (1 hour)
      touchAfter: 24 * 3600, // Only update timestamps once per day
      crypto: {
        secret: sessionSecret
      }
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  }));
  console.log('MongoDB session store initialized');
} catch (error) {
  console.error('Failed to initialize MongoDB session store, falling back to memory session:', error);
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day for in-memory
    }
  }));
}

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
