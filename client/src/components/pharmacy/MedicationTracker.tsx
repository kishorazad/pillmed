import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Clock, 
  Check, 
  MoreHorizontal, 
  FileText, 
  Pill, 
  Printer, 
  MessageSquare, 
  Phone, 
  Mail,
  Calendar,
  PencilLine,
  UserCheck,
  User,
  FlaskConical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ReceiptText,
  Headphones,
  MicIcon,
  CircleDashed
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';

// Define types
interface Prescription {
  id: number;
  patientId: number;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientEmail: string;
  doctorName: string;
  prescribedDate: string;
  status: 'pending' | 'processing' | 'ready' | 'collected' | 'cancelled';
  medications: Medication[];
  instructions: string;
  priority: 'normal' | 'high' | 'emergency';
  paymentStatus: 'pending' | 'paid' | 'insurance';
  notes?: string;
  patientPhoto?: string;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

const MedicationTracker = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewPrescriptionDialog, setViewPrescriptionDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isSearchByVoiceActive, setIsSearchByVoiceActive] = useState(false);
  
  // Sample prescription data
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: 2001,
      patientId: 1001,
      patientName: 'Vikram Mehta',
      patientAge: 45,
      patientGender: 'Male',
      patientPhone: '+91 98765 10111',
      patientEmail: 'vikram.m@example.com',
      doctorName: 'Dr. Anil Kumar',
      prescribedDate: '2025-04-09',
      status: 'pending',
      priority: 'normal',
      paymentStatus: 'pending',
      medications: [
        {
          id: 101,
          name: 'Amlodipine 5mg Tablets',
          dosage: '1 tablet',
          frequency: 'Once daily',
          duration: '30 days',
          quantity: 30,
          instructions: 'Take in the morning',
          status: 'in-stock'
        },
        {
          id: 102,
          name: 'Metformin 500mg Tablets',
          dosage: '1 tablet',
          frequency: 'Twice daily',
          duration: '30 days',
          quantity: 60,
          instructions: 'Take after meals',
          status: 'in-stock'
        }
      ],
      instructions: 'Take medications regularly. Avoid skipping doses.',
      patientPhoto: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 2002,
      patientId: 1002,
      patientName: 'Sunita Sharma',
      patientAge: 38,
      patientGender: 'Female',
      patientPhone: '+91 87654 20222',
      patientEmail: 'sunita.s@example.com',
      doctorName: 'Dr. Priya Patel',
      prescribedDate: '2025-04-09',
      status: 'processing',
      priority: 'high',
      paymentStatus: 'insurance',
      medications: [
        {
          id: 103,
          name: 'Montelukast 10mg Tablets',
          dosage: '1 tablet',
          frequency: 'Once daily',
          duration: '15 days',
          quantity: 15,
          instructions: 'Take at bedtime',
          status: 'in-stock'
        },
        {
          id: 104,
          name: 'Salbutamol Inhaler',
          dosage: '2 puffs',
          frequency: 'As needed',
          duration: 'As needed',
          quantity: 1,
          instructions: 'Use for breathlessness',
          status: 'in-stock'
        }
      ],
      instructions: 'Avoid allergens. Use inhaler before exposure to triggers.',
      patientPhoto: 'https://randomuser.me/api/portraits/women/67.jpg'
    },
    {
      id: 2003,
      patientId: 1003,
      patientName: 'Rajesh Patel',
      patientAge: 62,
      patientGender: 'Male',
      patientPhone: '+91 76543 30333',
      patientEmail: 'rajesh.p@example.com',
      doctorName: 'Dr. Suresh Goel',
      prescribedDate: '2025-04-08',
      status: 'ready',
      priority: 'normal',
      paymentStatus: 'paid',
      medications: [
        {
          id: 105,
          name: 'Diclofenac 50mg Tablets',
          dosage: '1 tablet',
          frequency: 'Twice daily',
          duration: '7 days',
          quantity: 14,
          instructions: 'Take after meals',
          status: 'in-stock'
        },
        {
          id: 106,
          name: 'Calcium + Vitamin D3 Tablets',
          dosage: '1 tablet',
          frequency: 'Once daily',
          duration: '30 days',
          quantity: 30,
          instructions: 'Take after breakfast',
          status: 'in-stock'
        }
      ],
      instructions: 'Apply hot compress for pain relief. Avoid prolonged sitting.',
      patientPhoto: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
      id: 2004,
      patientId: 1004,
      patientName: 'Kavita Singh',
      patientAge: 28,
      patientGender: 'Female',
      patientPhone: '+91 65432 40444',
      patientEmail: 'kavita.s@example.com',
      doctorName: 'Dr. Nisha Mehta',
      prescribedDate: '2025-04-08',
      status: 'collected',
      priority: 'normal',
      paymentStatus: 'paid',
      medications: [
        {
          id: 107,
          name: 'Azithromycin 500mg Tablets',
          dosage: '1 tablet',
          frequency: 'Once daily',
          duration: '3 days',
          quantity: 3,
          instructions: 'Take on empty stomach',
          status: 'low-stock'
        }
      ],
      instructions: 'Complete full course of antibiotics even if feeling better.',
      notes: 'Patient has history of allergic reaction to penicillin.',
      patientPhoto: 'https://randomuser.me/api/portraits/women/22.jpg'
    },
    {
      id: 2005,
      patientId: 1005,
      patientName: 'Arun Kumar',
      patientAge: 55,
      patientGender: 'Male',
      patientPhone: '+91 54321 50555',
      patientEmail: 'arun.k@example.com',
      doctorName: 'Dr. Rajan Verma',
      prescribedDate: '2025-04-07',
      status: 'ready',
      priority: 'emergency',
      paymentStatus: 'pending',
      medications: [
        {
          id: 108,
          name: 'Atorvastatin 10mg Tablets',
          dosage: '1 tablet',
          frequency: 'Once daily',
          duration: '30 days',
          quantity: 30,
          instructions: 'Take in the evening',
          status: 'low-stock'
        },
        {
          id: 109,
          name: 'Clopidogrel 75mg Tablets',
          dosage: '1 tablet',
          frequency: 'Once daily',
          duration: '30 days',
          quantity: 30,
          instructions: 'Take with food',
          status: 'in-stock'
        },
        {
          id: 110,
          name: 'Aspirin 75mg Tablets',
          dosage: '1 tablet',
          frequency: 'Once daily',
          duration: '30 days',
          quantity: 30,
          instructions: 'Take after meals',
          status: 'in-stock'
        }
      ],
      instructions: 'Monitor blood pressure daily. Follow low-salt diet.',
      notes: 'Recent cardiac event. Urgent dispensing needed.',
      patientPhoto: 'https://randomuser.me/api/portraits/men/67.jpg'
    },
    {
      id: 2006,
      patientId: 1006,
      patientName: 'Deepa Verma',
      patientAge: 42,
      patientGender: 'Female',
      patientPhone: '+91 43210 60666',
      patientEmail: 'deepa.v@example.com',
      doctorName: 'Dr. Kiran Shah',
      prescribedDate: '2025-04-07',
      status: 'cancelled',
      priority: 'normal',
      paymentStatus: 'pending',
      medications: [
        {
          id: 111,
          name: 'Levothyroxine 50mcg Tablets',
          dosage: '1 tablet',
          frequency: 'Once daily',
          duration: '30 days',
          quantity: 30,
          instructions: 'Take on empty stomach in the morning',
          status: 'out-of-stock'
        }
      ],
      instructions: 'Take 30 minutes before breakfast. Avoid calcium supplements within 4 hours.',
      notes: 'Cancelled due to out of stock medication. Alternative arranged through another pharmacy.',
      patientPhoto: 'https://randomuser.me/api/portraits/women/54.jpg'
    }
  ]);
  
  // Get filtered prescriptions
  const getFilteredPrescriptions = () => {
    return prescriptions.filter(prescription => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prescription.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prescription.id.toString().includes(searchQuery);
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };
  
  // Get count by status
  const getCountByStatus = (status: string) => {
    return prescriptions.filter(prescription => prescription.status === status).length;
  };
  
  // Get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'collected':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in-stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low-stock':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'insurance':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <CircleDashed className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'collected':
        return <UserCheck className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'in-stock':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'low-stock':
        return <AlertCircle className="h-4 w-4" />;
      case 'out-of-stock':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'normal':
        return <Clock className="h-4 w-4" />;
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'emergency':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  // Get payment status icon
  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Check className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'insurance':
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  // Handle view prescription
  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setViewPrescriptionDialog(true);
  };
  
  // Handle update status
  const handleUpdateStatus = (id: number, status: 'pending' | 'processing' | 'ready' | 'collected' | 'cancelled') => {
    setPrescriptions(prev => 
      prev.map(prescription => 
        prescription.id === id 
          ? { ...prescription, status } 
          : prescription
      )
    );
    
    if (selectedPrescription?.id === id) {
      setSelectedPrescription(prev => prev ? { ...prev, status } : null);
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
  
  // Toggle voice search
  const toggleVoiceSearch = () => {
    setIsSearchByVoiceActive(prev => !prev);
    // In a real app, you'd implement speech-to-text here
    if (!isSearchByVoiceActive) {
      setTimeout(() => {
        setSearchByVoiceResults();
      }, 2000);
    }
  };
  
  // Set search by voice results
  const setSearchByVoiceResults = () => {
    setSearchQuery('Arun Kumar');
    setIsSearchByVoiceActive(false);
  };
  
  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'processing':
        return 'Processing';
      case 'ready':
        return 'Ready for Pickup';
      case 'collected':
        return 'Collected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Prescription Tracker</h2>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-grow w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search prescriptions..."
              className="pl-9 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "absolute right-0 top-0", 
                isSearchByVoiceActive && "text-red-500"
              )}
              onClick={toggleVoiceSearch}
            >
              <MicIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="ready">Ready for Pickup</SelectItem>
              <SelectItem value="collected">Collected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-blue-700">{getCountByStatus('pending')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                <CircleDashed className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-amber-700">{getCountByStatus('processing')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Ready</p>
              <p className="text-2xl font-bold text-green-700">{getCountByStatus('ready')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Collected</p>
              <p className="text-2xl font-bold text-purple-700">{getCountByStatus('collected')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-sm text-gray-600">Emergency</p>
              <p className="text-2xl font-bold text-red-700">{prescriptions.filter(p => p.priority === 'emergency').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-700">{getCountByStatus('cancelled')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Prescription Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Prescriptions</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="ready">Ready for Pickup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <PrescriptionTable
            prescriptions={getFilteredPrescriptions()}
            handleViewPrescription={handleViewPrescription}
            getStatusStyle={getStatusStyle}
            getStatusIcon={getStatusIcon}
            getStatusLabel={getStatusLabel}
            getPriorityIcon={getPriorityIcon}
            getInitials={getInitials}
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <PrescriptionTable
            prescriptions={getFilteredPrescriptions().filter(p => p.status === 'pending')}
            handleViewPrescription={handleViewPrescription}
            getStatusStyle={getStatusStyle}
            getStatusIcon={getStatusIcon}
            getStatusLabel={getStatusLabel}
            getPriorityIcon={getPriorityIcon}
            getInitials={getInitials}
          />
        </TabsContent>
        
        <TabsContent value="processing">
          <PrescriptionTable
            prescriptions={getFilteredPrescriptions().filter(p => p.status === 'processing')}
            handleViewPrescription={handleViewPrescription}
            getStatusStyle={getStatusStyle}
            getStatusIcon={getStatusIcon}
            getStatusLabel={getStatusLabel}
            getPriorityIcon={getPriorityIcon}
            getInitials={getInitials}
          />
        </TabsContent>
        
        <TabsContent value="ready">
          <PrescriptionTable
            prescriptions={getFilteredPrescriptions().filter(p => p.status === 'ready')}
            handleViewPrescription={handleViewPrescription}
            getStatusStyle={getStatusStyle}
            getStatusIcon={getStatusIcon}
            getStatusLabel={getStatusLabel}
            getPriorityIcon={getPriorityIcon}
            getInitials={getInitials}
          />
        </TabsContent>
      </Tabs>
      
      {/* View Prescription Dialog */}
      <Dialog open={viewPrescriptionDialog} onOpenChange={setViewPrescriptionDialog}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              View and manage prescription information
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-6">
              {/* Prescription Header */}
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedPrescription.patientPhoto} alt={selectedPrescription.patientName} />
                    <AvatarFallback className="text-lg">{getInitials(selectedPrescription.patientName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedPrescription.patientName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{selectedPrescription.patientAge} years</span>
                      <span className="block h-1 w-1 rounded-full bg-gray-400"></span>
                      <span>{selectedPrescription.patientGender}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Patient ID: {selectedPrescription.patientId}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getStatusStyle(selectedPrescription.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedPrescription.status)}
                      <span>{getStatusLabel(selectedPrescription.status)}</span>
                    </span>
                  </Badge>
                  
                  <Badge className={getStatusStyle(selectedPrescription.priority)}>
                    <span className="flex items-center gap-1">
                      {getPriorityIcon(selectedPrescription.priority)}
                      <span>
                        {selectedPrescription.priority.charAt(0).toUpperCase() + 
                        selectedPrescription.priority.slice(1)} Priority
                      </span>
                    </span>
                  </Badge>
                  
                  <Badge className={getStatusStyle(selectedPrescription.paymentStatus)}>
                    <span className="flex items-center gap-1">
                      {getPaymentStatusIcon(selectedPrescription.paymentStatus)}
                      <span>
                        {selectedPrescription.paymentStatus === 'paid' ? 'Paid' : 
                        selectedPrescription.paymentStatus === 'pending' ? 'Payment Pending' : 
                        'Insurance'}
                      </span>
                    </span>
                  </Badge>
                </div>
              </div>
              
              {/* Prescription Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-500">Doctor</p>
                      <p className="font-medium">{selectedPrescription.doctorName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-500">Prescribed Date</p>
                      <p className="font-medium">{selectedPrescription.prescribedDate}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-500">Phone Number</p>
                      <p className="font-medium">{selectedPrescription.patientPhone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{selectedPrescription.patientEmail}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Medications */}
              <div>
                <h4 className="font-medium mb-2">Medications</h4>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPrescription.medications.map(medication => (
                        <TableRow key={medication.id}>
                          <TableCell>
                            <div className="font-medium">{medication.name}</div>
                            <div className="text-xs text-gray-500">{medication.frequency} for {medication.duration}</div>
                          </TableCell>
                          <TableCell>{medication.dosage}</TableCell>
                          <TableCell>{medication.quantity}</TableCell>
                          <TableCell>
                            <Badge className={getStatusStyle(medication.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(medication.status)}
                                <span>{medication.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                              </span>
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="space-y-2">
                <h4 className="font-medium">Instructions</h4>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p>{selectedPrescription.instructions}</p>
                </div>
              </div>
              
              {/* Notes */}
              {selectedPrescription.notes && (
                <div className="space-y-2">
                  <h4 className="font-medium">Notes</h4>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm">{selectedPrescription.notes}</p>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t">
                <Button variant="outline" className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Message</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <PencilLine className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <ReceiptText className="h-4 w-4" />
                  <span>Invoice</span>
                </Button>
              </div>
              
              <DialogFooter className="flex justify-between items-center border-t pt-4">
                <div className="flex gap-2">
                  {selectedPrescription.status !== 'cancelled' && (
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleUpdateStatus(selectedPrescription.id, 'cancelled')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Prescription
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setViewPrescriptionDialog(false)}
                  >
                    Close
                  </Button>
                  
                  {selectedPrescription.status === 'pending' && (
                    <Button onClick={() => handleUpdateStatus(selectedPrescription.id, 'processing')}>
                      <CircleDashed className="mr-2 h-4 w-4" />
                      Start Processing
                    </Button>
                  )}
                  
                  {selectedPrescription.status === 'processing' && (
                    <Button onClick={() => handleUpdateStatus(selectedPrescription.id, 'ready')}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as Ready
                    </Button>
                  )}
                  
                  {selectedPrescription.status === 'ready' && (
                    <Button onClick={() => handleUpdateStatus(selectedPrescription.id, 'collected')}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Mark as Collected
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Prescription Table Component
interface PrescriptionTableProps {
  prescriptions: Prescription[];
  handleViewPrescription: (prescription: Prescription) => void;
  getStatusStyle: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusLabel: (status: string) => string;
  getPriorityIcon: (status: string) => React.ReactNode;
  getInitials: (name: string) => string;
}

const PrescriptionTable: React.FC<PrescriptionTableProps> = ({
  prescriptions,
  handleViewPrescription,
  getStatusStyle,
  getStatusIcon,
  getStatusLabel,
  getPriorityIcon,
  getInitials
}) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Prescribed</TableHead>
                <TableHead>Medications</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.length > 0 ? (
                prescriptions.map(prescription => (
                  <TableRow 
                    key={prescription.id}
                    className={prescription.priority === 'emergency' ? 'bg-red-50' : undefined}
                  >
                    <TableCell className="font-medium">#{prescription.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={prescription.patientPhoto} alt={prescription.patientName} />
                          <AvatarFallback>{getInitials(prescription.patientName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{prescription.patientName}</div>
                          <div className="text-xs text-gray-500">
                            {prescription.patientAge} yrs, {prescription.patientGender}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{prescription.doctorName}</TableCell>
                    <TableCell>{prescription.prescribedDate}</TableCell>
                    <TableCell>{prescription.medications.length} items</TableCell>
                    <TableCell>
                      <Badge className={getStatusStyle(prescription.priority)}>
                        <span className="flex items-center gap-1">
                          {getPriorityIcon(prescription.priority)}
                          <span>{prescription.priority.charAt(0).toUpperCase() + prescription.priority.slice(1)}</span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusStyle(prescription.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(prescription.status)}
                          <span>{getStatusLabel(prescription.status)}</span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewPrescription(prescription)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    <div className="text-gray-500">No prescriptions found matching your criteria</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationTracker;