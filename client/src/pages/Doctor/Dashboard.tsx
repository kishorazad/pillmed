import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppointmentCalendar from '@/components/doctor/AppointmentCalendar';
import PatientManagement from '@/components/doctor/PatientManagement';
import { User, Calendar, VideoIcon, PlusCircle, Clipboard, Bell, Calendar as CalendarIcon } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'alert';
  time: string;
  read: boolean;
}

const DoctorDashboard = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: 'New appointment scheduled with Rajesh Patel',
      type: 'info',
      time: '10 minutes ago',
      read: false
    },
    {
      id: 2,
      message: 'Patient Sunita Sharma canceled her appointment',
      type: 'warning',
      time: '25 minutes ago',
      read: false
    },
    {
      id: 3,
      message: 'Lab results ready for Vikram Mehta',
      type: 'info',
      time: '1 hour ago',
      read: true
    },
    {
      id: 4,
      message: 'Emergency consultation requested by Dr. Kumar',
      type: 'alert',
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
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage appointments, patients, and medical records
          </p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Patient
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Today's Appointments</p>
                <h3 className="text-3xl font-bold mt-1">8</h3>
                <p className="text-amber-600 text-sm mt-1">3 pending</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Patients</p>
                <h3 className="text-3xl font-bold mt-1">124</h3>
                <p className="text-green-600 text-sm mt-1">+4 this week</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Upcoming Video Calls</p>
                <h3 className="text-3xl font-bold mt-1">5</h3>
                <p className="text-blue-600 text-sm mt-1">Next at 2:30 PM</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <VideoIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Reports</p>
                <h3 className="text-3xl font-bold mt-1">12</h3>
                <p className="text-red-600 text-sm mt-1">4 urgent</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clipboard className="h-6 w-6 text-purple-600" />
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

      {/* Main Content */}
      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appointments">
            <Calendar className="mr-2 h-4 w-4" /> 
            Appointments
          </TabsTrigger>
          <TabsTrigger value="patients">
            <User className="mr-2 h-4 w-4" /> 
            Patient Management
          </TabsTrigger>
          <TabsTrigger value="telemedicine">
            <VideoIcon className="mr-2 h-4 w-4" /> 
            Telemedicine
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments">
          <AppointmentCalendar />
        </TabsContent>
        
        <TabsContent value="patients">
          <PatientManagement />
        </TabsContent>
        
        <TabsContent value="telemedicine">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <VideoIcon className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Telemedicine Module</h3>
            <p className="text-gray-500 max-w-md">
              This feature is currently under development. Telemedicine capabilities will be coming soon.
            </p>
            <Button className="mt-6">
              Schedule a Demo
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;