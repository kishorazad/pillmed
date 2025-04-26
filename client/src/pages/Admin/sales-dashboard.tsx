import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Download, TrendingUp, Pill, DollarSign, Package, ShoppingCart } from "lucide-react";
import AdminNavigation from '@/components/admin/AdminNavigation';
import { queryClient } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";

// Define the product type
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  manufacturer: string;
  category: string;
  composition: string;
  brand: string;
  totalSales?: number;
  salesRevenue?: number;
}

// Define the sales data type
interface SalesData {
  productId: number;
  productName: string;
  quantity: number;
  revenue: number;
  date: string;
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function SalesDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [timeRange, setTimeRange] = useState('30');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Fetch products data
  const { 
    data: products, 
    isLoading: productsLoading, 
    error: productsError 
  } = useQuery<Product[]>({ 
    queryKey: ['/api/admin/products'], 
    staleTime: 60000,
  });

  // Fetch sales data
  const { 
    data: salesData, 
    isLoading: salesLoading, 
    error: salesError 
  } = useQuery<SalesData[]>({ 
    queryKey: ['/api/admin/sales', { timeRange }], 
    staleTime: 30000,
  });

  // Fetch categories for filtering
  const { data: categories } = useQuery<{name: string, description: string}[]>({ 
    queryKey: ['/api/categories'], 
  });

  // Handle errors
  useEffect(() => {
    if (productsError) {
      toast({
        title: "Error fetching products",
        description: "There was a problem loading product data.",
        variant: "destructive",
      });
    }
    
    if (salesError) {
      toast({
        title: "Error fetching sales data",
        description: "There was a problem loading sales metrics.",
        variant: "destructive",
      });
    }
  }, [productsError, salesError, toast]);

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    
    return products
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.composition?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(product => categoryFilter === 'all' || product.category === categoryFilter)
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          case 'sales':
            return (b.totalSales || 0) - (a.totalSales || 0);
          case 'stock_low':
            return a.stock - b.stock;
          default:
            return 0;
        }
      });
  }, [products, searchTerm, categoryFilter, sortBy]);

  // Prepare data for top selling products chart
  const topSellingProducts = React.useMemo(() => {
    if (!salesData) return [];
    
    // Group by product and sum quantities
    const productSales = salesData.reduce((acc, sale) => {
      const existingProduct = acc.find(p => p.name === sale.productName);
      if (existingProduct) {
        existingProduct.sales += sale.quantity;
        existingProduct.revenue += sale.revenue;
      } else {
        acc.push({ 
          name: sale.productName, 
          sales: sale.quantity,
          revenue: sale.revenue,
          id: sale.productId
        });
      }
      return acc;
    }, [] as {name: string, sales: number, revenue: number, id: number}[]);
    
    // Sort by sales and take top 10
    return productSales
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
  }, [salesData]);

  // Prepare data for category distribution chart
  const categorySales = React.useMemo(() => {
    if (!products || !salesData) return [];
    
    // Create a map of product id to category
    const productCategories = products.reduce((acc, product) => {
      acc[product.id] = product.category;
      return acc;
    }, {} as {[key: number]: string});
    
    // Group sales by category
    const categoryData = salesData.reduce((acc, sale) => {
      const category = productCategories[sale.productId] || 'Uncategorized';
      if (acc[category]) {
        acc[category].sales += sale.quantity;
        acc[category].revenue += sale.revenue;
      } else {
        acc[category] = { 
          name: category, 
          sales: sale.quantity,
          revenue: sale.revenue
        };
      }
      return acc;
    }, {} as {[key: string]: {name: string, sales: number, revenue: number}});
    
    return Object.values(categoryData)
      .sort((a, b) => b.sales - a.sales);
  }, [products, salesData]);

  // Calculate summary metrics
  const summaryMetrics = React.useMemo(() => {
    if (!salesData || !products) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        lowStockItems: 0
      };
    }
    
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.revenue, 0);
    const totalOrders = salesData.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const lowStockItems = products.filter(p => p.stock < 10).length;
    
    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      lowStockItems
    };
  }, [salesData, products]);

  // Export data to CSV
  const exportToCSV = () => {
    if (!products) return;
    
    const csvContent = [
      // Header
      ["ID", "Name", "Category", "Price", "Stock", "Composition", "Manufacturer", "Brand", "Total Sales", "Revenue"].join(","),
      // Rows
      ...filteredProducts.map(product => [
        product.id,
        `"${product.name.replace(/"/g, '""')}"`,
        `"${product.category?.replace(/"/g, '""') || ''}"`,
        product.price,
        product.stock,
        `"${product.composition?.replace(/"/g, '""') || ''}"`,
        `"${product.manufacturer?.replace(/"/g, '""') || ''}"`,
        `"${product.brand?.replace(/"/g, '""') || ''}"`,
        product.totalSales || 0,
        product.salesRevenue || 0
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `product_sales_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (productsLoading || salesLoading) {
    return (
      <div className="h-screen flex flex-col">
        <AdminNavigation />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Loading sales dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <AdminNavigation />
      <div className="flex-1 p-6 bg-background overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Sales Dashboard</h1>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">₹{summaryMetrics.totalRevenue.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">{summaryMetrics.totalOrders.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">₹{summaryMetrics.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">{summaryMetrics.lowStockItems}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, description, or composition..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map(cat => (
                    <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price_low">Price (Low to High)</SelectItem>
                  <SelectItem value="price_high">Price (High to Low)</SelectItem>
                  <SelectItem value="sales">Best Selling</SelectItem>
                  <SelectItem value="stock_low">Low Stock First</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="365">Last Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={exportToCSV}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Based on quantity sold in selected time period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topSellingProducts}
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === 'sales') return [`${value} units`, 'Sales'];
                          return [`₹${value}`, 'Revenue'];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="sales" fill="#0088FE" name="Units Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Distribution of sales across product categories</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySales}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categorySales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => {
                          return [`${value} units (₹${props.payload.revenue})`, props.payload.name];
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Product Data Tab */}
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="top">Top Performers</TabsTrigger>
              <TabsTrigger value="low">Low Stock</TabsTrigger>
              <TabsTrigger value="no-sales">No Recent Sales</TabsTrigger>
            </TabsList>
            
            <div className="flex justify-end mt-4 mb-2">
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === 'cards' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  Cards
                </Button>
                <Button 
                  variant={viewMode === 'table' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  Table
                </Button>
              </div>
            </div>
            
            <TabsContent value="all">
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <ProductsTable products={filteredProducts} />
              )}
            </TabsContent>
            
            <TabsContent value="top">
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts
                    .filter(p => (p.totalSales || 0) > 0)
                    .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
                    .slice(0, 12)
                    .map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  }
                </div>
              ) : (
                <ProductsTable 
                  products={filteredProducts
                    .filter(p => (p.totalSales || 0) > 0)
                    .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
                    .slice(0, 20)
                  } 
                />
              )}
            </TabsContent>
            
            <TabsContent value="low">
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts
                    .filter(p => p.stock < 10)
                    .sort((a, b) => a.stock - b.stock)
                    .map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  }
                </div>
              ) : (
                <ProductsTable 
                  products={filteredProducts
                    .filter(p => p.stock < 10)
                    .sort((a, b) => a.stock - b.stock)
                  } 
                />
              )}
            </TabsContent>
            
            <TabsContent value="no-sales">
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts
                    .filter(p => !(p.totalSales || 0))
                    .map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  }
                </div>
              ) : (
                <ProductsTable 
                  products={filteredProducts
                    .filter(p => !(p.totalSales || 0))
                  } 
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold line-clamp-2">{product.name}</CardTitle>
        <CardDescription className="line-clamp-1">
          {product.brand || product.manufacturer}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-green-500 mr-1" />
            <span className="font-medium">₹{product.price}</span>
          </div>
          <div className="text-sm">
            Stock: <span className={product.stock < 10 ? "text-red-500 font-semibold" : ""}>{product.stock}</span>
          </div>
        </div>
        
        <div className="text-sm">
          <span className="font-medium">Composition:</span> {product.composition || "N/A"}
        </div>
        
        <div className="flex justify-between text-sm">
          <div>
            <span className="font-medium">Category:</span> {product.category || "N/A"}
          </div>
        </div>
        
        {(product.totalSales !== undefined) && (
          <div className="flex justify-between mt-2 pt-2 border-t border-border">
            <div className="flex items-center">
              <ShoppingCart className="h-4 w-4 text-primary mr-1" />
              <span className="text-sm">{product.totalSales} units sold</span>
            </div>
            <div className="text-sm">
              ₹{product.salesRevenue?.toLocaleString() || 0}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProductsTable({ products }: { products: Product[] }) {
  return (
    <div className="border rounded-md overflow-auto max-h-[60vh]">
      <table className="w-full">
        <thead className="bg-muted sticky top-0">
          <tr>
            <th className="text-left p-2 font-medium">Name</th>
            <th className="text-left p-2 font-medium">Category</th>
            <th className="text-left p-2 font-medium">Composition</th>
            <th className="text-left p-2 font-medium">Price</th>
            <th className="text-left p-2 font-medium">Stock</th>
            <th className="text-left p-2 font-medium">Sales</th>
            <th className="text-left p-2 font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
              <td className="p-2">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground">{product.brand || product.manufacturer}</div>
              </td>
              <td className="p-2">{product.category || "N/A"}</td>
              <td className="p-2 max-w-[200px] truncate" title={product.composition}>
                {product.composition || "N/A"}
              </td>
              <td className="p-2">₹{product.price}</td>
              <td className={`p-2 ${product.stock < 10 ? 'text-red-500 font-semibold' : ''}`}>
                {product.stock}
              </td>
              <td className="p-2">{product.totalSales || 0}</td>
              <td className="p-2">₹{product.salesRevenue?.toLocaleString() || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}