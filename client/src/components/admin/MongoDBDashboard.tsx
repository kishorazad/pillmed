import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import OptimizedImage from './OptimizedImage';
import { 
  Loader2, 
  Database, 
  Users, 
  ShoppingBag, 
  Building2, 
  Stethoscope, 
  Beaker, 
  LayoutGrid, 
  FileText, 
  AlertCircle,
  ClipboardList,
  ShoppingCart,
  TestTube,
  Heart,
  CalendarDays,
  MessageSquare,
  Star,
  MessageCircle,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";

interface DBStats {
  totalUsers: number;
  userCounts: {
    [key: string]: number;
  };
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalPrescriptions: number;
  storageUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  recentPrescriptions: Array<{
    id: number;
    userId: number;
    userName: string;
    uploadDate: string;
    status: string;
    imageUrl?: string;
  }>;
  // Collections data
  collections?: Array<{
    name: string;
    count: number;
    size: number;
  }>;
  // Additional data we'll fetch from other endpoints
  products?: Array<any>;
  categories?: Array<any>;
  orders?: Array<any>;
  testimonials?: Array<any>;
  pharmacies?: Array<any>;
  labTests?: Array<any>;
  appointments?: Array<any>;
}

const MongoDBDashboard = () => {
  const [approvalMode, setApprovalMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Fetch the main database statistics
  const { data, isLoading, error } = useQuery<DBStats>({
    queryKey: ['/api/admin/stats'],
    staleTime: 60000, // 1 minute
  });
  
  // Fetch additional data for the tables
  const { data: productsData } = useQuery<any[]>({
    queryKey: ['/api/products'],
    staleTime: 60000,
  });
  
  const { data: pharmaciesData } = useQuery<any[]>({
    queryKey: ['/api/admin/pharmacies'],
    staleTime: 60000,
  });
  
  const { data: testimonialsData } = useQuery<any[]>({
    queryKey: ['/api/testimonials'],
    staleTime: 60000,
  });
  
  const { data: ordersData } = useQuery<any[]>({
    queryKey: ['/api/admin/orders'],
    staleTime: 60000,
  });
  
  const { data: labTestsData } = useQuery<any[]>({
    queryKey: ['/api/lab-tests'],
    staleTime: 60000,
  });
  
  const { data: appointmentsData } = useQuery<any[]>({
    queryKey: ['/api/appointments'],
    staleTime: 60000,
  });
  
  const { data: healthTipsData } = useQuery<any[]>({
    queryKey: ['/api/health-tips'],
    staleTime: 60000,
  });
  
  const { data: articlesData } = useQuery<any[]>({
    queryKey: ['/api/articles'],
    staleTime: 60000,
  });
  
  // Fetch prescriptions data directly from the non-authenticated API endpoint
  const { data: prescriptionsData } = useQuery<any[]>({
    queryKey: ['/api/data-api/prescriptions'],
    staleTime: 30000, // 30 seconds - more frequent refresh for prescriptions
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Loading database statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to load database statistics</h3>
        <p className="text-gray-500 max-w-md mb-4">
          There was an error connecting to the MongoDB database. Please check your connection and try again.
        </p>
        <Button>Retry</Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Database className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Database Statistics Available</h3>
        <p className="text-gray-500 max-w-md">
          Database statistics could not be loaded at this time. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="pharmacies">Pharmacies</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="lab-tests">Lab Tests</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="health-tips">Health Tips</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-blue-700">
                  <Users className="mr-2 h-5 w-5" />
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.totalUsers}</div>
                <p className="text-sm text-gray-500 mt-1">
                  Total registered users
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-emerald-700">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.totalProducts}</div>
                <p className="text-sm text-gray-500 mt-1">
                  Total products in catalog
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-amber-700">
                  <LayoutGrid className="mr-2 h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.totalCategories}</div>
                <p className="text-sm text-gray-500 mt-1">
                  Product categories
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-purple-700">
                  <FileText className="mr-2 h-5 w-5" />
                  Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.totalOrders}</div>
                <p className="text-sm text-gray-500 mt-1">
                  Total orders processed
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Database Storage</CardTitle>
              <CardDescription>Current MongoDB storage utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Used Space</span>
                    <span className="font-medium">{Math.round(data.storageUsage.percentage)}%</span>
                  </div>
                  <Progress 
                    value={data.storageUsage.percentage} 
                    className={`h-2 ${data.storageUsage.percentage > 80 ? 'bg-red-100' : 'bg-blue-100'}`}
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>{(data.storageUsage.used / 1024).toFixed(2)} GB used</span>
                    <span>{(data.storageUsage.total / 1024).toFixed(2)} GB total</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution by Role</CardTitle>
              <CardDescription>Breakdown of user accounts by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">{data.userCounts.customer || 0}</div>
                  <div className="text-sm text-gray-600">Customers</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-700">{data.userCounts.pharmacy || 0}</div>
                  <div className="text-sm text-gray-600">Pharmacies</div>
                </div>
                
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <Stethoscope className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-700">{data.userCounts.doctor || 0}</div>
                  <div className="text-sm text-gray-600">Doctors</div>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <Beaker className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-amber-700">{data.userCounts.laboratory || 0}</div>
                  <div className="text-sm text-gray-600">Laboratories</div>
                </div>
                
                <div className="bg-pink-50 rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-pink-700">{data.userCounts.chemist || 0}</div>
                  <div className="text-sm text-gray-600">Chemists</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <Building2 className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-700">{data.userCounts.hospital || 0}</div>
                  <div className="text-sm text-gray-600">Hospitals</div>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <Database className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-indigo-700">{data.userCounts.admin || 0}</div>
                  <div className="text-sm text-gray-600">Admins</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Prescription Management</CardTitle>
                <CardDescription>View and manage customer prescription uploads</CardDescription>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-2">
                <div className="flex items-center space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-8 w-full sm:w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Display loader if prescriptions are being fetched */}
              {!prescriptionsData ? (
                <div className="text-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-gray-500">Loading prescriptions...</p>
                </div>
              ) : prescriptionsData.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead>File</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prescriptionsData
                          .filter(p => statusFilter === 'all' || p.status === statusFilter)
                          .filter(p => 
                            searchQuery === '' || 
                            p.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()))
                          )
                          .map(prescription => (
                            <TableRow key={prescription.id}>
                              <TableCell className="font-medium">{prescription.id}</TableCell>
                              <TableCell>
                                <div className="w-12 h-12 rounded border overflow-hidden">
                                  <OptimizedImage 
                                    src={prescription.imageUrl} 
                                    alt="Prescription" 
                                    className="w-full h-full object-cover"
                                    size="THUMBNAIL"
                                    fallbackText="Rx"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{prescription.userName || prescription.userFullName}</div>
                                <div className="text-xs text-gray-500">ID: {prescription.userId}</div>
                              </TableCell>
                              <TableCell>
                                {new Date(prescription.uploadDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium truncate max-w-[150px]" title={prescription.fileName}>
                                  {prescription.fileName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {Math.round(prescription.fileSize / 1024)} KB
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`
                                  ${prescription.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                                  prescription.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'}
                                `}>
                                  {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">View Details</Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                      <DialogTitle>Prescription Details</DialogTitle>
                                      <DialogDescription>
                                        View complete prescription information and manage status
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="mx-auto max-w-full max-h-[300px] overflow-hidden rounded-md border">
                                  <OptimizedImage 
                                    src={prescription.imageUrl}
                                    alt="Prescription"
                                    className="w-full h-full object-contain"
                                    size="MEDIUM"
                                    fallbackText="No prescription image available"
                                  />
                                </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-medium text-sm">User Information</h4>
                                          <p className="text-sm mt-1">{prescription.userName || prescription.userFullName}</p>
                                          <p className="text-xs text-gray-500">ID: {prescription.userId}</p>
                                          {prescription.userEmail && <p className="text-xs text-gray-500">{prescription.userEmail}</p>}
                                          {prescription.userPhone && <p className="text-xs text-gray-500">{prescription.userPhone}</p>}
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-sm">File Information</h4>
                                          <p className="text-sm mt-1 break-all">{prescription.fileName}</p>
                                          <p className="text-xs text-gray-500">{Math.round(prescription.fileSize / 1024)} KB</p>
                                          <p className="text-xs text-gray-500">{prescription.fileType}</p>
                                        </div>
                                      </div>
                                      {prescription.notes && (
                                        <div>
                                          <h4 className="font-medium text-sm">Notes</h4>
                                          <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{prescription.notes}</p>
                                        </div>
                                      )}
                                      <div>
                                        <h4 className="font-medium text-sm">Status</h4>
                                        <div className="flex items-center mt-2">
                                          <Badge className={`
                                            ${prescription.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                                            prescription.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'}
                                          `}>
                                            {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                                          </Badge>
                                          {prescription.updatedAt && (
                                            <span className="text-xs text-gray-500 ml-2">
                                              Updated: {new Date(prescription.updatedAt).toLocaleString()}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex justify-between">
                                      <Button variant="outline" size="sm">Download</Button>
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="sm" 
                                          className="bg-green-50 hover:bg-green-100 text-green-700"
                                          disabled={prescription.status === 'approved'}>
                                          Approve
                                        </Button>
                                        <Button variant="outline" size="sm"
                                          className="bg-red-50 hover:bg-red-100 text-red-700"
                                          disabled={prescription.status === 'rejected'}>
                                          Reject
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No prescription uploads found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>Product Database</CardTitle>
                  <CardDescription>View and manage all products</CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="pl-9 w-full sm:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      <SelectItem value="pending">Pending Approval</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant={approvalMode ? "default" : "outline"}
                    className={approvalMode ? "bg-amber-600 hover:bg-amber-700" : ""}
                    onClick={() => setApprovalMode(!approvalMode)}
                  >
                    {approvalMode ? "Exit Approval Mode" : "Enter Approval Mode"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {productsData && productsData.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsData.map(product => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                                  <OptimizedImage 
                                    src={product.imageUrl} 
                                    alt={product.name || 'Product'} 
                                    className="w-full h-full object-cover"
                                    size="THUMBNAIL"
                                    fallbackText="Rx"
                                  />
                                </div>
                              <span>{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{product.categoryId}</TableCell>
                          <TableCell>₹{product.price}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                product.inStock 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : "bg-red-100 text-red-800 border-red-200"
                              }`}
                            >
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </Badge>
                            {product.pendingApproval && (
                              <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                                Pending Approval
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            {approvalMode && product.pendingApproval && (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive">
                                  Reject
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Products Found</h3>
                  <p className="text-gray-500 max-w-md mb-6">
                    There are no products matching your current filter criteria.
                  </p>
                  <Button>Add New Product</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>View and process customer orders</CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search by order ID..."
                      className="pl-9 w-full sm:w-[250px]"
                    />
                  </div>
                  
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline">
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ordersData && ordersData.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData.map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{order.userName || 'Anonymous'}</TableCell>
                          <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                          <TableCell>₹{order.totalAmount}</TableCell>
                          <TableCell>
                            <Badge
                              className={`
                                ${order.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                                  order.status === 'processing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                                  'bg-red-100 text-red-800 border-red-200'}
                              `}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ClipboardList className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Orders Found</h3>
                  <p className="text-gray-500 max-w-md mb-6">
                    There are no orders matching your current filter criteria.
                  </p>
                  <Button variant="outline">Clear Filters</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pharmacies" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>Pharmacy Management</CardTitle>
                  <CardDescription>View and manage partner pharmacies</CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search pharmacies..."
                      className="pl-9 w-full sm:w-[250px]"
                    />
                  </div>
                  
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pharmacies</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending Approval</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant={approvalMode ? "default" : "outline"}
                    className={approvalMode ? "bg-amber-600 hover:bg-amber-700" : ""}
                    onClick={() => setApprovalMode(!approvalMode)}
                  >
                    {approvalMode ? "Exit Approval Mode" : "Enter Approval Mode"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {pharmaciesData && pharmaciesData.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Pharmacy Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>License Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pharmaciesData.map(pharmacy => (
                        <TableRow key={pharmacy.id}>
                          <TableCell className="font-medium">{pharmacy.id}</TableCell>
                          <TableCell>
                            <div className="font-medium">{pharmacy.name}</div>
                            <div className="text-sm text-gray-500">{pharmacy.email}</div>
                          </TableCell>
                          <TableCell>{pharmacy.address || 'N/A'}</TableCell>
                          <TableCell>{pharmacy.licenseNumber || 'Not provided'}</TableCell>
                          <TableCell>
                            <Badge
                              className={`
                                ${pharmacy.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 
                                  pharmacy.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                  'bg-red-100 text-red-800 border-red-200'}
                              `}
                            >
                              {pharmacy.status.charAt(0).toUpperCase() + pharmacy.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            {approvalMode && pharmacy.status === 'pending' && (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive">
                                  Reject
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Pharmacies Found</h3>
                  <p className="text-gray-500 max-w-md mb-6">
                    There are no pharmacies matching your current filter criteria.
                  </p>
                  <Button variant="outline">Clear Filters</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>Testimonial Management</CardTitle>
                  <CardDescription>View and manage customer testimonials</CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search testimonials..."
                      className="pl-9 w-full sm:w-[250px]"
                    />
                  </div>
                  
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Testimonials</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="pending">Pending Approval</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant={approvalMode ? "default" : "outline"}
                    className={approvalMode ? "bg-amber-600 hover:bg-amber-700" : ""}
                    onClick={() => setApprovalMode(!approvalMode)}
                  >
                    {approvalMode ? "Exit Approval Mode" : "Enter Approval Mode"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {testimonialsData && testimonialsData.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testimonialsData.map(testimonial => (
                        <TableRow key={testimonial.id}>
                          <TableCell className="font-medium">{testimonial.id}</TableCell>
                          <TableCell>
                            <div className="font-medium">{testimonial.name}</div>
                            {testimonial.location && (
                              <div className="text-sm text-gray-500">{testimonial.location}</div>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{testimonial.content}</TableCell>
                          <TableCell>
                            {testimonial.rating && (
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < testimonial.rating
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-gray-200"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`
                                ${testimonial.status === 'published' ? 'bg-green-100 text-green-800 border-green-200' : 
                                  testimonial.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                  'bg-red-100 text-red-800 border-red-200'}
                              `}
                            >
                              {testimonial.status || "Published"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            {approvalMode && testimonial.status === 'pending' && (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive">
                                  Reject
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Testimonials Found</h3>
                  <p className="text-gray-500 max-w-md mb-6">
                    There are no testimonials matching your current filter criteria.
                  </p>
                  <Button variant="outline">Clear Filters</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lab-tests" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>Lab Test Management</CardTitle>
                  <CardDescription>View and manage lab tests and results</CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search lab tests..."
                      className="pl-9 w-full sm:w-[250px]"
                    />
                  </div>
                  
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tests</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {labTestsData && labTestsData.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labTestsData.map(test => (
                        <TableRow key={test.id}>
                          <TableCell className="font-medium">{test.id}</TableCell>
                          <TableCell>
                            <div className="font-medium">{test.patientName}</div>
                            {test.patientAge && test.patientGender && (
                              <div className="text-sm text-gray-500">
                                {test.patientAge} years, {test.patientGender}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{test.testName}</TableCell>
                          <TableCell>{new Date(test.scheduledDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              className={`
                                ${test.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : 
                                  test.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  'bg-red-100 text-red-800 border-red-200'}
                              `}
                            >
                              {test.status ? `${test.status.charAt(0).toUpperCase()}${test.status.slice(1)}` : 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            {test.status === 'completed' && (
                              <Button size="sm" variant="outline">
                                Download Report
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TestTube className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Lab Tests Found</h3>
                  <p className="text-gray-500 max-w-md mb-6">
                    There are no lab tests matching your current filter criteria.
                  </p>
                  <Button variant="outline">Clear Filters</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MongoDB Collection Sizes</CardTitle>
              <CardDescription>Size distribution by collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Users</span>
                    <span className="text-sm font-medium">32.5 MB</span>
                  </div>
                  <Progress value={15} className="h-2 bg-blue-100" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Products</span>
                    <span className="text-sm font-medium">128.2 MB</span>
                  </div>
                  <Progress value={45} className="h-2 bg-emerald-100" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Orders</span>
                    <span className="text-sm font-medium">214.7 MB</span>
                  </div>
                  <Progress value={78} className="h-2 bg-purple-100" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Prescriptions</span>
                    <span className="text-sm font-medium">86.3 MB</span>
                  </div>
                  <Progress value={25} className="h-2 bg-amber-100" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Other Collections</span>
                    <span className="text-sm font-medium">42.8 MB</span>
                  </div>
                  <Progress value={18} className="h-2 bg-gray-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MongoDBDashboard;