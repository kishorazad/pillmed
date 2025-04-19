import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { db } from '../db';

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
      // Fetch dynamic products
      const products = await db.collection('products').find({}, { projection: { _id: 1, updatedAt: 1 } }).toArray();
      
      // Add product pages
      products.forEach(product => {
        sitemapEntries.push({
          url: `/products/${product._id}`,
          priority: 0.8,
          changefreq: 'weekly',
          lastmod: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined
        });
      });
      
      // Fetch dynamic categories
      const categories = await db.collection('categories').find({}, { projection: { name: 1 } }).toArray();
      
      // Add category pages
      categories.forEach(category => {
        const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
        sitemapEntries.push({
          url: `/products/category/${categorySlug}`,
          priority: 0.7,
          changefreq: 'weekly'
        });
      });
      
      // Fetch doctors
      const doctors = await db.collection('doctors').find({}, { projection: { _id: 1 } }).toArray();
      
      // Add doctor pages
      doctors.forEach(doctor => {
        sitemapEntries.push({
          url: `/doctors/${doctor._id}`,
          priority: 0.7,
          changefreq: 'weekly'
        });
      });
      
      // Fetch hospitals
      const hospitals = await db.collection('hospitals').find({}, { projection: { _id: 1 } }).toArray();
      
      // Add hospital pages
      hospitals.forEach(hospital => {
        sitemapEntries.push({
          url: `/hospitals/${hospital._id}`,
          priority: 0.7,
          changefreq: 'weekly'
        });
      });
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