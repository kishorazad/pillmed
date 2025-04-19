import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart, Legend, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ArrowUpRight, ShoppingCart, User, Database, Activity, Pill, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch overview statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch admin statistics');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Dummy data for visualization until we connect to real API
  const salesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 2000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
    { name: 'Jul', sales: 3490 },
    { name: 'Aug', sales: 2000 },
    { name: 'Sep', sales: 2780 },
    { name: 'Oct', sales: 1890 },
    { name: 'Nov', sales: 2390 },
    { name: 'Dec', sales: 3490 },
  ];

  const usersByRole = [
    { name: 'Customers', value: statsData?.userCounts?.customer || 210 },
    { name: 'Chemists', value: statsData?.userCounts?.chemist || 45 },
    { name: 'Doctors', value: statsData?.userCounts?.doctor || 22 },
    { name: 'Hospitals', value: statsData?.userCounts?.hospital || 18 },
    { name: 'Admins', value: statsData?.userCounts?.admin || 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const popularMedicines = statsData?.topMedicines || [
    { name: 'Paracetamol 500mg', orders: 140 },
    { name: 'Amoxicillin 250mg', orders: 112 },
    { name: 'Montelukast 10mg', orders: 95 },
    { name: 'Lisinopril 20mg', orders: 87 },
    { name: 'Atorvastatin 40mg', orders: 76 },
  ];

  const recentOrders = statsData?.recentOrders || [
    { id: 'ORD-2023-0001', user: 'Rajesh Sharma', amount: 1240, date: '2025-04-19', status: 'Delivered' },
    { id: 'ORD-2023-0002', user: 'Priya Patel', amount: 890, date: '2025-04-18', status: 'Shipped' },
    { id: 'ORD-2023-0003', user: 'Amit Singh', amount: 2300, date: '2025-04-18', status: 'Processing' },
    { id: 'ORD-2023-0004', user: 'Sunita Desai', amount: 750, date: '2025-04-17', status: 'Delivered' },
    { id: 'ORD-2023-0005', user: 'Vikram Mehta', amount: 1600, date: '2025-04-17', status: 'Delivered' },
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || user?.username || 'Administrator'}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <p className="text-sm text-muted-foreground">
            Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 lg:w-[800px] mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{statsData?.totalRevenue?.toLocaleString() || '12,43,540'}</div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData?.totalOrders || '1,452'}</div>
                <p className="text-xs text-muted-foreground">
                  +7% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <User className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData?.totalUsers || '3,642'}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Pill className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData?.totalProducts || '12,578'}</div>
                <p className="text-xs text-muted-foreground">
                  +37 new today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales</CardTitle>
                <CardDescription>Sales trend over the past 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Users by role category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={usersByRole}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {usersByRole.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Medicines & Recent Orders */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Medicines</CardTitle>
                <CardDescription>Most ordered medicines this month</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {popularMedicines.map((medicine, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium">{medicine.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground mr-2">{medicine.orders} orders</span>
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from customers</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {recentOrders.map((order, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{order.id}</span>
                        <span className="text-sm text-muted-foreground">{order.user}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">₹{order.amount}</span>
                        <span className="text-sm text-muted-foreground">{order.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all users and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p>The User Management interface will be displayed here.</p>
                <p className="text-muted-foreground">Navigate to the Users section from the admin menu for detailed management.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Manage your product inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p>The Product Management interface will be displayed here.</p>
                <p className="text-muted-foreground">Navigate to the Products section from the admin menu for detailed management.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Track and manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p>The Order Management interface will be displayed here.</p>
                <p className="text-muted-foreground">Navigate to the Orders section from the admin menu for detailed management.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Insights</CardTitle>
              <CardDescription>Detailed metrics about your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p>The Analytics interface will be displayed here.</p>
                <p className="text-muted-foreground">Navigate to the Insights section from the admin menu for detailed analytics.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p>The Settings interface will be displayed here.</p>
                <p className="text-muted-foreground">Navigate to the Settings section from the admin menu for detailed configuration.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;