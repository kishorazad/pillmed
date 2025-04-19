import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart 
} from 'recharts';
import { 
  Search, Loader2, ArrowUpRight, TrendingUp, TrendingDown, 
  RefreshCw, Download, AlertCircle, ClipboardList, Calendar,
  PieChart as PieChartIcon, BarChart2, Layers, Activity
} from 'lucide-react';

const ProductAnalytics = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30days");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Fetch product analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/analytics/products', timeRange, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const res = await fetch(`/api/admin/analytics/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch product analytics');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch product categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch top-selling products
  const { data: topProducts, isLoading: topProductsLoading } = useQuery({
    queryKey: ['/api/admin/analytics/top-products', timeRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);
      params.append('limit', '10');
      
      const res = await fetch(`/api/admin/analytics/top-products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch top products');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch inventory status
  const { data: inventoryStatus, isLoading: inventoryLoading } = useQuery({
    queryKey: ['/api/admin/analytics/inventory-status'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics/inventory-status');
      if (!res.ok) throw new Error('Failed to fetch inventory status');
      return res.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Handle export data
  const handleExportData = () => {
    toast({
      title: "Exporting Data",
      description: "Your data is being exported as CSV. Download will start shortly.",
    });
    
    // This would typically be an API call to generate and download the CSV
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your data has been exported successfully.",
      });
    }, 2000);
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Dummy data for overview metrics
  const overviewMetrics = analyticsData?.metrics || {
    totalSales: 1248760,
    totalOrders: 3542,
    averageOrderValue: 352.27,
    conversionRate: 2.8,
    totalRevenue: 8765432,
    totalProfit: 3245678,
    totalProducts: 12578,
    lowStockProducts: 32,
    outOfStockProducts: 8,
  };

  // Sales trend data
  const salesTrendData = analyticsData?.salesTrend || [
    { date: '2025-03-01', sales: 4000 },
    { date: '2025-03-05', sales: 3000 },
    { date: '2025-03-10', sales: 2000 },
    { date: '2025-03-15', sales: 2780 },
    { date: '2025-03-20', sales: 1890 },
    { date: '2025-03-25', sales: 2390 },
    { date: '2025-04-01', sales: 3490 },
    { date: '2025-04-05', sales: 3200 },
    { date: '2025-04-10', sales: 2800 },
    { date: '2025-04-15', sales: 3300 },
    { date: '2025-04-19', sales: 3700 },
  ];

  // Category distribution data
  const categoryDistribution = analyticsData?.categoryDistribution || [
    { name: 'Antibiotics', value: 20 },
    { name: 'Pain Relief', value: 18 },
    { name: 'Vitamins', value: 15 },
    { name: 'Skin Care', value: 12 },
    { name: 'Diabetes', value: 10 },
    { name: 'Others', value: 25 },
  ];

  // Top selling medicines
  const topSellingMedicines = topProducts?.products || [
    { id: 1, name: 'Paracetamol 500mg', sales: 412, revenue: 15650, inStock: true, growth: 12.5 },
    { id: 2, name: 'Amoxicillin 500mg', sales: 387, revenue: 24815, inStock: true, growth: 8.7 },
    { id: 3, name: 'Metformin 500mg', sales: 356, revenue: 18340, inStock: true, growth: -5.2 },
    { id: 4, name: 'Atorvastatin 10mg', sales: 312, revenue: 21654, inStock: true, growth: 15.3 },
    { id: 5, name: 'Lisinopril 20mg', sales: 298, revenue: 17450, inStock: false, growth: 6.8 },
    { id: 6, name: 'Omeprazole 40mg', sales: 276, revenue: 13800, inStock: true, growth: -2.1 },
    { id: 7, name: 'Sertraline 50mg', sales: 268, revenue: 18760, inStock: true, growth: 9.4 },
    { id: 8, name: 'Albuterol Inhaler', sales: 245, revenue: 29400, inStock: true, growth: 22.7 },
    { id: 9, name: 'Levothyroxine 50mcg', sales: 232, revenue: 11600, inStock: false, growth: 1.3 },
    { id: 10, name: 'Clopidogrel 75mg', sales: 218, revenue: 16350, inStock: true, growth: 4.6 },
  ];

  // Inventory status data
  const inventoryData = inventoryStatus?.data || {
    inStock: 10254,
    lowStock: 268,
    outOfStock: 87,
    onOrder: 156,
    totalProducts: 10765,
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medicine Insights & Demand Analytics</h1>
          <p className="text-muted-foreground">
            Track sales performance, inventory, and identify trends
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px] mb-6">
          <TabsTrigger value="overview">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="top-sellers">
            <BarChart2 className="mr-2 h-4 w-4" />
            Top Sellers
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Layers className="mr-2 h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="trends">
            <Activity className="mr-2 h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview metrics cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overviewMetrics.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Medicine Orders</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewMetrics.totalOrders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +7% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overviewMetrics.averageOrderValue)}</div>
                <p className="text-xs text-muted-foreground">
                  -3% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewMetrics.lowStockProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {overviewMetrics.outOfStockProducts} out of stock
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sales trend chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Medicine sales trend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      labelFormatter={(date) => new Date(date as string).toLocaleDateString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category distribution and Top 5 products */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Sales by medicine category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Products</CardTitle>
                <CardDescription>Best-selling medicines this period</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {topSellingMedicines.slice(0, 5).map((medicine, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg font-semibold mr-2">{i + 1}</span>
                        <span className="font-medium">{medicine.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground mr-2">
                          {formatCurrency(medicine.revenue)}
                        </span>
                        {medicine.growth > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="top-sellers">
          {/* Filters for top sellers */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Top selling products table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Medicines</CardTitle>
              <CardDescription>
                Ranked by sales volume during the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topProductsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSellingMedicines
                      .filter(medicine => 
                        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((medicine, index) => (
                        <TableRow key={medicine.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{medicine.name}</TableCell>
                          <TableCell className="text-right">{medicine.sales.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(medicine.revenue)}</TableCell>
                          <TableCell>
                            {medicine.inStock ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                In Stock
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                Out of Stock
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <span className={medicine.growth > 0 ? "text-green-600" : "text-red-600"}>
                                {medicine.growth > 0 ? "+" : ""}{medicine.growth}%
                              </span>
                              {medicine.growth > 0 ? (
                                <TrendingUp className="ml-1 w-4 h-4 text-green-600" />
                              ) : (
                                <TrendingDown className="ml-1 w-4 h-4 text-red-600" />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Top categories chart */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Top Categories by Sales</CardTitle>
              <CardDescription>Sales distribution across medicine categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={categoryDistribution}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" name="Sales Percentage">
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          {/* Inventory summary cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventoryData.totalProducts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total unique products in database
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{inventoryData.inStock.toLocaleString()}</div>
                <Progress className="mt-2" value={(inventoryData.inStock / inventoryData.totalProducts) * 100} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{inventoryData.lowStock.toLocaleString()}</div>
                <Progress className="mt-2" value={(inventoryData.lowStock / inventoryData.totalProducts) * 100} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{inventoryData.outOfStock.toLocaleString()}</div>
                <Progress className="mt-2" value={(inventoryData.outOfStock / inventoryData.totalProducts) * 100} />
              </CardContent>
            </Card>
          </div>

          {/* Inventory distribution chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Inventory Distribution</CardTitle>
              <CardDescription>Current inventory status across all products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "In Stock", value: inventoryData.inStock },
                        { name: "Low Stock", value: inventoryData.lowStock },
                        { name: "Out of Stock", value: inventoryData.outOfStock },
                        { name: "On Order", value: inventoryData.onOrder },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" /> {/* Green */}
                      <Cell fill="#f59e0b" /> {/* Amber */}
                      <Cell fill="#ef4444" /> {/* Red */}
                      <Cell fill="#3b82f6" /> {/* Blue */}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Alert for low stock items */}
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Inventory Alert</AlertTitle>
            <AlertDescription>
              {inventoryData.outOfStock} products are out of stock and {inventoryData.lowStock} are running low. 
              Consider placing orders for these items soon.
            </AlertDescription>
          </Alert>

          {/* Low stock products */}
          <Card>
            <CardHeader>
              <CardTitle>Low Stock & Out of Stock Products</CardTitle>
              <CardDescription>Products that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              {inventoryLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right">Reorder Point</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Last Restock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Placeholder data - would be fetched from API */}
                    <TableRow>
                      <TableCell className="font-medium">Paracetamol 500mg</TableCell>
                      <TableCell>Pain Relief</TableCell>
                      <TableCell className="text-right">15</TableCell>
                      <TableCell className="text-right">50</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Low Stock
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">15 Apr 2025</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Lisinopril 20mg</TableCell>
                      <TableCell>Cardiovascular</TableCell>
                      <TableCell className="text-right">0</TableCell>
                      <TableCell className="text-right">30</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Out of Stock
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">28 Mar 2025</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Metformin 500mg</TableCell>
                      <TableCell>Diabetes</TableCell>
                      <TableCell className="text-right">12</TableCell>
                      <TableCell className="text-right">40</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Low Stock
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">10 Apr 2025</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Atorvastatin 40mg</TableCell>
                      <TableCell>Cardiovascular</TableCell>
                      <TableCell className="text-right">8</TableCell>
                      <TableCell className="text-right">25</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Low Stock
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">5 Apr 2025</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Levothyroxine 50mcg</TableCell>
                      <TableCell>Hormonal</TableCell>
                      <TableCell className="text-right">0</TableCell>
                      <TableCell className="text-right">20</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Out of Stock
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">2 Apr 2025</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          {/* Sales vs. Target */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sales Performance vs Target</CardTitle>
              <CardDescription>Monthly sales performance compared to targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { month: 'Jan', actual: 4200, target: 4000 },
                      { month: 'Feb', actual: 3800, target: 4100 },
                      { month: 'Mar', actual: 4300, target: 4200 },
                      { month: 'Apr', actual: 4500, target: 4300 },
                      { month: 'May', actual: 4100, target: 4400 },
                      { month: 'Jun', actual: 4800, target: 4500 },
                      { month: 'Jul', actual: 5200, target: 4600 },
                      { month: 'Aug', actual: 5500, target: 4700 },
                      { month: 'Sep', actual: 5100, target: 4800 },
                      { month: 'Oct', actual: 5300, target: 4900 },
                      { month: 'Nov', actual: 5600, target: 5000 },
                      { month: 'Dec', actual: 6200, target: 5100 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="target" name="Target" fill="#8884d8" />
                    <Bar dataKey="actual" name="Actual Sales" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Growth Trend Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sales Growth Trend</CardTitle>
              <CardDescription>Year-over-year sales growth percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: 'Jan', growth: 12 },
                      { month: 'Feb', growth: 8 },
                      { month: 'Mar', growth: 15 },
                      { month: 'Apr', growth: 10 },
                      { month: 'May', growth: 5 },
                      { month: 'Jun', growth: 7 },
                      { month: 'Jul', growth: 14 },
                      { month: 'Aug', growth: 18 },
                      { month: 'Sep', growth: 13 },
                      { month: 'Oct', growth: 9 },
                      { month: 'Nov', growth: 11 },
                      { month: 'Dec', growth: 16 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Line 
                      type="monotone" 
                      dataKey="growth" 
                      name="Growth Rate" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Demand Patterns</CardTitle>
              <CardDescription>Medicine demand by seasonal categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: 'Jan', cold: 450, allergy: 200, fever: 350, digestion: 280 },
                      { month: 'Feb', cold: 400, allergy: 220, fever: 320, digestion: 270 },
                      { month: 'Mar', cold: 320, allergy: 310, fever: 290, digestion: 260 },
                      { month: 'Apr', cold: 280, allergy: 380, fever: 270, digestion: 250 },
                      { month: 'May', cold: 230, allergy: 420, fever: 250, digestion: 270 },
                      { month: 'Jun', cold: 180, allergy: 380, fever: 290, digestion: 300 },
                      { month: 'Jul', cold: 150, allergy: 330, fever: 320, digestion: 340 },
                      { month: 'Aug', cold: 170, allergy: 300, fever: 350, digestion: 350 },
                      { month: 'Sep', cold: 220, allergy: 340, fever: 330, digestion: 320 },
                      { month: 'Oct', cold: 290, allergy: 380, fever: 310, digestion: 290 },
                      { month: 'Nov', cold: 360, allergy: 280, fever: 330, digestion: 280 },
                      { month: 'Dec', cold: 430, allergy: 210, fever: 360, digestion: 290 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cold" name="Cold & Flu" stroke="#8884d8" />
                    <Line type="monotone" dataKey="allergy" name="Allergy" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="fever" name="Fever" stroke="#ffc658" />
                    <Line type="monotone" dataKey="digestion" name="Digestion" stroke="#ff8042" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductAnalytics;