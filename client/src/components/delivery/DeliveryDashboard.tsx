import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Search, Phone, Calendar, Clock, CheckCircle, Navigation, 
  Filter, AlertCircle, ArrowRight, Check, X, Truck, Package, Home, 
  BarChart2, Users, CreditCard, FileText, RefreshCw, ShoppingBag, 
  CheckCheck, UserCheck, Zap, MoreHorizontal, ChevronRight, Shield,
  Star, Plus
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Types
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

// Sample delivery personnel data
const deliveryPersonnelData: DeliveryPerson[] = [
  {
    id: 1,
    name: "Rajiv Kumar",
    phone: "+91 9876543210",
    email: "rajiv.kumar@example.com",
    status: 'active',
    rating: 4.8,
    deliveriesCompleted: 245,
    joinDate: "2024-01-15",
    vehicle: "Motorcycle",
    area: "South Delhi",
    photo: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    name: "Priya Singh",
    phone: "+91 9876543211",
    email: "priya.singh@example.com",
    status: 'on-delivery',
    rating: 4.6,
    deliveriesCompleted: 198,
    joinDate: "2024-02-05",
    vehicle: "Electric Scooter",
    area: "East Delhi",
    photo: "https://randomuser.me/api/portraits/women/45.jpg"
  },
  {
    id: 3,
    name: "Amit Sharma",
    phone: "+91 9876543212",
    email: "amit.sharma@example.com",
    status: 'active',
    rating: 4.9,
    deliveriesCompleted: 312,
    joinDate: "2023-11-20",
    vehicle: "Motorcycle",
    area: "Central Delhi",
    photo: "https://randomuser.me/api/portraits/men/67.jpg"
  },
  {
    id: 4,
    name: "Neha Patel",
    phone: "+91 9876543213",
    email: "neha.patel@example.com",
    status: 'inactive',
    rating: 4.5,
    deliveriesCompleted: 156,
    joinDate: "2024-03-01",
    vehicle: "Electric Bike",
    area: "North Delhi",
    photo: "https://randomuser.me/api/portraits/women/28.jpg"
  },
  {
    id: 5,
    name: "Sanjay Gupta",
    phone: "+91 9876543214",
    email: "sanjay.gupta@example.com",
    status: 'on-delivery',
    rating: 4.7,
    deliveriesCompleted: 278,
    joinDate: "2023-12-10",
    vehicle: "Motorcycle",
    area: "West Delhi",
    photo: "https://randomuser.me/api/portraits/men/55.jpg"
  }
];

// Sample delivery orders data
const deliveryOrdersData: DeliveryOrder[] = [
  {
    id: "DEL-1001",
    orderId: "ORD-25789",
    customer: {
      name: "Aryan Patel",
      phone: "+91 9876543220",
      address: "42, Vasant Vihar, New Delhi, 110057",
      coordinates: {
        lat: 28.5621,
        lng: 77.1270
      }
    },
    pharmacy: {
      name: "MedLife Pharmacy",
      address: "Shop 5, DLF Phase 1, Gurugram, 122002",
      coordinates: {
        lat: 28.4594,
        lng: 77.0266
      }
    },
    items: [
      { id: 101, name: "Pantocid 40mg", quantity: 2, price: 120 },
      { id: 102, name: "Paracetamol 500mg", quantity: 1, price: 35 },
      { id: 103, name: "Vitamin D3 Supplements", quantity: 1, price: 250 }
    ],
    status: 'pending',
    createdAt: "2025-04-10T09:30:00",
    expectedDeliveryTime: "2025-04-10T12:30:00",
    paymentMethod: "Credit Card",
    paymentStatus: 'paid',
    amount: 405
  },
  {
    id: "DEL-1002",
    orderId: "ORD-25790",
    customer: {
      name: "Meera Reddy",
      phone: "+91 9876543221",
      address: "78, Greater Kailash, New Delhi, 110048",
      coordinates: {
        lat: 28.5412,
        lng: 77.2410
      }
    },
    pharmacy: {
      name: "Apollo Pharmacy",
      address: "Shop 12, Saket, New Delhi, 110017",
      coordinates: {
        lat: 28.5284,
        lng: 77.2100
      }
    },
    items: [
      { id: 104, name: "Insulin Novomix", quantity: 1, price: 850 },
      { id: 105, name: "Glucose Strips", quantity: 2, price: 320 },
      { id: 106, name: "BP Monitor", quantity: 1, price: 1200 }
    ],
    status: 'assigned',
    assignedTo: deliveryPersonnelData[1],
    createdAt: "2025-04-10T10:15:00",
    expectedDeliveryTime: "2025-04-10T13:15:00",
    paymentMethod: "UPI",
    paymentStatus: 'paid',
    amount: 2370
  },
  {
    id: "DEL-1003",
    orderId: "ORD-25791",
    customer: {
      name: "Suresh Menon",
      phone: "+91 9876543222",
      address: "112, Dwarka Sector 12, New Delhi, 110078",
      coordinates: {
        lat: 28.5922,
        lng: 77.0347
      }
    },
    pharmacy: {
      name: "MediPlus Pharmacy",
      address: "Shop 3, Dwarka Sector 10, New Delhi, 110075",
      coordinates: {
        lat: 28.5819,
        lng: 77.0511
      }
    },
    items: [
      { id: 107, name: "Azithromycin 500mg", quantity: 1, price: 180 },
      { id: 108, name: "Cough Syrup", quantity: 1, price: 120 }
    ],
    status: 'picked-up',
    assignedTo: deliveryPersonnelData[4],
    pickupTime: "2025-04-10T10:45:00",
    createdAt: "2025-04-10T10:00:00",
    expectedDeliveryTime: "2025-04-10T11:45:00",
    paymentMethod: "Cash on Delivery",
    paymentStatus: 'cod',
    amount: 300
  },
  {
    id: "DEL-1004",
    orderId: "ORD-25792",
    customer: {
      name: "Rahul Khanna",
      phone: "+91 9876543223",
      address: "25, Malviya Nagar, New Delhi, 110017",
      coordinates: {
        lat: 28.5389,
        lng: 77.2090
      }
    },
    pharmacy: {
      name: "HealthPlus Pharmacy",
      address: "Shop 8, Hauz Khas, New Delhi, 110016",
      coordinates: {
        lat: 28.5494,
        lng: 77.2001
      }
    },
    items: [
      { id: 109, name: "Thyronorm 50mcg", quantity: 1, price: 140 },
      { id: 110, name: "Multivitamin Tablets", quantity: 1, price: 320 },
      { id: 111, name: "Face Masks (Pack of 10)", quantity: 2, price: 200 }
    ],
    status: 'in-transit',
    assignedTo: deliveryPersonnelData[2],
    pickupTime: "2025-04-10T11:00:00",
    createdAt: "2025-04-10T09:45:00",
    expectedDeliveryTime: "2025-04-10T12:15:00",
    paymentMethod: "UPI",
    paymentStatus: 'paid',
    amount: 660
  },
  {
    id: "DEL-1005",
    orderId: "ORD-25793",
    customer: {
      name: "Anita Desai",
      phone: "+91 9876543224",
      address: "56, Rohini Sector 9, New Delhi, 110085",
      coordinates: {
        lat: 28.7158,
        lng: 77.1110
      }
    },
    pharmacy: {
      name: "MedLife Pharmacy",
      address: "Shop 15, Pitampura, New Delhi, 110034",
      coordinates: {
        lat: 28.6991,
        lng: 77.1368
      }
    },
    items: [
      { id: 112, name: "Telmisartan 40mg", quantity: 2, price: 240 },
      { id: 113, name: "Calcium Supplements", quantity: 1, price: 350 }
    ],
    status: 'delivered',
    assignedTo: deliveryPersonnelData[0],
    pickupTime: "2025-04-10T09:30:00",
    deliveryTime: "2025-04-10T10:45:00",
    createdAt: "2025-04-10T08:15:00",
    expectedDeliveryTime: "2025-04-10T11:00:00",
    paymentMethod: "Credit Card",
    paymentStatus: 'paid',
    amount: 590
  },
  {
    id: "DEL-1006",
    orderId: "ORD-25794",
    customer: {
      name: "Vikram Singh",
      phone: "+91 9876543225",
      address: "87, Lajpat Nagar, New Delhi, 110024",
      coordinates: {
        lat: 28.5693,
        lng: 77.2432
      }
    },
    pharmacy: {
      name: "Apollo Pharmacy",
      address: "Shop 7, Defence Colony, New Delhi, 110024",
      coordinates: {
        lat: 28.5754,
        lng: 77.2277
      }
    },
    items: [
      { id: 114, name: "Antibiotic Ointment", quantity: 1, price: 180 },
      { id: 115, name: "Bandages (Pack of 10)", quantity: 1, price: 120 },
      { id: 116, name: "Antiseptic Solution", quantity: 1, price: 90 }
    ],
    status: 'cancelled',
    createdAt: "2025-04-10T10:30:00",
    expectedDeliveryTime: "2025-04-10T13:30:00",
    paymentMethod: "UPI",
    paymentStatus: 'paid',
    amount: 390
  }
];

// Helper components
const StatusBadge = ({ status }: { status: DeliveryOrder['status'] }) => {
  const statusMap = {
    'pending': { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock className="h-3 w-3 mr-1" /> },
    'assigned': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <UserCheck className="h-3 w-3 mr-1" /> },
    'picked-up': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Package className="h-3 w-3 mr-1" /> },
    'in-transit': { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: <Truck className="h-3 w-3 mr-1" /> },
    'delivered': { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCheck className="h-3 w-3 mr-1" /> },
    'cancelled': { color: 'bg-red-100 text-red-800 border-red-200', icon: <X className="h-3 w-3 mr-1" /> }
  };
  
  return (
    <Badge className={statusMap[status].color}>
      {statusMap[status].icon}
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </Badge>
  );
};

const DeliveryStatus = ({ order }: { order: DeliveryOrder }) => {
  // Steps for the delivery process
  const steps = [
    { id: 'pending', label: 'Order Received', icon: <Clock className="h-4 w-4" /> },
    { id: 'assigned', label: 'Assigned', icon: <UserCheck className="h-4 w-4" /> },
    { id: 'picked-up', label: 'Picked Up', icon: <Package className="h-4 w-4" /> },
    { id: 'in-transit', label: 'In Transit', icon: <Truck className="h-4 w-4" /> },
    { id: 'delivered', label: 'Delivered', icon: <CheckCheck className="h-4 w-4" /> }
  ];
  
  // Get the current step index
  const currentStepIndex = order.status === 'cancelled' 
    ? -1 
    : steps.findIndex(step => step.id === order.status);
  
  return (
    <div className="space-y-4">
      {order.status === 'cancelled' ? (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <div>
            <p className="font-medium text-red-800">Order Cancelled</p>
            <p className="text-sm text-red-600">This delivery has been cancelled.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentStepIndex + 1) * 25)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`flex flex-col items-center text-xs ${
                    index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                  }`}
                  style={{ width: '20%' }}
                >
                  <div className={`rounded-full p-1 ${
                    index <= currentStepIndex ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.icon}
                  </div>
                  <span className="mt-1 text-center">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                Expected Delivery: {new Date(order.expectedDeliveryTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Main component
const DeliveryDashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assignDialogOpen, setAssignDialogOpen] = useState<boolean>(false);
  
  // Filter orders based on status and search query
  const filteredOrders = deliveryOrdersData.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  // Handle view order details
  const handleViewOrder = (order: DeliveryOrder) => {
    setSelectedOrder(order);
  };
  
  // Handle assign delivery to personnel
  const handleAssignDelivery = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    setAssignDialogOpen(true);
  };
  
  // Handle status update for an order
  const handleUpdateStatus = (order: DeliveryOrder, newStatus: DeliveryOrder['status']) => {
    // This would be an API call in a real application
    console.log(`Updating order ${order.id} status from ${order.status} to ${newStatus}`);
    
    // For now, we'll just show a mock success
    alert(`Order ${order.id} status updated to ${newStatus}`);
  };
  
  // Calculate statistics
  const totalOrders = deliveryOrdersData.length;
  const deliveredOrders = deliveryOrdersData.filter(order => order.status === 'delivered').length;
  const pendingOrders = deliveryOrdersData.filter(order => 
    ['pending', 'assigned', 'picked-up', 'in-transit'].includes(order.status)
  ).length;
  const cancelledOrders = deliveryOrdersData.filter(order => order.status === 'cancelled').length;
  const activeDeliveryPersonnel = deliveryPersonnelData.filter(person => 
    person.status === 'active' || person.status === 'on-delivery'
  ).length;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
        <p className="text-gray-500">Manage medicine deliveries from stores to customers</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-600">
              <span className="flex items-center text-green-600">
                <ArrowRight className="h-3 w-3 mr-1" />
                <span>{Math.round((deliveredOrders / totalOrders) * 100)}% delivered</span>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Deliveries</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-600">
              <span className="flex items-center text-amber-600">
                <RefreshCw className="h-3 w-3 mr-1" />
                <span>Need attention</span>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Delivery Personnel</p>
                <p className="text-2xl font-bold">{activeDeliveryPersonnel}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-600">
              <span className="flex items-center text-green-600">
                <Check className="h-3 w-3 mr-1" />
                <span>Active personnel</span>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Cancelled Orders</p>
                <p className="text-2xl font-bold">{cancelledOrders}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-600">
              <span className="flex items-center text-red-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>{Math.round((cancelledOrders / totalOrders) * 100)}% cancellation rate</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Delivery Orders</CardTitle>
              <Button size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <CardDescription>Manage all medicine delivery orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search by order ID, customer, or pharmacy..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
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
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewOrder(order)}>
                        <TableCell className="font-medium">
                          <div>{order.id}</div>
                          <div className="text-xs text-gray-500">{order.orderId}</div>
                        </TableCell>
                        <TableCell>
                          <div>{order.customer.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">
                            {order.customer.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>
                          <div>₹{order.amount.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">
                            {order.paymentStatus === 'paid' ? 'Paid' : 'COD'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrder(order);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                        No orders found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* Order Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Order Details</CardTitle>
            <CardDescription>
              {selectedOrder 
                ? `Details for Order ${selectedOrder.id}` 
                : "Select an order to view details"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            {selectedOrder ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedOrder.id}</h3>
                    <p className="text-sm text-gray-500">Order: {selectedOrder.orderId}</p>
                  </div>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Delivery Status</h4>
                  <DeliveryStatus order={selectedOrder} />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Customer Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{selectedOrder.customer.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{selectedOrder.customer.phone}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-1" />
                      <span>{selectedOrder.customer.address}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Pharmacy Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{selectedOrder.pharmacy.name}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-1" />
                      <span>{selectedOrder.pharmacy.address}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                          <span>{item.name}</span>
                          <span className="text-gray-500 ml-2">×{item.quantity}</span>
                        </div>
                        <span>₹{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Amount:</span>
                        <span>₹{selectedOrder.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Payment Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex items-center">
                      <Badge 
                        className={selectedOrder.paymentStatus === 'paid' ? 
                          'bg-green-100 text-green-800' : 
                          'bg-amber-100 text-amber-800'}
                      >
                        {selectedOrder.paymentStatus === 'paid' ? 'Paid' : 'Cash on Delivery'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {selectedOrder.assignedTo && (
                  <>
                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Delivery Person</h4>
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={selectedOrder.assignedTo.photo} alt={selectedOrder.assignedTo.name} />
                          <AvatarFallback>{selectedOrder.assignedTo.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedOrder.assignedTo.name}</div>
                          <div className="text-sm text-gray-500">{selectedOrder.assignedTo.phone}</div>
                          <div className="text-sm text-gray-500">{selectedOrder.assignedTo.vehicle}</div>
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span className="text-sm">{selectedOrder.assignedTo.rating} / 5.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Order Selected</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  Select an order from the list to view its details here.
                </p>
              </div>
            )}
          </CardContent>
          {selectedOrder && (
            <CardFooter className="flex flex-wrap justify-center sm:justify-between gap-2 border-t mt-6 pt-6">
              {selectedOrder.status === 'pending' && (
                <Button 
                  onClick={() => handleAssignDelivery(selectedOrder)}
                  className="w-full sm:w-auto"
                >
                  Assign Delivery Person
                </Button>
              )}
              
              {selectedOrder.status === 'assigned' && (
                <Button 
                  onClick={() => handleUpdateStatus(selectedOrder, 'picked-up')}
                  className="w-full sm:w-auto"
                >
                  Mark as Picked Up
                </Button>
              )}
              
              {selectedOrder.status === 'picked-up' && (
                <Button 
                  onClick={() => handleUpdateStatus(selectedOrder, 'in-transit')}
                  className="w-full sm:w-auto"
                >
                  Mark as In Transit
                </Button>
              )}
              
              {selectedOrder.status === 'in-transit' && (
                <Button 
                  onClick={() => handleUpdateStatus(selectedOrder, 'delivered')}
                  className="w-full sm:w-auto"
                >
                  Mark as Delivered
                </Button>
              )}
              
              {['pending', 'assigned', 'picked-up', 'in-transit'].includes(selectedOrder.status) && (
                <Button 
                  variant="outline" 
                  onClick={() => handleUpdateStatus(selectedOrder, 'cancelled')}
                  className="w-full sm:w-auto"
                >
                  Cancel Order
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* Delivery Personnel Section */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Personnel</CardTitle>
          <CardDescription>Available delivery personnel for medicine delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryPersonnelData.map((person) => (
              <div 
                key={person.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={person.photo} alt={person.name} />
                    <AvatarFallback>{person.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{person.name}</h4>
                        <p className="text-sm text-gray-500">{person.vehicle}</p>
                      </div>
                      <Badge 
                        className={
                          person.status === 'active' ? 'bg-green-100 text-green-800' :
                          person.status === 'on-delivery' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {person.status === 'active' ? 'Available' :
                         person.status === 'on-delivery' ? 'On Delivery' :
                         'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-1 text-sm">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      <span>{person.rating} / 5.0</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Package className="h-3 w-3 mr-1" />
                      <span>{person.deliveriesCompleted} deliveries</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{person.area}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline">
            View All Personnel
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Personnel
          </Button>
        </CardFooter>
      </Card>
      
      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Delivery Person</DialogTitle>
            <DialogDescription>
              Select a delivery person to assign to order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-2">
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-1">Order Details</h4>
              <div className="text-sm text-blue-700">
                <div>Customer: {selectedOrder?.customer.name}</div>
                <div>Pharmacy: {selectedOrder?.pharmacy.name}</div>
                <div className="font-medium mt-1">Total Amount: ₹{selectedOrder?.amount.toFixed(2)}</div>
              </div>
            </div>
            
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {deliveryPersonnelData
                  .filter(person => person.status === 'active')
                  .map((person) => (
                    <div 
                      key={person.id} 
                      className="flex items-start gap-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        // This would be an API call in a real application
                        console.log(`Assigning order ${selectedOrder?.id} to ${person.name}`);
                        
                        // For now, we'll just show a mock success
                        alert(`Order ${selectedOrder?.id} assigned to ${person.name}`);
                        setAssignDialogOpen(false);
                      }}
                    >
                      <Avatar>
                        <AvatarImage src={person.photo} alt={person.name} />
                        <AvatarFallback>{person.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{person.name}</h4>
                            <p className="text-sm text-gray-500">{person.vehicle}</p>
                          </div>
                          <div>
                            <div className="flex items-center text-sm">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              <span>{person.rating} / 5.0</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{person.area}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Package className="h-3 w-3 mr-1" />
                          <span>{person.deliveriesCompleted} deliveries completed</span>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {deliveryPersonnelData.filter(person => person.status === 'active').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Truck className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p>No available delivery personnel at the moment.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryDashboard;