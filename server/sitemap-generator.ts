import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { Request, Response } from 'express';
import { mongoDBStorage as dbStorage } from './mongodb-storage';

/**
 * Generates and serves a dynamic XML sitemap for better search engine indexing
 * @param req Express request object
 * @param res Express response object
 */
export async function generateSitemap(req: Request, res: Response) {
  try {
    // Create a sitemap stream
    const smStream = new SitemapStream({
      hostname: `https://${req.headers.host || 'pillnow.com'}`
    });
    
    // Pipe the sitemap to a file for caching
    const writeStream = createWriteStream('./public/sitemap.xml');
    smStream.pipe(writeStream);
    
    // Add static pages to the sitemap
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/products', changefreq: 'daily', priority: 0.9 },
      { url: '/lab-tests', changefreq: 'weekly', priority: 0.8 },
      { url: '/consult', changefreq: 'weekly', priority: 0.8 },
      { url: '/ai-healthcare', changefreq: 'weekly', priority: 0.7 },
      { url: '/health-blog', changefreq: 'weekly', priority: 0.7 },
      { url: '/offers', changefreq: 'daily', priority: 0.8 },
      { url: '/auth', changefreq: 'monthly', priority: 0.5 },
    ];
    
    staticPages.forEach(page => {
      smStream.write(page);
    });
    
    // Add all categories to the sitemap
    try {
      const categories = await dbStorage.getCategories();
      categories.forEach((category: any) => {
        smStream.write({
          url: `/products/category/${category.id}`,
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error('Error adding categories to sitemap:', error);
    }
    
    // Add all products to the sitemap
    try {
      const products = await dbStorage.getProducts();
      products.forEach((product: any) => {
        smStream.write({
          url: `/products/${product.id}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error('Error adding products to sitemap:', error);
    }
    
    // Add all blog articles to the sitemap
    try {
      const articles = await dbStorage.getArticles();
      articles.forEach((article: any) => {
        smStream.write({
          url: `/health-blog/${article.id}`,
          changefreq: 'monthly',
          priority: 0.6,
          lastmod: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error('Error adding articles to sitemap:', error);
    }
    
    // Add all lab tests to the sitemap
    try {
      const labTests = await dbStorage.getLabTests();
      labTests.forEach((test: any) => {
        smStream.write({
          url: `/lab-tests/${test.id}`,
          changefreq: 'monthly',
          priority: 0.6,
          lastmod: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error('Error adding lab tests to sitemap:', error);
    }
    
    // End the sitemap stream
    smStream.end();
    
    // Generate the XML and send the response
    const sitemap = await streamToPromise(smStream);
    res.header('Content-Type', 'application/xml');
    res.send(sitemap.toString());
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).end();
  }
}

/**
 * Generates a robots.txt file for search engine crawling instructions
 * @param req Express request object
 * @param res Express response object
 */
export function generateRobotsTxt(req: Request, res: Response) {
  const hostname = `https://${req.headers.host || 'pillnow.com'}`;
  
  const robotsTxt = `
# www.robotstxt.org/

User-agent: *
Disallow: /auth
Disallow: /admin
Disallow: /profile
Disallow: /cart
Disallow: /checkout
Disallow: /api/
Disallow: /*.json$

Sitemap: ${hostname}/sitemap.xml
  `.trim();
  
  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
}

/**
 * Function to setup sitemap and robots.txt routes
 * @param app Express application
 */
export function setupSeoRoutes(app: any) {
  app.get('/sitemap.xml', generateSitemap);
  app.get('/robots.txt', generateRobotsTxt);
}