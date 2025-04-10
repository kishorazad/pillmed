import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, 
  Search, 
  Filter, 
  FilePlus, 
  FileText, 
  Check, 
  X, 
  AlertCircle, 
  Clock, 
  Download, 
  Share2, 
  Printer 
} from 'lucide-react';

// Type definitions
interface LabTest {
  id: number;
  patientId: number;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientEmail: string;
  testName: string;
  testId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent' | 'routine';
  requestedBy: string;
  requestedDate: string;
  completedDate?: string;
  results?: TestResult[];
}

interface TestResult {
  id: number;
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag?: 'normal' | 'high' | 'low' | 'critical';
}

const TestManagement = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [isViewTestDialogOpen, setIsViewTestDialogOpen] = useState(false);
  const [isAddResultDialogOpen, setIsAddResultDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Sample lab test data
  const [labTests, setLabTests] = useState<LabTest[]>([
    {
      id: 10001,
      patientId: 1001,
      patientName: 'Vikram Mehta',
      patientAge: 45,
      patientGender: 'Male',
      patientPhone: '+91 98765 10111',
      patientEmail: 'vikram.m@example.com',
      testName: 'Complete Blood Count (CBC)',
      testId: 'CBC10001',
      status: 'pending',
      priority: 'urgent',
      requestedBy: 'Dr. Sharma',
      requestedDate: '2025-04-09'
    },
    {
      id: 10002,
      patientId: 1002,
      patientName: 'Sunita Sharma',
      patientAge: 38,
      patientGender: 'Female',
      patientPhone: '+91 87654 20222',
      patientEmail: 'sunita.s@example.com',
      testName: 'Hemoglobin A1C',
      testId: 'HA1C10002',
      status: 'in-progress',
      priority: 'normal',
      requestedBy: 'Dr. Patel',
      requestedDate: '2025-04-08'
    },
    {
      id: 10003,
      patientId: 1003,
      patientName: 'Rajesh Patel',
      patientAge: 62,
      patientGender: 'Male',
      patientPhone: '+91 76543 30333',
      patientEmail: 'rajesh.p@example.com',
      testName: 'Lipid Profile',
      testId: 'LP10003',
      status: 'completed',
      priority: 'routine',
      requestedBy: 'Dr. Kumar',
      requestedDate: '2025-04-06',
      completedDate: '2025-04-08',
      results: [
        {
          id: 1,
          parameter: 'Total Cholesterol',
          value: '220',
          unit: 'mg/dL',
          referenceRange: '< 200',
          flag: 'high'
        },
        {
          id: 2,
          parameter: 'HDL Cholesterol',
          value: '45',
          unit: 'mg/dL',
          referenceRange: '> 40',
          flag: 'normal'
        },
        {
          id: 3,
          parameter: 'LDL Cholesterol',
          value: '155',
          unit: 'mg/dL',
          referenceRange: '< 100',
          flag: 'high'
        },
        {
          id: 4,
          parameter: 'Triglycerides',
          value: '180',
          unit: 'mg/dL',
          referenceRange: '< 150',
          flag: 'high'
        }
      ]
    },
    {
      id: 10004,
      patientId: 1004,
      patientName: 'Kavita Singh',
      patientAge: 28,
      patientGender: 'Female',
      patientPhone: '+91 65432 40444',
      patientEmail: 'kavita.s@example.com',
      testName: 'Thyroid Profile',
      testId: 'TP10004',
      status: 'completed',
      priority: 'normal',
      requestedBy: 'Dr. Reddy',
      requestedDate: '2025-04-05',
      completedDate: '2025-04-07',
      results: [
        {
          id: 5,
          parameter: 'TSH',
          value: '2.5',
          unit: 'mIU/L',
          referenceRange: '0.4 - 4.0',
          flag: 'normal'
        },
        {
          id: 6,
          parameter: 'T4 (Free)',
          value: '1.1',
          unit: 'ng/dL',
          referenceRange: '0.8 - 1.8',
          flag: 'normal'
        },
        {
          id: 7,
          parameter: 'T3 (Free)',
          value: '3.2',
          unit: 'pg/mL',
          referenceRange: '2.3 - 4.2',
          flag: 'normal'
        }
      ]
    },
    {
      id: 10005,
      patientId: 1005,
      patientName: 'Arun Kumar',
      patientAge: 55,
      patientGender: 'Male',
      patientPhone: '+91 54321 50555',
      patientEmail: 'arun.k@example.com',
      testName: 'Liver Function Test',
      testId: 'LFT10005',
      status: 'cancelled',
      priority: 'urgent',
      requestedBy: 'Dr. Sharma',
      requestedDate: '2025-04-07'
    }
  ]);
  
  // Get filtered tests based on tab, search, and filters
  const getFilteredTests = () => {
    return labTests.filter(test => {
      // Filter by tab
      if (activeTab !== 'all' && test.status !== activeTab) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && !test.patientName.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !test.testId.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by status
      if (statusFilter !== 'all' && test.status !== statusFilter) {
        return false;
      }
      
      // Filter by priority
      if (priorityFilter !== 'all' && test.priority !== priorityFilter) {
        return false;
      }
      
      return true;
    });
  };
  
  // Handle view test
  const handleViewTest = (test: LabTest) => {
    setSelectedTest(test);
    setIsViewTestDialogOpen(true);
  };
  
  // Handle add result
  const handleAddResult = (test: LabTest) => {
    setSelectedTest(test);
    setIsAddResultDialogOpen(true);
  };
  
  // Handle save results
  const handleSaveResults = () => {
    // In a real app, you'd save the results here
    if (selectedTest) {
      // Update the test status to completed
      setLabTests(prev => 
        prev.map(test => 
          test.id === selectedTest.id 
            ? { 
                ...test, 
                status: 'completed', 
                completedDate: new Date().toISOString().split('T')[0],
                results: [
                  { id: 1, parameter: 'Sample Parameter', value: '100', unit: 'mg/dL', referenceRange: '70-120', flag: 'normal' }
                ]
              } 
            : test
        )
      );
    }
    setIsAddResultDialogOpen(false);
  };
  
  // Handle update test status
  const handleUpdateStatus = (testId: number, status: 'pending' | 'in-progress' | 'completed' | 'cancelled') => {
    setLabTests(prev => 
      prev.map(test => 
        test.id === testId 
          ? { ...test, status } 
          : test
      )
    );
    setIsViewTestDialogOpen(false);
  };
  
  // Get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get priority style
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'routine':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in-progress':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Laboratory Test Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search tests or patients..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="routine">Routine</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs 
        defaultValue="pending" 
        className="space-y-4"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Tests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Pending Tests</h4>
              <p className="text-sm text-gray-600">These tests are awaiting processing. Click "Start Processing" to begin work on a test.</p>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Details</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredTests().length > 0 ? (
                    getFilteredTests().map(test => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <div className="font-medium">{test.testName}</div>
                          <div className="text-sm text-gray-500">ID: {test.testId}</div>
                          <div className="text-sm text-gray-500">Requested: {test.requestedDate}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{getInitials(test.patientName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{test.patientName}</div>
                              <div className="text-xs text-gray-500">{test.patientAge} yrs, {test.patientGender}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityStyle(test.priority)}>
                            {test.priority.charAt(0).toUpperCase() + test.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>{test.requestedBy}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewTest(test)}
                            >
                              <FileText className="h-4 w-4 mr-1" /> Details
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateStatus(test.id, 'in-progress')}
                            >
                              Start Processing
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <div className="text-gray-500">No pending tests found</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="in-progress" className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin mt-0.5" />
            <div>
              <h4 className="font-medium">Tests In Progress</h4>
              <p className="text-sm text-gray-600">These tests are currently being processed. Click "Add Results" when you have completed a test.</p>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Details</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredTests().length > 0 ? (
                    getFilteredTests().map(test => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <div className="font-medium">{test.testName}</div>
                          <div className="text-sm text-gray-500">ID: {test.testId}</div>
                          <div className="text-sm text-gray-500">Requested: {test.requestedDate}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{getInitials(test.patientName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{test.patientName}</div>
                              <div className="text-xs text-gray-500">{test.patientAge} yrs, {test.patientGender}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityStyle(test.priority)}>
                            {test.priority.charAt(0).toUpperCase() + test.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>{test.requestedBy}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewTest(test)}
                            >
                              <FileText className="h-4 w-4 mr-1" /> Details
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleAddResult(test)}
                            >
                              <FilePlus className="h-4 w-4 mr-1" /> Add Results
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <div className="text-gray-500">No tests in progress</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Completed Tests</h4>
              <p className="text-sm text-gray-600">These tests have been completed. You can view, print, or share the results.</p>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Details</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredTests().length > 0 ? (
                    getFilteredTests().map(test => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <div className="font-medium">{test.testName}</div>
                          <div className="text-sm text-gray-500">ID: {test.testId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{getInitials(test.patientName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{test.patientName}</div>
                              <div className="text-xs text-gray-500">{test.patientAge} yrs, {test.patientGender}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusStyle(test.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(test.status)}
                              <span>{test.status.charAt(0).toUpperCase() + test.status.slice(1)}</span>
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div><span className="text-gray-500">Requested:</span> {test.requestedDate}</div>
                            {test.completedDate && (
                              <div><span className="text-gray-500">Completed:</span> {test.completedDate}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewTest(test)}
                            >
                              <FileText className="h-4 w-4 mr-1" /> View Results
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="p-2"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <div className="text-gray-500">No completed tests found</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Laboratory Tests</CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Details</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredTests().length > 0 ? (
                    getFilteredTests().map(test => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <div className="font-medium">{test.testName}</div>
                          <div className="text-sm text-gray-500">ID: {test.testId}</div>
                          <div className="text-sm text-gray-500">Requested: {test.requestedDate}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{getInitials(test.patientName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{test.patientName}</div>
                              <div className="text-xs text-gray-500">{test.patientAge} yrs, {test.patientGender}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusStyle(test.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(test.status)}
                              <span>{test.status.charAt(0).toUpperCase() + test.status.slice(1)}</span>
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityStyle(test.priority)}>
                            {test.priority.charAt(0).toUpperCase() + test.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewTest(test)}
                            >
                              <FileText className="h-4 w-4 mr-1" /> View
                            </Button>
                            {test.status === 'pending' && (
                              <Button 
                                size="sm"
                                onClick={() => handleUpdateStatus(test.id, 'in-progress')}
                              >
                                Start
                              </Button>
                            )}
                            {test.status === 'in-progress' && (
                              <Button 
                                size="sm"
                                onClick={() => handleAddResult(test)}
                              >
                                <FilePlus className="h-4 w-4 mr-1" /> Results
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <div className="text-gray-500">No tests found matching your criteria</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* View Test Dialog */}
      <Dialog open={isViewTestDialogOpen} onOpenChange={setIsViewTestDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Details</DialogTitle>
            <DialogDescription>
              View comprehensive test information and results
            </DialogDescription>
          </DialogHeader>
          
          {selectedTest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                    <div>
                      <Label className="text-gray-500">Test Information</Label>
                      <p className="font-bold mt-1">{selectedTest.testName}</p>
                      <p className="text-sm text-gray-600 mt-1">ID: {selectedTest.testId}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-gray-500">Status</Label>
                      <Badge className={`block w-full justify-center py-1.5 ${getStatusStyle(selectedTest.status)}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(selectedTest.status)}
                          <span>{selectedTest.status.charAt(0).toUpperCase() + selectedTest.status.slice(1)}</span>
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-gray-500">Priority</Label>
                      <Badge className={`block w-full justify-center py-1.5 ${getPriorityStyle(selectedTest.priority)}`}>
                        {selectedTest.priority.charAt(0).toUpperCase() + selectedTest.priority.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-gray-500">Requested By</Label>
                      <p className="font-medium">{selectedTest.requestedBy}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-gray-500">Dates</Label>
                      <div className="text-sm">
                        <div><span className="font-medium">Requested:</span> {selectedTest.requestedDate}</div>
                        {selectedTest.completedDate && (
                          <div><span className="font-medium">Completed:</span> {selectedTest.completedDate}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-500">Patient Information</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Avatar>
                          <AvatarFallback>{getInitials(selectedTest.patientName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">{selectedTest.patientName}</p>
                          <p className="text-sm text-gray-600">ID: {selectedTest.patientId} • {selectedTest.patientAge} years, {selectedTest.patientGender}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Phone:</span> {selectedTest.patientPhone}
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span> {selectedTest.patientEmail}
                        </div>
                      </div>
                    </div>
                    
                    {selectedTest.results && selectedTest.results.length > 0 ? (
                      <div>
                        <Label className="text-gray-500 mb-2 block">Test Results</Label>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Parameter</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Reference Range</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedTest.results.map(result => (
                              <TableRow key={result.id}>
                                <TableCell>{result.parameter}</TableCell>
                                <TableCell>
                                  <span className="font-medium">{result.value}</span> {result.unit}
                                </TableCell>
                                <TableCell>{result.referenceRange}</TableCell>
                                <TableCell>
                                  {result.flag && (
                                    <Badge className={
                                      result.flag === 'normal' ? 'bg-green-100 text-green-800 border-green-200' :
                                      result.flag === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                                      result.flag === 'low' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                      'bg-purple-100 text-purple-800 border-purple-200'
                                    }>
                                      {result.flag.charAt(0).toUpperCase() + result.flag.slice(1)}
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        <div className="flex justify-end gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-1"
                          >
                            <Download className="h-4 w-4" /> Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-1"
                          >
                            <Printer className="h-4 w-4" /> Print
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-1"
                          >
                            <Share2 className="h-4 w-4" /> Share
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-6 rounded-lg border border-dashed text-center">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto" />
                        <p className="mt-2 font-medium">No test results available</p>
                        {selectedTest.status === 'in-progress' && (
                          <Button 
                            className="mt-4"
                            onClick={() => {
                              setIsViewTestDialogOpen(false);
                              handleAddResult(selectedTest);
                            }}
                          >
                            <FilePlus className="h-4 w-4 mr-2" />
                            Add Results Now
                          </Button>
                        )}
                        {selectedTest.status === 'pending' && (
                          <Button 
                            className="mt-4"
                            onClick={() => handleUpdateStatus(selectedTest.id, 'in-progress')}
                          >
                            Start Processing
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {(selectedTest.status === 'pending' || selectedTest.status === 'in-progress') && (
                <div className="flex justify-between pt-4 border-t">
                  {selectedTest.status === 'pending' || selectedTest.status === 'in-progress' ? (
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleUpdateStatus(selectedTest.id, 'cancelled')}
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel Test
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  
                  <div className="flex gap-2">
                    {selectedTest.status === 'pending' && (
                      <Button onClick={() => handleUpdateStatus(selectedTest.id, 'in-progress')}>
                        Start Processing
                      </Button>
                    )}
                    {selectedTest.status === 'in-progress' && (
                      <Button 
                        onClick={() => {
                          setIsViewTestDialogOpen(false);
                          handleAddResult(selectedTest);
                        }}
                      >
                        <FilePlus className="h-4 w-4 mr-2" />
                        Add Results
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewTestDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Result Dialog */}
      <Dialog open={isAddResultDialogOpen} onOpenChange={setIsAddResultDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Test Results</DialogTitle>
            <DialogDescription>
              {selectedTest && `Enter results for ${selectedTest.testName} for patient ${selectedTest.patientName}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTest && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Test Information</h4>
                  <p className="text-sm">{selectedTest.testName} (ID: {selectedTest.testId})</p>
                  <p className="text-sm">Patient: {selectedTest.patientName} ({selectedTest.patientAge} yrs, {selectedTest.patientGender})</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Test Results</Label>
                  <Button variant="outline" size="sm">
                    Add Parameter
                  </Button>
                </div>
                
                {/* Sample parameters based on test type */}
                {selectedTest.testName === 'Complete Blood Count (CBC)' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div className="col-span-4 sm:col-span-1">
                        <Label>Parameter</Label>
                        <Input value="Hemoglobin" disabled />
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input placeholder="e.g. 14.5" />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Input value="g/dL" />
                      </div>
                      <div>
                        <Label>Reference Range</Label>
                        <Input value="13.5 - 17.5" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div className="col-span-4 sm:col-span-1">
                        <Label>Parameter</Label>
                        <Input value="WBC Count" disabled />
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input placeholder="e.g. 7.5" />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Input value="10^3/μL" />
                      </div>
                      <div>
                        <Label>Reference Range</Label>
                        <Input value="4.5 - 11.0" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div className="col-span-4 sm:col-span-1">
                        <Label>Parameter</Label>
                        <Input value="Platelet Count" disabled />
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input placeholder="e.g. 250" />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Input value="10^3/μL" />
                      </div>
                      <div>
                        <Label>Reference Range</Label>
                        <Input value="150 - 450" />
                      </div>
                    </div>
                  </div>
                ) : selectedTest.testName === 'Hemoglobin A1C' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div className="col-span-4 sm:col-span-1">
                        <Label>Parameter</Label>
                        <Input value="HbA1c" disabled />
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input placeholder="e.g. 5.7" />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Input value="%" />
                      </div>
                      <div>
                        <Label>Reference Range</Label>
                        <Input value="4.0 - 5.6" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="col-span-4 sm:col-span-1">
                      <Label>Parameter</Label>
                      <Input placeholder="Parameter name" />
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input placeholder="Result value" />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Input placeholder="e.g. mg/dL" />
                    </div>
                    <div>
                      <Label>Reference Range</Label>
                      <Input placeholder="e.g. 70 - 110" />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Add any additional notes about the test results"
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddResultDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveResults}>
              Save Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestManagement;