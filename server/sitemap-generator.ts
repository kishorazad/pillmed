import { Request, Response } from 'express';
import { generateSitemap as seoGenerateSitemap } from './seo/sitemap-generator';

/**
 * Generates and serves a dynamic XML sitemap for better search engine indexing
 * @param req Express request object
 * @param res Express response object
 */
export async function generateSitemap(req: Request, res: Response) {
  try {
    const baseUrl = `${req.protocol}://${req.get('host') || 'pillnow.com'}`;
    const sitemap = await seoGenerateSitemap(baseUrl);
    
    res.header('Content-Type', 'application/xml');
    res.header('Content-Length', sitemap.length.toString());
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
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