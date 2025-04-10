import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Microscope, Calendar, TestTube, Users, ClipboardCheck, TrendingUp, Download, 
  FileText, Info, Clock, CheckCircle, XCircle, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

const LaboratoryDashboard = () => {
  const [location, navigate] = useLocation();
  const { user } = useStore();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Redirect if not laboratory
  useEffect(() => {
    if (user && user.role !== 'laboratory') {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the laboratory panel.',
        variant: 'destructive',
      });
    } else if (!user) {
      navigate('/profile');
      toast({
        title: 'Authentication Required',
        description: 'Please login to access the laboratory panel.',
        variant: 'destructive',
      });
    }
  }, [user, navigate, toast]);
  
  // Dashboard overview stats
  const stats = [
    { title: "Today's Bookings", value: "12", icon: <Calendar className="h-4 w-4" />, trend: "+3" },
    { title: "Samples Collected", value: "8", icon: <TestTube className="h-4 w-4" />, trend: "+2" },
    { title: "Reports Pending", value: "15", icon: <Clock className="h-4 w-4" />, trend: "-5" },
    { title: "Reports Delivered", value: "86", icon: <ClipboardCheck className="h-4 w-4" />, trend: "+12" },
  ];
  
  if (!user || user.role !== 'laboratory') {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Laboratory Dashboard - 1mg</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Laboratory Dashboard</h1>
            <p className="text-muted-foreground">Manage tests, bookings, and sample collections</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              View Site
            </Button>
            <Button size="sm" className="bg-[#10847e] hover:bg-[#10847e]/90">
              <Plus className="mr-2 h-4 w-4" /> Add Test Package
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {stat.icon}
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className={`flex items-center ${!stat.trend.includes('-') ? 'text-green-500' : 'text-red-500'}`}>
                    <TrendingUp className="h-3 w-3 mr-1" /> {stat.trend}
                  </span>
                  <span className="text-muted-foreground ml-2">vs last week</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mb-8">
          <Tabs defaultValue="today">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 w-full">
              <TabsTrigger value="today">Today's Schedule</TabsTrigger>
              <TabsTrigger value="bookings">All Bookings</TabsTrigger>
              <TabsTrigger value="tests">Test Packages</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="profile">Laboratory Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>
                    Sample collections and tests scheduled for today, April 10, 2025
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Upcoming Sample Collections</h3>
                    <div className="flex gap-2">
                      <Badge className="bg-yellow-500">Pending</Badge>
                      <Badge className="bg-blue-500">En Route</Badge>
                      <Badge className="bg-green-500">Completed</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Card className="border border-yellow-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-4">
                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
                              <TestTube className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold">Rajesh Kumar</h4>
                              <p className="text-sm text-muted-foreground">Home Collection</p>
                              <p className="text-sm mt-1">Complete Blood Count, Lipid Profile</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">10:30 AM</p>
                            <p className="text-sm text-muted-foreground">In 15 mins</p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline">
                                Assign Technician
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                              <TestTube className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold">Priya Singh</h4>
                              <p className="text-sm text-muted-foreground">Home Collection</p>
                              <p className="text-sm mt-1">Thyroid Profile, Vitamin D</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">11:45 AM</p>
                            <p className="text-sm text-muted-foreground">In 1 hour 30 mins</p>
                            <p className="text-sm text-blue-500">Technician: Rahul (En Route)</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-green-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-4">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                              <TestTube className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold">Vikram Mehta</h4>
                              <p className="text-sm text-muted-foreground">Lab Visit</p>
                              <p className="text-sm mt-1">Diabetes Panel</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">9:15 AM</p>
                            <p className="text-sm text-green-500">Sample Collected</p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" className="bg-[#10847e] hover:bg-[#10847e]/90">
                                Process Sample
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-medium mb-4">Pending Reports</h3>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Test</TableHead>
                            <TableHead>Sample Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">#LAB001</TableCell>
                            <TableCell>Anita Sharma</TableCell>
                            <TableCell>Complete Body Checkup</TableCell>
                            <TableCell>Apr 9, 2025</TableCell>
                            <TableCell>
                              <Badge className="bg-orange-500">Processing</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Update Status
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">#LAB002</TableCell>
                            <TableCell>Rahul Verma</TableCell>
                            <TableCell>Lipid Profile</TableCell>
                            <TableCell>Apr 9, 2025</TableCell>
                            <TableCell>
                              <Badge className="bg-purple-500">Ready for Review</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Review Report
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">#LAB003</TableCell>
                            <TableCell>Vikram Mehta</TableCell>
                            <TableCell>Diabetes Panel</TableCell>
                            <TableCell>Apr 10, 2025</TableCell>
                            <TableCell>
                              <Badge>Sample Received</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Update Status
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bookings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Bookings</CardTitle>
                  <CardDescription>
                    View and manage all test bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                      <Input placeholder="Search bookings..." className="w-64" />
                      <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="collecting">Sample Collection</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                      </select>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4" />
                        <Input type="date" className="w-40" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Test Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">#LAB001</TableCell>
                          <TableCell>Anita Sharma</TableCell>
                          <TableCell>Complete Body Checkup</TableCell>
                          <TableCell>Apr 9, 2025</TableCell>
                          <TableCell><Badge className="bg-orange-500">Processing</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#LAB002</TableCell>
                          <TableCell>Rahul Verma</TableCell>
                          <TableCell>Lipid Profile</TableCell>
                          <TableCell>Apr 9, 2025</TableCell>
                          <TableCell><Badge className="bg-purple-500">Ready for Review</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#LAB003</TableCell>
                          <TableCell>Vikram Mehta</TableCell>
                          <TableCell>Diabetes Panel</TableCell>
                          <TableCell>Apr 10, 2025</TableCell>
                          <TableCell><Badge>Sample Received</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#LAB004</TableCell>
                          <TableCell>Priya Singh</TableCell>
                          <TableCell>Thyroid Profile, Vitamin D</TableCell>
                          <TableCell>Apr 10, 2025</TableCell>
                          <TableCell><Badge className="bg-blue-500">Collection Scheduled</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#LAB005</TableCell>
                          <TableCell>Suresh Patel</TableCell>
                          <TableCell>Kidney Function Test</TableCell>
                          <TableCell>Apr 8, 2025</TableCell>
                          <TableCell><Badge className="bg-green-500">Completed</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Previous</Button>
                  <Button variant="outline">Next</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="tests" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Test Packages</CardTitle>
                    <Button className="bg-[#10847e] hover:bg-[#10847e]/90">
                      <Plus className="mr-2 h-4 w-4" /> Add Test Package
                    </Button>
                  </div>
                  <CardDescription>
                    Manage your diagnostic test packages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                      <Input placeholder="Search test packages..." className="w-64" />
                      <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                        <option value="all">All Categories</option>
                        <option value="basic">Basic Health</option>
                        <option value="comprehensive">Comprehensive</option>
                        <option value="specialized">Specialized</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Test Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Discounted Price</TableHead>
                          <TableHead>Tests Included</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Complete Body Checkup</TableCell>
                          <TableCell>Comprehensive</TableCell>
                          <TableCell>₹3,999</TableCell>
                          <TableCell>₹1,999</TableCell>
                          <TableCell>70+ tests</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Info className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Diabetes Screening</TableCell>
                          <TableCell>Specialized</TableCell>
                          <TableCell>₹1,499</TableCell>
                          <TableCell>₹799</TableCell>
                          <TableCell>15+ tests</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Info className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Women's Health</TableCell>
                          <TableCell>Specialized</TableCell>
                          <TableCell>₹2,999</TableCell>
                          <TableCell>₹1,599</TableCell>
                          <TableCell>40+ tests</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Info className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Liver Function Test</TableCell>
                          <TableCell>Basic Health</TableCell>
                          <TableCell>₹899</TableCell>
                          <TableCell>₹599</TableCell>
                          <TableCell>8 tests</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Info className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Vitamin Panel</TableCell>
                          <TableCell>Basic Health</TableCell>
                          <TableCell>₹1,299</TableCell>
                          <TableCell>₹899</TableCell>
                          <TableCell>6 tests</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Info className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Previous</Button>
                  <Button variant="outline">Next</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Reports</CardTitle>
                  <CardDescription>
                    View and manage generated reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                      <Input placeholder="Search reports..." className="w-64" />
                      <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4" />
                        <Input type="date" className="w-40" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Report ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Test</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">#RPT001</TableCell>
                          <TableCell>Anita Sharma</TableCell>
                          <TableCell>Complete Body Checkup</TableCell>
                          <TableCell>Apr 9, 2025</TableCell>
                          <TableCell><Badge className="bg-orange-500">Processing</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                Update
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#RPT002</TableCell>
                          <TableCell>Rahul Verma</TableCell>
                          <TableCell>Lipid Profile</TableCell>
                          <TableCell>Apr 9, 2025</TableCell>
                          <TableCell><Badge className="bg-purple-500">Ready for Review</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                Review
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#RPT003</TableCell>
                          <TableCell>Suresh Patel</TableCell>
                          <TableCell>Kidney Function Test</TableCell>
                          <TableCell>Apr 8, 2025</TableCell>
                          <TableCell><Badge className="bg-green-500">Completed</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4 mr-1" /> Download
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#RPT004</TableCell>
                          <TableCell>Meera Reddy</TableCell>
                          <TableCell>Vitamin D, B12</TableCell>
                          <TableCell>Apr 8, 2025</TableCell>
                          <TableCell><Badge className="bg-green-500">Completed</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4 mr-1" /> Download
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Previous</Button>
                  <Button variant="outline">Next</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Laboratory Profile</CardTitle>
                  <CardDescription>
                    Manage your laboratory information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="lab-name">Laboratory Name</Label>
                        <Input id="lab-name" value="HealthFirst Labs" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license">License Number</Label>
                        <Input id="license" value="HL3456" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value="456 Park Avenue, Chennai" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input id="pincode" value="600001" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" value="+91 9876543210" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value="info@healthfirstlabs.com" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hours">Operating Hours</Label>
                      <Input id="hours" value="Monday to Saturday, 7:00 AM to 9:00 PM" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="facilities">Facilities</Label>
                      <textarea 
                        id="facilities" 
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="Advanced blood testing equipment, Molecular diagnostics, Home sample collection, Digital reports, NABL accredited"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea 
                        id="description" 
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="HealthFirst Labs is a state-of-the-art diagnostic laboratory offering a wide range of clinical laboratory tests with accurate and timely results. We are committed to providing the highest quality diagnostic services to our patients and healthcare providers."
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="bg-[#10847e] hover:bg-[#10847e]/90">
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default LaboratoryDashboard;