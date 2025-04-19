import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, AlertCircle, Check, ExternalLink, FileText, Globe, BarChart, Search, Tag, Settings } from 'lucide-react';

interface SeoSettings {
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  ogImage: string;
  googleVerification: string;
  bingVerification: string;
  enableIndexing: boolean;
  sitemapEnabled: boolean;
  robotsTxtEnabled: boolean;
  schemaMarkupEnabled: boolean;
  canonicalUrlEnabled: boolean;
  hreflangEnabled: boolean;
  socialMediaMetaEnabled: boolean;
}

interface SeoAnalytics {
  totalIndexedPages: number;
  topPerformingPages: Array<{
    path: string;
    impressions: number;
    clicks: number;
    position: number;
  }>;
  topKeywords: Array<{
    keyword: string;
    impressions: number;
    clicks: number;
    position: number;
  }>;
  issuesCount: {
    missingTitles: number;
    duplicateTitles: number;
    missingDescriptions: number;
    brokenLinks: number;
    missingAltText: number;
  };
}

const SEODashboard: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SeoSettings>({
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
  });

  // Simulated analytics data (would be fetched from API in production)
  const [analytics, setAnalytics] = useState<SeoAnalytics>({
    totalIndexedPages: 1523,
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
      missingTitles: 3,
      duplicateTitles: 12,
      missingDescriptions: 28,
      brokenLinks: 7,
      missingAltText: 54,
    }
  });

  // Fetch settings from API
  const { isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/admin/seo-settings'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/admin/seo-settings');
        const data = await res.json();
        setSettings(data);
        return data;
      } catch (error) {
        console.error('Error fetching SEO settings:', error);
        // Keep using default settings
        return settings;
      }
    },
    // Disable the query in development if the endpoint doesn't exist
    enabled: false
  });

  // Mutation for saving settings
  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: async (updatedSettings: SeoSettings) => {
      const res = await apiRequest('POST', '/api/admin/seo-settings', updatedSettings);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your SEO settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your SEO settings. Please try again.",
        variant: "destructive",
      });
      console.error('Error saving SEO settings:', error);
    }
  });

  // Generate or regenerate sitemap
  const { mutate: generateSitemap, isPending: isGeneratingSitemap } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/generate-sitemap');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Sitemap generated",
        description: "Your sitemap.xml file has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating sitemap",
        description: "There was a problem generating your sitemap. Please try again.",
        variant: "destructive",
      });
      console.error('Error generating sitemap:', error);
    }
  });

  // Run SEO analysis
  const { mutate: runSeoAnalysis, isPending: isAnalyzing } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/run-seo-analysis');
      return res.json();
    },
    onSuccess: (data) => {
      setAnalytics(data);
      toast({
        title: "SEO analysis complete",
        description: "Your website SEO analysis has been completed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error running SEO analysis",
        description: "There was a problem analyzing your website. Please try again.",
        variant: "destructive",
      });
      console.error('Error running SEO analysis:', error);
    }
  });

  // Handle settings changes
  const handleSettingChange = (key: keyof SeoSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">SEO Dashboard</CardTitle>
            <CardDescription>
              Optimize your website's visibility on search engines
            </CardDescription>
          </div>
          <Button
            onClick={() => window.open(`${window.location.origin}/sitemap.xml`, '_blank')}
            variant="outline"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            View Sitemap
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <TabsTrigger value="overview">
              <BarChart className="mr-2 h-4 w-4" /> 
              Overview
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" /> 
              SEO Settings
            </TabsTrigger>
            <TabsTrigger value="pages">
              <Globe className="mr-2 h-4 w-4" /> 
              Pages & Sitemap
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Search className="mr-2 h-4 w-4" /> 
              Search Analytics
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">Indexed Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.totalIndexedPages}</div>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">SEO Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Object.values(analytics.issuesCount).reduce((a, b) => a + b, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Across {analytics.totalIndexedPages} pages
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">Settings Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      (settings.sitemapEnabled && settings.robotsTxtEnabled) 
                        ? 'bg-green-500' 
                        : 'bg-amber-500'
                    }`}></div>
                    <div className="text-lg font-semibold">
                      {(settings.sitemapEnabled && settings.robotsTxtEnabled) 
                        ? 'Optimized' 
                        : 'Needs Attention'}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {settings.sitemapEnabled ? 'Sitemap enabled' : 'Sitemap disabled'} • 
                    {settings.robotsTxtEnabled ? ' Robots.txt enabled' : ' Robots.txt disabled'}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performing Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topPerformingPages.map((page, index) => (
                      <div key={index} className="flex items-start justify-between">
                        <div>
                          <div className="font-medium truncate max-w-[250px]">{page.path}</div>
                          <div className="text-sm text-muted-foreground">
                            {page.impressions.toLocaleString()} impressions • {page.clicks.toLocaleString()} clicks
                          </div>
                        </div>
                        <Badge variant={index < 2 ? 'default' : 'outline'}>
                          Pos. {page.position.toFixed(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all pages <ExternalLink className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topKeywords.map((keyword, index) => (
                      <div key={index} className="flex items-start justify-between">
                        <div>
                          <div className="font-medium truncate max-w-[250px]">"{keyword.keyword}"</div>
                          <div className="text-sm text-muted-foreground">
                            {keyword.impressions.toLocaleString()} impressions • {keyword.clicks.toLocaleString()} clicks
                          </div>
                        </div>
                        <Badge variant={index < 2 ? 'default' : 'outline'}>
                          Pos. {keyword.position.toFixed(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all keywords <ExternalLink className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">SEO Recommendation</AlertTitle>
              <AlertDescription className="text-amber-700">
                Add more descriptive meta descriptions to 28 pages to improve click-through rates from search results.
              </AlertDescription>
              <Button size="sm" variant="outline" className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100">
                Fix Issues
              </Button>
            </Alert>
            
            <div className="flex justify-between">
              <Button 
                onClick={() => runSeoAnalysis()}
                variant="outline"
                disabled={isAnalyzing}
                className="gap-2"
              >
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart className="h-4 w-4" />}
                Run SEO Analysis
              </Button>
              
              <Button 
                onClick={() => generateSitemap()}
                disabled={isGeneratingSitemap}
                className="gap-2"
              >
                {isGeneratingSitemap ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Generate Sitemap
              </Button>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Global SEO Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultTitle">Default Page Title</Label>
                      <Input
                        id="defaultTitle"
                        value={settings.defaultTitle}
                        onChange={(e) => handleSettingChange('defaultTitle', e.target.value)}
                        placeholder="Enter default title"
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended length: 50-60 characters
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ogImage">Default OG Image URL</Label>
                      <Input
                        id="ogImage"
                        value={settings.ogImage}
                        onChange={(e) => handleSettingChange('ogImage', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 1200x630 pixels
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultDescription">Default Meta Description</Label>
                    <Textarea
                      id="defaultDescription"
                      value={settings.defaultDescription}
                      onChange={(e) => handleSettingChange('defaultDescription', e.target.value)}
                      placeholder="Enter default meta description"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended length: 120-158 characters. Current length: {settings.defaultDescription.length} characters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultKeywords">Default Keywords</Label>
                    <Textarea
                      id="defaultKeywords"
                      value={settings.defaultKeywords}
                      onChange={(e) => handleSettingChange('defaultKeywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate keywords with commas. Use 5-10 relevant keywords.
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Search Engine Verification</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="googleVerification">Google Search Console Verification</Label>
                      <Input
                        id="googleVerification"
                        value={settings.googleVerification}
                        onChange={(e) => handleSettingChange('googleVerification', e.target.value)}
                        placeholder="Enter Google verification code"
                      />
                      <p className="text-xs text-muted-foreground">
                        Format: google-site-verification=XXXXXXXXXX
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bingVerification">Bing Webmaster Tools Verification</Label>
                      <Input
                        id="bingVerification"
                        value={settings.bingVerification}
                        onChange={(e) => handleSettingChange('bingVerification', e.target.value)}
                        placeholder="Enter Bing verification code"
                      />
                      <p className="text-xs text-muted-foreground">
                        Format: msvalidate.01=XXXXXXXXXX
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Indexing & Technical SEO</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="enableIndexing">Enable Search Engine Indexing</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow search engines to index your site
                          </p>
                        </div>
                        <Switch
                          id="enableIndexing"
                          checked={settings.enableIndexing}
                          onCheckedChange={(value) => handleSettingChange('enableIndexing', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sitemapEnabled">Enable XML Sitemap</Label>
                          <p className="text-sm text-muted-foreground">
                            Generate and serve XML sitemap
                          </p>
                        </div>
                        <Switch
                          id="sitemapEnabled"
                          checked={settings.sitemapEnabled}
                          onCheckedChange={(value) => handleSettingChange('sitemapEnabled', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="robotsTxtEnabled">Enable Robots.txt</Label>
                          <p className="text-sm text-muted-foreground">
                            Generate and serve robots.txt file
                          </p>
                        </div>
                        <Switch
                          id="robotsTxtEnabled"
                          checked={settings.robotsTxtEnabled}
                          onCheckedChange={(value) => handleSettingChange('robotsTxtEnabled', value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="schemaMarkupEnabled">Enable Schema Markup</Label>
                          <p className="text-sm text-muted-foreground">
                            Add structured data to improve rich snippets
                          </p>
                        </div>
                        <Switch
                          id="schemaMarkupEnabled"
                          checked={settings.schemaMarkupEnabled}
                          onCheckedChange={(value) => handleSettingChange('schemaMarkupEnabled', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="canonicalUrlEnabled">Enable Canonical URLs</Label>
                          <p className="text-sm text-muted-foreground">
                            Add canonical tags to prevent duplicate content
                          </p>
                        </div>
                        <Switch
                          id="canonicalUrlEnabled"
                          checked={settings.canonicalUrlEnabled}
                          onCheckedChange={(value) => handleSettingChange('canonicalUrlEnabled', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="socialMediaMetaEnabled">Enable Social Media Meta Tags</Label>
                          <p className="text-sm text-muted-foreground">
                            Add Open Graph and Twitter Card tags
                          </p>
                        </div>
                        <Switch
                          id="socialMediaMetaEnabled"
                          checked={settings.socialMediaMetaEnabled}
                          onCheckedChange={(value) => handleSettingChange('socialMediaMetaEnabled', value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save Settings
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
          
          {/* Pages & Sitemap Tab */}
          <TabsContent value="pages">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">Indexed Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{analytics.totalIndexedPages}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">Last Sitemap Update</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold">{new Date().toLocaleDateString()}</div>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">Sitemap Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${settings.sitemapEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div className="text-lg font-semibold">
                        {settings.sitemapEnabled ? 'Active' : 'Disabled'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Page SEO Status</CardTitle>
                  <CardDescription>
                    Overview of SEO issues across all pages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="font-medium">Issue Type</div>
                      <div className="font-medium">Count</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <div>Missing Meta Titles</div>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {analytics.issuesCount.missingTitles}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                        <div>Duplicate Meta Titles</div>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {analytics.issuesCount.duplicateTitles}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <div>Missing Meta Descriptions</div>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {analytics.issuesCount.missingDescriptions}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <div>Broken Links</div>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {analytics.issuesCount.brokenLinks}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                        <div>Missing Image Alt Text</div>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {analytics.issuesCount.missingAltText}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" size="sm">
                    View Detailed Report
                  </Button>
                  <Button variant="outline" size="sm">
                    Fix Issues
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => window.open(`${window.location.origin}/robots.txt`, '_blank')}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Robots.txt
                  <ExternalLink className="h-3 w-3" />
                </Button>
                
                <Button 
                  onClick={() => generateSitemap()}
                  disabled={isGeneratingSitemap}
                  className="gap-2"
                >
                  {isGeneratingSitemap ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  Regenerate Sitemap
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">Average Position</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">4.2</div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <span className="inline-block text-green-500 mr-1">↑ 0.8</span> from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">Total Impressions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">124.5K</div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <span className="inline-block text-green-500 mr-1">↑ 12%</span> from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">Click-Through Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">3.2%</div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <span className="inline-block text-amber-500 mr-1">↓ 0.5%</span> from last month
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Keywords</CardTitle>
                  <CardDescription>
                    Keywords driving the most traffic to your site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="grid grid-cols-5 gap-4 pb-2 text-sm font-medium text-muted-foreground">
                      <div>Keyword</div>
                      <div className="text-right">Impressions</div>
                      <div className="text-right">Clicks</div>
                      <div className="text-right">CTR</div>
                      <div className="text-right">Position</div>
                    </div>
                    
                    {analytics.topKeywords.map((keyword, index) => (
                      <div key={index} className="grid grid-cols-5 gap-4 py-3 border-b last:border-0">
                        <div className="font-medium truncate">{keyword.keyword}</div>
                        <div className="text-right">{keyword.impressions.toLocaleString()}</div>
                        <div className="text-right">{keyword.clicks.toLocaleString()}</div>
                        <div className="text-right">
                          {((keyword.clicks / keyword.impressions) * 100).toFixed(1)}%
                        </div>
                        <div className="text-right">
                          <Badge variant={keyword.position < 5 ? 'default' : 'outline'}>
                            {keyword.position.toFixed(1)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm">
                    View All Keywords
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Keyword Opportunities</CardTitle>
                  <CardDescription>
                    Keywords you could target to improve visibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-blue-500" />
                        <div className="font-medium">medicine home delivery service</div>
                      </div>
                      <Button variant="outline" size="sm">Target</Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-blue-500" />
                        <div className="font-medium">pharmacy delivery near me</div>
                      </div>
                      <Button variant="outline" size="sm">Target</Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-blue-500" />
                        <div className="font-medium">prescription medicine online</div>
                      </div>
                      <Button variant="outline" size="sm">Target</Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-blue-500" />
                        <div className="font-medium">diabetes medicine online purchase</div>
                      </div>
                      <Button variant="outline" size="sm">Target</Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-blue-500" />
                        <div className="font-medium">best online pharmacy app</div>
                      </div>
                      <Button variant="outline" size="sm">Target</Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm">
                    View All Opportunities
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => runSeoAnalysis()}
                  disabled={isAnalyzing}
                  className="gap-2"
                >
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart className="h-4 w-4" />}
                  Refresh Analytics
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SEODashboard;