import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { importMedicinesFromCSV } from "./csv-import";
import { importMedicinesFromExcel } from "./excel-import";
import session from 'express-session';

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || 'medadock-secret-key';

// Use in-memory storage for this project since we don't have MongoDB
console.log('Using in-memory storage');

// Try to import medicine data from Excel first, and then from CSV as backup
importMedicinesFromExcel().then((success) => {
  if (success) {
    console.log('Imported medicine data from Excel successfully');
  } else {
    // Fall back to CSV
    return importMedicinesFromCSV();
  }
}).catch(err => {
  console.error('Failed to import medicine data from Excel, trying CSV:', err);
  return importMedicinesFromCSV();
}).then((success) => {
  if (success) {
    console.log('Imported medicine data from CSV successfully');
  }
}).catch(err => {
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
