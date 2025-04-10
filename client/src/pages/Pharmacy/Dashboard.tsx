import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MedicationTracker from '@/components/pharmacy/MedicationTracker';
import PrescriptionAnalysis from '@/components/pharmacy/PrescriptionAnalysis';
import InventoryManagement from '@/components/pharmacy/InventoryManagement';
import { 
  Pill, 
  PackageCheck, 
  FileBarChart, 
  Bell, 
  User, 
  Search, 
  ClipboardList,
  FileSearch,
  ShoppingBag,
  Printer,
  Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'alert';
  time: string;
  read: boolean;
}

const PharmacyDashboard = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: 'New prescription uploaded by Dr. Anil Kumar',
      type: 'info',
      time: '15 minutes ago',
      read: false
    },
    {
      id: 2,
      message: 'Atorvastatin inventory low, only 12 units left',
      type: 'warning',
      time: '32 minutes ago',
      read: false
    },
    {
      id: 3,
      message: 'Order PO-2025-0423 has been shipped',
      type: 'info',
      time: '1 hour ago',
      read: true
    },
    {
      id: 4,
      message: 'Patient Vikram Mehta collected prescription #PRE-2874',
      type: 'info',
      time: '2 hours ago',
      read: true
    }
  ]);

  const unreadNotificationsCount = notifications.filter(notification => !notification.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage prescriptions, medications, and inventory
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search patients or prescriptions..."
              className="pl-9 w-full"
            />
          </div>
          <div className="relative">
            <Button 
              variant="outline" 
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </Button>
          </div>
          <Avatar>
            <AvatarImage src="https://randomuser.me/api/portraits/women/2.jpg" alt="Pharmacy Admin" />
            <AvatarFallback>PA</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Prescriptions</p>
                <h3 className="text-3xl font-bold mt-1">87</h3>
                <p className="text-blue-600 text-sm mt-1">12 pending review</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Dispensed Today</p>
                <h3 className="text-3xl font-bold mt-1">34</h3>
                <p className="text-green-600 text-sm mt-1">+8 from yesterday</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Pill className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Inventory Alerts</p>
                <h3 className="text-3xl font-bold mt-1">3</h3>
                <p className="text-amber-600 text-sm mt-1">1 out of stock</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <PackageCheck className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-1">₹24,850</h3>
                <p className="text-green-600 text-sm mt-1">+12% this week</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FileBarChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {unreadNotificationsCount > 0 && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Notifications</CardTitle>
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications
                .filter(notification => !notification.read)
                .map(notification => (
                  <div 
                    key={notification.id}
                    className="flex items-start p-3 rounded-md bg-gray-50"
                  >
                    <div className={`w-2 h-2 mt-2 rounded-full mr-3 ${
                      notification.type === 'info' ? 'bg-blue-500' :
                      notification.type === 'warning' ? 'bg-amber-500' : 
                      'bg-red-500'
                    }`} />
                    <div className="flex-1">
                      <p>{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
        <Button variant="outline" className="flex flex-col h-auto py-4 px-2 gap-2 justify-center items-center">
          <FileSearch className="h-5 w-5" />
          <span className="text-xs">New Prescription</span>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-4 px-2 gap-2 justify-center items-center">
          <ShoppingBag className="h-5 w-5" />
          <span className="text-xs">Process Order</span>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-4 px-2 gap-2 justify-center items-center">
          <PackageCheck className="h-5 w-5" />
          <span className="text-xs">Receive Stock</span>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-4 px-2 gap-2 justify-center items-center">
          <User className="h-5 w-5" />
          <span className="text-xs">Patient Lookup</span>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-4 px-2 gap-2 justify-center items-center">
          <Printer className="h-5 w-5" />
          <span className="text-xs">Print Reports</span>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-4 px-2 gap-2 justify-center items-center">
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Schedule</span>
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="prescriptions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 gap-2">
          <TabsTrigger value="prescriptions">
            <ClipboardList className="mr-2 h-4 w-4" /> 
            Prescription Tracker
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <PackageCheck className="mr-2 h-4 w-4" /> 
            Inventory Management
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <FileBarChart className="mr-2 h-4 w-4" /> 
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="prescriptions">
          <MedicationTracker />
        </TabsContent>
        
        <TabsContent value="inventory">
          <InventoryManagement />
        </TabsContent>
        
        <TabsContent value="analytics">
          <PrescriptionAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PharmacyDashboard;