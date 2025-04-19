import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { Request, Response, Router } from 'express';
import { IStorage } from './storage';
import { mongoDBStorage } from './mongodb-storage';

/**
 * Sets up SEO-related routes including sitemap and robots.txt
 * These are essential for search engine discoverability and ranking
 */
export function setupSeoRoutes(router: Router) {
  // Sitemap route
  router.get('/sitemap.xml', generateSitemap);
  
  // Robots.txt route
  router.get('/robots.txt', (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Create a robots.txt file with references to sitemap
    // This helps search engines discover content efficiently
    const robotsTxt = `
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /cart/
Disallow: /profile/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
    `.trim();
    
    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });
  
  return router;
}

/**
 * Generates a dynamically updated XML sitemap for SEO optimization
 * Based on approaches used by leading pharmacy platforms for better indexing
 */
async function generateSitemap(req: Request, res: Response) {
  try {
    const storage: IStorage = global.useMongoStorage 
      ? mongoDBStorage
      : req.app.locals.storage;
    
    // Base URL from request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Start with static routes
    const staticRoutes = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/products', changefreq: 'daily', priority: 0.9 },
      { url: '/cart', changefreq: 'monthly', priority: 0.5 },
      { url: '/checkout', changefreq: 'monthly', priority: 0.5 },
      { url: '/profile', changefreq: 'monthly', priority: 0.6 },
      { url: '/doctors', changefreq: 'weekly', priority: 0.8 },
      { url: '/hospitals', changefreq: 'weekly', priority: 0.8 },
      { url: '/ai-healthcare', changefreq: 'weekly', priority: 0.7 },
      { url: '/medication-tracking', changefreq: 'monthly', priority: 0.6 },
      { url: '/communication', changefreq: 'monthly', priority: 0.7 },
      { url: '/services', changefreq: 'weekly', priority: 0.8 },
      { url: '/services/medical-equipment', changefreq: 'weekly', priority: 0.7 },
      { url: '/services/medical-services', changefreq: 'weekly', priority: 0.7 },
      { url: '/services/ambulance-request', changefreq: 'monthly', priority: 0.6 },
      { url: '/services/emergency', changefreq: 'monthly', priority: 0.6 },
    ];

    // Dynamic routes
    let routes = [...staticRoutes];
    
    // Get all product categories
    const categories = await storage.getCategories();
    
    for (const category of categories) {
      routes.push({
        url: `/products/category/${category.id}`,
        changefreq: 'weekly',
        priority: 0.8,
      });
    }
    
    // Get all products - use getProducts method which is available in storage
    const products = await storage.getProducts();
    
    for (const product of products) {
      routes.push({
        url: `/products/${product.id}`,
        changefreq: 'weekly',
        priority: 0.7,
        // Add lastmod based on product update date if available
        lastmod: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined
      });
    }
    
    // Get doctors/hospitals if applicable
    try {
      const doctors = await storage.getDoctors?.();
      if (doctors && Array.isArray(doctors)) {
        for (const doctor of doctors) {
          routes.push({
            url: `/doctors/${doctor.id}`,
            changefreq: 'weekly',
            priority: 0.7,
          });
        }
      }
    } catch (error) {
      console.log('Skipping doctor routes in sitemap');
    }
    
    // Create a sitemap stream
    const stream = new SitemapStream({ hostname: baseUrl });
    
    // Add all routes to the sitemap
    const sitemapData = await streamToPromise(
      Readable.from(routes).pipe(stream)
    );
    
    // Set headers
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');
    
    // Send the sitemap
    res.send(sitemapData);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}