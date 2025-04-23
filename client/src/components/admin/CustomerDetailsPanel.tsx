import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  User, 
  Edit, 
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  Heart,
  MapPin,
  AlertCircle,
  Download,
  Upload,
  X,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Type definitions
interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  joinDate: string;
  lastActive: string;
  totalOrders: number;
  totalSpent: number;
  healthProfile?: {
    age?: number;
    gender?: string;
    allergies?: string[];
    medicalConditions?: string[];
    currentMedications?: string[];
  };
  avatar?: string;
}

interface Order {
  id: number;
  orderId: string;
  date: string;
  status: 'delivered' | 'processing' | 'cancelled' | 'returned';
  items: number;
  total: number;
}

const CustomerDetailsPanel = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isViewCustomerDialogOpen, setIsViewCustomerDialogOpen] = useState(false);
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch customers query
  const { 
    data: customers = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/admin/customers'],
    queryFn: async () => {
      try {
        // For development purposes, returning mock data
        // In production, this would be an API call
        return getMockCustomers();
      } catch (err) {
        console.error('Error fetching customers:', err);
        throw err;
      }
    }
  });
  
  // Mock data for development
  const getMockCustomers = (): Customer[] => {
    return [
      {
        id: 1,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        address: '123 Gandhi Street',
        city: 'New Delhi',
        pincode: '110001',
        joinDate: '2023-05-15',
        lastActive: '2025-04-18',
        totalOrders: 12,
        totalSpent: 8450,
        healthProfile: {
          age: 35,
          gender: 'male',
          allergies: ['Penicillin'],
          medicalConditions: ['Hypertension'],
          currentMedications: ['Lisinopril 10mg']
        },
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      {
        id: 2,
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '+91 87654 32109',
        address: '456 Nehru Road',
        city: 'Mumbai',
        pincode: '400001',
        joinDate: '2023-07-22',
        lastActive: '2025-04-20',
        totalOrders: 8,
        totalSpent: 5200,
        healthProfile: {
          age: 28,
          gender: 'female',
          allergies: ['Sulfa drugs'],
          medicalConditions: ['Asthma'],
          currentMedications: ['Albuterol inhaler']
        },
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
      },
      {
        id: 3,
        name: 'Amit Kumar',
        email: 'amit.kumar@example.com',
        phone: '+91 76543 21098',
        address: '789 Tagore Lane',
        city: 'Bangalore',
        pincode: '560001',
        joinDate: '2024-01-10',
        lastActive: '2025-04-15',
        totalOrders: 5,
        totalSpent: 3750,
        healthProfile: {
          age: 42,
          gender: 'male',
          allergies: [],
          medicalConditions: ['Diabetes Type 2'],
          currentMedications: ['Metformin 500mg', 'Glipizide 5mg']
        },
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
      },
      {
        id: 4,
        name: 'Sneha Gupta',
        email: 'sneha.gupta@example.com',
        phone: '+91 65432 10987',
        address: '101 Bose Avenue',
        city: 'Kolkata',
        pincode: '700001',
        joinDate: '2024-02-18',
        lastActive: '2025-04-22',
        totalOrders: 3,
        totalSpent: 1950,
        healthProfile: {
          age: 31,
          gender: 'female',
          allergies: ['Peanuts'],
          medicalConditions: [],
          currentMedications: ['Loratadine 10mg']
        },
        avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
      },
      {
        id: 5,
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        phone: '+91 54321 09876',
        address: '234 Rajaji Street',
        city: 'Chennai',
        pincode: '600001',
        joinDate: '2023-11-05',
        lastActive: '2025-04-19',
        totalOrders: 7,
        totalSpent: 4800,
        healthProfile: {
          age: 45,
          gender: 'male',
          allergies: [],
          medicalConditions: ['Arthritis'],
          currentMedications: ['Ibuprofen 400mg']
        },
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg'
      }
    ];
  };
  
  // Get mock orders for a customer
  const getMockOrders = (customerId: number): Order[] => {
    return [
      {
        id: 1,
        orderId: `ORD-${customerId}-1001`,
        date: '2025-04-10',
        status: 'delivered',
        items: 3,
        total: 1250
      },
      {
        id: 2,
        orderId: `ORD-${customerId}-1002`,
        date: '2025-03-22',
        status: 'delivered',
        items: 2,
        total: 850
      },
      {
        id: 3,
        orderId: `ORD-${customerId}-1003`,
        date: '2025-02-15',
        status: 'delivered',
        items: 4,
        total: 1600
      },
      {
        id: 4,
        orderId: `ORD-${customerId}-1004`,
        date: '2025-01-05',
        status: 'cancelled',
        items: 1,
        total: 550
      },
      {
        id: 5,
        orderId: `ORD-${customerId}-1005`,
        date: '2025-04-20',
        status: 'processing',
        items: 2,
        total: 980
      }
    ];
  };
  
  // Get filtered customers based on search query
  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.address.toLowerCase().includes(query) ||
        customer.city.toLowerCase().includes(query) ||
        customer.pincode.toLowerCase().includes(query)
      );
    });
  };
  
  // Get filtered orders based on status filter
  const getFilteredOrders = () => {
    if (statusFilter === 'all') return customerOrders;
    return customerOrders.filter(order => order.status === statusFilter);
  };
  
  // Handle view customer details
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerOrders(getMockOrders(customer.id));
    setIsViewCustomerDialogOpen(true);
  };
  
  // Handle edit customer
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditCustomerDialogOpen(true);
  };
  
  // Handle add new customer
  const handleAddCustomer = () => {
    setIsAddCustomerDialogOpen(true);
  };
  
  // Export customers to CSV
  const handleExportCustomers = () => {
    setIsExporting(true);
    
    // Simulate export delay
    setTimeout(() => {
      // Convert customers to CSV format
      const headers = ["ID", "Name", "Email", "Phone", "Address", "City", "Pincode", "Join Date", "Total Orders", "Total Spent"];
      const csvContent = [
        headers.join(','),
        ...customers.map(customer => [
          customer.id,
          customer.name,
          customer.email,
          customer.phone,
          `"${customer.address}"`,
          customer.city,
          customer.pincode,
          customer.joinDate,
          customer.totalOrders,
          customer.totalSpent
        ].join(','))
      ].join('\n');
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'pillnow_customers.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
      
      toast({
        title: "Export Successful",
        description: "Customer data has been exported to CSV",
        variant: "default",
      });
    }, 1500);
  };
  
  // Handle import customers
  const handleImportCustomers = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsImporting(true);
        
        // Simulate import delay
        setTimeout(() => {
          setIsImporting(false);
          
          toast({
            title: "Import Successful",
            description: "Customer data has been imported",
            variant: "default",
          });
        }, 1500);
      }
    };
    input.click();
  };
  
  // Get status style for order status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'returned':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customer Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={handleExportCustomers}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={handleImportCustomers}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import
                </>
              )}
            </Button>
            
            <Button onClick={handleAddCustomer}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>
            View and manage all customer profiles, purchase history, and cart data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load customer data. Please try again later.</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredCustomers().length > 0 ? (
                  getFilteredCustomers().map(customer => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={customer.avatar} alt={customer.name} />
                            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500">ID: {customer.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-start gap-1">
                          <MapPin className="h-3 w-3 text-gray-500 mt-1" />
                          <div>
                            <div>{customer.city}</div>
                            <div className="text-xs text-gray-500">{customer.pincode}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span>{customer.joinDate}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Last active: {customer.lastActive}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="h-3 w-3 text-gray-500" />
                            <span>{customer.totalOrders} orders</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Total spent: ₹{customer.totalSpent}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                              <User className="mr-2 h-4 w-4" />
                              <span>View Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Customer</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <ShoppingBag className="mr-2 h-4 w-4" />
                              <span>View Orders</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Heart className="mr-2 h-4 w-4" />
                              <span>Health Profile</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      <div className="text-gray-500">No customers found matching your criteria</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* View Customer Dialog */}
      <Dialog open={isViewCustomerDialogOpen} onOpenChange={setIsViewCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
            <DialogDescription>
              View and manage customer information
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Customer Basic Info Card */}
                <div className="col-span-1">
                  <div className="bg-white border rounded-lg p-4 flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-3">
                      <AvatarImage src={selectedCustomer.avatar} alt={selectedCustomer.name} />
                      <AvatarFallback className="text-2xl">{getInitials(selectedCustomer.name)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Customer ID: {selectedCustomer.id}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                      <span>Joined {selectedCustomer.joinDate}</span>
                    </div>
                    <div className="mt-4 space-y-2 w-full">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="flex-1 text-left">{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="flex-1 text-left">{selectedCustomer.phone}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <div className="flex-1 text-left">
                          <p>{selectedCustomer.address}</p>
                          <p>{selectedCustomer.city}, {selectedCustomer.pincode}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 w-full">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => handleEditCustomer(selectedCustomer)}
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit Customer</span>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Customer Details Tabs */}
                <div className="col-span-3">
                  <Tabs defaultValue="orders" className="w-full">
                    <TabsList className="w-full mb-4">
                      <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
                      <TabsTrigger value="health" className="flex-1">Health Profile</TabsTrigger>
                      <TabsTrigger value="prescriptions" className="flex-1">Prescriptions</TabsTrigger>
                      <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                    </TabsList>
                    
                    {/* Orders Tab */}
                    <TabsContent value="orders">
                      <div className="mb-4 flex justify-between items-center">
                        <div className="text-lg font-semibold">Order History</div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Orders</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredOrders().length > 0 ? (
                            getFilteredOrders().map(order => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.orderId}</TableCell>
                                <TableCell>{order.date}</TableCell>
                                <TableCell>{order.items} items</TableCell>
                                <TableCell>₹{order.total}</TableCell>
                                <TableCell>
                                  <Badge className={getStatusStyle(order.status)}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm">
                                    View Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4">
                                <div className="text-gray-500">No orders found</div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TabsContent>
                    
                    {/* Health Profile Tab */}
                    <TabsContent value="health">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Health Information</h3>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" /> 
                            Edit Health Profile
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Age:</span>
                                  <span className="text-sm font-medium">{selectedCustomer.healthProfile?.age || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Gender:</span>
                                  <span className="text-sm font-medium capitalize">{selectedCustomer.healthProfile?.gender || 'Not specified'}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Allergies</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {selectedCustomer.healthProfile?.allergies && selectedCustomer.healthProfile.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {selectedCustomer.healthProfile.allergies.map((allergy, index) => (
                                    <Badge key={index} variant="outline" className="bg-red-50 text-red-800 border-red-200">
                                      {allergy}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">No known allergies</p>
                              )}
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Medical Conditions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {selectedCustomer.healthProfile?.medicalConditions && selectedCustomer.healthProfile.medicalConditions.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {selectedCustomer.healthProfile.medicalConditions.map((condition, index) => (
                                    <Badge key={index} variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                                      {condition}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">No medical conditions</p>
                              )}
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Current Medications</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {selectedCustomer.healthProfile?.currentMedications && selectedCustomer.healthProfile.currentMedications.length > 0 ? (
                                <ul className="space-y-1">
                                  {selectedCustomer.healthProfile.currentMedications.map((medication, index) => (
                                    <li key={index} className="text-sm">
                                      • {medication}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500">No current medications</p>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Prescriptions Tab */}
                    <TabsContent value="prescriptions">
                      <div className="text-center py-8">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <FileDashed className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">No Prescriptions Found</h3>
                        <p className="text-gray-500 mb-4">This customer doesn't have any prescriptions yet.</p>
                        <Button variant="outline">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Prescription
                        </Button>
                      </div>
                    </TabsContent>
                    
                    {/* Activity Tab */}
                    <TabsContent value="activity">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm">Placed an order <span className="font-medium">ORD-{selectedCustomer.id}-1005</span></p>
                                <p className="text-xs text-gray-500">2025-04-20 at 14:32</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm">Updated profile information</p>
                                <p className="text-xs text-gray-500">2025-04-18 at 10:15</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Heart className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm">Updated health profile</p>
                                <p className="text-xs text-gray-500">2025-04-15 at 09:22</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm">Placed an order <span className="font-medium">ORD-{selectedCustomer.id}-1004</span></p>
                                <p className="text-xs text-gray-500">2025-01-05 at 18:47</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewCustomerDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Customer and Edit Customer dialogs would go here */}
    </div>
  );
};

export function FileDashed(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <path d="M14 2v6h6" />
      <path d="M3 15h6" />
      <path d="M3 10h6" />
      <path d="M3 5h4" />
      <path d="M15 15h6" />
      <path d="M15 20h6" />
    </svg>
  );
}

export default CustomerDetailsPanel;