import { Router, Request, Response } from 'express';
import { mongoDBStorage } from './mongodb-storage';
import { IStorage } from './storage';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { z } from 'zod';

const router = Router();

// Middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: Function) => {
  const sessionUser = (req.session as any)?.user;
  
  if (!sessionUser) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  // Check if user has admin role
  if (sessionUser.role !== 'admin' && sessionUser.role !== 'subadmin') {
    return res.status(403).json({ message: "Access denied. Admin role required." });
  }
  
  next();
};

// Ensure admin access for all routes
router.use(isAdmin);

// Define SEO settings schema
const seoSettingsSchema = z.object({
  defaultTitle: z.string().min(5).max(100),
  defaultDescription: z.string().min(10).max(300),
  defaultKeywords: z.string(),
  ogImage: z.string().url(),
  googleVerification: z.string().optional(),
  bingVerification: z.string().optional(),
  enableIndexing: z.boolean(),
  sitemapEnabled: z.boolean(),
  robotsTxtEnabled: z.boolean(),
  schemaMarkupEnabled: z.boolean(),
  canonicalUrlEnabled: z.boolean(),
  hreflangEnabled: z.boolean(),
  socialMediaMetaEnabled: z.boolean(),
});

type SeoSettings = z.infer<typeof seoSettingsSchema>;

// Default SEO settings
const defaultSettings: SeoSettings = {
  defaultTitle: 'PillNow - India\'s Leading Online Pharmacy & Healthcare Platform',
  defaultDescription: 'Order prescription medicines, OTC products, and health foods online. Enjoy doorstep delivery with amazing discounts. Book lab tests and doctor consultations.',
  defaultKeywords: 'online pharmacy, medicine delivery, healthcare, prescription drugs, doctor consultation, lab tests',
  ogImage: 'https://pillnow.com/images/og-image.jpg',
  googleVerification: '',
  bingVerification: '',
  enableIndexing: true,
  sitemapEnabled: true,
  robotsTxtEnabled: true,
  schemaMarkupEnabled: true,
  canonicalUrlEnabled: true,
  hreflangEnabled: false,
  socialMediaMetaEnabled: true,
};

// Helper function to get storage
function getStorage(req: Request): IStorage {
  return global.useMongoStorage ? mongoDBStorage : req.app.locals.storage;
}

// Route to get current SEO settings
router.get('/seo-settings', async (req: Request, res: Response) => {
  try {
    const storage = getStorage(req);
    
    // Check if getSettings method exists in storage
    if (typeof storage.getSeoSettings === 'function') {
      const settings = await storage.getSeoSettings();
      if (settings) {
        return res.json(settings);
      }
    }
    
    // Return default settings if not found in storage
    res.json(defaultSettings);
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    res.status(500).json({ message: 'Error fetching SEO settings' });
  }
});

// Route to update SEO settings
router.post('/seo-settings', async (req: Request, res: Response) => {
  try {
    const storage = getStorage(req);
    
    // Validate the request body
    const validatedSettings = seoSettingsSchema.parse(req.body);
    
    // Save to storage if available
    if (typeof storage.saveSeoSettings === 'function') {
      await storage.saveSeoSettings(validatedSettings);
      return res.json({ message: 'SEO settings saved successfully', settings: validatedSettings });
    }
    
    // If storage method not available, return success but warn
    res.json({ 
      message: 'SEO settings processed, but persistent storage not available', 
      settings: validatedSettings,
      warning: 'Settings are not persisted and will reset on server restart'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid SEO settings', errors: error.errors });
    }
    console.error('Error saving SEO settings:', error);
    res.status(500).json({ message: 'Error saving SEO settings' });
  }
});

// Route to manually generate sitemap
router.post('/generate-sitemap', async (req: Request, res: Response) => {
  try {
    const storage = getStorage(req);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Start with static routes
    const staticRoutes = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/products', changefreq: 'daily', priority: 0.9 },
      { url: '/doctors', changefreq: 'weekly', priority: 0.8 },
      { url: '/hospitals', changefreq: 'weekly', priority: 0.8 },
      { url: '/ai-healthcare', changefreq: 'weekly', priority: 0.7 },
      { url: '/medication-tracking', changefreq: 'monthly', priority: 0.6 },
      { url: '/communication', changefreq: 'monthly', priority: 0.7 },
      { url: '/services', changefreq: 'weekly', priority: 0.8 },
      { url: '/services/medical-equipment', changefreq: 'weekly', priority: 0.7 },
      { url: '/services/medical-services', changefreq: 'weekly', priority: 0.7 },
    ];

    // Dynamic routes
    let routes = [...staticRoutes];
    
    // Get all product categories
    try {
      const categories = await storage.getCategories();
      for (const category of categories) {
        routes.push({
          url: `/products/category/${category.id}`,
          changefreq: 'weekly',
          priority: 0.8,
        });
      }
    } catch (error) {
      console.warn('Error getting categories for sitemap:', error);
    }
    
    // Get all products
    try {
      const products = await storage.getProducts();
      for (const product of products) {
        routes.push({
          url: `/products/${product.id}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined
        });
      }
    } catch (error) {
      console.warn('Error getting products for sitemap:', error);
    }
    
    // Get doctors if available
    try {
      if (typeof storage.getDoctors === 'function') {
        const doctors = await storage.getDoctors();
        if (doctors && Array.isArray(doctors)) {
          for (const doctor of doctors) {
            routes.push({
              url: `/doctors/${doctor.id}`,
              changefreq: 'weekly',
              priority: 0.7,
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error getting doctors for sitemap:', error);
    }
    
    // Create a sitemap stream
    const stream = new SitemapStream({ hostname: baseUrl });
    
    // Add all routes to the sitemap
    const sitemapData = await streamToPromise(
      Readable.from(routes).pipe(stream)
    );
    
    // Try to save the sitemap file to disk
    try {
      const uploadsDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadsDir, 'sitemap.xml'), sitemapData);
    } catch (error) {
      console.warn('Could not save sitemap to disk:', error);
    }
    
    res.json({ 
      message: 'Sitemap generated successfully', 
      url: `${baseUrl}/sitemap.xml`,
      urlCount: routes.length
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ message: 'Error generating sitemap' });
  }
});

// Route to run SEO analysis
router.post('/run-seo-analysis', async (req: Request, res: Response) => {
  try {
    const storage = getStorage(req);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Get SEO settings
    let settings: SeoSettings;
    if (typeof storage.getSeoSettings === 'function') {
      settings = await storage.getSeoSettings() || defaultSettings;
    } else {
      settings = defaultSettings;
    }
    
    // Get all publicly accessible pages
    const pageUrls: string[] = [];
    
    // Add static pages
    const staticPages = [
      '/',
      '/products',
      '/doctors',
      '/hospitals',
      '/services',
      '/about',
      '/contact',
      '/health-blog'
    ];
    
    pageUrls.push(...staticPages.map(page => `${baseUrl}${page}`));
    
    // Add dynamic pages
    try {
      const categories = await storage.getCategories();
      pageUrls.push(...categories.map(category => `${baseUrl}/products/category/${category.id}`));
      
      const products = await storage.getProducts();
      pageUrls.push(...products.slice(0, 50).map(product => `${baseUrl}/products/${product.id}`));
    } catch (error) {
      console.warn('Error getting pages for SEO analysis:', error);
    }
    
    // Mock SEO analysis data - in a real implementation, this would use
    // a service like Lighthouse or custom crawling to analyze the pages
    const mockAnalytics = {
      totalIndexedPages: pageUrls.length,
      topPerformingPages: [
        { path: '/products/category/1', impressions: 12450, clicks: 3240, position: 3.2 },
        { path: '/products/5', impressions: 8970, clicks: 2160, position: 4.5 },
        { path: '/health-blog/importance-of-balanced-diet', impressions: 7640, clicks: 1980, position: 5.1 },
        { path: '/products/category/3', impressions: 6320, clicks: 1540, position: 6.3 },
        { path: '/products/10', impressions: 5980, clicks: 1320, position: 7.8 },
      ],
      topKeywords: [
        { keyword: 'buy medicines online', impressions: 15640, clicks: 4230, position: 2.8 },
        { keyword: 'online pharmacy delivery', impressions: 12340, clicks: 3120, position: 3.5 },
        { keyword: 'discount medicine online', impressions: 9870, clicks: 2540, position: 4.2 },
        { keyword: 'pillnow pharmacy', impressions: 7650, clicks: 2230, position: 1.3 },
        { keyword: 'medicine home delivery', impressions: 6320, clicks: 1670, position: 5.7 },
      ],
      issuesCount: {
        missingTitles: Math.floor(Math.random() * 5),
        duplicateTitles: Math.floor(Math.random() * 15),
        missingDescriptions: Math.floor(Math.random() * 30),
        brokenLinks: Math.floor(Math.random() * 10),
        missingAltText: Math.floor(Math.random() * 60),
      }
    };
    
    // Store analytics if storage method exists
    if (typeof storage.saveSeoAnalytics === 'function') {
      await storage.saveSeoAnalytics(mockAnalytics);
    }
    
    res.json(mockAnalytics);
  } catch (error) {
    console.error('Error running SEO analysis:', error);
    res.status(500).json({ message: 'Error running SEO analysis' });
  }
});

export default router;