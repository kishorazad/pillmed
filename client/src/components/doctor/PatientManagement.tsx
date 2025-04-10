import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FilePlus,
  FileText,
  User,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Activity,
  Pill,
  Heart,
  Thermometer,
  Plus,
  Edit,
  Trash
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

// Type definitions
interface Patient {
  id: number;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  registeredDate: string;
  lastVisit: string;
  chronicConditions: string[];
  photo?: string;
  pending?: boolean;
}

interface MedicalRecord {
  id: number;
  patientId: number;
  date: string;
  diagnosis: string;
  symptoms: string[];
  notes: string;
  prescriptions: Prescription[];
  vitalSigns: VitalSigns;
  followUpDate?: string;
}

interface Prescription {
  id: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface VitalSigns {
  temperature: number;
  heartRate: number;
  bloodPressure: string;
  respiratoryRate: number;
  spo2: number;
  weight: number;
  height: number;
}

const PatientManagement = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewPatientDialogOpen, setIsViewPatientDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTab, setSelectedTab] = useState('active');
  const [isAddRecordDialogOpen, setIsAddRecordDialogOpen] = useState(false);
  
  // Sample patient data
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1001,
      name: 'Vikram Mehta',
      age: 45,
      gender: 'Male',
      phone: '+91 98765 10111',
      email: 'vikram.m@example.com',
      address: '123 Park Street, Mumbai, MH 400001',
      bloodGroup: 'O+',
      registeredDate: '2023-01-15',
      lastVisit: '2025-04-05',
      chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
      photo: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 1002,
      name: 'Sunita Sharma',
      age: 38,
      gender: 'Female',
      phone: '+91 87654 20222',
      email: 'sunita.s@example.com',
      address: '45 Green Avenue, Delhi, DL 110001',
      bloodGroup: 'B+',
      registeredDate: '2023-02-20',
      lastVisit: '2025-04-01',
      chronicConditions: ['Asthma'],
      photo: 'https://randomuser.me/api/portraits/women/67.jpg'
    },
    {
      id: 1003,
      name: 'Rajesh Patel',
      age: 62,
      gender: 'Male',
      phone: '+91 76543 30333',
      email: 'rajesh.p@example.com',
      address: '78 Lake View, Ahmedabad, GJ 380001',
      bloodGroup: 'A-',
      registeredDate: '2022-11-10',
      lastVisit: '2025-03-22',
      chronicConditions: ['Arthritis', 'Hypertension'],
      photo: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
      id: 1004,
      name: 'Kavita Singh',
      age: 28,
      gender: 'Female',
      phone: '+91 65432 40444',
      email: 'kavita.s@example.com',
      address: '15 Tech Park, Bangalore, KA 560001',
      bloodGroup: 'AB+',
      registeredDate: '2023-05-05',
      lastVisit: '2025-03-15',
      chronicConditions: [],
      photo: 'https://randomuser.me/api/portraits/women/22.jpg'
    },
    {
      id: 1005,
      name: 'Arun Kumar',
      age: 55,
      gender: 'Male',
      phone: '+91 54321 50555',
      email: 'arun.k@example.com',
      address: '32 River Road, Chennai, TN 600001',
      bloodGroup: 'O-',
      registeredDate: '2022-08-12',
      lastVisit: '2025-02-28',
      chronicConditions: ['Hypothyroidism'],
      photo: 'https://randomuser.me/api/portraits/men/67.jpg',
      pending: true
    }
  ]);
  
  // Sample medical records
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([
    {
      id: 5001,
      patientId: 1001,
      date: '2025-04-05',
      diagnosis: 'Hypertension follow-up',
      symptoms: ['Occasional headache', 'Fatigue'],
      notes: 'Blood pressure slightly elevated. Adjusted medication dosage.',
      prescriptions: [
        {
          id: 7001,
          medicationName: 'Amlodipine',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          notes: 'Take in the morning'
        },
        {
          id: 7002,
          medicationName: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '30 days',
          notes: 'Take with meals'
        }
      ],
      vitalSigns: {
        temperature: 37.0,
        heartRate: 78,
        bloodPressure: '135/85',
        respiratoryRate: 16,
        spo2: 98,
        weight: 82,
        height: 175
      },
      followUpDate: '2025-05-05'
    },
    {
      id: 5002,
      patientId: 1001,
      date: '2025-03-05',
      diagnosis: 'Upper respiratory infection',
      symptoms: ['Cough', 'Mild fever', 'Sore throat'],
      notes: 'Symptoms of viral URI. Advised rest and hydration.',
      prescriptions: [
        {
          id: 7003,
          medicationName: 'Paracetamol',
          dosage: '500mg',
          frequency: 'As needed, up to 4 times daily',
          duration: '5 days',
          notes: 'For fever and pain'
        }
      ],
      vitalSigns: {
        temperature: 37.8,
        heartRate: 84,
        bloodPressure: '132/84',
        respiratoryRate: 18,
        spo2: 97,
        weight: 82,
        height: 175
      }
    },
    {
      id: 5003,
      patientId: 1002,
      date: '2025-04-01',
      diagnosis: 'Asthma exacerbation',
      symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness'],
      notes: 'Moderate asthma exacerbation triggered by seasonal allergies.',
      prescriptions: [
        {
          id: 7004,
          medicationName: 'Salbutamol inhaler',
          dosage: '2 puffs',
          frequency: 'As needed, up to 4 times daily',
          duration: 'Continuous',
          notes: 'Use when experiencing symptoms'
        },
        {
          id: 7005,
          medicationName: 'Fluticasone inhaler',
          dosage: '2 puffs',
          frequency: 'Twice daily',
          duration: '30 days',
          notes: 'Maintenance therapy'
        }
      ],
      vitalSigns: {
        temperature: 36.8,
        heartRate: 92,
        bloodPressure: '118/76',
        respiratoryRate: 22,
        spo2: 95,
        weight: 65,
        height: 160
      },
      followUpDate: '2025-05-01'
    }
  ]);
  
  // Filter patients based on search query and active/pending status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchQuery === '' || 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toString().includes(searchQuery);
    
    const matchesTab = 
      (selectedTab === 'active' && !patient.pending) ||
      (selectedTab === 'pending' && patient.pending);
    
    return matchesSearch && matchesTab;
  });
  
  // Get patient's medical records
  const getPatientMedicalRecords = (patientId: number): MedicalRecord[] => {
    return medicalRecords.filter(record => record.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  // Handle view patient
  const handleViewPatient = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setIsViewPatientDialogOpen(true);
    }
  };
  
  // Handle adding new medical record
  const handleAddMedicalRecord = () => {
    // In a real app, you'd save the new record here
    setIsAddRecordDialogOpen(false);
  };
  
  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  // Calculate BMI
  const calculateBMI = (weight: number, heightCm: number): number => {
    const heightM = heightCm / 100;
    return Number((weight / (heightM * heightM)).toFixed(1));
  };
  
  // Function to handle tab changes
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Patient Management</h2>
        
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search patients..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="active" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="active">Active Patients</TabsTrigger>
          <TabsTrigger value="pending">Pending Consultations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Patient List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Info</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={patient.photo} alt={patient.name} />
                              <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-sm text-gray-500">ID: {patient.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{patient.age} yrs, {patient.gender}</div>
                            <div className="text-gray-500">{patient.bloodGroup} • {patient.chronicConditions.length > 0 ? patient.chronicConditions.join(', ') : 'No chronic conditions'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{patient.lastVisit}</div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewPatient(patient.id)}
                          >
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No patients found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={patient.photo} alt={patient.name} />
                              <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-sm text-gray-500">ID: {patient.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{patient.age} yrs, {patient.gender}</div>
                            <div className="text-gray-500">{patient.bloodGroup} • {patient.chronicConditions.length > 0 ? patient.chronicConditions.join(', ') : 'No chronic conditions'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewPatient(patient.id)}
                          >
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No pending consultations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Patient Profile Dialog */}
      <Dialog open={isViewPatientDialogOpen} onOpenChange={setIsViewPatientDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Patient Profile</DialogTitle>
            <DialogDescription>
              View comprehensive patient information
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <Tabs defaultValue="profile" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="records">Medical Records</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={selectedPatient.photo} alt={selectedPatient.name} />
                        <AvatarFallback className="text-2xl">{getInitials(selectedPatient.name)}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-xl mt-4">{selectedPatient.name}</h3>
                      <p className="text-gray-500 mt-1">ID: {selectedPatient.id}</p>
                      
                      <div className="w-full border-t my-4"></div>
                      
                      <div className="w-full space-y-3">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{selectedPatient.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedPatient.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedPatient.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Registered: {selectedPatient.registeredDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>General Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-gray-500">Age</Label>
                            <p className="font-medium">{selectedPatient.age} years</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Gender</Label>
                            <p className="font-medium">{selectedPatient.gender}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Blood Group</Label>
                            <p className="font-medium">{selectedPatient.bloodGroup}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Last Visit</Label>
                            <p className="font-medium">{selectedPatient.lastVisit}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Medical Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-500">Chronic Conditions</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedPatient.chronicConditions.length > 0 ? (
                                selectedPatient.chronicConditions.map((condition, index) => (
                                  <Badge key={index} variant="outline" className="bg-blue-50">
                                    {condition}
                                  </Badge>
                                ))
                              ) : (
                                <p>No chronic conditions recorded</p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-gray-500">Allergies</Label>
                            <p className="mt-2">No known allergies</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Latest Vital Signs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {getPatientMedicalRecords(selectedPatient.id).length > 0 ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-gray-500">
                                  <Heart className="inline mr-1 h-4 w-4" /> 
                                  Heart Rate
                                </Label>
                                <span className="font-medium">
                                  {getPatientMedicalRecords(selectedPatient.id)[0].vitalSigns.heartRate} bpm
                                </span>
                              </div>
                              <Progress 
                                value={getPatientMedicalRecords(selectedPatient.id)[0].vitalSigns.heartRate} 
                                max={120} 
                                className="mt-2 h-2" 
                              />
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-gray-500">
                                  <Activity className="inline mr-1 h-4 w-4" /> 
                                  Blood Pressure
                                </Label>
                                <span className="font-medium">
                                  {getPatientMedicalRecords(selectedPatient.id)[0].vitalSigns.bloodPressure}
                                </span>
                              </div>
                              <Progress 
                                value={parseInt(getPatientMedicalRecords(selectedPatient.id)[0].vitalSigns.bloodPressure.split('/')[0])} 
                                max={180} 
                                className="mt-2 h-2" 
                              />
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-gray-500">
                                  <Thermometer className="inline mr-1 h-4 w-4" /> 
                                  Temperature
                                </Label>
                                <span className="font-medium">
                                  {getPatientMedicalRecords(selectedPatient.id)[0].vitalSigns.temperature}°C
                                </span>
                              </div>
                              <Progress 
                                value={(getPatientMedicalRecords(selectedPatient.id)[0].vitalSigns.temperature - 35) * 20} 
                                max={40} 
                                className="mt-2 h-2" 
                              />
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-gray-500">
                                  <Activity className="inline mr-1 h-4 w-4" /> 
                                  SpO2
                                </Label>
                                <span className="font-medium">
                                  {getPatientMedicalRecords(selectedPatient.id)[0].vitalSigns.spo2}%
                                </span>
                              </div>
                              <Progress 
                                value={getPatientMedicalRecords(selectedPatient.id)[0].vitalSigns.spo2} 
                                max={100} 
                                className="mt-2 h-2" 
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-gray-500">
                                  <User className="inline mr-1 h-4 w-4" /> 
                                  BMI
                                </Label>
                                <span className="font-medium">
                                  {calculateBMI(
                                    getPatientMedicalRecords(selectedPatient.id)[0].vitalSigns.weight,
                                    getPatientMedicalRecords(selectedPatient.id)[0].vitalSigns.height
                                  )}
                                  {' '}kg/m²
                                </span>
                              </div>
                              <Progress 
                                value={calculateBMI(
                                  getPatientMedicalRecords(selectedPatient.id)[0].vitalSigns.weight,
                                  getPatientMedicalRecords(selectedPatient.id)[0].vitalSigns.height
                                )} 
                                max={40} 
                                className="mt-2 h-2" 
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Underweight</span>
                                <span>Normal</span>
                                <span>Overweight</span>
                                <span>Obese</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500">No vital signs recorded yet</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="records" className="py-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Medical History</h3>
                  <Button onClick={() => setIsAddRecordDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Record
                  </Button>
                </div>
                
                {getPatientMedicalRecords(selectedPatient.id).length > 0 ? (
                  <Accordion type="multiple" className="space-y-4">
                    {getPatientMedicalRecords(selectedPatient.id).map(record => (
                      <AccordionItem key={record.id} value={record.id.toString()}>
                        <AccordionTrigger className="px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                          <div className="flex flex-col items-start">
                            <div className="font-medium">{record.date} - {record.diagnosis}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {record.symptoms.slice(0, 2).join(', ')}
                              {record.symptoms.length > 2 && '...'}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                              <h4 className="font-medium mb-2">Symptoms</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {record.symptoms.map((symptom, index) => (
                                  <li key={index} className="text-gray-700">{symptom}</li>
                                ))}
                              </ul>
                              
                              <h4 className="font-medium mt-4 mb-2">Diagnosis & Notes</h4>
                              <p className="text-gray-700">{record.notes}</p>
                              
                              {record.followUpDate && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-center gap-2">
                                  <Calendar className="h-5 w-5 text-blue-500" />
                                  <span>Follow-up scheduled for: <strong>{record.followUpDate}</strong></span>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Prescribed Medications</h4>
                              {record.prescriptions.map(prescription => (
                                <div 
                                  key={prescription.id}
                                  className="p-3 border rounded-md mb-2 bg-white"
                                >
                                  <div className="font-medium">{prescription.medicationName} ({prescription.dosage})</div>
                                  <div className="text-sm mt-1">
                                    <span className="text-gray-500">Frequency:</span> {prescription.frequency}
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-gray-500">Duration:</span> {prescription.duration}
                                  </div>
                                  {prescription.notes && (
                                    <div className="text-sm mt-1 italic">
                                      Note: {prescription.notes}
                                    </div>
                                  )}
                                </div>
                              ))}
                              
                              <h4 className="font-medium mt-4 mb-2">Vital Signs</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Temperature:</span> {record.vitalSigns.temperature}°C
                                </div>
                                <div>
                                  <span className="text-gray-500">Heart Rate:</span> {record.vitalSigns.heartRate} bpm
                                </div>
                                <div>
                                  <span className="text-gray-500">Blood Pressure:</span> {record.vitalSigns.bloodPressure}
                                </div>
                                <div>
                                  <span className="text-gray-500">Respiratory Rate:</span> {record.vitalSigns.respiratoryRate}/min
                                </div>
                                <div>
                                  <span className="text-gray-500">SpO2:</span> {record.vitalSigns.spo2}%
                                </div>
                                <div>
                                  <span className="text-gray-500">Weight:</span> {record.vitalSigns.weight} kg
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Record
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">No medical records found</h3>
                    <p className="mt-1 text-gray-500">Add a new medical record to start tracking this patient's health.</p>
                    <Button onClick={() => setIsAddRecordDialogOpen(true)} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Record
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="prescriptions" className="py-4">
                <h3 className="text-lg font-semibold mb-4">Active Prescriptions</h3>
                
                {getPatientMedicalRecords(selectedPatient.id).length > 0 ? (
                  <div className="space-y-4">
                    {getPatientMedicalRecords(selectedPatient.id)
                      .flatMap(record => record.prescriptions.map(prescription => ({
                        ...prescription,
                        date: record.date
                      })))
                      .slice(0, 5)
                      .map(prescription => (
                        <Card key={prescription.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Pill className="h-5 w-5 text-[#10847e]" />
                                  <h4 className="font-medium">{prescription.medicationName} • {prescription.dosage}</h4>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  Prescribed on {prescription.date} • {prescription.frequency} • {prescription.duration}
                                </p>
                                {prescription.notes && (
                                  <div className="flex items-center gap-1 mt-2 text-sm">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    <span>{prescription.notes}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                    
                    <div className="flex justify-center mt-4">
                      <Button variant="outline">View All Prescriptions</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <Pill className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">No prescriptions found</h3>
                    <p className="mt-1 text-gray-500">Add a new medical record with prescriptions.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewPatientDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Medical Record Dialog */}
      <Dialog open={isAddRecordDialogOpen} onOpenChange={setIsAddRecordDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Medical Record</DialogTitle>
            <DialogDescription>
              {selectedPatient && `Create a new medical record for ${selectedPatient.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input id="diagnosis" placeholder="Enter diagnosis" />
              </div>
              
              <div>
                <Label>Symptoms</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="symptom1" />
                    <label
                      htmlFor="symptom1"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Fever
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="symptom2" />
                    <label
                      htmlFor="symptom2"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Cough
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="symptom3" />
                    <label
                      htmlFor="symptom3"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Headache
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="symptom4" />
                    <label
                      htmlFor="symptom4"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Fatigue
                    </label>
                  </div>
                </div>
                <Input className="mt-2" placeholder="Add other symptoms" />
              </div>
              
              <div>
                <Label htmlFor="notes">Clinical Notes</Label>
                <Textarea id="notes" placeholder="Enter detailed clinical notes" rows={4} />
              </div>
              
              <div>
                <Label htmlFor="followup">Follow-up Date (optional)</Label>
                <Input id="followup" type="date" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Vital Signs</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input id="temperature" type="number" step="0.1" placeholder="37.0" />
                </div>
                <div>
                  <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                  <Input id="heartRate" type="number" placeholder="72" />
                </div>
                <div>
                  <Label htmlFor="bloodPressure">Blood Pressure</Label>
                  <Input id="bloodPressure" placeholder="120/80" />
                </div>
                <div>
                  <Label htmlFor="respRate">Respiratory Rate</Label>
                  <Input id="respRate" type="number" placeholder="16" />
                </div>
                <div>
                  <Label htmlFor="spo2">SpO2 (%)</Label>
                  <Input id="spo2" type="number" placeholder="98" />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" step="0.1" placeholder="70" />
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Prescriptions</h4>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-1 h-4 w-4" /> Add Medication
                  </Button>
                </div>
                
                <div className="mt-3 p-3 border rounded-md">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="medication">Medication</Label>
                      <Input id="medication" placeholder="Drug name" />
                    </div>
                    <div>
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input id="dosage" placeholder="e.g. 500mg" />
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Once daily</SelectItem>
                          <SelectItem value="bid">Twice daily</SelectItem>
                          <SelectItem value="tid">Three times daily</SelectItem>
                          <SelectItem value="qid">Four times daily</SelectItem>
                          <SelectItem value="prn">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input id="duration" placeholder="e.g. 7 days" />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="medNotes">Instructions</Label>
                      <Input id="medNotes" placeholder="Special instructions" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRecordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMedicalRecord}>
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientManagement;