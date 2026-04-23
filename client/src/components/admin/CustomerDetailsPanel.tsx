import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  MoreHorizontal,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  ShoppingCart,
  FileText,
  AlertCircle,
  Package,
  Pill,
  ClipboardList,
  CalendarClock,
  CreditCard
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  profileImage?: string;
  createdAt: string;
  lastOrderDate?: string;
  totalOrders: number;
  totalSpent: number;
  preferredPaymentMethod?: 'card' | 'upi' | 'cod' | 'netbanking';
  status: 'active' | 'inactive';
  hasMedicalHistory: boolean;
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  total: number;
  paymentMethod: string;
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: string;
}

interface Prescription {
  id: string;
  date: string;
  doctor: string;
  hospital?: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  notes?: string;
  status: 'active' | 'completed' | 'expired';
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  hospital: string;
  type: 'consultation' | 'follow-up' | 'test';
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface Cart {
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  subtotal: number;
  lastUpdated: string;
}

interface MedicalHistory {
  allergies: string[];
  chronicConditions: string[];
  currentMedications: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  pastSurgeries: {
    name: string;
    date: string;
    hospital?: string;
  }[];
  bloodGroup?: string;
  height?: string;
  weight?: string;
}

const CustomerDetailsPanel = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const { toast } = useToast();
  
  // Fetch customers
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
        // return getMockCustomers();
        // const res = await fetch("/api/admin/customers");
// return res.json();
const res = await fetch("/api/admin/customers");
const data = await res.json();

return Array.isArray(data) ? data : data.data || [];

      } catch (err) {
        console.error('Error fetching customers:', err);
        throw err;
      }
    }
  });
  
  // Get customer orders
  const { 
    data: customerOrders = [], 
    isLoading: isLoadingOrders 
  } = useQuery({
    queryKey: ['/api/admin/customers', selectedCustomer?.id, 'orders'],
    queryFn: async () => {
      if (!selectedCustomer) return [];
      
      try {
        // For development, returning mock data
        return getMockOrders(selectedCustomer.id);
      } catch (err) {
        console.error('Error fetching customer orders:', err);
        throw err;
      }
    },
    enabled: !!selectedCustomer,
  });
  
  // Get customer prescriptions
  const { 
    data: customerPrescriptions = [], 
    isLoading: isLoadingPrescriptions 
  } = useQuery({
    queryKey: ['/api/admin/customers', selectedCustomer?.id, 'prescriptions'],
    queryFn: async () => {
      if (!selectedCustomer) return [];
      
      try {
        // For development, returning mock data
        return getMockPrescriptions(selectedCustomer.id);
      } catch (err) {
        console.error('Error fetching customer prescriptions:', err);
        throw err;
      }
    },
    enabled: !!selectedCustomer && selectedCustomer.hasMedicalHistory,
  });
  
  // Get customer appointments
  const { 
    data: customerAppointments = [], 
    isLoading: isLoadingAppointments 
  } = useQuery({
    queryKey: ['/api/admin/customers', selectedCustomer?.id, 'appointments'],
    queryFn: async () => {
      if (!selectedCustomer) return [];
      
      try {
        // For development, returning mock data
        return getMockAppointments(selectedCustomer.id);
      } catch (err) {
        console.error('Error fetching customer appointments:', err);
        throw err;
      }
    },
    enabled: !!selectedCustomer,
  });
  
  // Get customer cart
  const { 
    data: customerCart, 
    isLoading: isLoadingCart 
  } = useQuery({
    queryKey: ['/api/admin/customers', selectedCustomer?.id, 'cart'],
    queryFn: async () => {
      if (!selectedCustomer) return null;
      
      try {
        // For development, returning mock data
        return getMockCart(selectedCustomer.id);
      } catch (err) {
        console.error('Error fetching customer cart:', err);
        throw err;
      }
    },
    enabled: !!selectedCustomer,
  });
  
  // Get customer medical history
  const { 
    data: customerMedicalHistory, 
    isLoading: isLoadingMedicalHistory 
  } = useQuery({
    queryKey: ['/api/admin/customers', selectedCustomer?.id, 'medical-history'],
    queryFn: async () => {
      if (!selectedCustomer || !selectedCustomer.hasMedicalHistory) return null;
      
      try {
        // For development, returning mock data
        // return getMockMedicalHistory(selectedCustomer.id);
      } catch (err) {
        console.error('Error fetching customer medical history:', err);
        throw err;
      }
    },
    enabled: !!selectedCustomer && selectedCustomer.hasMedicalHistory,
  });
  
  // Mock data for development
  const getMockCustomers = (): Customer[] => {
    return [
      {
        id: 1,
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "+91 98765 43210",
        address: {
          street: "123, Park Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001"
        },
        profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
        createdAt: "2024-10-15",
        lastOrderDate: "2025-04-10",
        totalOrders: 8,
        totalSpent: 4500,
        preferredPaymentMethod: "card",
        status: "active",
        hasMedicalHistory: true
      },
      {
        id: 2,
        name: "Priya Patel",
        email: "priya.patel@example.com",
        phone: "+91 87654 32109",
        address: {
          street: "456, Lake View Road",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001"
        },
        profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
        createdAt: "2024-11-20",
        lastOrderDate: "2025-04-05",
        totalOrders: 5,
        totalSpent: 2800,
        preferredPaymentMethod: "upi",
        status: "active",
        hasMedicalHistory: false
      },
      {
        id: 3,
        name: "Vikram Singh",
        email: "vikram.singh@example.com",
        phone: "+91 76543 21098",
        address: {
          street: "789, Green Avenue",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001"
        },
        profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
        createdAt: "2025-01-05",
        lastOrderDate: "2025-03-28",
        totalOrders: 3,
        totalSpent: 1200,
        preferredPaymentMethod: "cod",
        status: "active",
        hasMedicalHistory: true
      },
      {
        id: 4,
        name: "Anjali Gupta",
        email: "anjali.gupta@example.com",
        phone: "+91 65432 10987",
        address: {
          street: "101, Sunset Boulevard",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "600001"
        },
        profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
        createdAt: "2025-02-12",
        totalOrders: 0,
        totalSpent: 0,
        status: "inactive",
        hasMedicalHistory: false
      },
      {
        id: 5,
        name: "Rajesh Kumar",
        email: "rajesh.kumar@example.com",
        phone: "+91 54321 09876",
        address: {
          street: "234, Hillside Colony",
          city: "Hyderabad",
          state: "Telangana",
          pincode: "500001"
        },
        createdAt: "2025-02-28",
        lastOrderDate: "2025-04-15",
        totalOrders: 12,
        totalSpent: 8900,
        preferredPaymentMethod: "netbanking",
        status: "active",
        hasMedicalHistory: true
      }
    ];
  };
  
  const getMockOrders = (customerId: number): Order[] => {
    // Different orders for different customers
    if (customerId === 1) {
      return [
        {
          id: "ORD-001-2025",
          date: "2025-04-10",
          status: "delivered",
          total: 850,
          paymentMethod: "Credit Card",
          items: [
            { id: 101, name: "Paracetamol 500mg", quantity: 2, price: 120 },
            { id: 102, name: "Vitamin C Tablets", quantity: 1, price: 250 },
            { id: 103, name: "Digital Thermometer", quantity: 1, price: 480 }
          ],
          shippingAddress: "123, Park Street, Mumbai, Maharashtra - 400001"
        },
        {
          id: "ORD-001-2025",
          date: "2025-03-22",
          status: "delivered",
          total: 1250,
          paymentMethod: "Credit Card",
          items: [
            { id: 104, name: "Blood Pressure Monitor", quantity: 1, price: 1100 },
            { id: 105, name: "Bandages", quantity: 1, price: 150 }
          ],
          shippingAddress: "123, Park Street, Mumbai, Maharashtra - 400001"
        },
        {
          id: "ORD-001-2025",
          date: "2025-02-15",
          status: "delivered",
          total: 580,
          paymentMethod: "Credit Card",
          items: [
            { id: 106, name: "Cough Syrup", quantity: 1, price: 180 },
            { id: 107, name: "Multi-vitamin Tablets", quantity: 1, price: 400 }
          ],
          shippingAddress: "123, Park Street, Mumbai, Maharashtra - 400001"
        }
      ];
    } else if (customerId === 2) {
      return [
        {
          id: "ORD-002-2025",
          date: "2025-04-05",
          status: "delivered",
          total: 720,
          paymentMethod: "UPI",
          items: [
            { id: 108, name: "Face Masks (Pack of 10)", quantity: 2, price: 200 },
            { id: 109, name: "Hand Sanitizer", quantity: 2, price: 160 },
            { id: 110, name: "Calcium Tablets", quantity: 1, price: 360 }
          ],
          shippingAddress: "456, Lake View Road, Delhi, Delhi - 110001"
        },
        {
          id: "ORD-002-2025",
          date: "2025-03-10",
          status: "delivered",
          total: 540,
          paymentMethod: "UPI",
          items: [
            { id: 111, name: "Protein Powder", quantity: 1, price: 540 }
          ],
          shippingAddress: "456, Lake View Road, Delhi, Delhi - 110001"
        }
      ];
    } else if (customerId === 3) {
      return [
        {
          id: "ORD-003-2025",
          date: "2025-03-28",
          status: "delivered",
          total: 450,
          paymentMethod: "Cash on Delivery",
          items: [
            { id: 112, name: "Eyedrops", quantity: 1, price: 120 },
            { id: 113, name: "Antacid Syrup", quantity: 1, price: 180 },
            { id: 114, name: "Pain Relief Gel", quantity: 1, price: 150 }
          ],
          shippingAddress: "789, Green Avenue, Bangalore, Karnataka - 560001"
        },
        {
          id: "ORD-003-2025",
          date: "2025-02-12",
          status: "cancelled",
          total: 350,
          paymentMethod: "Cash on Delivery",
          items: [
            { id: 115, name: "Glucose Powder", quantity: 1, price: 200 },
            { id: 116, name: "Band-Aids", quantity: 1, price: 150 }
          ],
          shippingAddress: "789, Green Avenue, Bangalore, Karnataka - 560001"
        }
      ];
    } else if (customerId === 5) {
      return [
        {
          id: "ORD-005-2025",
          date: "2025-04-15",
          status: "processing",
          total: 1450,
          paymentMethod: "Net Banking",
          items: [
            { id: 117, name: "Blood Glucose Monitor", quantity: 1, price: 1200 },
            { id: 118, name: "Glucose Test Strips", quantity: 1, price: 250 }
          ],
          shippingAddress: "234, Hillside Colony, Hyderabad, Telangana - 500001"
        },
        {
          id: "ORD-005-2025",
          date: "2025-04-02",
          status: "delivered",
          total: 680,
          paymentMethod: "Net Banking",
          items: [
            { id: 119, name: "Whey Protein", quantity: 1, price: 680 }
          ],
          shippingAddress: "234, Hillside Colony, Hyderabad, Telangana - 500001"
        }
      ];
    } else {
      return [];
    }
  };
  
  const getMockPrescriptions = (customerId: number): Prescription[] => {
    if (customerId === 1) {
      return [
        {
          id: "PRES-001",
          date: "2025-04-01",
          doctor: "Dr. Anjali Mehta",
          hospital: "City Hospital",
          medicines: [
            { name: "Amoxicillin", dosage: "500mg", frequency: "Twice daily", duration: "7 days" },
            { name: "Paracetamol", dosage: "650mg", frequency: "As needed", duration: "5 days" }
          ],
          notes: "Take medication after meals. Avoid alcohol consumption during the course.",
          status: "active"
        },
        {
          id: "PRES-002",
          date: "2025-03-05",
          doctor: "Dr. Suresh Kapoor",
          hospital: "Apollo Hospitals",
          medicines: [
            { name: "Cetirizine", dosage: "10mg", frequency: "Once daily", duration: "15 days" },
            { name: "Montelukast", dosage: "10mg", frequency: "Once daily at night", duration: "30 days" }
          ],
          notes: "For seasonal allergies. Follow up after 30 days.",
          status: "active"
        }
      ];
    } else if (customerId === 3) {
      return [
        {
          id: "PRES-003",
          date: "2025-03-20",
          doctor: "Dr. Rohan Desai",
          medicines: [
            { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily at night", duration: "90 days" },
            { name: "Aspirin", dosage: "75mg", frequency: "Once daily", duration: "90 days" }
          ],
          status: "active"
        }
      ];
    } else if (customerId === 5) {
      return [
        {
          id: "PRES-004",
          date: "2025-04-10",
          doctor: "Dr. Priya Sharma",
          hospital: "Care Hospital",
          medicines: [
            { name: "Metformin", dosage: "500mg", frequency: "Twice daily after meals", duration: "30 days" },
            { name: "Glimepiride", dosage: "2mg", frequency: "Once daily before breakfast", duration: "30 days" }
          ],
          notes: "Monitor blood sugar regularly. Follow diabetic diet plan.",
          status: "active"
        },
        {
          id: "PRES-005",
          date: "2025-03-15",
          doctor: "Dr. Amit Patel",
          medicines: [
            { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "60 days" }
          ],
          notes: "Monitor blood pressure daily. Reduce salt intake.",
          status: "active"
        },
        {
          id: "PRES-006",
          date: "2025-01-20",
          doctor: "Dr. Vikram Singh",
          hospital: "City Hospital",
          medicines: [
            { name: "Amoxicillin", dosage: "500mg", frequency: "Thrice daily", duration: "7 days" },
            { name: "Ibuprofen", dosage: "400mg", frequency: "Thrice daily after meals", duration: "5 days" }
          ],
          status: "completed"
        }
      ];
    } else {
      return [];
    }
  };
  
  const getMockAppointments = (customerId: number): Appointment[] => {
    if (customerId === 1) {
      return [
        {
          id: "APP-001",
          date: "2025-04-25",
          time: "10:30 AM",
          doctor: "Dr. Anjali Mehta",
          hospital: "City Hospital",
          type: "follow-up",
          status: "scheduled"
        },
        {
          id: "APP-002",
          date: "2025-04-05",
          time: "11:00 AM",
          doctor: "Dr. Suresh Kapoor",
          hospital: "Apollo Hospitals",
          type: "consultation",
          status: "completed"
        }
      ];
    } else if (customerId === 3) {
      return [
        {
          id: "APP-003",
          date: "2025-04-10",
          time: "09:15 AM",
          doctor: "Dr. Rohan Desai",
          hospital: "LifeCare Hospital",
          type: "follow-up",
          status: "completed"
        }
      ];
    } else if (customerId === 5) {
      return [
        {
          id: "APP-004",
          date: "2025-05-05",
          time: "02:30 PM",
          doctor: "Dr. Priya Sharma",
          hospital: "Care Hospital",
          type: "follow-up",
          status: "scheduled"
        },
        {
          id: "APP-005",
          date: "2025-04-20",
          time: "11:30 AM",
          doctor: "Lab Services",
          hospital: "Diagnostic Center",
          type: "test",
          status: "completed"
        },
        {
          id: "APP-006",
          date: "2025-03-15",
          time: "10:00 AM",
          doctor: "Dr. Amit Patel",
          hospital: "City Hospital",
          type: "consultation",
          status: "completed"
        }
      ];
    } else {
      return [];
    }
  };
  
  const getMockCart = (customerId: number): Cart | null => {
    if (customerId === 1) {
      return {
        items: [
          { id: 201, name: "Vitamin B Complex", quantity: 1, price: 320, image: "https://via.placeholder.com/50" },
          { id: 202, name: "Hand Sanitizer", quantity: 2, price: 160, image: "https://via.placeholder.com/50" }
        ],
        subtotal: 480,
        lastUpdated: "2025-04-18"
      };
    } else if (customerId === 2) {
      return {
        items: [
          { id: 203, name: "Omega-3 Fish Oil", quantity: 1, price: 450, image: "https://via.placeholder.com/50" }
        ],
        subtotal: 450,
        lastUpdated: "2025-04-15"
      };
    } else if (customerId === 5) {
      return {
        items: [
          { id: 204, name: "Blood Glucose Test Strips", quantity: 1, price: 250, image: "https://via.placeholder.com/50" },
          { id: 205, name: "Lancets", quantity: 1, price: 120, image: "https://via.placeholder.com/50" },
          { id: 206, name: "Alcohol Swabs", quantity: 1, price: 80, image: "https://via.placeholder.com/50" }
        ],
        subtotal: 450,
        lastUpdated: "2025-04-17"
      };
    } else {
      return null;
    }
  };
  
  const getMockMedicalHistory = (customerId: number): MedicalHistory | null => {
    if (customerId === 1) {
      return {
        allergies: ["Penicillin", "Dust Mites"],
        chronicConditions: ["Asthma"],
        currentMedications: [
          { name: "Montelukast", dosage: "10mg", frequency: "Once daily at night" },
          { name: "Cetirizine", dosage: "10mg", frequency: "As needed for allergies" }
        ],
        pastSurgeries: [
          { name: "Appendectomy", date: "2020-06-15", hospital: "City Hospital" }
        ],
        bloodGroup: "B+",
        height: "175 cm",
        weight: "70 kg"
      };
    } else if (customerId === 3) {
      return {
        allergies: ["None"],
        chronicConditions: ["Hypercholesterolemia"],
        currentMedications: [
          { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily at night" },
          { name: "Aspirin", dosage: "75mg", frequency: "Once daily" }
        ],
        pastSurgeries: [],
        bloodGroup: "O+",
        height: "180 cm",
        weight: "82 kg"
      };
    } else if (customerId === 5) {
      return {
        allergies: ["Sulfa drugs"],
        chronicConditions: ["Type 2 Diabetes", "Hypertension"],
        currentMedications: [
          { name: "Metformin", dosage: "500mg", frequency: "Twice daily after meals" },
          { name: "Glimepiride", dosage: "2mg", frequency: "Once daily before breakfast" },
          { name: "Amlodipine", dosage: "5mg", frequency: "Once daily" }
        ],
        pastSurgeries: [
          { name: "Hernia Repair", date: "2018-09-23", hospital: "Apollo Hospitals" }
        ],
        bloodGroup: "AB+",
        height: "168 cm",
        weight: "78 kg"
      };
    } else {
      return null;
    }
  };
  
  // Get filtered customers
  const getFilteredCustomers = () => {
    // return customers.filter(customer => {
   return (Array.isArray(customers) ? customers : []).filter(customer => {
    // Filter by search query
      if (searchQuery && !customer.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !customer.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !customer.phone.includes(searchQuery)) {
        return false;
      }
      
      // Filter by status
      if (statusFilter !== 'all' && customer.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  };
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredCustomers = getFilteredCustomers();
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  
  // Handle view customer details
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
    setActiveTab('details');
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  // Get order status badge style
  const getOrderStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get appointment status badge style
  const getAppointmentStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get prescription status badge style
  const getPrescriptionStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
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
  
  // Format full address
  const formatFullAddress = (address: { street: string; city: string; state: string; pincode: string }) => {
    return `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;
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
              placeholder="Search customers by name, email, or phone..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Customer Database</CardTitle>
              <CardDescription>
                View and manage customer information
              </CardDescription>
            </div>
          </div>
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
              <AlertDescription>Failed to load customers. Please try again later.</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact Information</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCustomers.length > 0 ? (
                      currentCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={customer.profileImage} alt={customer.name} />
                                <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-xs text-gray-500">
                                  <Calendar className="inline-block h-3 w-3 mr-1" />
                                  Joined {formatDate(customer.createdAt)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3 text-gray-500" />
                                <span>{customer.email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3 text-gray-500" />
                                <span>{customer.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-gray-500" />
                              <span>{customer.address.city}, {customer.address.state}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {customer.totalOrders} orders
                              </div>
                              {customer.lastOrderDate && (
                                <div className="text-xs text-gray-500">
                                  Last order: {formatDate(customer.lastOrderDate)}
                                </div>
                              )}
                              {customer.totalSpent > 0 && (
                                <div className="text-xs">
                                  Total spent: {formatCurrency(customer.totalSpent)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeStyle(customer.status)}>
                              {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
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
              </div>
              
              {/* Pagination controls */}
              {filteredCustomers.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} customers
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <Button
                          key={index}
                          variant={currentPage === index + 1 ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Customer Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              View complete customer information
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedCustomer.profileImage} alt={selectedCustomer.name} />
                  <AvatarFallback className="text-lg">{getInitials(selectedCustomer.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {selectedCustomer.name}
                    <Badge className={getStatusBadgeStyle(selectedCustomer.status)}>
                      {selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1)}
                    </Badge>
                  </h3>
                  <div className="text-sm text-gray-500">Customer since {formatDate(selectedCustomer.createdAt)}</div>
                </div>
              </div>
              
              <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-6">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="prescriptions" disabled={!selectedCustomer.hasMedicalHistory}>Prescriptions</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="cart">Cart</TabsTrigger>
                  <TabsTrigger value="medical" disabled={!selectedCustomer.hasMedicalHistory}>Medical History</TabsTrigger>
                </TabsList>
                
                {/* Customer Details Tab */}
                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Email</div>
                          <div className="font-medium flex items-center gap-1">
                            <Mail className="h-4 w-4 text-gray-500" />
                            {selectedCustomer.email}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Phone</div>
                          <div className="font-medium flex items-center gap-1">
                            <Phone className="h-4 w-4 text-gray-500" />
                            {selectedCustomer.phone}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <div className="font-medium">{formatFullAddress(selectedCustomer.address)}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Order Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Total Orders</div>
                          <div className="font-medium text-lg">{selectedCustomer.totalOrders}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Total Spent</div>
                          <div className="font-medium text-lg">{formatCurrency(selectedCustomer.totalSpent)}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Preferred Payment</div>
                          <div className="font-medium text-lg flex items-center gap-1">
                            <CreditCard className="h-4 w-4 text-gray-500" />
                            {selectedCustomer.preferredPaymentMethod 
                              ? selectedCustomer.preferredPaymentMethod.toUpperCase() 
                              : 'None'
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Orders Tab */}
                <TabsContent value="orders">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Order History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingOrders ? (
                        <div className="flex items-center justify-center py-4">
                          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : customerOrders.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          No orders found for this customer
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {customerOrders.map((order) => (
                            <div key={order.id} className="border rounded-lg p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium">{order.id}</div>
                                    <Badge className={getOrderStatusBadgeStyle(order.status)}>
                                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {formatDate(order.date)} • {order.paymentMethod}
                                  </div>
                                </div>
                                <div className="font-semibold text-lg">
                                  {formatCurrency(order.total)}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="text-sm font-medium">Items:</div>
                                <div className="space-y-1">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                      <div>
                                        {item.name} x{item.quantity}
                                      </div>
                                      <div>
                                        {formatCurrency(item.price * item.quantity)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="mt-3 pt-3 border-t text-sm">
                                <div className="font-medium mb-1">Shipping Address:</div>
                                <div className="text-gray-600">{order.shippingAddress}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Prescriptions Tab */}
                <TabsContent value="prescriptions">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Prescriptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingPrescriptions ? (
                        <div className="flex items-center justify-center py-4">
                          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : customerPrescriptions.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          No prescriptions found for this customer
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {customerPrescriptions.map((prescription) => (
                            <div key={prescription.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium">{prescription.id}</div>
                                    <Badge className={getPrescriptionStatusBadgeStyle(prescription.status)}>
                                      {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {formatDate(prescription.date)} • {prescription.doctor}
                                  </div>
                                  {prescription.hospital && (
                                    <div className="text-xs text-gray-500">
                                      {prescription.hospital}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="text-sm font-medium">Medicines:</div>
                                <div className="space-y-2">
                                  {prescription.medicines.map((medicine, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <Pill className="h-4 w-4 text-primary mt-0.5" />
                                      <div>
                                        <div className="font-medium text-sm">{medicine.name} ({medicine.dosage})</div>
                                        <div className="text-xs text-gray-600">
                                          {medicine.frequency} for {medicine.duration}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {prescription.notes && (
                                <div className="mt-3 pt-3 border-t">
                                  <div className="text-sm font-medium mb-1">Notes:</div>
                                  <div className="text-sm text-gray-600">{prescription.notes}</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Appointments Tab */}
                <TabsContent value="appointments">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingAppointments ? (
                        <div className="flex items-center justify-center py-4">
                          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : customerAppointments.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          No appointments found for this customer
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {customerAppointments.map((appointment) => (
                            <div key={appointment.id} className="border rounded-lg p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium">{appointment.id}</div>
                                    <Badge className={getAppointmentStatusBadgeStyle(appointment.status)}>
                                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <CalendarClock className="h-3 w-3" />
                                    {formatDate(appointment.date)} at {appointment.time}
                                  </div>
                                </div>
                                <Badge variant="outline" className="capitalize">
                                  {appointment.type}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1 mt-2">
                                <div className="flex items-center gap-1 text-sm">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{appointment.doctor}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Building className="h-4 w-4 text-gray-500" />
                                  <span>{appointment.hospital}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Cart Tab */}
                <TabsContent value="cart">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Shopping Cart</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingCart ? (
                        <div className="flex items-center justify-center py-4">
                          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : !customerCart || customerCart.items.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          Customer's cart is empty
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-gray-500 mb-2">
                              Last updated: {formatDate(customerCart.lastUpdated)}
                            </div>
                            
                            <div className="space-y-3">
                              {customerCart.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 py-2 border-b">
                                  {item.image && (
                                    <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0 border">
                                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                                  </div>
                                  <div className="font-medium">
                                    {formatCurrency(item.price * item.quantity)}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex justify-between pt-3 font-medium">
                              <div>Subtotal</div>
                              <div>{formatCurrency(customerCart.subtotal)}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Medical History Tab */}
                <TabsContent value="medical">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Medical History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingMedicalHistory ? (
                        <div className="flex items-center justify-center py-4">
                          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : !customerMedicalHistory ? (
                        <div className="text-center py-4 text-gray-500">
                          No medical history found for this customer
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {customerMedicalHistory.bloodGroup && (
                              <div className="space-y-1">
                                <div className="text-sm text-gray-500">Blood Group</div>
                                <div className="font-medium">{customerMedicalHistory.bloodGroup}</div>
                              </div>
                            )}
                            
                            {customerMedicalHistory.height && (
                              <div className="space-y-1">
                                <div className="text-sm text-gray-500">Height</div>
                                <div className="font-medium">{customerMedicalHistory.height}</div>
                              </div>
                            )}
                            
                            {customerMedicalHistory.weight && (
                              <div className="space-y-1">
                                <div className="text-sm text-gray-500">Weight</div>
                                <div className="font-medium">{customerMedicalHistory.weight}</div>
                              </div>
                            )}
                          </div>
                          
                          <div className="border-t pt-3">
                            <div className="font-medium mb-2">Allergies</div>
                            <div>
                              {customerMedicalHistory.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {customerMedicalHistory.allergies.map((allergy, index) => (
                                    <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                      {allergy}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">No known allergies</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="border-t pt-3">
                            <div className="font-medium mb-2">Chronic Conditions</div>
                            <div>
                              {customerMedicalHistory.chronicConditions.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {customerMedicalHistory.chronicConditions.map((condition, index) => (
                                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      {condition}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">No chronic conditions</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="border-t pt-3">
                            <div className="font-medium mb-2">Current Medications</div>
                            <div>
                              {customerMedicalHistory.currentMedications.length > 0 ? (
                                <div className="space-y-2">
                                  {customerMedicalHistory.currentMedications.map((medication, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <Pill className="h-4 w-4 text-primary mt-0.5" />
                                      <div>
                                        <div className="font-medium text-sm">{medication.name} ({medication.dosage})</div>
                                        <div className="text-xs text-gray-600">
                                          {medication.frequency}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">No current medications</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="border-t pt-3">
                            <div className="font-medium mb-2">Past Surgeries</div>
                            <div>
                              {customerMedicalHistory.pastSurgeries.length > 0 ? (
                                <div className="space-y-2">
                                  {customerMedicalHistory.pastSurgeries.map((surgery, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <ClipboardList className="h-4 w-4 text-primary mt-0.5" />
                                      <div>
                                        <div className="font-medium text-sm">{surgery.name}</div>
                                        <div className="text-xs text-gray-600">
                                          {formatDate(surgery.date)}
                                          {surgery.hospital && ` • ${surgery.hospital}`}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">No past surgeries</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerDetailsPanel;