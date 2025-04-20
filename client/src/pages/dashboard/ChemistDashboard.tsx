import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageSwitcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, AlertTriangle, Package, Truck, Clock, FileText, XCircle, 
  MapPin, User, Phone, Plus, Pill, Upload, Search, Filter, MoreVertical, 
  PlusCircle, UploadCloud, RefreshCw, Pencil, Loader2, Stethoscope,
  UserCog, Ambulance, FilterX, ClipboardCheck, ClipboardList, CheckSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { getSafeImageUrl } from '@/utils/imageUtils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

// Mock data - would be replaced with API calls
interface Prescription {
  id: number;
  customerId: number;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  prescriptionImage: string;
  status: 'new' | 'reviewed' | 'medicine_checked' | 'order_confirmed' | 'not_readable' | 'packed' | 'picked' | 'delivered';
  uploadDate: string;
  medicines: Medicine[];
  extraMedicines?: ExtraMedicine[]; // Optional array for medicines added by chemist
  medicalEquipment?: MedicalEquipment[]; // Optional array for equipment rentals or purchases
  medicalServices?: MedicalService[]; // Optional array for doctor/nurse services
  emergencyServices?: EmergencyService; // Optional emergency ambulance services
  orderNotes?: string;
  doctorId?: number; // Doctor who uploaded or needs to approve
  doctorName?: string;
}

interface Medicine {
  id: number;
  name: string;
  quantity: number;
  inStock: boolean;
  price: number;
  currentPrice: number;
  priceChanged: boolean;
}

interface ExtraMedicine {
  id: number;
  name: string;
  quantity: number;
  price: number;
  isRxOnly: boolean; // Whether this is a prescription-only medicine
  addedBy: {
    id: number;
    name: string;
    role: 'chemist';
  };
  status: 'pending_approval' | 'approved' | 'rejected' | 'no_approval_needed';
  reason?: string; // Reason for adding this extra medicine
  approvalDate?: string;
  rejectionReason?: string;
  doctorId?: number; // Doctor who approved/rejected
  doctorName?: string; // Doctor who approved/rejected
}

interface ChemistMedicine {
  id: number;
  name: string;
  brand: string;
  genericName: string;
  category: string;
  composition: string;
  uploadedBy: {
    id: number;
    name: string;
    role: 'admin' | 'subadmin' | 'chemist' | 'hospital_staff';
  };
  description: string;
  price: number;
  discountedPrice: number;
  packSize: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  equipmentType?: 'medical_device' | 'surgical_instrument' | 'diagnostic_equipment' | 'monitoring_device' | 'mobility_aid';
}

interface MedicalEquipment {
  id: number;
  name: string;
  type: 'medical_device' | 'surgical_instrument' | 'diagnostic_equipment' | 'monitoring_device' | 'mobility_aid';
  description: string;
  price: number;
  rentalPrice?: number; // Optional for equipment available for rent
  rentalDuration?: string; // e.g., "per day", "per week"
  isRental: boolean; // Whether this is a rental or purchase
  quantity: number;
  status: 'pending_approval' | 'approved' | 'rejected' | 'delivered' | 'returned';
  addedDate: string;
  requestNotes?: string;
  approvalDate?: string;
  approvedBy?: {
    id: number;
    name: string;
    role: 'admin' | 'hospital_staff';
  };
}

interface MedicalService {
  id: number;
  serviceType: 'doctor_visit' | 'nurse_visit' | 'specialist_consultation' | 'home_care' | 'physiotherapy' | 'other';
  description: string;
  requestedFor: Date; // Date and time service is requested for
  duration: string; // e.g., "2 hours", "full day"
  patientCondition: string; // Description of patient's condition
  specialInstructions?: string; // Any special instructions
  price: number;
  status: 'pending' | 'approved' | 'assigned' | 'completed' | 'cancelled';
  assignedTo?: {
    id: number;
    name: string;
    role: 'doctor' | 'nurse' | 'specialist';
    specialization?: string; // For specialists
  };
  requestNotes?: string;
}

interface EmergencyService {
  id: number;
  serviceType: 'ambulance' | 'air_ambulance' | 'emergency_medical_team';
  requestedAt: Date;
  pickupLocation: string;
  destinationLocation: string;
  patientCondition: string;
  contactName: string;
  contactPhone: string;
  status: 'requested' | 'dispatched' | 'in_transit' | 'completed' | 'cancelled';
  dispatchedAt?: Date;
  arrivalEstimate?: Date;
  price: number;
  specialInstructions?: string;
  medicalEquipmentNeeded?: string[];
}

interface Customer {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

const ChemistDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [assignCourier, setAssignCourier] = useState('');
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  
  // Medicine management state
  const [openAddMedicineDialog, setOpenAddMedicineDialog] = useState(false);
  const [openAddEquipmentDialog, setOpenAddEquipmentDialog] = useState(false);
  const [openAddServiceDialog, setOpenAddServiceDialog] = useState(false);
  const [openEmergencyServiceDialog, setOpenEmergencyServiceDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [medicineSearchQuery, setMedicineSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // New medicine form state
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    brand: '',
    genericName: '',
    category: '',
    composition: '',
    description: '',
    price: '',
    discountedPrice: '',
    packSize: '',
    image: null as File | null
  });
  
  // Sample medicine data - would be replaced with API data
  const medicines: ChemistMedicine[] = [
    {
      id: 1,
      name: 'Telma-H 40 Tablet',
      brand: 'Glenmark',
      genericName: 'Telmisartan/Hydrochlorothiazide',
      category: 'Cardiac Care',
      composition: 'Telmisartan (40mg) + Hydrochlorothiazide (12.5mg)',
      uploadedBy: {
        id: 1,
        name: 'Admin User',
        role: 'admin'
      },
      description: 'Used for hypertension and reduces risk of cardiovascular events',
      price: 120,
      discountedPrice: 108,
      packSize: '10 tablets per strip',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',
      status: 'approved',
      createdAt: '2025-03-15T10:30:00',
      updatedAt: '2025-03-16T15:20:00'
    },
    {
      id: 2,
      name: 'Glycomet-GP 1 Forte',
      brand: 'USV Limited',
      genericName: 'Metformin/Glimepiride',
      category: 'Diabetes Care',
      composition: 'Metformin (500mg) + Glimepiride (1mg)',
      uploadedBy: {
        id: 3,
        name: 'Hospital Staff User',
        role: 'hospital_staff'
      },
      description: 'Used to control high blood sugar in type 2 diabetes',
      price: 145,
      discountedPrice: 130,
      packSize: '15 tablets per strip',
      imageUrl: 'https://images.unsplash.com/photo-1579154392429-20e114ece59e',
      status: 'pending',
      createdAt: '2025-04-10T09:15:00',
      updatedAt: '2025-04-10T09:15:00'
    },
    {
      id: 3,
      name: 'Pan-D Capsule',
      brand: 'Alkem',
      genericName: 'Pantoprazole/Domperidone',
      category: 'Gastro Care',
      composition: 'Pantoprazole (40mg) + Domperidone (30mg)',
      uploadedBy: {
        id: 4,
        name: 'Hospital Staff Member',
        role: 'hospital_staff'
      },
      description: 'Used for treatment of acid reflux and indigestion',
      price: 95,
      discountedPrice: 85,
      packSize: '10 capsules per strip',
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88',
      status: 'rejected',
      createdAt: '2025-04-05T11:20:00',
      updatedAt: '2025-04-07T14:30:00',
      rejectionReason: 'Product image is not clear and product description is incomplete'
    },
    {
      id: 4,
      name: 'Levocet M Tablet',
      brand: 'Mankind',
      genericName: 'Levocetirizine/Montelukast',
      category: 'Respiratory Care',
      composition: 'Levocetirizine (5mg) + Montelukast (10mg)',
      uploadedBy: {
        id: 2,
        name: 'Subadmin User',
        role: 'subadmin'
      },
      description: 'Used for allergic rhinitis and asthma symptoms',
      price: 110,
      discountedPrice: 99,
      packSize: '10 tablets per strip',
      imageUrl: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d',
      status: 'approved',
      createdAt: '2025-03-20T16:45:00',
      updatedAt: '2025-03-21T10:10:00'
    },
    {
      id: 5,
      name: 'Dolo 650mg Tablet',
      brand: 'Micro Labs',
      genericName: 'Paracetamol',
      category: 'Pain Relief',
      composition: 'Paracetamol (650mg)',
      uploadedBy: {
        id: 5,
        name: 'Chemist User',
        role: 'chemist'
      },
      description: 'Used for fever and mild to moderate pain relief',
      price: 30,
      discountedPrice: 30,
      packSize: '15 tablets per strip',
      imageUrl: 'https://images.unsplash.com/photo-1584362917165-526a968579e8',
      status: 'pending',
      createdAt: '2025-04-12T14:20:00',
      updatedAt: '2025-04-12T14:20:00'
    }
  ];
  
  // Sample data - would be replaced with API data
  const prescriptions: Prescription[] = [
    {
      id: 1,
      customerId: 101,
      customerName: 'Amit Kumar',
      customerAddress: '123 Main Street, Sector 47, Gurugram',
      customerPhone: '+91 9876543210',
      prescriptionImage: 'https://images.unsplash.com/photo-1583912267648-d48299db5df5',
      status: 'new',
      uploadDate: '2025-04-17T14:30:00',
      medicines: [
        {
          id: 814,
          name: 'Telmibrex-AM Tablet',
          quantity: 2,
          inStock: true,
          price: 106,
          currentPrice: 106,
          priceChanged: false
        },
        {
          id: 245,
          name: 'Dolo 650mg Tablet',
          quantity: 1,
          inStock: true,
          price: 30,
          currentPrice: 30,
          priceChanged: false
        }
      ]
    },
    {
      id: 2,
      customerId: 102,
      customerName: 'Priya Singh',
      customerAddress: '456 Park Avenue, Andheri East, Mumbai',
      customerPhone: '+91 8765432109',
      prescriptionImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
      status: 'reviewed',
      uploadDate: '2025-04-17T10:15:00',
      doctorId: 201,
      doctorName: 'Dr. Raj Kumar',
      medicines: [
        {
          id: 312,
          name: 'Azithral 500mg Tablet',
          quantity: 1,
          inStock: true,
          price: 95,
          currentPrice: 95,
          priceChanged: false
        },
        {
          id: 518,
          name: 'Montair LC Tablet',
          quantity: 1,
          inStock: true,
          price: 125,
          currentPrice: 149,
          priceChanged: true
        }
      ],
      extraMedicines: [
        {
          id: 621,
          name: 'Pantocid 40mg Tablet',
          quantity: 1,
          price: 85,
          isRxOnly: true, // This is a prescription-only medicine
          addedBy: {
            id: 5,
            name: 'Chemist User',
            role: 'chemist'
          },
          status: 'pending_approval',
          reason: 'Patient mentioned acid reflux symptoms; this will help with that condition'
        },
        {
          id: 735,
          name: 'Ecosprin 75mg Tablet',
          quantity: 1,
          price: 12,
          isRxOnly: true, // This is a prescription-only medicine
          addedBy: {
            id: 5,
            name: 'Chemist User',
            role: 'chemist'
          },
          status: 'approved',
          reason: 'Recommended based on patient profile and existing medications',
          approvalDate: '2025-04-17T13:45:00',
          doctorId: 201,
          doctorName: 'Dr. Raj Kumar'
        },
        {
          id: 127,
          name: 'Crocin 500mg Tablet',
          quantity: 2,
          price: 24,
          isRxOnly: false, // This is an OTC medicine
          addedBy: {
            id: 5,
            name: 'Chemist User',
            role: 'chemist'
          },
          status: 'no_approval_needed',
          reason: 'Added for fever symptoms mentioned by patient'
        }
      ]
    },
    {
      id: 3,
      customerId: 103,
      customerName: 'Rajesh Sharma',
      customerAddress: '789 Lake View, Koramangala, Bangalore',
      customerPhone: '+91 7654321098',
      prescriptionImage: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88',
      status: 'not_readable',
      uploadDate: '2025-04-16T18:45:00',
      medicines: [],
      orderNotes: 'Prescription image is blurry and text is not readable. Please upload a clearer image.'
    },
    {
      id: 4,
      customerId: 104,
      customerName: 'Neha Verma',
      customerAddress: '101 High Street, Salt Lake, Kolkata',
      customerPhone: '+91 6543210987',
      prescriptionImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
      status: 'packed',
      uploadDate: '2025-04-16T09:30:00',
      medicines: [
        {
          id: 814,
          name: 'Telmibrex-AM Tablet',
          quantity: 3,
          inStock: true,
          price: 106,
          currentPrice: 106,
          priceChanged: false
        },
        {
          id: 621,
          name: 'Pantop 40mg Tablet',
          quantity: 2,
          inStock: true,
          price: 85,
          currentPrice: 75,
          priceChanged: true
        }
      ],
      medicalEquipment: [
        {
          id: 101,
          name: 'Oxygen Concentrator',
          type: 'medical_device',
          description: 'Portable oxygen concentrator for home use',
          price: 3500,
          rentalPrice: 250,
          rentalDuration: 'per week',
          isRental: true,
          quantity: 1,
          status: 'approved',
          addedDate: '2025-04-16T10:15:00',
          requestNotes: 'Patient needs home oxygen therapy',
          approvalDate: '2025-04-16T11:30:00',
          approvedBy: {
            id: 15,
            name: 'Hospital Admin',
            role: 'hospital_staff'
          }
        },
        {
          id: 102,
          name: 'Blood Pressure Monitor',
          type: 'monitoring_device',
          description: 'Digital BP monitor for home use',
          price: 1200,
          isRental: false,
          quantity: 1,
          status: 'approved',
          addedDate: '2025-04-16T10:20:00',
          approvalDate: '2025-04-16T11:30:00',
          approvedBy: {
            id: 15,
            name: 'Hospital Admin',
            role: 'hospital_staff'
          }
        }
      ],
      medicalServices: [
        {
          id: 201,
          serviceType: 'nurse_visit',
          description: 'Home nursing care for post-surgery recovery',
          requestedFor: new Date('2025-04-20T09:00:00'),
          duration: '2 hours',
          patientCondition: 'Post-surgery recovery, needs dressing change and IV medication',
          specialInstructions: 'Patient has latex allergy',
          price: 1200,
          status: 'pending',
          requestNotes: 'Patient needs dressing change and IV medication'
        }
      ]
    },
    {
      id: 5,
      customerId: 105,
      customerName: 'Suresh Patel',
      customerAddress: '222 Ring Road, Navrangpura, Ahmedabad',
      customerPhone: '+91 5432109876',
      prescriptionImage: 'https://images.unsplash.com/photo-1583911650865-f6882549458a',
      status: 'picked',
      uploadDate: '2025-04-15T16:20:00',
      medicines: [
        {
          id: 418,
          name: 'Crocin Advance 500mg Tablet',
          quantity: 2,
          inStock: true,
          price: 24,
          currentPrice: 24,
          priceChanged: false
        }
      ],
      emergencyServices: {
        id: 301,
        serviceType: 'ambulance',
        requestedAt: new Date('2025-04-15T16:30:00'),
        pickupLocation: '222 Ring Road, Navrangpura, Ahmedabad',
        destinationLocation: 'Apollo Hospital, Gandhinagar Highway',
        patientCondition: 'Elderly patient with sudden chest pain and difficulty breathing',
        contactName: 'Suresh Patel',
        contactPhone: '+91 5432109876',
        status: 'completed',
        dispatchedAt: new Date('2025-04-15T16:40:00'),
        arrivalEstimate: new Date('2025-04-15T17:00:00'),
        price: 1500,
        specialInstructions: 'Patient has history of cardiac issues, bring oxygen support',
        medicalEquipmentNeeded: ['Oxygen', 'ECG Monitor', 'Emergency medication kit']
      }
    },
    {
      id: 6,
      customerId: 106,
      customerName: 'Kavita Gupta',
      customerAddress: '333 Jubilee Hills, Hyderabad',
      customerPhone: '+91 4321098765',
      prescriptionImage: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3',
      status: 'delivered',
      uploadDate: '2025-04-15T11:45:00',
      medicines: [
        {
          id: 814,
          name: 'Telmibrex-AM Tablet',
          quantity: 1,
          inStock: true,
          price: 106,
          currentPrice: 106,
          priceChanged: false
        },
        {
          id: 735,
          name: 'Ecosprin 75mg Tablet',
          quantity: 1,
          inStock: true,
          price: 12,
          currentPrice: 12,
          priceChanged: false
        },
        {
          id: 526,
          name: 'Shelcal 500mg Tablet',
          quantity: 1,
          inStock: true,
          price: 110,
          currentPrice: 110,
          priceChanged: false
        }
      ]
    }
  ];

  // Step 1: Mark as reviewed - first step in the workflow
  const handleMarkAsReviewed = (prescription: Prescription) => {
    // In a real app, this would make an API call to update the status to 'reviewed'
    console.log('Marking prescription as reviewed:', prescription.id);
    toast({
      title: "Prescription reviewed",
      description: "Prescription has been reviewed and will be checked against medicine database.",
    });
    
    // Mock notification to customer
    console.log(`NOTIFICATION to ${prescription.customerPhone}: Your prescription has been reviewed by our pharmacist. We're now checking medicine availability.`);
  };
  
  // Step 2: Mark as medicine checked
  const handleMarkMedicineChecked = (prescription: Prescription) => {
    // In a real app, this would make an API call to update the status to 'medicine_checked'
    console.log('Marking prescription medicines as checked:', prescription.id);
    toast({
      title: "Medicines checked",
      description: "All prescribed medicines have been checked for availability.",
    });
    
    // Mock notification to customer
    console.log(`NOTIFICATION to ${prescription.customerPhone}: Your prescribed medicines are available. Proceeding to order confirmation.`);
  };
  
  // Step 3: Mark as order confirmed
  const handleConfirmOrder = (prescription: Prescription) => {
    // In a real app, this would make an API call to update the status to 'order_confirmed'
    console.log('Confirming prescription order:', prescription.id);
    toast({
      title: "Order confirmed",
      description: "The order has been confirmed and will be prepared for delivery.",
    });
    
    // Mock notification to customer
    console.log(`NOTIFICATION to ${prescription.customerPhone}: Your prescription order #${prescription.id} has been confirmed. We'll prepare it for delivery soon.`);
  };
  
  // For backward compatibility
  const handleMarkReadable = (prescription: Prescription) => {
    // Call the new workflow function
    handleMarkAsReviewed(prescription);
  };

  const handleMarkNotReadable = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setOpenRejectDialog(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedPrescription) return;
    
    // In a real app, this would make an API call to reject the prescription
    console.log('Rejecting prescription:', selectedPrescription.id, 'Reason:', rejectReason);
    toast({
      title: "Prescription marked as not readable",
      description: "Customer has been notified to upload a clearer prescription image.",
      variant: "destructive"
    });
    
    // Mock notification to customer
    console.log(`NOTIFICATION to ${selectedPrescription.customerPhone}: Your prescription could not be verified. Reason: ${rejectReason}. Please upload a clearer image.`);
    
    setOpenRejectDialog(false);
    setRejectReason('');
    setSelectedPrescription(null);
  };

  const handleMarkPacked = (prescription: Prescription) => {
    // In a real app, this would make an API call to update the status
    console.log('Marking prescription as packed:', prescription.id);
    toast({
      title: "Order packed",
      description: "Order has been marked as packed and customer has been notified.",
    });
    
    // Mock notification to customer
    console.log(`NOTIFICATION to ${prescription.customerPhone}: Your order #${prescription.id} has been packed and is ready for pickup.`);
  };

  const handleAssignDelivery = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setOpenAssignDialog(true);
  };
  
  // Form states for new services
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: 'medical_device' as const,
    description: '',
    quantity: 1,
    isRental: false,
    price: '',
    rentalPrice: '',
    rentalDuration: 'per day',
    requestNotes: ''
  });
  
  const [newMedicalService, setNewMedicalService] = useState({
    serviceType: 'nurse_visit' as const,
    description: '',
    requestedDate: '',
    requestedTime: '',
    duration: '',
    patientCondition: '',
    specialInstructions: '',
    price: ''
  });
  
  const [newEmergencyService, setNewEmergencyService] = useState({
    serviceType: 'ambulance' as const,
    pickupLocation: '',
    destinationLocation: '',
    patientCondition: '',
    contactName: '',
    contactPhone: '',
    specialInstructions: '',
    medicalEquipmentNeeded: [] as string[]
  });
  
  // Handlers for adding medical equipment
  const handleAddEquipment = () => {
    if (!selectedPrescription) return;
    
    const price = parseFloat(newEquipment.price);
    const rentalPrice = newEquipment.isRental ? parseFloat(newEquipment.rentalPrice) : undefined;
    
    if (!newEquipment.name) {
      toast({
        title: "Error",
        description: "Equipment name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }
    
    if (newEquipment.isRental && (isNaN(rentalPrice!) || rentalPrice! <= 0)) {
      toast({
        title: "Error",
        description: "Please enter a valid rental price",
        variant: "destructive"
      });
      return;
    }
    
    const equipment: MedicalEquipment = {
      id: Math.floor(Math.random() * 1000) + 500, // In a real app, this would be generated by the server
      name: newEquipment.name,
      type: newEquipment.type,
      description: newEquipment.description,
      price: price,
      rentalPrice: rentalPrice,
      rentalDuration: newEquipment.isRental ? newEquipment.rentalDuration : undefined,
      isRental: newEquipment.isRental,
      quantity: newEquipment.quantity,
      status: 'pending_approval',
      addedDate: new Date().toISOString(),
      requestNotes: newEquipment.requestNotes || undefined
    };
    
    // In a real app, this would make an API call to add the equipment
    console.log('Adding equipment to prescription:', selectedPrescription.id, equipment);
    
    toast({
      title: "Equipment added",
      description: `${equipment.name} has been added to the prescription and is pending approval.`
    });
    
    // Reset the form
    setNewEquipment({
      name: '',
      type: 'medical_device',
      description: '',
      quantity: 1,
      isRental: false,
      price: '',
      rentalPrice: '',
      rentalDuration: 'per day',
      requestNotes: ''
    });
    
    setOpenAddEquipmentDialog(false);
  };
  
  // Handlers for adding medical service
  const handleAddMedicalService = () => {
    if (!selectedPrescription) return;
    
    const price = parseFloat(newMedicalService.price);
    
    if (!newMedicalService.description) {
      toast({
        title: "Error",
        description: "Service description is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!newMedicalService.requestedDate || !newMedicalService.requestedTime) {
      toast({
        title: "Error",
        description: "Service date and time are required",
        variant: "destructive"
      });
      return;
    }
    
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }
    
    const requestedDateTime = new Date(`${newMedicalService.requestedDate}T${newMedicalService.requestedTime}`);
    
    const service: MedicalService = {
      id: Math.floor(Math.random() * 1000) + 200, // In a real app, this would be generated by the server
      serviceType: newMedicalService.serviceType,
      description: newMedicalService.description,
      requestedFor: requestedDateTime,
      duration: newMedicalService.duration,
      patientCondition: newMedicalService.patientCondition,
      specialInstructions: newMedicalService.specialInstructions || undefined,
      price: price,
      status: 'pending',
      requestNotes: newMedicalService.patientCondition
    };
    
    // In a real app, this would make an API call to add the service
    console.log('Adding medical service to prescription:', selectedPrescription.id, service);
    
    toast({
      title: "Service requested",
      description: `${service.serviceType.replace('_', ' ')} has been requested and is pending approval.`
    });
    
    // Reset the form
    setNewMedicalService({
      serviceType: 'nurse_visit',
      description: '',
      requestedDate: '',
      requestedTime: '',
      duration: '',
      patientCondition: '',
      specialInstructions: '',
      price: ''
    });
    
    setOpenAddServiceDialog(false);
  };
  
  // Handlers for adding emergency service
  const handleAddEmergencyService = () => {
    if (!selectedPrescription) return;
    
    if (!newEmergencyService.pickupLocation) {
      toast({
        title: "Error",
        description: "Pickup location is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!newEmergencyService.patientCondition) {
      toast({
        title: "Error",
        description: "Patient condition is required",
        variant: "destructive"
      });
      return;
    }
    
    const emergency: EmergencyService = {
      id: Math.floor(Math.random() * 1000) + 300, // In a real app, this would be generated by the server
      serviceType: newEmergencyService.serviceType,
      requestedAt: new Date(),
      pickupLocation: newEmergencyService.pickupLocation,
      destinationLocation: newEmergencyService.destinationLocation,
      patientCondition: newEmergencyService.patientCondition,
      contactName: newEmergencyService.contactName || selectedPrescription.customerName,
      contactPhone: newEmergencyService.contactPhone || selectedPrescription.customerPhone,
      status: 'requested',
      price: newEmergencyService.serviceType === 'ambulance' ? 1500 : 
             newEmergencyService.serviceType === 'air_ambulance' ? 25000 : 5000,
      specialInstructions: newEmergencyService.specialInstructions || undefined,
      medicalEquipmentNeeded: newEmergencyService.medicalEquipmentNeeded.length > 0 ? 
                              newEmergencyService.medicalEquipmentNeeded : undefined
    };
    
    // In a real app, this would make an API call to add the emergency service
    console.log('Adding emergency service to prescription:', selectedPrescription.id, emergency);
    
    const serviceTypeDisplay = emergency.serviceType === 'air_ambulance' ? 'Air Ambulance' : 
                              emergency.serviceType === 'emergency_medical_team' ? 'Emergency Medical Team' : 'Ambulance';
    
    toast({
      title: "Emergency service requested",
      description: `${serviceTypeDisplay} has been requested and will be dispatched immediately.`,
      variant: "destructive" // Using destructive variant to highlight emergency
    });
    
    // Reset the form
    setNewEmergencyService({
      serviceType: 'ambulance',
      pickupLocation: '',
      destinationLocation: '',
      patientCondition: '',
      contactName: '',
      contactPhone: '',
      specialInstructions: '',
      medicalEquipmentNeeded: []
    });
    
    setOpenEmergencyServiceDialog(false);
  };

  const handleAssignConfirm = () => {
    if (!selectedPrescription) return;
    
    // In a real app, this would make an API call to assign delivery
    console.log('Assigning delivery for prescription:', selectedPrescription.id, 'Courier:', assignCourier);
    toast({
      title: "Delivery assigned",
      description: `Order assigned to ${assignCourier} for delivery.`,
    });
    
    // Mock notification to customer
    console.log(`NOTIFICATION to ${selectedPrescription.customerPhone}: Your order #${selectedPrescription.id} has been picked up by ${assignCourier} for delivery.`);
    
    setOpenAssignDialog(false);
    setAssignCourier('');
    setSelectedPrescription(null);
  };
  
  // Medicine management handlers
  const handleAddMedicine = () => {
    setOpenAddMedicineDialog(true);
  };
  
  // Function to add medicine to prescription
  const handleAddExtraMedicineToPrescription = (
    prescriptionId: number, 
    medicine: { 
      id: number;
      name: string;
      price: number;
      quantity: number;
      isRxOnly: boolean;
      reason: string;
    }
  ) => {
    // In a real app, this would make an API call to add the medicine to the prescription
    console.log('Adding medicine to prescription:', prescriptionId, medicine);
    
    // Determine approval status based on whether it's an RX or OTC medicine
    const status = medicine.isRxOnly ? 'pending_approval' : 'no_approval_needed';
    
    const extraMedicine: ExtraMedicine = {
      id: medicine.id,
      name: medicine.name,
      quantity: medicine.quantity,
      price: medicine.price,
      isRxOnly: medicine.isRxOnly,
      addedBy: {
        id: 5, // Assuming current logged in chemist ID
        name: 'Chemist User',
        role: 'chemist'
      },
      status: status,
      reason: medicine.reason
    };
    
    toast({
      title: medicine.isRxOnly ? "Medicine Added (Needs Approval)" : "Medicine Added to Order",
      description: medicine.isRxOnly 
        ? `${medicine.name} has been added to the prescription and is awaiting doctor approval.`
        : `${medicine.name} has been added to the prescription and will be included in the order.`,
    });
    
    // If this was a real app, we would update the prescription state after the API call
    // For now, just log that we would add the medicine with the appropriate status
    console.log('Extra medicine would be added with status:', status);
    
    return extraMedicine;
  };
  
  // Function to add medical equipment to prescription
  const handleAddEquipmentToPrescription = (
    prescriptionId: number, 
    equipment: { 
      name: string;
      type: 'medical_device' | 'surgical_instrument' | 'diagnostic_equipment' | 'monitoring_device' | 'mobility_aid';
      description: string;
      price: number;
      isRental: boolean;
      rentalPrice?: number;
      rentalDuration?: string;
      quantity: number;
      requestNotes?: string;
    }
  ) => {
    // In a real app, this would make an API call to add equipment to the prescription
    console.log('Adding equipment to prescription:', prescriptionId, equipment);
    
    const medicalEquipment: MedicalEquipment = {
      id: Math.floor(Math.random() * 1000) + 1000, // Generate random ID for demo
      name: equipment.name,
      type: equipment.type,
      description: equipment.description,
      price: equipment.price,
      rentalPrice: equipment.rentalPrice,
      rentalDuration: equipment.rentalDuration,
      isRental: equipment.isRental,
      quantity: equipment.quantity,
      status: 'pending_approval',
      addedDate: new Date().toISOString(),
      requestNotes: equipment.requestNotes
    };
    
    toast({
      title: "Medical Equipment Request Added",
      description: `${equipment.name} request has been added to the prescription and is awaiting approval.`,
    });
    
    // If this was a real app, we would update the prescription state after the API call
    console.log('Medical equipment would be added with status: pending_approval');
    
    return medicalEquipment;
  };
  
  // Function to add medical service request to prescription
  const handleAddMedicalServiceToPrescription = (
    prescriptionId: number, 
    service: { 
      serviceType: 'doctor_visit' | 'nurse_visit' | 'specialist_consultation' | 'home_care' | 'physiotherapy' | 'other';
      description: string;
      requestedFor: Date;
      duration: string;
      patientCondition: string;
      specialInstructions?: string;
      price: number;
      requestNotes?: string;
    }
  ) => {
    // In a real app, this would make an API call to add medical service to the prescription
    console.log('Adding medical service to prescription:', prescriptionId, service);
    
    const medicalService: MedicalService = {
      id: Math.floor(Math.random() * 1000) + 2000, // Generate random ID for demo
      serviceType: service.serviceType,
      description: service.description,
      requestedFor: service.requestedFor,
      duration: service.duration,
      patientCondition: service.patientCondition,
      specialInstructions: service.specialInstructions,
      price: service.price,
      status: 'pending',
      requestNotes: service.requestNotes
    };
    
    toast({
      title: "Medical Service Request Added",
      description: `${service.serviceType.replace('_', ' ')} request has been added to the prescription and will be processed.`,
    });
    
    // If this was a real app, we would update the prescription state after the API call
    console.log('Medical service would be added with status: pending');
    
    return medicalService;
  };
  
  // Function to add emergency service to prescription
  const handleAddEmergencyServiceToPrescription = (
    prescriptionId: number, 
    service: { 
      serviceType: 'ambulance' | 'air_ambulance' | 'emergency_medical_team';
      pickupLocation: string;
      destinationLocation: string;
      patientCondition: string;
      contactName: string;
      contactPhone: string;
      specialInstructions?: string;
      medicalEquipmentNeeded?: string[];
    }
  ) => {
    // In a real app, this would make an API call to add emergency service to the prescription
    console.log('Adding emergency service to prescription:', prescriptionId, service);
    
    const emergencyService: EmergencyService = {
      id: Math.floor(Math.random() * 1000) + 3000, // Generate random ID for demo
      serviceType: service.serviceType,
      requestedAt: new Date(),
      pickupLocation: service.pickupLocation,
      destinationLocation: service.destinationLocation,
      patientCondition: service.patientCondition,
      contactName: service.contactName,
      contactPhone: service.contactPhone,
      status: 'requested',
      price: service.serviceType === 'air_ambulance' ? 25000 : 1500, // Higher price for air ambulance
      specialInstructions: service.specialInstructions,
      medicalEquipmentNeeded: service.medicalEquipmentNeeded
    };
    
    toast({
      title: "Emergency Service Requested",
      description: `${service.serviceType.replace('_', ' ')} has been requested and dispatchers have been notified. You will receive confirmation shortly.`,
      variant: "destructive" // Using destructive variant for emergency alert
    });
    
    // If this was a real app, we would update the prescription state after the API call
    // and trigger immediate notifications to dispatchers
    console.log('Emergency service would be added with status: requested');
    console.log('NOTIFICATION to EMERGENCY DISPATCHERS: New emergency service request received!');
    
    return emergencyService;
  };

  const handleMedicineInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMedicine(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewMedicine(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  const handleSubmitMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Validate form
    if (!newMedicine.name || !newMedicine.brand || !newMedicine.composition || 
        !newMedicine.category || !newMedicine.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all the required fields.",
        variant: "destructive"
      });
      setIsUploading(false);
      return;
    }
    
    // In a real app, this would make an API call to upload the medicine
    console.log('New medicine data:', newMedicine);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Medicine Submitted",
      description: "Your medicine has been submitted for admin approval.",
    });
    
    setIsUploading(false);
    setOpenAddMedicineDialog(false);
    
    // Reset form
    setNewMedicine({
      name: '',
      brand: '',
      genericName: '',
      category: '',
      composition: '',
      description: '',
      price: '',
      discountedPrice: '',
      packSize: '',
      image: null
    });
  };
  
  // Function to handle price/dosage edits only (for chemist restricted permissions)
  const handlePriceUpdate = async (medicineId: number, updatedData: {
    price: number;
    discountedPrice: number;
    packSize: string;
  }) => {
    try {
      // In a real app, this would make an API call to update only the price and dosage
      console.log('Updating medicine price/dosage:', medicineId, updatedData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Price Updated",
        description: "The medicine price and information has been updated successfully.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update medicine price. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Filter medicines based on search query and filters
  const filteredMedicines = medicines.filter(medicine => {
    // Apply search filter
    const matchesSearch = medicineSearchQuery === '' || 
      medicine.name.toLowerCase().includes(medicineSearchQuery.toLowerCase()) ||
      medicine.composition.toLowerCase().includes(medicineSearchQuery.toLowerCase()) ||
      medicine.brand.toLowerCase().includes(medicineSearchQuery.toLowerCase());
      
    // Apply category filter
    const matchesCategory = categoryFilter === null || medicine.category === categoryFilter;
    
    // Apply status filter
    const matchesStatus = statusFilter === null || medicine.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Get unique categories for filtering
  const categories = Array.from(new Set(medicines.map(m => m.category)));

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">New</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-300">Reviewed</Badge>;
      case 'medicine_checked':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">Medicines Checked</Badge>;
      case 'order_confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Order Confirmed</Badge>;
      case 'not_readable':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Not Readable</Badge>;
      case 'packed':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">Packed</Badge>;
      case 'picked':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Picked</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">Delivered</Badge>;
      // For backward compatibility
      case 'readable':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Verified</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filterPrescriptions = (status: string | string[]) => {
    if (Array.isArray(status)) {
      return prescriptions.filter(p => status.includes(p.status));
    }
    return prescriptions.filter(p => p.status === status);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('chemist_dashboard')}</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <Tabs defaultValue="new">
        <TabsList className="mb-4">
          <TabsTrigger value="new" className="relative">
            {t('new_prescriptions')}
            {filterPrescriptions('new').length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {filterPrescriptions('new').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="medicine_checked">Medicines Checked</TabsTrigger>
          <TabsTrigger value="order_confirmed">Order Confirmed</TabsTrigger>
          <TabsTrigger value="not_readable">{t('not_readable')}</TabsTrigger>
          <TabsTrigger value="processing">{t('processing')}</TabsTrigger>
          <TabsTrigger value="completed">{t('completed')}</TabsTrigger>
          <TabsTrigger value="all">{t('all_prescriptions')}</TabsTrigger>
          <TabsTrigger value="medicines" className="relative">
            {t('medicines')}
            {medicines.filter(m => m.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {medicines.filter(m => m.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          {filterPrescriptions('new').length > 0 ? (
            filterPrescriptions('new').map(prescription => (
              <PrescriptionCard 
                key={prescription.id}
                prescription={prescription}
                onMarkReadable={handleMarkReadable}
                onMarkNotReadable={handleMarkNotReadable}
                onMarkPacked={handleMarkPacked}
                onAssignDelivery={handleAssignDelivery}
                renderStatusBadge={renderStatusBadge}
                onMarkAsReviewed={handleMarkAsReviewed}
                onMarkMedicineChecked={handleMarkMedicineChecked}
                onConfirmOrder={handleConfirmOrder}
              />
            ))
          ) : (
            <EmptyState message={t('no_new_prescriptions')} />
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {filterPrescriptions('reviewed').length > 0 ? (
            filterPrescriptions('reviewed').map(prescription => (
              <PrescriptionCard 
                key={prescription.id}
                prescription={prescription}
                onMarkReadable={handleMarkReadable}
                onMarkNotReadable={handleMarkNotReadable}
                onMarkPacked={handleMarkPacked}
                onAssignDelivery={handleAssignDelivery}
                renderStatusBadge={renderStatusBadge}
                onMarkAsReviewed={handleMarkAsReviewed}
                onMarkMedicineChecked={handleMarkMedicineChecked}
                onConfirmOrder={handleConfirmOrder}
              />
            ))
          ) : (
            <EmptyState message={t('no_verified_prescriptions')} />
          )}
        </TabsContent>

        <TabsContent value="not_readable" className="space-y-4">
          {filterPrescriptions('not_readable').length > 0 ? (
            filterPrescriptions('not_readable').map(prescription => (
              <PrescriptionCard 
                key={prescription.id}
                prescription={prescription}
                onMarkReadable={handleMarkReadable}
                onMarkNotReadable={handleMarkNotReadable}
                onMarkPacked={handleMarkPacked}
                onAssignDelivery={handleAssignDelivery}
                renderStatusBadge={renderStatusBadge}
                onMarkAsReviewed={handleMarkAsReviewed}
                onMarkMedicineChecked={handleMarkMedicineChecked}
                onConfirmOrder={handleConfirmOrder}
              />
            ))
          ) : (
            <EmptyState message={t('no_unreadable_prescriptions')} />
          )}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          {filterPrescriptions(['packed', 'picked']).length > 0 ? (
            filterPrescriptions(['packed', 'picked']).map(prescription => (
              <PrescriptionCard 
                key={prescription.id}
                prescription={prescription}
                onMarkReadable={handleMarkReadable}
                onMarkNotReadable={handleMarkNotReadable}
                onMarkPacked={handleMarkPacked}
                onAssignDelivery={handleAssignDelivery}
                renderStatusBadge={renderStatusBadge}
                onMarkAsReviewed={handleMarkAsReviewed}
                onMarkMedicineChecked={handleMarkMedicineChecked}
                onConfirmOrder={handleConfirmOrder}
              />
            ))
          ) : (
            <EmptyState message={t('no_processing_prescriptions')} />
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filterPrescriptions('delivered').length > 0 ? (
            filterPrescriptions('delivered').map(prescription => (
              <PrescriptionCard 
                key={prescription.id}
                prescription={prescription}
                onMarkReadable={handleMarkReadable}
                onMarkNotReadable={handleMarkNotReadable}
                onMarkPacked={handleMarkPacked}
                onAssignDelivery={handleAssignDelivery}
                renderStatusBadge={renderStatusBadge}
                onMarkAsReviewed={handleMarkAsReviewed}
                onMarkMedicineChecked={handleMarkMedicineChecked}
                onConfirmOrder={handleConfirmOrder}
              />
            ))
          ) : (
            <EmptyState message={t('no_completed_prescriptions')} />
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {prescriptions.map(prescription => (
            <PrescriptionCard 
              key={prescription.id}
              prescription={prescription}
              onMarkReadable={handleMarkReadable}
              onMarkNotReadable={handleMarkNotReadable}
              onMarkPacked={handleMarkPacked}
              onAssignDelivery={handleAssignDelivery}
              renderStatusBadge={renderStatusBadge}
              onMarkAsReviewed={handleMarkAsReviewed}
              onMarkMedicineChecked={handleMarkMedicineChecked}
              onConfirmOrder={handleConfirmOrder}
            />
          ))}
        </TabsContent>

        <TabsContent value="medicines" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1 mr-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  className="pl-9" 
                  placeholder={t('search_medicines')}
                  value={medicineSearchQuery}
                  onChange={(e) => setMedicineSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter || ''} onValueChange={val => setCategoryFilter(val || null)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('filter_by_category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter || ''} onValueChange={val => setStatusFilter(val || null)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('filter_by_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddMedicine}>
                <PlusCircle className="h-4 w-4 mr-2" />
                {t('add_medicine')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map(medicine => (
                <MedicineCard 
                  key={medicine.id} 
                  medicine={medicine} 
                  onUpdatePrice={handlePriceUpdate} 
                />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState message={t('no_medicines_found')} />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={openRejectDialog} onOpenChange={setOpenRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('mark_prescription_not_readable')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="rejectReason">{t('reason_for_rejection')}</Label>
              <Textarea 
                id="rejectReason" 
                placeholder={t('explain_why_prescription_not_readable')}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenRejectDialog(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              {t('confirm_not_readable')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openAssignDialog} onOpenChange={setOpenAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('assign_delivery')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="courierSelect">{t('select_delivery_service')}</Label>
              <Select value={assignCourier} onValueChange={setAssignCourier}>
                <SelectTrigger id="courierSelect">
                  <SelectValue placeholder={t('select_delivery_service')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-house-delivery">In-House Delivery</SelectItem>
                  <SelectItem value="delhivery">Delhivery</SelectItem>
                  <SelectItem value="bluedart">BlueDart</SelectItem>
                  <SelectItem value="dtdc">DTDC</SelectItem>
                  <SelectItem value="fedex">FedEx</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenAssignDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleAssignConfirm} disabled={!assignCourier}>
              {t('assign')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={openAddMedicineDialog} onOpenChange={setOpenAddMedicineDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('add_new_medicine')}</DialogTitle>
            <DialogDescription>
              All medicines uploaded by hospital staff and chemists require admin or subadmin approval. Only price and dosage can be directly edited for existing medicines.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitMedicine} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="required">{t('medicine_name')}</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={newMedicine.name}
                    onChange={handleMedicineInputChange}
                    placeholder="e.g., Telma-H 40 Tablet" 
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="brand" className="required">{t('brand')}</Label>
                  <Input 
                    id="brand" 
                    name="brand" 
                    value={newMedicine.brand}
                    onChange={handleMedicineInputChange}
                    placeholder="e.g., Glenmark" 
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="genericName">{t('generic_name')}</Label>
                  <Input 
                    id="genericName" 
                    name="genericName" 
                    value={newMedicine.genericName}
                    onChange={handleMedicineInputChange}
                    placeholder="e.g., Telmisartan/Hydrochlorothiazide" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category" className="required">{t('category')}</Label>
                  <Input 
                    id="category" 
                    name="category" 
                    value={newMedicine.category}
                    onChange={handleMedicineInputChange}
                    placeholder="e.g., Cardiac Care" 
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="composition" className="required">{t('composition')}</Label>
                  <Input 
                    id="composition" 
                    name="composition" 
                    value={newMedicine.composition}
                    onChange={handleMedicineInputChange}
                    placeholder="e.g., Telmisartan (40mg) + Hydrochlorothiazide (12.5mg)" 
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">{t('description')}</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={newMedicine.description}
                    onChange={handleMedicineInputChange}
                    placeholder="e.g., Used for hypertension and reduces risk of cardiovascular events" 
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="price" className="required">{t('price')}</Label>
                  <Input 
                    id="price" 
                    name="price" 
                    type="number" 
                    min="0" 
                    step="0.01"
                    value={newMedicine.price}
                    onChange={handleMedicineInputChange}
                    placeholder="e.g., 120" 
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="discountedPrice">{t('discounted_price')}</Label>
                  <Input 
                    id="discountedPrice" 
                    name="discountedPrice" 
                    type="number" 
                    min="0" 
                    step="0.01"
                    value={newMedicine.discountedPrice}
                    onChange={handleMedicineInputChange}
                    placeholder="e.g., 108" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="packSize">{t('pack_size')}</Label>
                  <Input 
                    id="packSize" 
                    name="packSize" 
                    value={newMedicine.packSize}
                    onChange={handleMedicineInputChange}
                    placeholder="e.g., 10 tablets per strip" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="image">{t('product_image')}</Label>
                  <Input 
                    id="image" 
                    name="image" 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-gray-500">{t('image_requirements')}</p>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => setOpenAddMedicineDialog(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('uploading')}
                  </>
                ) : (
                  t('submit_for_approval')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sub-components
interface PrescriptionCardProps {
  prescription: Prescription;
  onMarkReadable: (prescription: Prescription) => void;
  onMarkNotReadable: (prescription: Prescription) => void;
  onMarkPacked: (prescription: Prescription) => void;
  onAssignDelivery: (prescription: Prescription) => void;
  renderStatusBadge: (status: string) => React.ReactNode;
  // New handlers for the updated workflow
  onMarkAsReviewed?: (prescription: Prescription) => void;
  onMarkMedicineChecked?: (prescription: Prescription) => void;
  onConfirmOrder?: (prescription: Prescription) => void;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ 
  prescription, 
  onMarkReadable, 
  onMarkNotReadable, 
  onMarkPacked,
  onAssignDelivery,
  renderStatusBadge,
  onMarkAsReviewed,
  onMarkMedicineChecked,
  onConfirmOrder
}) => {
  const { t } = useLanguage();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  
  // Calculate order total (including medicines, equipment, and services)
  let orderTotal = prescription.medicines.reduce((total, med) => total + (med.currentPrice * med.quantity), 0);
  
  // Add medical equipment costs if present
  if (prescription.medicalEquipment && prescription.medicalEquipment.length > 0) {
    orderTotal += prescription.medicalEquipment.reduce((total, equip) => {
      return total + (equip.isRental ? (equip.rentalPrice || 0) : equip.price) * equip.quantity;
    }, 0);
  }
  
  // Add medical service costs if present
  if (prescription.medicalServices && prescription.medicalServices.length > 0) {
    orderTotal += prescription.medicalServices.reduce((total, service) => {
      return total + service.price;
    }, 0);
  }
  
  // Add emergency service cost if present
  if (prescription.emergencyServices) {
    orderTotal += prescription.emergencyServices.price;
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderActionButtons = () => {
    switch(prescription.status) {
      case 'new':
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              onClick={() => onMarkNotReadable(prescription)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              {t('not_readable')}
            </Button>
            <Button
              variant="outline"
              className="bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200"
              onClick={() => onMarkAsReviewed?.(prescription)}
            >
              <ClipboardCheck className="h-4 w-4 mr-1" />
              Mark Reviewed
            </Button>
          </div>
        );
      
      case 'reviewed':
        return (
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
              onClick={() => onMarkMedicineChecked?.(prescription)}
            >
              <ClipboardList className="h-4 w-4 mr-1" />
              Mark Medicines Checked
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Add to Prescription</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  setSelectedPrescription(prescription);
                  setOpenAddMedicineDialog(true);
                }}>
                  <Pill className="mr-2 h-4 w-4" />
                  <span>Add Medicines</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedPrescription(prescription);
                  setOpenAddEquipmentDialog(true);
                }}>
                  <Stethoscope className="mr-2 h-4 w-4" />
                  <span>Add Medical Equipment</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedPrescription(prescription);
                  setOpenAddServiceDialog(true);
                }}>
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>Request Medical Service</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      
      case 'medicine_checked':
        return (
          <div className="flex flex-wrap gap-2">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onConfirmOrder?.(prescription)}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Confirm Order
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Add to Prescription</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  setSelectedPrescription(prescription);
                  setOpenAddMedicineDialog(true);
                }}>
                  <Pill className="mr-2 h-4 w-4" />
                  <span>Add Medicines</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      
      case 'order_confirmed':
        return (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onMarkPacked(prescription)}>
              <Package className="h-4 w-4 mr-1" />
              {t('mark_packed')}
            </Button>
          </div>
        );
      
      case 'packed':
        return (
          <Button onClick={() => onAssignDelivery(prescription)}>
            <Truck className="h-4 w-4 mr-1" />
            {t('assign_delivery')}
          </Button>
        );
        
      // For backward compatibility
      case 'readable':
        return (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onMarkPacked(prescription)}>
              <Package className="h-4 w-4 mr-1" />
              {t('mark_packed')}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Add to Prescription</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  setSelectedPrescription(prescription);
                  setOpenAddMedicineDialog(true);
                }}>
                  <Pill className="mr-2 h-4 w-4" />
                  <span>Add Medicines</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedPrescription(prescription);
                  setOpenAddEquipmentDialog(true);
                }}>
                  <Stethoscope className="mr-2 h-4 w-4" />
                  <span>Add Medical Equipment</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedPrescription(prescription);
                  setOpenAddServiceDialog(true);
                }}>
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>Request Medical Service</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
          
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <span>{t('order')} #{prescription.id}</span>
              <span className="ml-3">{renderStatusBadge(prescription.status)}</span>
            </CardTitle>
            <CardDescription>
              {t('uploaded')}: {formatDate(prescription.uploadDate)}
            </CardDescription>
          </div>
          <Dialog open={openDetailsDialog} onOpenChange={setOpenDetailsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                {t('view_details')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{t('prescription_details')} #{prescription.id}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">{t('customer_information')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <User className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <span>{prescription.customerName}</span>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <span>{prescription.customerPhone}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <span>{prescription.customerAddress}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-700 mt-4 mb-2">{t('prescription_image')}</h3>
                  <img 
                    src={getSafeImageUrl(prescription.prescriptionImage)} 
                    alt="Prescription" 
                    className="rounded-md border border-gray-200 w-full max-h-60 object-contain"
                  />
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">{t('order_details')}</h3>
                  {prescription.medicines.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-600">{t('prescribed_medicines')}</h4>
                      {prescription.medicines.map((medicine) => (
                        <div key={medicine.id} className="flex justify-between border-b pb-2">
                          <div>
                            <div className="font-medium">{medicine.name}</div>
                            <div className="text-sm text-gray-500">Qty: {medicine.quantity}</div>
                          </div>
                          <div className="text-right">
                            {medicine.priceChanged ? (
                              <div>
                                <div className="text-sm line-through text-gray-500">₹{medicine.price}</div>
                                <div className={medicine.currentPrice > medicine.price ? 'text-red-600' : 'text-green-600'}>
                                  ₹{medicine.currentPrice}
                                </div>
                              </div>
                            ) : (
                              <div>₹{medicine.price}</div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Extra medicines added by chemist */}
                      {prescription.extraMedicines && prescription.extraMedicines.length > 0 && (
                        <>
                          <h4 className="text-sm font-semibold text-gray-600 mt-4">{t('additional_medicines')}</h4>
                          
                          {/* Group extra medicines by approval status */}
                          <div className="space-y-3">
                            {/* RX medicines needing doctor approval */}
                            {prescription.extraMedicines.filter(med => med.isRxOnly && med.status === 'pending_approval').length > 0 && (
                              <div className="text-xs bg-amber-50 text-amber-800 p-2 rounded mb-2">
                                Prescription medicines require doctor approval before being included.
                              </div>
                            )}
                            
                            {/* OTC medicines not needing approval */}
                            {prescription.extraMedicines.filter(med => !med.isRxOnly && med.status === 'no_approval_needed').length > 0 && (
                              <div className="text-xs bg-blue-50 text-blue-800 p-2 rounded mb-2">
                                OTC medicines added to order (no approval needed).
                              </div>
                            )}
                            
                            {prescription.extraMedicines.map((medicine) => (
                              <div key={medicine.id} className="flex justify-between border-b pb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{medicine.name}</span>
                                    {medicine.isRxOnly && (
                                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs">
                                        RX
                                      </Badge>
                                    )}
                                    {!medicine.isRxOnly && (
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs">
                                        OTC
                                      </Badge>
                                    )}
                                    {medicine.status === 'pending_approval' && (
                                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                                        Awaiting Approval
                                      </Badge>
                                    )}
                                    {medicine.status === 'approved' && (
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                        Approved
                                      </Badge>
                                    )}
                                    {medicine.status === 'rejected' && (
                                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                                        Rejected
                                      </Badge>
                                    )}
                                    {medicine.status === 'no_approval_needed' && (
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                        Added to Order
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">Qty: {medicine.quantity}</div>
                                  {medicine.reason && (
                                    <div className="text-xs text-gray-500 mt-1 italic">
                                      Reason: {medicine.reason}
                                    </div>
                                  )}
                                  {medicine.status === 'approved' && medicine.doctorName && (
                                    <div className="text-xs text-green-600 mt-1">
                                      Approved by: {medicine.doctorName}
                                    </div>
                                  )}
                                  {medicine.status === 'rejected' && medicine.rejectionReason && (
                                    <div className="text-xs text-red-600 mt-1">
                                      Rejected: {medicine.rejectionReason}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div>₹{medicine.price}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Medical Equipment Section */}
                      {prescription.medicalEquipment && prescription.medicalEquipment.length > 0 && (
                        <>
                          <h4 className="text-sm font-semibold text-gray-600 mt-4">Medical Equipment</h4>
                          <div className="space-y-3">
                            {prescription.medicalEquipment.map((equipment) => (
                              <div key={equipment.id} className="flex justify-between border-b pb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{equipment.name}</span>
                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300 text-xs">
                                      {equipment.type.replace('_', ' ')}
                                    </Badge>
                                    <Badge variant="outline" className={`text-xs ${
                                      equipment.status === 'pending_approval' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                                      equipment.status === 'approved' ? 'bg-green-50 text-green-700 border-green-300' :
                                      equipment.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-300' :
                                      equipment.status === 'delivered' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                      equipment.status === 'returned' ? 'bg-purple-50 text-purple-700 border-purple-300' :
                                      'bg-gray-50 text-gray-700 border-gray-300'
                                    }`}>
                                      {equipment.status.replace('_', ' ')}
                                    </Badge>
                                    {equipment.isRental && (
                                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs">
                                        Rental
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">{equipment.description}</div>
                                  <div className="text-sm text-gray-500">Qty: {equipment.quantity}</div>
                                  {equipment.isRental && equipment.rentalDuration && (
                                    <div className="text-sm text-gray-500">Duration: {equipment.rentalDuration}</div>
                                  )}
                                  {equipment.requestNotes && (
                                    <div className="text-xs text-gray-500 mt-1 italic">
                                      Note: {equipment.requestNotes}
                                    </div>
                                  )}
                                  {equipment.approvedBy && (
                                    <div className="text-xs text-green-600 mt-1">
                                      Approved by: {equipment.approvedBy.name} ({equipment.approvedBy.role})
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  {equipment.isRental ? (
                                    <div>
                                      <div className="text-sm text-gray-500">Rental fee:</div>
                                      <div>₹{equipment.rentalPrice} {equipment.rentalDuration}</div>
                                    </div>
                                  ) : (
                                    <div>₹{equipment.price}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Medical Services Section */}
                      {prescription.medicalServices && prescription.medicalServices.length > 0 && (
                        <>
                          <h4 className="text-sm font-semibold text-gray-600 mt-4">Medical Services</h4>
                          <div className="space-y-3">
                            {prescription.medicalServices.map((service) => (
                              <div key={service.id} className="flex justify-between border-b pb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{service.serviceType.replace('_', ' ')}</span>
                                    <Badge variant="outline" className={`text-xs ${
                                      service.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                                      service.status === 'approved' ? 'bg-green-50 text-green-700 border-green-300' :
                                      service.status === 'assigned' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                      service.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                      service.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-300' :
                                      'bg-gray-50 text-gray-700 border-gray-300'
                                    }`}>
                                      {service.status}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-500">{service.description}</div>
                                  <div className="text-sm text-gray-500">
                                    Requested for: {new Date(service.requestedFor).toLocaleString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  <div className="text-sm text-gray-500">Duration: {service.duration}</div>
                                  <div className="text-sm text-gray-500">Patient condition: {service.patientCondition}</div>
                                  {service.specialInstructions && (
                                    <div className="text-xs text-gray-500 mt-1 italic">
                                      Special instructions: {service.specialInstructions}
                                    </div>
                                  )}
                                  {service.assignedTo && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      Assigned to: {service.assignedTo.name} ({service.assignedTo.role})
                                      {service.assignedTo.specialization && ` - ${service.assignedTo.specialization}`}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div>₹{service.price}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Emergency Services Section */}
                      {prescription.emergencyServices && (
                        <>
                          <h4 className="text-sm font-semibold text-gray-600 mt-4">Emergency Services</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between border-b pb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{prescription.emergencyServices.serviceType.replace('_', ' ')}</span>
                                  <Badge variant={prescription.emergencyServices.serviceType === 'air_ambulance' ? 'default' : 'outline'} 
                                    className={`text-xs ${
                                    prescription.emergencyServices.status === 'requested' ? 'bg-red-50 text-red-700 border-red-300' :
                                    prescription.emergencyServices.status === 'dispatched' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                                    prescription.emergencyServices.status === 'in_transit' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                    prescription.emergencyServices.status === 'completed' ? 'bg-green-50 text-green-700 border-green-300' :
                                    prescription.emergencyServices.status === 'cancelled' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                                    'bg-gray-50 text-gray-700 border-gray-300'
                                  }`}>
                                    {prescription.emergencyServices.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-500">
                                  Requested at: {new Date(prescription.emergencyServices.requestedAt).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                <div className="text-sm text-gray-500">From: {prescription.emergencyServices.pickupLocation}</div>
                                <div className="text-sm text-gray-500">To: {prescription.emergencyServices.destinationLocation}</div>
                                <div className="text-sm text-gray-500">Patient condition: {prescription.emergencyServices.patientCondition}</div>
                                
                                {prescription.emergencyServices.specialInstructions && (
                                  <div className="text-xs text-gray-500 mt-1 italic">
                                    Special instructions: {prescription.emergencyServices.specialInstructions}
                                  </div>
                                )}
                                
                                {prescription.emergencyServices.medicalEquipmentNeeded && 
                                prescription.emergencyServices.medicalEquipmentNeeded.length > 0 && (
                                  <div className="mt-1">
                                    <div className="text-xs text-gray-600 font-medium">Equipment needed:</div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {prescription.emergencyServices.medicalEquipmentNeeded.map((item, index) => (
                                        <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                          {item}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {prescription.emergencyServices.dispatchedAt && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    Dispatched at: {new Date(prescription.emergencyServices.dispatchedAt).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                )}
                                
                                {prescription.emergencyServices.arrivalEstimate && (
                                  <div className="text-xs text-green-600 mt-1">
                                    Estimated arrival: {new Date(prescription.emergencyServices.arrivalEstimate).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div>₹{prescription.emergencyServices.price}</div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between font-medium pt-2">
                        <div>{t('total')}</div>
                        <div>₹{orderTotal}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      {prescription.orderNotes || t('no_medicines_in_order')}
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end">
                    {renderActionButtons()}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-2 sm:mb-0">
            <div className="text-sm font-medium">{prescription.customerName}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {prescription.customerAddress.split(',')[0]}...
            </div>
          </div>
          
          <div className="flex items-center">
            {prescription.medicines.length > 0 && (
              <div className="mr-4">
                <div className="text-sm text-gray-500">{t('items')}</div>
                <div className="font-medium">{prescription.medicines.length}</div>
              </div>
            )}
            
            <div>
              <div className="text-sm text-gray-500">{t('total')}</div>
              <div className="font-medium">₹{orderTotal}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="flex gap-1">
          {prescription.medicines.map((medicine, idx) => (
            medicine.priceChanged && (
              <Badge key={idx} variant="outline" className={medicine.currentPrice > medicine.price ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}>
                {medicine.name.length > 15 ? `${medicine.name.substring(0, 15)}...` : medicine.name}: {medicine.currentPrice > medicine.price ? 'Price ↑' : 'Price ↓'}
              </Badge>
            )
          ))}
        </div>
        {renderActionButtons()}
      </CardFooter>
    </Card>
  );
};

const MedicineCard: React.FC<{ 
  medicine: ChemistMedicine;
  onUpdatePrice: (medicineId: number, updatedData: { price: number; discountedPrice: number; packSize: string; }) => Promise<boolean>;
}> = ({ medicine, onUpdatePrice }) => {
  const { t } = useLanguage();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    price: medicine.price.toString(),
    discountedPrice: medicine.discountedPrice.toString(),
    packSize: medicine.packSize
  });
  const { toast } = useToast();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would make an API call to update the medicine
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Price Updated",
        description: "The medicine price has been updated successfully.",
      });
      
      setOpenEditDialog(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update medicine price. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Calculate discount percentage
  const discountPercentage = medicine.discountedPrice < medicine.price
    ? Math.round(((medicine.price - medicine.discountedPrice) / medicine.price) * 100)
    : 0;

  return (
    <Card className="overflow-hidden">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={getSafeImageUrl(medicine.imageUrl)} 
          alt={medicine.name} 
          className="w-full h-full object-contain"
        />
        <div className="absolute top-2 right-2">
          {renderStatusBadge(medicine.status)}
        </div>
        {discountPercentage > 0 && (
          <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            {discountPercentage}% OFF
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{medicine.name}</CardTitle>
        <CardDescription>{medicine.brand}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-baseline">
          <div>
            {medicine.discountedPrice < medicine.price ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold">₹{medicine.discountedPrice}</span>
                <span className="text-sm text-gray-500 line-through">₹{medicine.price}</span>
              </div>
            ) : (
              <span className="text-lg font-bold">₹{medicine.price}</span>
            )}
          </div>
          <div className="text-sm text-gray-500">{medicine.packSize}</div>
        </div>
        <div className="mt-2 text-sm text-gray-700">
          {medicine.composition}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 border-t pt-3">
        <Button variant="ghost" size="sm" onClick={() => setOpenDetailsDialog(true)}>
          {t('view_details')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpenEditDialog(true)}>
          <Pencil className="h-4 w-4 mr-1" />
          {t('edit_price')}
        </Button>
        <div className="ml-auto">
          <span className="text-xs text-gray-500">{formatDate(medicine.createdAt)}</span>
        </div>
      </CardFooter>
      
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('edit_medicine_price')}</DialogTitle>
            <DialogDescription>
              {t('edit_medicine_price_description')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="price">{t('regular_price')}</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number" 
                  min="0" 
                  step="0.01"
                  value={editData.price}
                  onChange={handleEditChange}
                  placeholder="e.g., 120"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="discountedPrice">{t('discounted_price')}</Label>
                <Input 
                  id="discountedPrice" 
                  name="discountedPrice" 
                  type="number" 
                  min="0" 
                  step="0.01"
                  value={editData.discountedPrice}
                  onChange={handleEditChange}
                  placeholder="e.g., 108" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="packSize">{t('pack_size')}</Label>
                <Input 
                  id="packSize" 
                  name="packSize" 
                  value={editData.packSize}
                  onChange={handleEditChange}
                  placeholder="e.g., 10 tablets per strip" 
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => setOpenEditDialog(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit">
                {t('update_price')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openDetailsDialog} onOpenChange={setOpenDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{medicine.name}</DialogTitle>
            <DialogDescription>{medicine.brand} • {medicine.packSize}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <img 
                src={getSafeImageUrl(medicine.imageUrl)} 
                alt={medicine.name} 
                className="w-full h-64 object-contain rounded-md border"
              />
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">{t('price_information')}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-lg font-bold">₹{medicine.discountedPrice}</span>
                  {medicine.discountedPrice < medicine.price && (
                    <span className="text-sm text-gray-500 line-through">₹{medicine.price}</span>
                  )}
                </div>
                {medicine.status === 'pending' && (
                  <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded mt-2">
                    {t('pending_approval_message')}
                  </p>
                )}
                {medicine.status === 'rejected' && (
                  <div className="text-sm text-red-700 bg-red-50 p-2 rounded mt-2">
                    <p className="font-medium">{t('rejection_reason')}:</p>
                    <p>{medicine.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">{t('medicine_information')}</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-600">{t('generic_name')}</dt>
                  <dd>{medicine.genericName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">{t('category')}</dt>
                  <dd>{medicine.category}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">{t('composition')}</dt>
                  <dd>{medicine.composition}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">{t('description')}</dt>
                  <dd>{medicine.description}</dd>
                </div>
              </dl>
              
              <h3 className="font-medium text-gray-700 mt-4 mb-2">{t('status_information')}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span>{t('status')}:</span>
                {renderStatusBadge(medicine.status)}
              </div>
              <div className="text-sm text-gray-600">
                <div>{t('created')}: {formatDate(medicine.createdAt)}</div>
                <div>{t('last_updated')}: {formatDate(medicine.updatedAt)}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg">
      <Clock className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-1">{message}</h3>
      <p className="text-gray-500 max-w-md">
        When new prescriptions arrive, they will appear here for processing.
      </p>
    </div>
  );
};

export default ChemistDashboard;