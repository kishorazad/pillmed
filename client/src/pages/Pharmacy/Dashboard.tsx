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
import { ShoppingBag, Pill, Package, Calendar, Clock, Truck, TrendingUp, Edit, FileText, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

const PharmacyDashboard = () => {
  const [location, navigate] = useLocation();
  const { user } = useStore();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Redirect if not pharmacy
  useEffect(() => {
    if (user && user.role !== 'pharmacy') {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the pharmacy panel.',
        variant: 'destructive',
      });
    } else if (!user) {
      navigate('/profile');
      toast({
        title: 'Authentication Required',
        description: 'Please login to access the pharmacy panel.',
        variant: 'destructive',
      });
    }
  }, [user, navigate, toast]);
  
  // Dashboard overview stats
  const stats = [
    { title: "Total Orders", value: "124", icon: <Package className="h-4 w-4" />, trend: "+8%" },
    { title: "Pending", value: "18", icon: <Clock className="h-4 w-4" />, trend: "-3%" },
    { title: "In Transit", value: "42", icon: <Truck className="h-4 w-4" />, trend: "+11%" },
    { title: "Delivered", value: "64", icon: <ShoppingBag className="h-4 w-4" />, trend: "+5%" },
  ];
  
  if (!user || user.role !== 'pharmacy') {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Pharmacy Dashboard - 1mg</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Pharmacy Dashboard</h1>
            <p className="text-muted-foreground">Manage orders, inventory, and prescriptions</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              View Site
            </Button>
            <Button size="sm" className="bg-[#10847e] hover:bg-[#10847e]/90">
              <Plus className="mr-2 h-4 w-4" /> Add Medicine
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
                  <span className={`flex items-center ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    <TrendingUp className="h-3 w-3 mr-1" /> {stat.trend}
                  </span>
                  <span className="text-muted-foreground ml-2">vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mb-8">
          <Tabs defaultValue="orders">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 w-full">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="profile">Pharmacy Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    View and manage customer orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                      <Input placeholder="Search orders..." className="w-64" />
                      <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">#ORD001</TableCell>
                          <TableCell>Rahul Sharma</TableCell>
                          <TableCell>3</TableCell>
                          <TableCell>Apr 8, 2025</TableCell>
                          <TableCell>₹1,249</TableCell>
                          <TableCell><Badge>Processing</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#ORD002</TableCell>
                          <TableCell>Priya Patel</TableCell>
                          <TableCell>5</TableCell>
                          <TableCell>Apr 7, 2025</TableCell>
                          <TableCell>₹2,849</TableCell>
                          <TableCell><Badge className="bg-blue-500">Shipped</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#ORD003</TableCell>
                          <TableCell>Vikram Singh</TableCell>
                          <TableCell>2</TableCell>
                          <TableCell>Apr 6, 2025</TableCell>
                          <TableCell>₹799</TableCell>
                          <TableCell><Badge className="bg-green-500">Delivered</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#ORD004</TableCell>
                          <TableCell>Neha Gupta</TableCell>
                          <TableCell>8</TableCell>
                          <TableCell>Apr 5, 2025</TableCell>
                          <TableCell>₹3,499</TableCell>
                          <TableCell><Badge>Processing</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#ORD005</TableCell>
                          <TableCell>Aditya Kumar</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>Apr 4, 2025</TableCell>
                          <TableCell>₹1,999</TableCell>
                          <TableCell><Badge className="bg-yellow-500">Pending</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
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
            
            <TabsContent value="inventory" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Medicine Inventory</CardTitle>
                    <Button className="bg-[#10847e] hover:bg-[#10847e]/90">
                      <Plus className="mr-2 h-4 w-4" /> Add Medicine
                    </Button>
                  </div>
                  <CardDescription>
                    Manage your medicine inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                      <Input placeholder="Search medicines..." className="w-64" />
                      <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                        <option value="all">All Categories</option>
                        <option value="antibiotics">Antibiotics</option>
                        <option value="painkillers">Painkillers</option>
                        <option value="diabetes">Diabetes</option>
                        <option value="heart">Heart Care</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Expiry</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Crocin 500mg</TableCell>
                          <TableCell>Painkillers</TableCell>
                          <TableCell>245 units</TableCell>
                          <TableCell>₹15</TableCell>
                          <TableCell>Dec 2026</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Azithromycin 250mg</TableCell>
                          <TableCell>Antibiotics</TableCell>
                          <TableCell>120 units</TableCell>
                          <TableCell>₹85</TableCell>
                          <TableCell>Nov 2025</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Metformin 500mg</TableCell>
                          <TableCell>Diabetes</TableCell>
                          <TableCell>380 units</TableCell>
                          <TableCell>₹45</TableCell>
                          <TableCell>Aug 2026</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Atorvastatin 10mg</TableCell>
                          <TableCell>Heart Care</TableCell>
                          <TableCell>210 units</TableCell>
                          <TableCell>₹120</TableCell>
                          <TableCell>Sep 2026</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Cetirizine 10mg</TableCell>
                          <TableCell>Allergy</TableCell>
                          <TableCell>175 units</TableCell>
                          <TableCell>₹35</TableCell>
                          <TableCell>Oct 2025</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
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
                    Manage customer prescriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                      <Input placeholder="Search prescriptions..." className="w-64" />
                      <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="fulfilled">Fulfilled</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">#PRE001</TableCell>
                          <TableCell>Rahul Sharma</TableCell>
                          <TableCell>Dr. Amit Kumar</TableCell>
                          <TableCell>Apr 8, 2025</TableCell>
                          <TableCell><Badge>Pending</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-2" /> View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#PRE002</TableCell>
                          <TableCell>Priya Patel</TableCell>
                          <TableCell>Dr. Sanjay Gupta</TableCell>
                          <TableCell>Apr 7, 2025</TableCell>
                          <TableCell><Badge className="bg-green-500">Verified</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-2" /> View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#PRE003</TableCell>
                          <TableCell>Vikram Singh</TableCell>
                          <TableCell>Dr. Meera Reddy</TableCell>
                          <TableCell>Apr 6, 2025</TableCell>
                          <TableCell><Badge className="bg-blue-500">Fulfilled</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-2" /> View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#PRE004</TableCell>
                          <TableCell>Neha Gupta</TableCell>
                          <TableCell>Dr. Rajiv Kumar</TableCell>
                          <TableCell>Apr 5, 2025</TableCell>
                          <TableCell><Badge>Pending</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-2" /> View
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
                  <CardTitle>Pharmacy Profile</CardTitle>
                  <CardDescription>
                    Manage your pharmacy information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="pharmacy-name">Pharmacy Name</Label>
                        <Input id="pharmacy-name" value="MedPlus Pharmacy" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license">License Number</Label>
                        <Input id="license" value="MP1234" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value="123 Main Street, Mumbai" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input id="pincode" value="400001" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" value="+91 9876543210" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value="contact@medplus.com" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hours">Operating Hours</Label>
                      <Input id="hours" value="Monday to Sunday, 8:00 AM to 10:00 PM" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea 
                        id="description" 
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="MedPlus Pharmacy is a trusted pharmacy chain providing quality medicines and healthcare products. We offer a wide range of prescription and over-the-counter medications at competitive prices."
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

export default PharmacyDashboard;