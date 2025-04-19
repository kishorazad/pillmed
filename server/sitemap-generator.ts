import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { Request, Response, Router } from 'express';
import { IStorage } from './storage';
import { mongoDBStorage } from './mongodb-storage';
import { Product } from '@shared/schema';

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
 * Based on industry-leading pharmacy platforms like 1mg, PharmEasy, and Netmeds
 * This comprehensive approach helps search engines discover and index all important pages
 */
async function generateSitemap(req: Request, res: Response) {
  try {
    const storage: IStorage = global.useMongoStorage 
      ? mongoDBStorage
      : req.app.locals.storage;
    
    // Base URL from request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Start with static routes - organized by section for better management
    // Core pages with highest priority
    const corePages = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/products', changefreq: 'daily', priority: 0.9 },
      { url: '/search', changefreq: 'hourly', priority: 0.9 }, // Search page gets higher priority and frequency
      { url: '/offers', changefreq: 'daily', priority: 0.8 }, // Offers/discounts page - high priority for e-commerce
    ];
    
    // Healthcare services - moderate to high priority
    const healthcareServices = [
      { url: '/doctors', changefreq: 'daily', priority: 0.8 },
      { url: '/doctors/specialities', changefreq: 'weekly', priority: 0.8 },
      { url: '/hospitals', changefreq: 'weekly', priority: 0.8 },
      { url: '/ai-healthcare', changefreq: 'weekly', priority: 0.8 },
      { url: '/lab-tests', changefreq: 'daily', priority: 0.8 }, // Lab tests are important service
      { url: '/health-packages', changefreq: 'weekly', priority: 0.8 },
      { url: '/services', changefreq: 'weekly', priority: 0.8 },
      { url: '/services/medical-equipment', changefreq: 'weekly', priority: 0.7 },
      { url: '/services/medical-services', changefreq: 'weekly', priority: 0.7 },
      { url: '/services/ambulance-request', changefreq: 'weekly', priority: 0.7 },
    ];
    
    // User-specific pages - low priority as they're personalized
    const userPages = [
      { url: '/cart', changefreq: 'monthly', priority: 0.4 },
      { url: '/checkout', changefreq: 'monthly', priority: 0.4 },
      { url: '/profile', changefreq: 'monthly', priority: 0.4 },
      { url: '/medication-tracking', changefreq: 'monthly', priority: 0.5 },
      { url: '/communication', changefreq: 'monthly', priority: 0.5 },
      { url: '/orders', changefreq: 'monthly', priority: 0.5 },
      { url: '/prescriptions', changefreq: 'monthly', priority: 0.5 },
    ];
    
    // Information pages - moderate priority for trust building
    const infoPages = [
      { url: '/about-us', changefreq: 'monthly', priority: 0.6 },
      { url: '/contact-us', changefreq: 'monthly', priority: 0.6 },
      { url: '/faq', changefreq: 'weekly', priority: 0.7 }, // FAQs are higher priority for customer information
      { url: '/terms-and-conditions', changefreq: 'monthly', priority: 0.5 },
      { url: '/privacy-policy', changefreq: 'monthly', priority: 0.5 },
      { url: '/shipping-policy', changefreq: 'monthly', priority: 0.5 },
      { url: '/return-policy', changefreq: 'monthly', priority: 0.5 },
      { url: '/careers', changefreq: 'monthly', priority: 0.5 },
    ];
    
    // Health information pages - medium-high priority for SEO value
    const healthInfoPages = [
      { url: '/health-articles', changefreq: 'daily', priority: 0.7 },
      { url: '/health-tips', changefreq: 'daily', priority: 0.7 },
      { url: '/medicine-information', changefreq: 'weekly', priority: 0.7 },
      { url: '/disease-conditions', changefreq: 'weekly', priority: 0.7 },
    ];
    
    // Combine all static routes
    const staticRoutes = [
      ...corePages,
      ...healthcareServices,
      ...userPages,
      ...infoPages,
      ...healthInfoPages
    ];

    // Dynamic routes
    let routes = [...staticRoutes];
    
    // Get all product categories with error handling
    let categories = [];
    try {
      categories = await storage.getCategories();
    } catch (error) {
      console.log('Error getting categories for sitemap:', error);
    }
    
    for (const category of categories) {
      routes.push({
        url: `/products/category/${category.id}`,
        changefreq: 'weekly',
        priority: 0.8,
      });
    }
    
    // Get all products - use try/catch in case method is not available
    let products: Product[] = [];
    try {
      products = await storage.getProducts();
    } catch (error) {
      console.log('Error getting products for sitemap:', error);
    }
    
    for (const product of products) {
      // Create the base route entry
      const routeEntry: any = {
        url: `/products/${product.id}`,
        changefreq: 'weekly',
        priority: 0.7
      };
      
      // Add lastmod if the product has an updatedAt property
      // This supports products from both MongoDB and SQL storage
      if ((product as any).updatedAt) {
        routeEntry.lastmod = new Date((product as any).updatedAt).toISOString();
      }
      
      routes.push(routeEntry);
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