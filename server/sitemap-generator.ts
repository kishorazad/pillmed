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
  
  // Enhanced robots.txt route with industry-leading configurations
  router.get('/robots.txt', async (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const storage: IStorage = global.useMongoStorage 
      ? mongoDBStorage
      : req.app.locals.storage;
    
    // Try to get SEO settings
    let enableIndexing = true;
    try {
      if (typeof storage.getSeoSettings === 'function') {
        const settings = await storage.getSeoSettings();
        enableIndexing = settings?.enableIndexing !== undefined ? settings.enableIndexing : true;
      }
    } catch (error) {
      console.log('Error fetching SEO settings for robots.txt, using defaults:', error);
    }
    
    // Create an enhanced robots.txt file with detailed rules
    // Based on best practices from top pharmacy websites
    let robotsTxt = '';
    
    if (enableIndexing) {
      robotsTxt = `
# Website: PillNow - India's Leading Online Pharmacy & Healthcare Platform
# Updated: ${new Date().toISOString().split('T')[0]}

# Allow all crawlers (default)
User-agent: *
Allow: /
Allow: /products/
Allow: /products/category/
Allow: /doctors/
Allow: /health-articles/
Allow: /services/
Allow: /about-us/
Allow: /contact-us/
Allow: /faq/

# Disallow private or sensitive areas
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /cart/
Disallow: /profile/
Disallow: /orders/
Disallow: /prescriptions/
Disallow: /*?*order=
Disallow: /*?*password=
Disallow: /*?*token=

# Optimize crawl budget for large pharmacy catalog
# Slower crawl rate for Googlebot to prevent server overload with 10 lakh+ products
User-agent: Googlebot
Crawl-delay: 1

# Prevent media files from being indexed directly
User-agent: Googlebot-Image
Disallow: /uploads/prescriptions/
Allow: /uploads/products/
Allow: /uploads/categories/

# Prevent mobile-specific duplicates
User-agent: Googlebot-Mobile
Allow: /

# Special rules for AI website indexing models
User-agent: GPTBot
Disallow: /user-generated-content/
Disallow: /prescriptions/
Allow: /health-articles/
Allow: /medicine-information/
Allow: /products/
Allow: /disease-conditions/

# Sitemap references - comprehensive set for large pharmacy catalog
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemaps/products-sitemap.xml
Sitemap: ${baseUrl}/sitemaps/categories-sitemap.xml
Sitemap: ${baseUrl}/sitemaps/health-articles-sitemap.xml
Sitemap: ${baseUrl}/sitemaps/doctors-sitemap.xml

# Host directive to specify canonical hostname
Host: ${req.get('host')}
      `.trim();
    } else {
      // If indexing is disabled in settings, disallow all bots
      robotsTxt = `
# Website: PillNow - India's Leading Online Pharmacy & Healthcare Platform
# Indexing currently disabled

User-agent: *
Disallow: /
      `.trim();
    }
    
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
    
    // Define category type
    interface Category {
      id: number | string;
      name: string;
    }

    // Get all product categories with error handling
    let categories: Category[] = [];
    try {
      categories = await storage.getCategories() as Category[];
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
    
    // Enhanced sitemap generation with additional format support
    // Define streaming options for strongly typed sitemap generation
    interface ExtendedNamespaces {
      news?: boolean;
      xhtml?: boolean;
      image?: boolean;
      video?: boolean;
      custom?: Array<{name: string, url: string}>;
    }
    
    interface SitemapStreamOptions {
      hostname: string;
      xmlns?: ExtendedNamespaces;
    }
    
    // Create a sitemap stream with extended options (follows best practices from top pharmacy sites)
    const stream = new SitemapStream({ 
      hostname: baseUrl,
      xmlns: {
        // Default namespaces
        news: true,       // Adds support for Google News
        xhtml: true,      // Adds support for alternate language pages
        image: true,      // Adds support for image sitemaps
        video: true,      // Adds support for video sitemaps
        // Custom namespaces for additional functionality
        custom: [
          {
            name: 'mobile',
            url: 'http://www.google.com/schemas/sitemap-mobile/1.0'
          },
          {
            name: 'codesearch',
            url: 'http://www.google.com/schemas/sitemap-codesearch/1.0'
          }
        ]
      } as ExtendedNamespaces
    } as SitemapStreamOptions);
    
    // Try to get SEO settings from storage
    // Define interface for SEO settings to ensure TypeScript compatibility
    interface SitemapSeoSettings {
      sitemapIncludeImages?: boolean;
      sitemapChangeFrequency?: string;
      sitemapPriority?: number;
    }
    
    let settings: SitemapSeoSettings | null = null;
    try {
      if (typeof storage.getSeoSettings === 'function') {
        settings = await storage.getSeoSettings() as SitemapSeoSettings;
      }
    } catch (error) {
      console.log('Error fetching SEO settings, using defaults:', error);
    }

    // Set defaults if settings not found with fallback to true (industry standard)
    const sitemapIncludeImages = settings?.sitemapIncludeImages !== undefined ? 
      settings.sitemapIncludeImages : true;
    
    // Process routes to add image information for products, articles, and doctors
    // This significantly improves image SEO and discovery following patterns from 1mg, PharmEasy, and Netmeds
    let enhancedRoutes = [];
    
    // Define types for articles and doctors to avoid implicit any[] types
    interface Article {
      id: number | string;
      title?: string;
      imageUrl?: string;
    }
    
    interface Doctor {
      id: number | string;
      name?: string;
      profileImage?: string;
      profile?: {
        name?: string;
        imageUrl?: string;
      };
      specialization?: string;
    }
    
    // Pre-fetch required data for efficiency
    let articles: Article[] = [];
    try {
      if (typeof storage.getArticles === 'function') {
        articles = await storage.getArticles() as Article[];
      }
    } catch (error) {
      console.log('Error fetching articles for sitemap:', error);
    }
    
    let doctors: Doctor[] = [];
    try {
      if (typeof storage.getDoctors === 'function') {
        const doctorsResult = await storage.getDoctors();
        if (Array.isArray(doctorsResult)) {
          doctors = doctorsResult as Doctor[];
        }
      }
    } catch (error) {
      console.log('Error fetching doctors for sitemap:', error);
    }
    
    // Process each route to enhance with images and metadata
    for (const route of routes) {
      // Handle product images
      if (route.url.startsWith('/products/') && sitemapIncludeImages) {
        const productId = route.url.split('/').pop();
        const product = products.find(p => p.id.toString() === productId);
        
        if (product && product.imageUrl) {
          // Enhanced product image entry with pharmaceutical-specific metadata
          // This follows the patterns of leading pharmacy platforms
          const imgEntry: any = {
            url: product.imageUrl,
            caption: product.name,
            title: `${product.name} ${product.quantity || ''}`,
            geoLocation: 'India'
          };
          
          // Add additional image metadata when available (composition, brand, etc.)
          // Check for extended product properties safely using type assertion
          const extendedProduct = product as any;
          
          if (extendedProduct.composition) {
            imgEntry.caption += ` - ${extendedProduct.composition}`;
          }
          
          if (product.brand) {
            imgEntry.title += ` by ${product.brand}`;
          }
          
          enhancedRoutes.push({
            ...route,
            img: [imgEntry],
            // Add mobile specific tag for better mobile indexing
            mobile: true,
            // Add language alternatives if needed
            links: [
              { lang: 'en', url: `${baseUrl}${route.url}` },
              { lang: 'hi', url: `${baseUrl}/hi${route.url}` }
            ]
          });
          continue;
        }
      }
      
      // Handle article images
      else if (route.url.startsWith('/health-articles/') && sitemapIncludeImages) {
        try {
          const articleId = route.url.split('/').pop() || '';
          let article: any = null;
          
          // Use pre-fetched articles
          if (articles && articles.length > 0) {
            article = articles.find((a: Article) => a.id && a.id.toString() === articleId);
          }
          
          if (article && article.imageUrl) {
            enhancedRoutes.push({
              ...route,
              img: [
                {
                  url: article.imageUrl,
                  caption: article.title || 'Health Article',
                  title: article.title || 'Health Article',
                  geoLocation: 'India'
                }
              ],
              mobile: true,
              // Important for health content to specify languages
              links: [
                { lang: 'en', url: `${baseUrl}${route.url}` },
                { lang: 'hi', url: `${baseUrl}/hi${route.url}` }
              ]
            });
            continue;
          }
        } catch (error) {
          console.log('Error processing article for sitemap:', error);
        }
      }
      
      // Handle doctor images
      else if (route.url.startsWith('/doctors/') && sitemapIncludeImages) {
        try {
          const doctorId = route.url.split('/').pop() || '';
          let doctor: any = null;
          
          // Use pre-fetched doctors
          if (doctors && doctors.length > 0) {
            doctor = doctors.find((d: Doctor) => d.id && d.id.toString() === doctorId);
          }
          
          // Extract doctor information safely
          if (doctor) {
            // Check doctor data
            const doctorImage = doctor.profileImage || 
                               (doctor.profile ? doctor.profile.imageUrl : null) ||
                               null;
                               
            const doctorName = doctor.name || 
                              (doctor.profile ? doctor.profile.name : null) || 
                              'Doctor';
                              
            const doctorSpecialization = doctor.specialization || 'Medical Doctor';
                                
            if (doctorImage) {
              enhancedRoutes.push({
                ...route,
                img: [
                  {
                    url: doctorImage,
                    caption: `Dr. ${doctorName}, ${doctorSpecialization}`,
                    title: `Dr. ${doctorName} - ${doctorSpecialization} at PillNow`,
                    geoLocation: 'India'
                  }
                ],
                mobile: true,
                links: [
                  { lang: 'en', url: `${baseUrl}${route.url}` },
                  { lang: 'hi', url: `${baseUrl}/hi${route.url}` }
                ]
              });
              continue;
            }
          }
        } catch (error) {
          console.log('Error processing doctor for sitemap:', error);
        }
      }
      
      // Add the original route if no enhancements were made
      enhancedRoutes.push(route);
    }
    
    // Add all enhanced routes to the sitemap
    const sitemapData = await streamToPromise(
      Readable.from(enhancedRoutes).pipe(stream)
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