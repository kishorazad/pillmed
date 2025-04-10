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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Clock,
  Package,
  ShoppingCart,
  Truck,
  CreditCard,
  AlertCircle,
  Calendar,
  Box,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  FileText,
  Star,
  Phone,
  MapPin,
  Navigation,
  CheckCircle2,
  Briefcase,
  Map,
  Home,
  Building,
  BarChart4,
  User,
  CheckCircle,
  XCircle,
  UserCheck,
  PlusCircle,
  Edit,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Wallet,
  Store
} from 'lucide-react';

// Define types
interface DeliveryPerson {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'on-delivery';
  rating: number;
  deliveriesCompleted: number;
  joinDate: string;
  vehicle: string;
  area: string;
  photo: string;
}

interface DeliveryOrder {
  id: string;
  orderId: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  };
  pharmacy: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  };
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
  status: 'pending' | 'assigned' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';
  assignedTo?: DeliveryPerson;
  pickupTime?: string;
  deliveryTime?: string;
  expectedDeliveryTime?: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'cod';
  amount: number;
}

// Sample data for delivery personnel
const deliveryPersonnel: DeliveryPerson[] = [
  {
    id: 101,
    name: 'Ajay Kumar',
    phone: '+91 87654 12398',
    email: 'ajay.k@delivery1mg.com',
    status: 'active',
    rating: 4.8,
    deliveriesCompleted: 1245,
    joinDate: '2023-06-15',
    vehicle: 'Motorcycle',
    area: 'South Delhi',
    photo: 'https://randomuser.me/api/portraits/men/34.jpg'
  },
  {
    id: 102,
    name: 'Priya Verma',
    phone: '+91 98765 43210',
    email: 'priya.v@delivery1mg.com',
    status: 'on-delivery',
    rating: 4.9,
    deliveriesCompleted: 987,
    joinDate: '2023-08-22',
    vehicle: 'Electric Scooter',
    area: 'East Delhi',
    photo: 'https://randomuser.me/api/portraits/women/45.jpg'
  },
  {
    id: 103,
    name: 'Rajesh Singh',
    phone: '+91 76543 21098',
    email: 'rajesh.s@delivery1mg.com',
    status: 'inactive',
    rating: 4.2,
    deliveriesCompleted: 543,
    joinDate: '2024-01-10',
    vehicle: 'Bicycle',
    area: 'North Delhi',
    photo: 'https://randomuser.me/api/portraits/men/67.jpg'
  },
  {
    id: 104,
    name: 'Sunita Rao',
    phone: '+91 65432 10987',
    email: 'sunita.r@delivery1mg.com',
    status: 'active',
    rating: 4.7,
    deliveriesCompleted: 876,
    joinDate: '2023-11-05',
    vehicle: 'Motorcycle',
    area: 'Central Delhi',
    photo: 'https://randomuser.me/api/portraits/women/28.jpg'
  },
  {
    id: 105,
    name: 'Vikram Mehta',
    phone: '+91 54321 09876',
    email: 'vikram.m@delivery1mg.com',
    status: 'on-delivery',
    rating: 4.6,
    deliveriesCompleted: 654,
    joinDate: '2023-09-18',
    vehicle: 'Electric Scooter',
    area: 'West Delhi',
    photo: 'https://randomuser.me/api/portraits/men/55.jpg'
  }
];

// Sample data for delivery orders
const deliveryOrders: DeliveryOrder[] = [
  {
    id: 'DEL-2025-4001',
    orderId: 'ORD-2025-10145',
    customer: {
      name: 'Rajesh Kumar',
      phone: '+91 98765 43211',
      address: '123, Green Park, New Delhi 110016',
      coordinates: {
        lat: 28.569,
        lng: 77.206
      }
    },
    pharmacy: {
      name: '1mg Pharmacy - Green Park',
      address: '45, Main Market, Green Park, New Delhi 110016',
      coordinates: {
        lat: 28.561,
        lng: 77.204
      }
    },
    items: [
      {
        id: 1001,
        name: 'Paracetamol 500mg',
        quantity: 2,
        price: 25.5
      },
      {
        id: 1002,
        name: 'Azithromycin 500mg',
        quantity: 1,
        price: 120
      },
      {
        id: 1003,
        name: 'Vitamin D3 60K',
        quantity: 1,
        price: 150
      }
    ],
    status: 'in-transit',
    assignedTo: deliveryPersonnel[1],
    pickupTime: '2025-04-09 15:30:00',
    expectedDeliveryTime: '2025-04-09 16:30:00',
    createdAt: '2025-04-09 14:15:00',
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    amount: 321
  },
  {
    id: 'DEL-2025-4002',
    orderId: 'ORD-2025-10144',
    customer: {
      name: 'Ananya Singh',
      phone: '+91 87654 32109',
      address: '56, Vasant Vihar, New Delhi 110057',
      coordinates: {
        lat: 28.559,
        lng: 77.156
      }
    },
    pharmacy: {
      name: '1mg Warehouse - Saket',
      address: '12, Saket District Center, New Delhi 110017',
      coordinates: {
        lat: 28.524,
        lng: 77.214
      }
    },
    items: [
      {
        id: 1004,
        name: 'Blood Glucose Monitor',
        quantity: 1,
        price: 1250
      },
      {
        id: 1005,
        name: 'Glucose Test Strips (Pack of 50)',
        quantity: 1,
        price: 850
      }
    ],
    status: 'pending',
    createdAt: '2025-04-09 14:00:00',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    amount: 2100
  },
  {
    id: 'DEL-2025-4003',
    orderId: 'ORD-2025-10143',
    customer: {
      name: 'Vikram Mehta',
      phone: '+91 76543 21098',
      address: '78, Hauz Khas, New Delhi 110016',
      coordinates: {
        lat: 28.553,
        lng: 77.201
      }
    },
    pharmacy: {
      name: '1mg Pharmacy - Malviya Nagar',
      address: '34, Main Market, Malviya Nagar, New Delhi 110017',
      coordinates: {
        lat: 28.537,
        lng: 77.211
      }
    },
    items: [
      {
        id: 1006,
        name: 'Omeprazole 20mg',
        quantity: 2,
        price: 110
      },
      {
        id: 1007,
        name: 'Cetirizine 10mg',
        quantity: 1,
        price: 45
      },
      {
        id: 1008,
        name: 'Multivitamin Tablets',
        quantity: 1,
        price: 195
      },
      {
        id: 1009,
        name: 'Calcium Supplements',
        quantity: 1,
        price: 250
      }
    ],
    status: 'assigned',
    assignedTo: deliveryPersonnel[4],
    createdAt: '2025-04-08 17:30:00',
    expectedDeliveryTime: '2025-04-09 18:30:00',
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    amount: 710
  },
  {
    id: 'DEL-2025-4004',
    orderId: 'ORD-2025-10142',
    customer: {
      name: 'Meena Patel',
      phone: '+91 65432 10987',
      address: '145, Lajpat Nagar, New Delhi 110024',
      coordinates: {
        lat: 28.570,
        lng: 77.240
      }
    },
    pharmacy: {
      name: '1mg Pharmacy - Lajpat Nagar',
      address: '23, Main Market, Lajpat Nagar, New Delhi 110024',
      coordinates: {
        lat: 28.569,
        lng: 77.237
      }
    },
    items: [
      {
        id: 1010,
        name: 'Blood Pressure Monitor',
        quantity: 1,
        price: 1850
      }
    ],
    status: 'delivered',
    assignedTo: deliveryPersonnel[0],
    pickupTime: '2025-04-08 11:15:00',
    deliveryTime: '2025-04-08 12:30:00',
    createdAt: '2025-04-08 10:00:00',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'cod',
    amount: 1850
  },
  {
    id: 'DEL-2025-4005',
    orderId: 'ORD-2025-10141',
    customer: {
      name: 'Rahul Joshi',
      phone: '+91 54321 09876',
      address: '34, Karol Bagh, New Delhi 110005',
      coordinates: {
        lat: 28.651,
        lng: 77.190
      }
    },
    pharmacy: {
      name: '1mg Warehouse - Saket',
      address: '12, Saket District Center, New Delhi 110017',
      coordinates: {
        lat: 28.524,
        lng: 77.214
      }
    },
    items: [
      {
        id: 1011,
        name: 'Metformin 500mg',
        quantity: 2,
        price: 120
      },
      {
        id: 1012,
        name: 'Insulin Syringes (Pack of 10)',
        quantity: 1,
        price: 350
      },
      {
        id: 1013,
        name: 'Glucose Powder',
        quantity: 1,
        price: 280
      }
    ],
    status: 'cancelled',
    createdAt: '2025-04-07 15:45:00',
    paymentMethod: 'Debit Card',
    paymentStatus: 'paid',
    amount: 870
  }
];

// Statistics data for delivery dashboard
const deliveryStats = [
  {
    title: 'Orders Today',
    value: 86,
    change: '+12%',
    trend: 'up',
    icon: <Package className="h-5 w-5 text-blue-600" />
  },
  {
    title: 'Active Deliveries',
    value: 32,
    change: '+8%',
    trend: 'up',
    icon: <Truck className="h-5 w-5 text-green-600" />
  },
  {
    title: 'Avg. Delivery Time',
    value: '38 min',
    change: '-5%',
    trend: 'down',
    icon: <Clock className="h-5 w-5 text-amber-600" />
  },
  {
    title: 'On-time Rate',
    value: '94.5%',
    change: '+2.1%',
    trend: 'up',
    icon: <CheckCircle2 className="h-5 w-5 text-purple-600" />
  }
];

// Get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>;
    case 'assigned':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Assigned</Badge>;
    case 'picked-up':
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Picked Up</Badge>;
    case 'in-transit':
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">In Transit</Badge>;
    case 'delivered':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
    case 'active':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    case 'inactive':
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
    case 'on-delivery':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">On Delivery</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
  }
};

// Star Rating component
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center">
      <span className="font-medium mr-1">{rating.toFixed(1)}</span>
      <div className="flex text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-xs">
            {i < fullStars ? "★" : (i === fullStars && hasHalfStar ? "★" : "☆")}
          </span>
        ))}
      </div>
    </div>
  );
};

// Main Delivery Dashboard Component
const DeliveryDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [deliveryPersonFilter, setDeliveryPersonFilter] = useState('all');
  const [viewOrderDialog, setViewOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [assignDialog, setAssignDialog] = useState(false);
  
  // Filter orders based on selected status
  const filteredOrders = orderStatusFilter === 'all'
    ? deliveryOrders
    : deliveryOrders.filter(order => order.status === orderStatusFilter);
  
  // Filter delivery personnel based on selected status
  const filteredPersonnel = deliveryPersonFilter === 'all'
    ? deliveryPersonnel
    : deliveryPersonnel.filter(person => person.status === deliveryPersonFilter);
  
  // Handle view order details
  const handleViewOrder = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    setViewOrderDialog(true);
  };
  
  // Handle assign delivery person
  const handleAssignDelivery = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    setAssignDialog(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
          <p className="text-gray-500">Track and manage medicine deliveries from stores to customers</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </Button>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Create Delivery</span>
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {deliveryStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last week
                  </p>
                </div>
                <div className="p-2 bg-gray-100 rounded-full">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Delivery Orders</TabsTrigger>
          <TabsTrigger value="personnel">Delivery Personnel</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Delivery Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>All Delivery Orders</CardTitle>
                  <CardDescription>Manage and track all delivery orders</CardDescription>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="picked-up">Picked Up</SelectItem>
                      <SelectItem value="in-transit">In Transit</SelectItem>
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
                      <TableHead>Pharmacy/Store</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivery Person</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div className="max-w-[180px] truncate">{order.customer.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[180px] truncate">{order.pharmacy.name}</div>
                        </TableCell>
                        <TableCell>{order.createdAt.split(' ')[0]}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {order.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={order.assignedTo.photo} />
                                <AvatarFallback>{order.assignedTo.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span className="truncate max-w-[120px]">{order.assignedTo.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>₹{order.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                              Details
                            </Button>
                            {order.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAssignDelivery(order)}
                              >
                                Assign
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
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">5</span> of <span className="font-medium">25</span> orders
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
          
          {/* Active Deliveries Map Card */}
          <Card>
            <CardHeader>
              <CardTitle>Active Deliveries Map</CardTitle>
              <CardDescription>Live tracking of ongoing deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 border rounded-md h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 max-w-md mx-auto">
                    The live map would display real-time locations of delivery personnel, customers, and pharmacies with routing information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Delivery Personnel Tab */}
        <TabsContent value="personnel" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Delivery Personnel</CardTitle>
                  <CardDescription>Manage delivery staff and track performance</CardDescription>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={deliveryPersonFilter} onValueChange={setDeliveryPersonFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on-delivery">On Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search personnel..."
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  
                  <Button className="ml-auto">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Add Delivery Person
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPersonnel.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={person.photo} alt={person.name} />
                              <AvatarFallback>{person.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{person.name}</div>
                              <div className="text-sm text-gray-500">{person.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(person.status)}</TableCell>
                        <TableCell>
                          <StarRating rating={person.rating} />
                        </TableCell>
                        <TableCell>{person.area}</TableCell>
                        <TableCell>{person.vehicle}</TableCell>
                        <TableCell>{person.deliveriesCompleted}</TableCell>
                        <TableCell>{person.joinDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">5</span> of <span className="font-medium">25</span> delivery personnel
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
          
          {/* Performance Metrics Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Delivery efficiency and ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Average Delivery Time</Label>
                      <span>38 min</span>
                    </div>
                    <Progress value={68} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Target: 35 min</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Delivery Success Rate</Label>
                      <span>98.5%</span>
                    </div>
                    <Progress value={98.5} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Target: 98%</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Customer Rating</Label>
                      <span>4.7/5</span>
                    </div>
                    <Progress value={94} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Target: 4.5/5</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>On-Time Delivery</Label>
                      <span>94.5%</span>
                    </div>
                    <Progress value={94.5} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Target: 95%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>This month's best delivery personnel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliveryPersonnel
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 3)
                    .map((person, index) => (
                      <div key={person.id} className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-green-100">
                            <AvatarImage src={person.photo} alt={person.name} />
                            <AvatarFallback>{person.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium">{person.name}</div>
                          <div className="flex justify-between items-center">
                            <StarRating rating={person.rating} />
                            <span className="text-sm text-gray-500">{person.deliveriesCompleted} deliveries</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Awards are announced monthly</span>
                    <Button variant="outline" size="sm">View All</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Volumes</CardTitle>
                <CardDescription>Daily delivery counts for the last week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-gray-50 rounded-md flex items-center justify-center">
                  <BarChart4 className="h-16 w-16 text-gray-300" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Delivery Times</CardTitle>
                <CardDescription>Average times by order size and distance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-gray-50 rounded-md flex items-center justify-center">
                  <BarChart4 className="h-16 w-16 text-gray-300" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
                <CardDescription>Ratings and feedback summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-green-500"></div>
                      <span>5 Stars</span>
                    </div>
                    <span>68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-green-300"></div>
                      <span>4 Stars</span>
                    </div>
                    <span>24%</span>
                  </div>
                  <Progress value={24} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-yellow-400"></div>
                      <span>3 Stars</span>
                    </div>
                    <span>6%</span>
                  </div>
                  <Progress value={6} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-orange-400"></div>
                      <span>2 Stars</span>
                    </div>
                    <span>1%</span>
                  </div>
                  <Progress value={1} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-red-500"></div>
                      <span>1 Star</span>
                    </div>
                    <span>1%</span>
                  </div>
                  <Progress value={1} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Delivery Personnel Stats</CardTitle>
                <CardDescription>Active vs. Inactive breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-md text-center">
                      <div className="text-3xl font-bold text-green-700">32</div>
                      <div className="text-sm text-gray-600">Active</div>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-md text-center">
                      <div className="text-3xl font-bold text-amber-700">18</div>
                      <div className="text-sm text-gray-600">On Delivery</div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <div className="text-3xl font-bold text-gray-700">5</div>
                      <div className="text-sm text-gray-600">Inactive</div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-md text-center">
                      <div className="text-3xl font-bold text-blue-700">3</div>
                      <div className="text-sm text-gray-600">New Hires</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <div className="font-medium">Total Personnel</div>
                      <div className="text-2xl font-bold">58</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">Avg. Deliveries/Person</div>
                      <div className="text-2xl font-bold">14.2/day</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-blue-500"></div>
                      <span>Prepaid - Credit/Debit Card</span>
                    </div>
                    <span>42%</span>
                  </div>
                  <Progress value={42} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-green-500"></div>
                      <span>Prepaid - UPI</span>
                    </div>
                    <span>38%</span>
                  </div>
                  <Progress value={38} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-purple-500"></div>
                      <span>Prepaid - Wallet</span>
                    </div>
                    <span>8%</span>
                  </div>
                  <Progress value={8} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-amber-500"></div>
                      <span>Cash on Delivery</span>
                    </div>
                    <span>12%</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">Prepaid Orders</div>
                    <div className="text-xl font-bold">88%</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">COD Orders</div>
                    <div className="text-xl font-bold">12%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* View Order Dialog */}
      <Dialog open={viewOrderDialog} onOpenChange={setViewOrderDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Delivery Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Order #${selectedOrder.id} | ${selectedOrder.orderId}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="font-medium">{selectedOrder.createdAt}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Payment</div>
                  <div className="font-medium">
                    {selectedOrder.paymentStatus === 'paid' ? (
                      <span className="text-green-600">Paid</span>
                    ) : (
                      <span className="text-amber-600">Cash on Delivery</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Customer and Pharmacy Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">Customer</div>
                      <div className="text-gray-700">{selectedOrder.customer.name}</div>
                      <div className="text-sm text-gray-500">{selectedOrder.customer.phone}</div>
                      <Separator className="my-2" />
                      <div className="text-sm text-gray-700 flex items-start gap-1">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                        <span>{selectedOrder.customer.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Store className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">Pharmacy/Store</div>
                      <div className="text-gray-700">{selectedOrder.pharmacy.name}</div>
                      <Separator className="my-2" />
                      <div className="text-sm text-gray-700 flex items-start gap-1">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                        <span>{selectedOrder.pharmacy.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delivery Person (if assigned) */}
              {selectedOrder.assignedTo && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedOrder.assignedTo.photo} alt={selectedOrder.assignedTo.name} />
                      <AvatarFallback>{selectedOrder.assignedTo.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Delivery Person</div>
                      <div className="text-gray-700">{selectedOrder.assignedTo.name}</div>
                      <div className="text-sm text-gray-500">{selectedOrder.assignedTo.phone}</div>
                    </div>
                    <div className="ml-auto">
                      <StarRating rating={selectedOrder.assignedTo.rating} />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Order Items */}
              <div>
                <div className="font-medium mb-2">Order Items</div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₹{(item.quantity * item.price).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">Total Amount</TableCell>
                        <TableCell className="text-right font-bold">₹{selectedOrder.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* Timeline */}
              <div>
                <div className="font-medium mb-2">Delivery Timeline</div>
                <div className="border rounded-lg p-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Order Created</div>
                        <div className="text-sm text-gray-500">{selectedOrder.createdAt}</div>
                      </div>
                    </div>
                    
                    {selectedOrder.assignedTo && (
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Assigned to {selectedOrder.assignedTo.name}</div>
                          <div className="text-sm text-gray-500">
                            {selectedOrder.pickupTime ? selectedOrder.pickupTime.split(' ')[0] : 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedOrder.pickupTime && (
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Picked Up from Store</div>
                          <div className="text-sm text-gray-500">{selectedOrder.pickupTime}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedOrder.status === 'in-transit' && (
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                          <Truck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">In Transit</div>
                          <div className="text-sm text-gray-500">
                            Expected delivery by {selectedOrder.expectedDeliveryTime}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedOrder.deliveryTime && (
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Delivered to Customer</div>
                          <div className="text-sm text-gray-500">{selectedOrder.deliveryTime}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedOrder.status === 'cancelled' && (
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                          <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium">Order Cancelled</div>
                          <div className="text-sm text-gray-500">
                            Unable to process delivery
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between gap-2">
                {selectedOrder.status === 'pending' && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setViewOrderDialog(false);
                      handleAssignDelivery(selectedOrder);
                    }}
                  >
                    Assign Delivery Person
                  </Button>
                )}
                
                {selectedOrder.status === 'in-transit' && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    Mark as Delivered
                  </Button>
                )}
                
                {(selectedOrder.status === 'pending' || selectedOrder.status === 'assigned') && (
                  <Button variant="outline" className="text-red-600">
                    Cancel Delivery
                  </Button>
                )}
                
                <Button variant="outline" onClick={() => setViewOrderDialog(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Assign Delivery Person Dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Delivery Person</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Order #${selectedOrder.id} | ${selectedOrder.customer.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-start gap-2">
                  <Store className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Pickup: {selectedOrder.pharmacy.name}</div>
                    <div className="text-xs text-gray-500">{selectedOrder.pharmacy.address}</div>
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Deliver to: {selectedOrder.customer.name}</div>
                    <div className="text-xs text-gray-500">{selectedOrder.customer.address}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Select Delivery Person</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a delivery person" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryPersonnel
                      .filter(person => person.status === 'active')
                      .map(person => (
                        <SelectItem key={person.id} value={person.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{person.name}</span>
                            <span className="text-gray-500">({person.area})</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Estimated Delivery Time</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Delivery Instructions (Optional)</Label>
                <Input placeholder="Add special instructions for delivery person" />
              </div>
              
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setAssignDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setAssignDialog(false)}>
                  Assign Delivery
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryDashboard;