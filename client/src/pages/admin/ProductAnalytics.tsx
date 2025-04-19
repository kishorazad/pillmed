import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  Activity,
  Circle,
  Search
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

// Custom color palette for charts
const CHART_COLORS = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
  "#FF9F40", "#8AC926", "#1982C4", "#6A4C93", "#F15BB5"
];

// Product Analytics Component
const ProductAnalytics = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch analytics data
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['/api/admin/analytics/products', timeRange, categoryFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await apiRequest('GET', `/api/admin/analytics/products?${params.toString()}`);
      return response.json();
    },
  });

  // Fetch top products data
  const { data: topProductsData, isLoading: isLoadingTopProducts } = useQuery({
    queryKey: ['/api/admin/analytics/top-products', timeRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);
      
      const response = await apiRequest('GET', `/api/admin/analytics/top-products?${params.toString()}`);
      return response.json();
    },
  });

  // Fetch inventory status
  const { data: inventoryData, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['/api/admin/analytics/inventory-status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/analytics/inventory-status');
      return response.json();
    },
  });

  // Generate pie chart data for inventory status
  const inventoryStatusData = inventoryData?.statusDistribution?.map(item => ({
    name: item.status,
    value: item.count
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Analytics</h1>
        <p className="text-muted-foreground">
          Analyze product performance and inventory status.
        </p>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="painkillers">Painkillers</SelectItem>
                <SelectItem value="antibiotics">Antibiotics</SelectItem>
                <SelectItem value="vitamins">Vitamins</SelectItem>
                <SelectItem value="skincare">Skincare</SelectItem>
                <SelectItem value="ayurvedic">Ayurvedic</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={timeRange}
              onValueChange={setTimeRange}
            >
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 90 Days</SelectItem>
                <SelectItem value="year">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{analyticsData?.totalProducts || 0}</div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Sales */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{analyticsData?.totalSales || 0}</div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">₹{analyticsData?.revenue?.toLocaleString() || '0'}</div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingInventory ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{inventoryData?.lowStockCount || 0}</div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Section */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
          <TabsTrigger value="trending">Trending Products</TabsTrigger>
        </TabsList>
        
        {/* Sales Analysis Tab */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>
                Product sales over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoadingAnalytics ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.salesTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" name="Units Sold" />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>
                  Sales distribution by product category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {isLoadingAnalytics ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-56 w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData?.categoryDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(analyticsData?.categoryDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value} units`, props.payload.name]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sales by Price Range</CardTitle>
                <CardDescription>
                  Distribution of sales by product price ranges
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {isLoadingAnalytics ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-56 w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData?.priceRangeDistribution || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#8884d8" name="Units Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Inventory Status Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status Overview</CardTitle>
              <CardDescription>
                Current inventory levels and distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoadingInventory ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {inventoryStatusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === 'In Stock' ? '#4ade80' : 
                            entry.name === 'Low Stock' ? '#facc15' : 
                            entry.name === 'Out of Stock' ? '#f87171' : 
                            CHART_COLORS[index % CHART_COLORS.length]
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} products`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
              <CardDescription>
                Products that need reordering soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInventory ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : inventoryData?.lowStockProducts?.length > 0 ? (
                <div className="space-y-4">
                  {inventoryData.lowStockProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-yellow-100 rounded-full">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            SKU: {product.sku} | Category: {product.category}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-medium">Stock</div>
                          <div>{product.stock} units</div>
                        </div>
                        <Button size="sm" variant="outline">
                          Reorder
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No low stock products at the moment
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Trending Products Tab */}
        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Best performing products in the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoadingTopProducts ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topProductsData?.topSellingProducts || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" name="Units Sold" />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Trending Up</CardTitle>
                <CardDescription>
                  Products with increasing popularity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTopProducts ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : topProductsData?.trendingUp?.length > 0 ? (
                  <div className="space-y-4">
                    {topProductsData.trendingUp.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-100 rounded-full">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="font-medium">{product.name}</div>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <span>+{product.growthRate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No trending products found
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Trending Down</CardTitle>
                <CardDescription>
                  Products with decreasing sales
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTopProducts ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : topProductsData?.trendingDown?.length > 0 ? (
                  <div className="space-y-4">
                    {topProductsData.trendingDown.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-red-100 rounded-full">
                            <Activity className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="font-medium">{product.name}</div>
                        </div>
                        <div className="flex items-center gap-2 text-red-600">
                          <span>{product.growthRate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No declining products found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductAnalytics;