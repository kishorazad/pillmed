import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Database, Users, ShoppingBag, Building2, Stethoscope, Beaker, LayoutGrid, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  }>
}

const MongoDBDashboard = () => {
  const { data, isLoading, error } = useQuery<DBStats>({
    queryKey: ['/api/admin/stats'],
    staleTime: 60000, // 1 minute
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
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
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
            <CardHeader>
              <CardTitle>Recent Prescription Uploads</CardTitle>
              <CardDescription>Customer prescriptions awaiting review</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentPrescriptions && data.recentPrescriptions.length > 0 ? (
                <div className="space-y-4">
                  {data.recentPrescriptions.map(prescription => (
                    <div key={prescription.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      {prescription.imageUrl && (
                        <div className="mr-4 w-16 h-16 bg-white rounded border overflow-hidden flex-shrink-0">
                          <img 
                            src={prescription.imageUrl} 
                            alt="Prescription" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <div className="font-medium">{prescription.userName}</div>
                        <div className="text-sm text-gray-500">Uploaded on {prescription.uploadDate}</div>
                        <div className="mt-1 flex items-center">
                          <Badge className={`
                            ${prescription.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                            prescription.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'}
                          `}>
                            {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  ))}
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