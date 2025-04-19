import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { db } from '../db';
import { products, categories } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Generates a sitemap for the entire website
 * Includes main pages, product pages, category pages, etc.
 * This should be used with a route handler to serve the sitemap.xml file
 */
export async function generateSitemap(baseUrl: string): Promise<Buffer> {
  try {
    // Create a sitemap stream
    const sitemapStream = new SitemapStream({
      hostname: baseUrl
    });
    
    // Create an array to hold all sitemap entries
    const sitemapEntries: Array<{
      url: string;
      changefreq?: string;
      priority?: number;
      lastmod?: string;
    }> = [];
    
    // Add static pages
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/products', priority: 0.9, changefreq: 'daily' },
      { url: '/services', priority: 0.8, changefreq: 'weekly' },
      { url: '/doctors', priority: 0.8, changefreq: 'weekly' },
      { url: '/hospitals', priority: 0.8, changefreq: 'weekly' },
      { url: '/ai-healthcare', priority: 0.7, changefreq: 'weekly' },
      { url: '/services/medical-equipment', priority: 0.7, changefreq: 'weekly' },
      { url: '/services/medical-services', priority: 0.7, changefreq: 'weekly' },
      { url: '/about', priority: 0.6, changefreq: 'monthly' },
      { url: '/contact', priority: 0.6, changefreq: 'monthly' },
      { url: '/terms', priority: 0.5, changefreq: 'yearly' },
      { url: '/privacy', priority: 0.5, changefreq: 'yearly' },
    ];
    
    sitemapEntries.push(...staticPages);
    
    try {
      // Fetch dynamic products using Drizzle
      const productsList = await db.select({
        id: products.id,
      }).from(products);
      
      // Add product pages
      productsList.forEach(product => {
        sitemapEntries.push({
          url: `/product/${product.id}`,
          priority: 0.8,
          changefreq: 'weekly'
        });
      });
      
      // Fetch dynamic categories using Drizzle
      const categoriesList = await db.select({
        id: categories.id,
        name: categories.name,
      }).from(categories);
      
      // Add category pages
      categoriesList.forEach(category => {
        sitemapEntries.push({
          url: `/products/category/${category.id}`,
          priority: 0.7,
          changefreq: 'weekly'
        });
      });
      
      // Add doctor pages if the doctors table exists
      try {
        const doctors = await db.execute(sql`SELECT id FROM doctors`);
        if (doctors.rows && doctors.rows.length > 0) {
          doctors.rows.forEach((doctor: any) => {
            sitemapEntries.push({
              url: `/doctors/${doctor.id}`,
              priority: 0.7,
              changefreq: 'weekly'
            });
          });
        }
      } catch (error) {
        // Table might not exist, continue without doctors
        console.log('Doctors table not found for sitemap');
      }
      
      // Add hospital pages if the hospitals table exists
      try {
        const hospitals = await db.execute(sql`SELECT id FROM hospitals`);
        if (hospitals.rows && hospitals.rows.length > 0) {
          hospitals.rows.forEach((hospital: any) => {
            sitemapEntries.push({
              url: `/hospitals/${hospital.id}`,
              priority: 0.7,
              changefreq: 'weekly'
            });
          });
        }
      } catch (error) {
        // Table might not exist, continue without hospitals
        console.log('Hospitals table not found for sitemap');
      }
    } catch (err) {
      console.error('Error fetching dynamic pages for sitemap:', err);
      // Continue with static pages if there's a database error
    }
    
    // Create a readable stream from the sitemap entries
    const stream = Readable.from(sitemapEntries).pipe(sitemapStream);
    
    // Generate the XML
    const sitemap = await streamToPromise(stream);
    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}

// Add this handler to your Express app:
/*
app.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const sitemap = await generateSitemap(baseUrl);
    
    res.header('Content-Type', 'application/xml');
    res.header('Content-Length', sitemap.length.toString());
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
});
*/