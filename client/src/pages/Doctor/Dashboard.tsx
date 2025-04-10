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
import { Calendar, Clock, Users, CheckCircle, XCircle, Calendar as CalendarIcon, Info, 
  FileText, TrendingUp, MessageSquare, PhoneCall, Video } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

const DoctorDashboard = () => {
  const [location, navigate] = useLocation();
  const { user } = useStore();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Redirect if not doctor
  useEffect(() => {
    if (user && user.role !== 'doctor') {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the doctor panel.',
        variant: 'destructive',
      });
    } else if (!user) {
      navigate('/profile');
      toast({
        title: 'Authentication Required',
        description: 'Please login to access the doctor panel.',
        variant: 'destructive',
      });
    }
  }, [user, navigate, toast]);
  
  // Dashboard overview stats
  const stats = [
    { title: "Today's Appointments", value: "8", icon: <Calendar className="h-4 w-4" />, trend: "+2" },
    { title: "Total Patients", value: "245", icon: <Users className="h-4 w-4" />, trend: "+12" },
    { title: "Completed", value: "76", icon: <CheckCircle className="h-4 w-4" />, trend: "+5" },
    { title: "Cancelled", value: "12", icon: <XCircle className="h-4 w-4" />, trend: "-3" },
  ];
  
  if (!user || user.role !== 'doctor') {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Doctor Dashboard - 1mg</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Manage appointments, patients, and prescriptions</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              View Site
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
              <TabsTrigger value="appointments">All Appointments</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="profile">Doctor Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Appointments</CardTitle>
                  <CardDescription>
                    Your schedule for today, April 10, 2025
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Upcoming</h3>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-500">Video</Badge>
                      <Badge className="bg-green-500">In-person</Badge>
                      <Badge className="bg-purple-500">Phone</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Card className="border border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                              <Video className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold">Rajesh Kumar</h4>
                              <p className="text-sm text-muted-foreground">Video Consultation</p>
                              <p className="text-sm mt-1">Headache, Fever for 2 days</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">10:30 AM</p>
                            <p className="text-sm text-muted-foreground">In 15 mins</p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" className="bg-[#10847e] hover:bg-[#10847e]/90">
                                <Video className="h-4 w-4 mr-1" /> Join
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-green-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-4">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold">Priya Singh</h4>
                              <p className="text-sm text-muted-foreground">In-person Visit</p>
                              <p className="text-sm mt-1">Diabetes Follow-up</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">11:45 AM</p>
                            <p className="text-sm text-muted-foreground">In 1 hour 30 mins</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-4">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                              <PhoneCall className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold">Vikram Mehta</h4>
                              <p className="text-sm text-muted-foreground">Phone Consultation</p>
                              <p className="text-sm mt-1">Prescription Renewal</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">2:15 PM</p>
                            <p className="text-sm text-muted-foreground">In 4 hours</p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline">
                                <PhoneCall className="h-4 w-4 mr-1" /> Call
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-medium mb-4">Completed Today</h3>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Anita Sharma</TableCell>
                            <TableCell>
                              <Badge className="bg-blue-500">Video</Badge>
                            </TableCell>
                            <TableCell>9:00 AM</TableCell>
                            <TableCell>
                              <Badge className="bg-green-500">Completed</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" /> View Notes
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Rahul Verma</TableCell>
                            <TableCell>
                              <Badge className="bg-green-500">In-person</Badge>
                            </TableCell>
                            <TableCell>9:45 AM</TableCell>
                            <TableCell>
                              <Badge className="bg-green-500">Completed</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" /> View Notes
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
            
            <TabsContent value="appointments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Appointments</CardTitle>
                  <CardDescription>
                    View and manage all your appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                      <Input placeholder="Search appointments..." className="w-64" />
                      <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                        <option value="all">All Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
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
                          <TableHead>Patient</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Rajesh Kumar</TableCell>
                          <TableCell>Apr 10, 2025 10:30 AM</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-500">Video</Badge>
                          </TableCell>
                          <TableCell><Badge>Upcoming</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Priya Singh</TableCell>
                          <TableCell>Apr 10, 2025 11:45 AM</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">In-person</Badge>
                          </TableCell>
                          <TableCell><Badge>Upcoming</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Anita Sharma</TableCell>
                          <TableCell>Apr 10, 2025 9:00 AM</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-500">Video</Badge>
                          </TableCell>
                          <TableCell><Badge className="bg-green-500">Completed</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Suresh Patel</TableCell>
                          <TableCell>Apr 9, 2025 3:15 PM</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">In-person</Badge>
                          </TableCell>
                          <TableCell><Badge className="bg-green-500">Completed</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Meera Reddy</TableCell>
                          <TableCell>Apr 9, 2025 1:00 PM</TableCell>
                          <TableCell>
                            <Badge className="bg-purple-500">Phone</Badge>
                          </TableCell>
                          <TableCell><Badge className="bg-red-500">Cancelled</Badge></TableCell>
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
            
            <TabsContent value="patients" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patients</CardTitle>
                  <CardDescription>
                    View and manage your patients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                      <Input placeholder="Search patients..." className="w-64" />
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Last Visit</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Rajesh Kumar</TableCell>
                          <TableCell>42</TableCell>
                          <TableCell>Male</TableCell>
                          <TableCell>+91 9876543210</TableCell>
                          <TableCell>Apr 5, 2025</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Profile
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Priya Singh</TableCell>
                          <TableCell>35</TableCell>
                          <TableCell>Female</TableCell>
                          <TableCell>+91 9876543211</TableCell>
                          <TableCell>Apr 8, 2025</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Profile
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Anita Sharma</TableCell>
                          <TableCell>28</TableCell>
                          <TableCell>Female</TableCell>
                          <TableCell>+91 9876543212</TableCell>
                          <TableCell>Apr 10, 2025</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Profile
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Suresh Patel</TableCell>
                          <TableCell>55</TableCell>
                          <TableCell>Male</TableCell>
                          <TableCell>+91 9876543213</TableCell>
                          <TableCell>Apr 9, 2025</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Profile
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Meera Reddy</TableCell>
                          <TableCell>32</TableCell>
                          <TableCell>Female</TableCell>
                          <TableCell>+91 9876543214</TableCell>
                          <TableCell>Apr 2, 2025</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                View Profile
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
            
            <TabsContent value="prescriptions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prescriptions</CardTitle>
                  <CardDescription>
                    View and manage issued prescriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                      <Input placeholder="Search prescriptions..." className="w-64" />
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
                          <TableHead>ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Medications</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">#PRE001</TableCell>
                          <TableCell>Rajesh Kumar</TableCell>
                          <TableCell>Apr 5, 2025</TableCell>
                          <TableCell>Paracetamol, Azithromycin</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" /> View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#PRE002</TableCell>
                          <TableCell>Priya Singh</TableCell>
                          <TableCell>Apr 8, 2025</TableCell>
                          <TableCell>Metformin, Atorvastatin</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" /> View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#PRE003</TableCell>
                          <TableCell>Anita Sharma</TableCell>
                          <TableCell>Apr 10, 2025</TableCell>
                          <TableCell>Cetirizine, Montelukast</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" /> View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#PRE004</TableCell>
                          <TableCell>Suresh Patel</TableCell>
                          <TableCell>Apr 9, 2025</TableCell>
                          <TableCell>Amlodipine, Losartan</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" /> View
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
                  <CardTitle>Doctor Profile</CardTitle>
                  <CardDescription>
                    Manage your professional information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value="Dr. Amit Sharma" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input id="specialization" value="Cardiologist" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="qualification">Qualification</Label>
                        <Input id="qualification" value="MBBS, MD (Cardiology)" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Experience (years)</Label>
                        <Input id="experience" type="number" value="15" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="consultation-fee">Consultation Fee (₹)</Label>
                        <Input id="consultation-fee" type="number" value="1200" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license">Medical License Number</Label>
                        <Input id="license" value="MCI-12345" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="available-days">Available Days</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-[#10847e]">Monday</Badge>
                        <Badge className="bg-[#10847e]">Tuesday</Badge>
                        <Badge className="bg-[#10847e]">Wednesday</Badge>
                        <Badge className="bg-[#10847e]">Thursday</Badge>
                        <Badge className="bg-[#10847e]">Friday</Badge>
                        <Badge variant="outline">Saturday</Badge>
                        <Badge variant="outline">Sunday</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="time-start">Available Time Start</Label>
                        <Input id="time-start" type="time" value="09:00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time-end">Available Time End</Label>
                        <Input id="time-end" type="time" value="17:00" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="about">About</Label>
                      <textarea 
                        id="about" 
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="Dr. Amit Sharma is a highly experienced cardiologist with over 15 years of clinical experience. He specializes in treating heart diseases, performing angioplasty, and managing cardiac conditions. He has successfully treated more than 5000 patients throughout his career."
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

export default DoctorDashboard;