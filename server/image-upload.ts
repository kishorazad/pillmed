import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { Request, Response, NextFunction, Router } from 'express';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to avoid collisions
    const uniqueFilename = `${uuidv4()}-${file.originalname.replace(/\s+/g, '-').toLowerCase()}`;
    cb(null, uniqueFilename);
  }
});

// Create multer instance with file filter for images
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any);
    }
  }
});

// Setup image upload router
export function setupImageUpload(app: Router) {
  // Single file upload endpoint
  app.post('/api/upload-image', upload.single('file'), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Generate URL for the uploaded file
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Return the URL to the client
      res.status(201).json({ 
        imageUrl,
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });
  
  // Error handling middleware for multer
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds the 5MB limit' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }
    next();
  });
  
  // Serve uploaded files statically
  app.use('/uploads', app.static(uploadsDir));
}