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
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Users, Pill, Stethoscope, Microscope, Clipboard, Package, Calendar, Heart, 
  DollarSign, TrendingUp, BarChart2, Activity, Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [location, navigate] = useLocation();
  const { user } = useStore();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the admin panel.',
        variant: 'destructive',
      });
    } else if (!user) {
      navigate('/profile');
      toast({
        title: 'Authentication Required',
        description: 'Please login to access the admin panel.',
        variant: 'destructive',
      });
    }
  }, [user, navigate, toast]);
  
  // Dashboard overview stats
  const stats = [
    { title: "Products", value: "240", icon: <ShoppingBag className="h-4 w-4" />, trend: "+12%" },
    { title: "Users", value: "1,240", icon: <Users className="h-4 w-4" />, trend: "+8%" },
    { title: "Orders", value: "356", icon: <Package className="h-4 w-4" />, trend: "+16%" },
    { title: "Revenue", value: "₹87,240", icon: <DollarSign className="h-4 w-4" />, trend: "+5%" },
  ];
  
  if (!user || user.role !== 'admin') {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Admin Dashboard - 1mg</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your products, users, and services</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              View Site
            </Button>
            <Button size="sm" className="bg-[#10847e] hover:bg-[#10847e]/90">
              <Plus className="mr-2 h-4 w-4" /> Add Product
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
                  <span className="text-green-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> {stat.trend}
                  </span>
                  <span className="text-muted-foreground ml-2">vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mb-8">
          <Tabs defaultValue="products">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-full">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="doctors">Doctors</TabsTrigger>
              <TabsTrigger value="pharmacies">Pharmacies</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Products</CardTitle>
                    <Button className="bg-[#10847e] hover:bg-[#10847e]/90">
                      <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                  </div>
                  <CardDescription>
                    Manage your products inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                      <Input placeholder="Search products..." className="w-64" />
                      <Button variant="outline" size="sm">
                        Filter
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">HealthVit Multivitamin Tablets</TableCell>
                          <TableCell>Vitamins</TableCell>
                          <TableCell>₹349</TableCell>
                          <TableCell><Badge className="bg-green-500">In Stock</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Accu-Check Active Glucometer Kit</TableCell>
                          <TableCell>Diabetes Care</TableCell>
                          <TableCell>₹1,249</TableCell>
                          <TableCell><Badge className="bg-green-500">In Stock</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Omron HEM-7124 BP Monitor</TableCell>
                          <TableCell>Heart Care</TableCell>
                          <TableCell>₹1,899</TableCell>
                          <TableCell><Badge className="bg-green-500">In Stock</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Premium N95 Masks Pack</TableCell>
                          <TableCell>COVID Essentials</TableCell>
                          <TableCell>₹299</TableCell>
                          <TableCell><Badge className="bg-green-500">In Stock</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Ayush Kadha Herbal Mix</TableCell>
                          <TableCell>Ayurveda</TableCell>
                          <TableCell>₹249</TableCell>
                          <TableCell><Badge className="bg-green-500">In Stock</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
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
            
            <TabsContent value="categories" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Categories</CardTitle>
                    <Button className="bg-[#10847e] hover:bg-[#10847e]/90">
                      <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                  </div>
                  <CardDescription>
                    Manage your product categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Diabetes Care</TableCell>
                          <TableCell>Products for managing diabetes</TableCell>
                          <TableCell>12</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Heart Care</TableCell>
                          <TableCell>Products for heart health</TableCell>
                          <TableCell>8</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Vitamins</TableCell>
                          <TableCell>Vitamins and supplements</TableCell>
                          <TableCell>15</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">COVID Essentials</TableCell>
                          <TableCell>Essential supplies for COVID protection</TableCell>
                          <TableCell>7</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Ayurveda</TableCell>
                          <TableCell>Traditional Ayurvedic remedies</TableCell>
                          <TableCell>9</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>
                    Manage customer orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                      <Input placeholder="Search orders..." className="w-64" />
                      <Button variant="outline" size="sm">
                        Filter
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
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
                          <TableCell>Apr 7, 2025</TableCell>
                          <TableCell>₹2,849</TableCell>
                          <TableCell><Badge className="bg-green-500">Delivered</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#ORD003</TableCell>
                          <TableCell>Vikram Singh</TableCell>
                          <TableCell>Apr 6, 2025</TableCell>
                          <TableCell>₹799</TableCell>
                          <TableCell><Badge className="bg-blue-500">Shipped</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#ORD004</TableCell>
                          <TableCell>Neha Gupta</TableCell>
                          <TableCell>Apr 5, 2025</TableCell>
                          <TableCell>₹3,499</TableCell>
                          <TableCell><Badge className="bg-green-500">Delivered</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#ORD005</TableCell>
                          <TableCell>Aditya Kumar</TableCell>
                          <TableCell>Apr 4, 2025</TableCell>
                          <TableCell>₹1,999</TableCell>
                          <TableCell><Badge className="bg-red-500">Cancelled</Badge></TableCell>
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
            
            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>
                    Manage user accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                      <Input placeholder="Search users..." className="w-64" />
                      <Button variant="outline" size="sm">
                        Filter
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Rahul Sharma</TableCell>
                          <TableCell>rahul.sharma@example.com</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Mar 15, 2025</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Dr. Priya Patel</TableCell>
                          <TableCell>priya.patel@example.com</TableCell>
                          <TableCell>Doctor</TableCell>
                          <TableCell>Feb 28, 2025</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Vikram Singh</TableCell>
                          <TableCell>vikram.singh@example.com</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Jan 10, 2025</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">LifeCare Pharmacy</TableCell>
                          <TableCell>lifecare@example.com</TableCell>
                          <TableCell>Pharmacy</TableCell>
                          <TableCell>Dec 5, 2024</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">HealthFirst Labs</TableCell>
                          <TableCell>healthfirst@example.com</TableCell>
                          <TableCell>Laboratory</TableCell>
                          <TableCell>Nov 18, 2024</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
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
            
            <TabsContent value="doctors" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Doctors</CardTitle>
                    <Button className="bg-[#10847e] hover:bg-[#10847e]/90">
                      <Plus className="mr-2 h-4 w-4" /> Add Doctor
                    </Button>
                  </div>
                  <CardDescription>
                    Manage doctor profiles and appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Specialization</TableHead>
                          <TableHead>Experience</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Dr. Amit Sharma</TableCell>
                          <TableCell>Cardiologist</TableCell>
                          <TableCell>15 years</TableCell>
                          <TableCell>4.8 (124)</TableCell>
                          <TableCell><Badge className="bg-green-500">Verified</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Dr. Priya Patel</TableCell>
                          <TableCell>Dermatologist</TableCell>
                          <TableCell>8 years</TableCell>
                          <TableCell>4.6 (87)</TableCell>
                          <TableCell><Badge className="bg-green-500">Verified</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Dr. Sanjay Gupta</TableCell>
                          <TableCell>Neurologist</TableCell>
                          <TableCell>12 years</TableCell>
                          <TableCell>4.7 (103)</TableCell>
                          <TableCell><Badge className="bg-green-500">Verified</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Dr. Meera Reddy</TableCell>
                          <TableCell>Pediatrician</TableCell>
                          <TableCell>10 years</TableCell>
                          <TableCell>4.9 (156)</TableCell>
                          <TableCell><Badge className="bg-green-500">Verified</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Dr. Rajiv Kumar</TableCell>
                          <TableCell>Orthopedic</TableCell>
                          <TableCell>14 years</TableCell>
                          <TableCell>4.5 (92)</TableCell>
                          <TableCell><Badge className="bg-yellow-500">Pending</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Profile
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
            
            <TabsContent value="pharmacies" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Pharmacies & Laboratories</CardTitle>
                    <div className="flex gap-2">
                      <Button className="bg-[#10847e] hover:bg-[#10847e]/90">
                        <Plus className="mr-2 h-4 w-4" /> Add Pharmacy
                      </Button>
                      <Button className="bg-[#10847e] hover:bg-[#10847e]/90">
                        <Plus className="mr-2 h-4 w-4" /> Add Laboratory
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Manage pharmacy and laboratory partners
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>License</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">MedPlus Pharmacy</TableCell>
                          <TableCell>Pharmacy</TableCell>
                          <TableCell>Mumbai, MH</TableCell>
                          <TableCell>MP1234</TableCell>
                          <TableCell><Badge className="bg-green-500">Verified</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">LifeCare Pharmacy</TableCell>
                          <TableCell>Pharmacy</TableCell>
                          <TableCell>Delhi, DL</TableCell>
                          <TableCell>LC5678</TableCell>
                          <TableCell><Badge className="bg-green-500">Verified</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Apollo Pharmacy</TableCell>
                          <TableCell>Pharmacy</TableCell>
                          <TableCell>Bangalore, KA</TableCell>
                          <TableCell>AP9012</TableCell>
                          <TableCell><Badge className="bg-green-500">Verified</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">HealthFirst Labs</TableCell>
                          <TableCell>Laboratory</TableCell>
                          <TableCell>Chennai, TN</TableCell>
                          <TableCell>HL3456</TableCell>
                          <TableCell><Badge className="bg-green-500">Verified</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Metropolis Labs</TableCell>
                          <TableCell>Laboratory</TableCell>
                          <TableCell>Hyderabad, TS</TableCell>
                          <TableCell>ML7890</TableCell>
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
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Dashboard;