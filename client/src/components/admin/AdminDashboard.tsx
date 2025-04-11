import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  ShoppingCart,
  Package,
  Truck,
  CreditCard,
  AlertCircle,
  Calendar,
  FilePieChart,
  FileBarChart,
  FileLineChart,
  Pill,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  FileText,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
  Map,
  Home,
  Hospital,
  Stethoscope
} from 'lucide-react';

// Dashboard cards data
const statCardData = [
  {
    title: 'Total Users',
    value: '45,239',
    change: '+12.5%',
    trend: 'up',
    icon: <Users className="h-5 w-5 text-blue-600" />,
    description: 'Total registered users',
    color: 'blue'
  },
  {
    title: 'Total Orders',
    value: '12,876',
    change: '+18.2%',
    trend: 'up',
    icon: <ShoppingCart className="h-5 w-5 text-green-600" />,
    description: 'Orders processed',
    color: 'green'
  },
  {
    title: 'Total Products',
    value: '8,452',
    change: '+5.3%',
    trend: 'up',
    icon: <Package className="h-5 w-5 text-purple-600" />,
    description: 'Active products',
    color: 'purple'
  },
  {
    title: 'Total Revenue',
    value: '₹24.5M',
    change: '+22.1%',
    trend: 'up',
    icon: <CreditCard className="h-5 w-5 text-amber-600" />,
    description: 'Overall earnings',
    color: 'amber'
  },
  {
    title: 'Active Doctors',
    value: '234',
    change: '+8.7%',
    trend: 'up',
    icon: <Stethoscope className="h-5 w-5 text-red-600" />,
    description: 'Verified medical professionals',
    color: 'red'
  },
  {
    title: 'Active Pharmacies',
    value: '158',
    change: '+14.3%',
    trend: 'up',
    icon: <Pill className="h-5 w-5 text-cyan-600" />,
    description: 'Verified drug stores',
    color: 'cyan'
  },
  {
    title: 'Active Labs',
    value: '73',
    change: '+6.2%',
    trend: 'up',
    icon: <FilePieChart className="h-5 w-5 text-emerald-600" />,
    description: 'Verified testing facilities',
    color: 'emerald'
  },
  {
    title: 'Hospital Partners',
    value: '42',
    change: '+3.8%',
    trend: 'up',
    icon: <Hospital className="h-5 w-5 text-indigo-600" />,
    description: 'Partner medical facilities',
    color: 'indigo'
  }
];

// Sample sales data
const salesData = [
  { month: 'Jan', orders: 1200, revenue: 1800000 },
  { month: 'Feb', orders: 1800, revenue: 2700000 },
  { month: 'Mar', orders: 1600, revenue: 2400000 },
  { month: 'Apr', orders: 2400, revenue: 3600000 },
  { month: 'May', orders: 2200, revenue: 3300000 },
  { month: 'Jun', orders: 2800, revenue: 4200000 },
  { month: 'Jul', orders: 3200, revenue: 4800000 },
  { month: 'Aug', orders: 3600, revenue: 5400000 },
  { month: 'Sep', orders: 3000, revenue: 4500000 },
  { month: 'Oct', orders: 3400, revenue: 5100000 },
  { month: 'Nov', orders: 4000, revenue: 6000000 },
  { month: 'Dec', orders: 4800, revenue: 7200000 }
];

// Sample category distribution data
const categoryData = [
  { name: 'Medicines', value: 45 },
  { name: 'Healthcare Devices', value: 20 },
  { name: 'Personal Care', value: 15 },
  { name: 'Supplements', value: 10 },
  { name: 'Ayurveda', value: 5 },
  { name: 'Others', value: 5 }
];

// Sample users data
const usersData = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh.k@example.com',
    role: 'user',
    status: 'active',
    lastLogin: '2025-04-09 14:32:15',
    ordersCount: 12,
    totalSpent: '₹12,450',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya.s@example.com',
    role: 'pharmacy',
    status: 'active',
    lastLogin: '2025-04-08 10:18:22',
    ordersCount: 0,
    totalSpent: '₹0',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg'
  },
  {
    id: 3,
    name: 'Dr. Anil Gupta',
    email: 'anil.g@example.com',
    role: 'doctor',
    status: 'pending',
    lastLogin: '2025-04-08 08:42:11',
    ordersCount: 0,
    totalSpent: '₹0',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
  },
  {
    id: 4,
    name: 'Meena Patel',
    email: 'meena.p@example.com',
    role: 'user',
    status: 'inactive',
    lastLogin: '2025-03-20 16:05:33',
    ordersCount: 4,
    totalSpent: '₹3,240',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg'
  },
  {
    id: 5,
    name: 'Sanjay Desai',
    email: 'sanjay.d@example.com',
    role: 'laboratory',
    status: 'active',
    lastLogin: '2025-04-09 09:11:45',
    ordersCount: 0,
    totalSpent: '₹0',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
  }
];

// Sample orders data
const ordersData = [
  {
    id: 'ORD-2025-10145',
    customer: 'Rajesh Kumar',
    customerId: 1,
    date: '2025-04-09',
    status: 'delivered',
    items: 3,
    total: '₹1,240',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'ORD-2025-10144',
    customer: 'Ananya Singh',
    customerId: 8,
    date: '2025-04-09',
    status: 'processing',
    items: 2,
    total: '₹780',
    paymentMethod: 'UPI'
  },
  {
    id: 'ORD-2025-10143',
    customer: 'Vikram Mehta',
    customerId: 12,
    date: '2025-04-08',
    status: 'shipped',
    items: 5,
    total: '₹2,340',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'ORD-2025-10142',
    customer: 'Meena Patel',
    customerId: 4,
    date: '2025-04-08',
    status: 'delivered',
    items: 1,
    total: '₹450',
    paymentMethod: 'Cash on Delivery'
  },
  {
    id: 'ORD-2025-10141',
    customer: 'Rahul Joshi',
    customerId: 15,
    date: '2025-04-07',
    status: 'cancelled',
    items: 4,
    total: '₹1,860',
    paymentMethod: 'Debit Card'
  }
];

// Sample hospitals data
const hospitalsData = [
  {
    id: 1,
    name: 'Apollo Hospitals',
    address: '154 Anna Salai, Little Mount, Chennai 600015',
    phone: '+91 44 2829 3333',
    email: 'info@apollohospitals.com',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology'],
    rating: 4.7,
    latitude: 13.0168,
    longitude: 80.2299,
    verified: true
  },
  {
    id: 2,
    name: 'Fortis Healthcare',
    address: 'Sector 62, Phase-VIII, Mohali, Punjab 160062',
    phone: '+91 172 5096 222',
    email: 'contact@fortishealthcare.com',
    specialties: ['Dermatology', 'Gastroenterology', 'Pediatrics', 'Urology'],
    rating: 4.5,
    latitude: 30.7046,
    longitude: 76.7179,
    verified: true
  },
  {
    id: 3,
    name: 'Max Super Speciality Hospital',
    address: '1, Press Enclave Road, Saket, New Delhi 110017',
    phone: '+91 11 2651 5050',
    email: 'info@maxhealthcare.com',
    specialties: ['Pulmonology', 'Nephrology', 'Endocrinology', 'Cardiology'],
    rating: 4.6,
    latitude: 28.6307,
    longitude: 77.2202,
    verified: true
  },
  {
    id: 4,
    name: 'Medanta - The Medicity',
    address: 'CH Baktawar Singh Rd, Sector 38, Gurugram, Haryana 122001',
    phone: '+91 124 4141 414',
    email: 'info@medanta.org',
    specialties: ['Liver Transplant', 'Cardiac Surgery', 'Neurosciences', 'Oncology'],
    rating: 4.8,
    latitude: 28.4511,
    longitude: 77.0724,
    verified: false
  },
  {
    id: 5,
    name: 'Manipal Hospitals',
    address: '98, HAL Airport Road, Bangalore 560017',
    phone: '+91 80 2502 4444',
    email: 'info@manipalhospitals.com',
    specialties: ['Orthopedics', 'Nephrology', 'Neurology', 'Cardiology'],
    rating: 4.6,
    latitude: 12.9592,
    longitude: 77.6483,
    verified: true
  }
];

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Status badges
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    case 'inactive':
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
    case 'pending':
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
    case 'suspended':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Suspended</Badge>;
    case 'delivered':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
    case 'processing':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
    case 'shipped':
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Shipped</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
  }
};

// Role badges
const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Admin</Badge>;
    case 'user':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">User</Badge>;
    case 'pharmacy':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Pharmacy</Badge>;
    case 'doctor':
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Doctor</Badge>;
    case 'laboratory':
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Laboratory</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{role}</Badge>;
  }
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userFilter, setUserFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  
  // Filter users based on selected role
  const filteredUsers = userFilter === 'all' 
    ? usersData 
    : usersData.filter(user => user.role === userFilter);
  
  // Filter orders based on selected status
  const filteredOrders = orderFilter === 'all'
    ? ordersData
    : ordersData.filter(order => order.status === orderFilter);
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your Medadock healthcare platform and monitor performance.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Export Reports</span>
          </Button>
          <Button className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            <span>Manage Hospitals</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users Management</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {statCardData.slice(0, 4).map((stat, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className={`bg-${stat.color}-50 pb-2`}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                    <div className={`p-1.5 rounded-full bg-${stat.color}-100`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500">vs. last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Recent Orders and Sales Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest 5 orders across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-right">{order.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href="#orders">View All Orders</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Orders and revenue for the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesData.slice(-6)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="orders"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Orders"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#82ca9d"
                        name="Revenue (₹)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Professional Accounts Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCardData.slice(4).map((stat, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className={`bg-${stat.color}-50 pb-2`}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                    <div className={`p-1.5 rounded-full bg-${stat.color}-100`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500">{stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Product Category Distribution</CardTitle>
              <CardDescription>Breakdown of products by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
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
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts across the platform</CardDescription>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">Users</SelectItem>
                      <SelectItem value="pharmacy">Pharmacies</SelectItem>
                      <SelectItem value="doctor">Doctors</SelectItem>
                      <SelectItem value="laboratory">Laboratories</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search users..."
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  
                  <Button className="ml-auto">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add New User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>{user.ordersCount}</TableCell>
                        <TableCell>{user.totalSpent}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.status === 'pending' ? (
                              <Button variant="ghost" size="icon" className="text-green-600">
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" className="text-amber-600">
                                {user.status === 'active' ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">5</span> of <span className="font-medium">100</span> users
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trend</CardTitle>
                <CardDescription>New user signups over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { month: 'Jan', users: 340 },
                        { month: 'Feb', users: 290 },
                        { month: 'Mar', users: 410 },
                        { month: 'Apr', users: 380 },
                        { month: 'May', users: 450 },
                        { month: 'Jun', users: 520 }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" name="New Users" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
                <CardDescription>Breakdown of users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Regular Users', value: 80 },
                          { name: 'Pharmacies', value: 8 },
                          { name: 'Doctors', value: 6 },
                          { name: 'Laboratories', value: 4 },
                          { name: 'Admins', value: 2 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
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
          </div>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>Monitor and manage all orders</CardDescription>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search orders..."
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Orders
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>{order.total}</TableCell>
                        <TableCell>{order.paymentMethod}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <Button variant="ghost" size="icon" className="text-red-600">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">5</span> of <span className="font-medium">234</span> orders
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Order Trends</CardTitle>
                <CardDescription>Order volume by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" name="Orders" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Current order statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Processing', value: 15 },
                          { name: 'Shipped', value: 25 },
                          { name: 'Delivered', value: 55 },
                          { name: 'Cancelled', value: 5 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#a855f7" />
                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>2025 financial data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Bar dataKey="revenue" name="Revenue (₹)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Year-over-Year Comparison</CardTitle>
                <CardDescription>Revenue growth comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month"
                        type="category"
                        allowDuplicatedCategory={false}
                        categories={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                      <Line 
                        data={salesData.map(item => ({ month: item.month, revenue: item.revenue }))}
                        dataKey="revenue" 
                        name="2025" 
                        stroke="#8884d8" 
                      />
                      <Line 
                        data={salesData.map(item => ({ month: item.month, revenue: item.revenue * 0.85 }))}
                        dataKey="revenue" 
                        name="2024" 
                        stroke="#82ca9d" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Product Categories</CardTitle>
                <CardDescription>Sales by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { category: 'Medicines', sales: 42 },
                        { category: 'Healthcare Devices', sales: 18 },
                        { category: 'Personal Care', sales: 14 },
                        { category: 'Supplements', sales: 12 },
                        { category: 'Ayurveda', sales: 8 },
                        { category: 'Others', sales: 6 }
                      ]}
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" name="Sales %" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Credit Card', value: 35 },
                          { name: 'Debit Card', value: 25 },
                          { name: 'UPI', value: 30 },
                          { name: 'Cash on Delivery', value: 8 },
                          { name: 'Others', value: 2 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
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
          </div>
        </TabsContent>
        
        {/* Hospitals Tab */}
        <TabsContent value="hospitals" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Hospital Management</CardTitle>
                  <CardDescription>Manage hospital partners across the platform</CardDescription>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Hospitals</SelectItem>
                      <SelectItem value="verified">Verified Only</SelectItem>
                      <SelectItem value="pending">Pending Verification</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search hospitals..."
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  
                  <Button className="ml-auto">
                    <Hospital className="mr-2 h-4 w-4" />
                    Add New Hospital
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hospital Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Specialties</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hospitalsData.map((hospital) => (
                      <TableRow key={hospital.id}>
                        <TableCell>
                          <div className="font-medium">{hospital.name}</div>
                          <div className="text-sm text-gray-500">{hospital.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[250px] truncate">{hospital.address}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {hospital.specialties.slice(0, 2).map((specialty, index) => (
                              <Badge key={index} variant="outline">{specialty}</Badge>
                            ))}
                            {hospital.specialties.length > 2 && (
                              <Badge variant="outline">+{hospital.specialties.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">{hospital.rating}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {hospital.verified ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Map className="h-4 w-4" />
                            </Button>
                            {!hospital.verified && (
                              <Button variant="ghost" size="icon" className="text-green-600">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">5</span> of <span className="font-medium">42</span> hospitals
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hospital Geographic Distribution</CardTitle>
                <CardDescription>Hospital partners by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { region: 'North India', count: 15 },
                        { region: 'South India', count: 12 },
                        { region: 'East India', count: 8 },
                        { region: 'West India', count: 7 }
                      ]}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="region" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Hospitals" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Specialty Distribution</CardTitle>
                <CardDescription>Hospital specialties by count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { specialty: 'Cardiology', count: 35 },
                        { specialty: 'Orthopedics', count: 32 },
                        { specialty: 'Neurology', count: 28 },
                        { specialty: 'Oncology', count: 25 },
                        { specialty: 'Pediatrics', count: 22 },
                        { specialty: 'Dermatology', count: 18 }
                      ]}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="specialty" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Hospitals" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;