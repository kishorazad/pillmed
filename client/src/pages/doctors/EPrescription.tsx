import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Pill, 
  Download, 
  Printer, 
  Mail, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Share2,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Sample data - in a real application, this would be fetched from the API
const doctorData = {
  id: 1,
  name: 'Dr. Priya Sharma',
  image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  specialty: 'Cardiologist',
  qualifications: 'MBBS, MD (Cardiology)',
  registrationNumber: 'MCI-123456',
  hospital: 'Apollo Hospitals, Delhi'
};

const patientData = {
  id: 1,
  name: 'Rahul Khanna',
  age: 45,
  gender: 'Male',
  weight: 78,
  height: 175,
  bloodGroup: 'O+',
  address: '123 Park Street, New Delhi',
  phone: '+91 98765 43210',
  email: 'rahul.khanna@example.com'
};

const appointmentData = {
  id: 'APT1234567',
  date: '2025-04-25',
  consultationType: 'Video'
};

// Common medication frequencies
const frequencies = [
  { value: 'once-daily', label: 'Once daily' },
  { value: 'twice-daily', label: 'Twice daily' },
  { value: 'thrice-daily', label: 'Three times a day' },
  { value: 'four-times-daily', label: 'Four times a day' },
  { value: 'every-morning', label: 'Every morning' },
  { value: 'every-night', label: 'Every night' },
  { value: 'before-meals', label: 'Before meals' },
  { value: 'after-meals', label: 'After meals' },
  { value: 'as-needed', label: 'As needed (PRN)' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' }
];

// Common durations
const durations = [
  { value: '3-days', label: '3 days' },
  { value: '5-days', label: '5 days' },
  { value: '7-days', label: '7 days' },
  { value: '10-days', label: '10 days' },
  { value: '14-days', label: '14 days' },
  { value: '1-month', label: '1 month' },
  { value: '2-months', label: '2 months' },
  { value: '3-months', label: '3 months' },
  { value: 'continuous', label: 'Continuous' },
  { value: 'custom', label: 'Custom' }
];

// Interface for medication item
interface Medication {
  id: string;
  name: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  instructions: string;
}

// Interface for test item
interface Test {
  id: string;
  name: string;
  instructions: string;
}

const EPrescription: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // State for prescription details
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  
  // State for medications
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Amlodipine',
      dosage: '5mg',
      route: 'Oral',
      frequency: 'Once daily',
      duration: '1 month',
      instructions: 'Take in the morning with food'
    }
  ]);
  
  // State for tests
  const [tests, setTests] = useState<Test[]>([
    {
      id: '1',
      name: 'Complete Blood Count (CBC)',
      instructions: 'Fasting 8 hours prior to test'
    }
  ]);
  
  // State for confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Function to add new medication
  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      route: 'Oral',
      frequency: '',
      duration: '',
      instructions: ''
    };
    setMedications([...medications, newMedication]);
  };
  
  // Function to update medication
  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };
  
  // Function to remove medication
  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };
  
  // Function to add new test
  const addTest = () => {
    const newTest: Test = {
      id: Date.now().toString(),
      name: '',
      instructions: ''
    };
    setTests([...tests, newTest]);
  };
  
  // Function to update test
  const updateTest = (id: string, field: keyof Test, value: string) => {
    setTests(tests.map(test => 
      test.id === id ? { ...test, [field]: value } : test
    ));
  };
  
  // Function to remove test
  const removeTest = (id: string) => {
    setTests(tests.filter(test => test.id !== id));
  };
  
  // Function to save prescription
  const savePrescription = () => {
    // Validate required fields
    if (!diagnosis) {
      toast({
        title: "Diagnosis Required",
        description: "Please enter a diagnosis before saving the prescription.",
        variant: "destructive",
      });
      return;
    }
    
    if (medications.some(med => !med.name || !med.dosage || !med.frequency || !med.duration)) {
      toast({
        title: "Incomplete Medication Details",
        description: "Please complete all medication details before saving.",
        variant: "destructive",
      });
      return;
    }
    
    // Show confirmation dialog
    setShowConfirmation(true);
  };
  
  // Function to confirm and finalize prescription
  const finalizePrescription = () => {
    // In a real application, this would make an API call to save the prescription
    console.log("Saving prescription:", {
      doctor: doctorData,
      patient: patientData,
      appointment: appointmentData,
      diagnosis,
      symptoms,
      medications,
      tests,
      generalInstructions,
      followUpDate,
      followUpNotes
    });
    
    // Close dialog
    setShowConfirmation(false);
    
    // Show success toast
    toast({
      title: "Prescription Saved",
      description: "The e-prescription has been successfully saved and shared with the patient.",
    });
    
    // Navigate to doctor dashboard
    navigate('/doctor');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/doctor">Doctor Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>E-Prescription</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create E-Prescription</h1>
          <p className="text-gray-600">
            Digital prescription for appointment #{appointmentData.id}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={() => navigate('/doctor')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            className="bg-orange-500 hover:bg-orange-600 flex items-center"
            onClick={savePrescription}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Prescription
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Diagnosis and Symptoms */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis & Symptoms</CardTitle>
              <CardDescription>
                Enter the patient's diagnosis and observed symptoms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis <span className="text-red-500">*</span></Label>
                <Input 
                  id="diagnosis" 
                  placeholder="Enter diagnosis" 
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms & Observations</Label>
                <Textarea 
                  id="symptoms" 
                  placeholder="Describe patient's symptoms and observations" 
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Medications */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Medications</CardTitle>
                  <CardDescription>
                    Prescribe medications with dosage and instructions
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                  onClick={addMedication}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p>No medications added yet</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={addMedication}
                  >
                    Add a medication
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {medications.map((medication, index) => (
                    <div key={medication.id} className="border rounded-lg p-4 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
                        onClick={() => removeMedication(medication.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <h3 className="font-medium mb-4">Medication #{index + 1}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor={`med-name-${medication.id}`}>
                            Medication Name <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            id={`med-name-${medication.id}`}
                            placeholder="Enter medication name"
                            value={medication.name}
                            onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`med-dosage-${medication.id}`}>
                            Dosage <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            id={`med-dosage-${medication.id}`}
                            placeholder="E.g. 500mg, 5ml, etc."
                            value={medication.dosage}
                            onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor={`med-route-${medication.id}`}>Route</Label>
                          <Select 
                            value={medication.route}
                            onValueChange={(value) => updateMedication(medication.id, 'route', value)}
                          >
                            <SelectTrigger id={`med-route-${medication.id}`}>
                              <SelectValue placeholder="Select route" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Oral">Oral</SelectItem>
                              <SelectItem value="Topical">Topical</SelectItem>
                              <SelectItem value="Injection">Injection</SelectItem>
                              <SelectItem value="Inhalation">Inhalation</SelectItem>
                              <SelectItem value="Sublingual">Sublingual</SelectItem>
                              <SelectItem value="Rectal">Rectal</SelectItem>
                              <SelectItem value="Eye Drops">Eye Drops</SelectItem>
                              <SelectItem value="Ear Drops">Ear Drops</SelectItem>
                              <SelectItem value="Nasal">Nasal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`med-frequency-${medication.id}`}>
                            Frequency <span className="text-red-500">*</span>
                          </Label>
                          <Select 
                            value={medication.frequency}
                            onValueChange={(value) => updateMedication(medication.id, 'frequency', value)}
                            required
                          >
                            <SelectTrigger id={`med-frequency-${medication.id}`}>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              {frequencies.map((freq) => (
                                <SelectItem key={freq.value} value={freq.label}>
                                  {freq.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`med-duration-${medication.id}`}>
                            Duration <span className="text-red-500">*</span>
                          </Label>
                          <Select 
                            value={medication.duration}
                            onValueChange={(value) => updateMedication(medication.id, 'duration', value)}
                            required
                          >
                            <SelectTrigger id={`med-duration-${medication.id}`}>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              {durations.map((dur) => (
                                <SelectItem key={dur.value} value={dur.label}>
                                  {dur.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`med-instructions-${medication.id}`}>Special Instructions</Label>
                        <Input 
                          id={`med-instructions-${medication.id}`}
                          placeholder="E.g. Take with food, avoid alcohol, etc."
                          value={medication.instructions}
                          onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Tests */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Lab Tests</CardTitle>
                  <CardDescription>
                    Recommended laboratory tests and diagnostics
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                  onClick={addTest}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p>No tests recommended yet</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={addTest}
                  >
                    Add a test
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tests.map((test, index) => (
                    <div key={test.id} className="border rounded-lg p-4 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
                        onClick={() => removeTest(test.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <h3 className="font-medium mb-4">Test #{index + 1}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`test-name-${test.id}`}>
                            Test Name <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            id={`test-name-${test.id}`}
                            placeholder="Enter test name"
                            value={test.name}
                            onChange={(e) => updateTest(test.id, 'name', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`test-instructions-${test.id}`}>Instructions</Label>
                          <Input 
                            id={`test-instructions-${test.id}`}
                            placeholder="E.g. Fasting required, morning sample, etc."
                            value={test.instructions}
                            onChange={(e) => updateTest(test.id, 'instructions', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Follow-up and General Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Follow-up & Instructions</CardTitle>
              <CardDescription>
                Add follow-up appointment details and general instructions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="follow-up-date">Follow-up Date</Label>
                  <Input 
                    id="follow-up-date" 
                    type="date" 
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="follow-up-notes">Follow-up Notes</Label>
                  <Input 
                    id="follow-up-notes" 
                    placeholder="E.g. Bring test reports, etc."
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="general-instructions">General Instructions</Label>
                <Textarea 
                  id="general-instructions" 
                  placeholder="Add any general instructions for the patient"
                  className="min-h-[100px]"
                  value={generalInstructions}
                  onChange={(e) => setGeneralInstructions(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Doctor Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Doctor Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={doctorData.image} alt={doctorData.name} />
                  <AvatarFallback>{doctorData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">{doctorData.name}</h3>
                  <p className="text-sm text-gray-500">{doctorData.specialty}</p>
                  <p className="text-sm text-gray-500">{doctorData.qualifications}</p>
                </div>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Reg. Number:</span>
                  <span className="font-medium">{doctorData.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hospital:</span>
                  <span className="font-medium">{doctorData.hospital}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Patient Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Patient Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">{patientData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Age / Gender:</span>
                  <span className="font-medium">{patientData.age} years / {patientData.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weight:</span>
                  <span className="font-medium">{patientData.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Height:</span>
                  <span className="font-medium">{patientData.height} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Blood Group:</span>
                  <span className="font-medium">{patientData.bloodGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{patientData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{patientData.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Appointment Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Appointment ID:</span>
                  <span className="font-medium">{appointmentData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">{new Date(appointmentData.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Consultation Type:</span>
                  <span className="font-medium">{appointmentData.consultationType}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-start"
                  disabled
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Preview
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-start"
                  disabled
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-start"
                  disabled
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email to Patient
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-start"
                  disabled
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Prescription</DialogTitle>
            <DialogDescription>
              Please review the prescription details before finalizing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Diagnosis</h3>
                <p className="text-gray-700">{diagnosis}</p>
              </div>
              
              {symptoms && (
                <div>
                  <h3 className="font-medium text-gray-900">Symptoms</h3>
                  <p className="text-gray-700">{symptoms}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-gray-900">Medications</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((med) => (
                      <TableRow key={med.id}>
                        <TableCell className="font-medium">{med.name}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{med.frequency}</TableCell>
                        <TableCell>{med.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {tests.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900">Recommended Tests</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {tests.map((test) => (
                      <li key={test.id}>
                        {test.name}
                        {test.instructions && <span className="text-gray-500"> ({test.instructions})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {followUpDate && (
                <div>
                  <h3 className="font-medium text-gray-900">Follow-up</h3>
                  <p className="text-gray-700">
                    {new Date(followUpDate).toLocaleDateString()}
                    {followUpNotes && ` - ${followUpNotes}`}
                  </p>
                </div>
              )}
              
              {generalInstructions && (
                <div>
                  <h3 className="font-medium text-gray-900">General Instructions</h3>
                  <p className="text-gray-700">{generalInstructions}</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmation(false)}
            >
              Edit Prescription
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={finalizePrescription}
            >
              Finalize & Send to Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EPrescription;