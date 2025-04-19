import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UserManagement from '@/components/admin/UserManagement';
import SystemOverview from '@/components/admin/SystemOverview';
import ProductManagement from '@/components/admin/ProductManagement';
import SEODashboard from '@/components/admin/SEODashboard';
import { 
  Users, 
  Settings, 
  BarChart, 
  Layers, 
  Database, 
  AlertCircle,
  Bell,
  Search,
  GanttChart,
  Shield,
  UserPlus,
  Database as DatabaseIcon,
  ShoppingBag,
  Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage users, system settings, and monitor platform performance
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
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
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
          <Avatar>
            <AvatarImage src="https://randomuser.me/api/portraits/women/4.jpg" alt="Admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-shadow border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">User Onboarding</h3>
                <p className="text-sm text-gray-600">Add and manage users</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              Manage Users
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-md transition-shadow border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Role Management</h3>
                <p className="text-sm text-gray-600">Assign roles and permissions</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
              Manage Roles
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-md transition-shadow border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <GanttChart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">System Logs</h3>
                <p className="text-sm text-gray-600">View activity logs</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
              View Logs
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-md transition-shadow border-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                <DatabaseIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Backups</h3>
                <p className="text-sm text-gray-600">Manage database backups</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700">
              Run Backup
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card className="mb-8 border-amber-200 bg-amber-50">
        <CardHeader className="pb-2">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
            <CardTitle>System Alerts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start border-l-2 border-amber-500 pl-3 py-1">
              <div>
                <p className="font-medium">Database storage approaching limit</p>
                <p className="text-sm text-gray-600">Current usage is at 85% of allocated storage</p>
                <div className="flex gap-2 mt-1">
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    Warning
                  </Badge>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
              </div>
            </div>
            <div className="flex items-start border-l-2 border-red-500 pl-3 py-1">
              <div>
                <p className="font-medium">Failed login attempts detected</p>
                <p className="text-sm text-gray-600">Multiple failed login attempts from IP 203.0.113.42</p>
                <div className="flex gap-2 mt-1">
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    Security
                  </Badge>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <TabsTrigger value="overview">
            <BarChart className="mr-2 h-4 w-4" /> 
            Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" /> 
            Users
          </TabsTrigger>
          <TabsTrigger value="products">
            <ShoppingBag className="mr-2 h-4 w-4" /> 
            Products
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" /> 
            Settings
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Globe className="mr-2 h-4 w-4" /> 
            SEO
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Layers className="mr-2 h-4 w-4" /> 
            Integrations
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="mr-2 h-4 w-4" /> 
            Database
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <SystemOverview />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Settings className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Settings Module</h3>
                <p className="text-gray-500 max-w-md">
                  This area will contain system-wide configuration options, notification settings, and security preferences.
                </p>
                <Button className="mt-6">
                  View Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="seo">
          <SEODashboard />
        </TabsContent>
        
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Layers className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Integrations Hub</h3>
                <p className="text-gray-500 max-w-md">
                  Connect your healthcare platform with third-party services, payment gateways, and notification systems.
                </p>
                <Button className="mt-6">
                  Explore Integrations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Database className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Database Controls</h3>
                <p className="text-gray-500 max-w-md">
                  This panel will provide database metrics, maintenance tools, and backup/restore functionality.
                </p>
                <Button className="mt-6">
                  Manage Database
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;