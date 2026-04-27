import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  ShoppingBag,
  FileText,
  Globe,
  Server,
  Database,
  Clock,
  HardDrive,
  Cpu,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Sample data for charts
const userActivityData = [
  { name: 'Mon', value: 3200 },
  { name: 'Tue', value: 4500 },
  { name: 'Wed', value: 4200 },
  { name: 'Thu', value: 3800 },
  { name: 'Fri', value: 5100 },
  { name: 'Sat', value: 2800 },
  { name: 'Sun', value: 2400 },
];

const revenueData = [
  { name: 'Jan', revenue: 42000 },
  { name: 'Feb', revenue: 47000 },
  { name: 'Mar', revenue: 55000 },
  { name: 'Apr', revenue: 58000 },
  { name: 'May', revenue: 52000 },
  { name: 'Jun', revenue: 63000 },
  { name: 'Jul', revenue: 68000 },
  { name: 'Aug', revenue: 72000 },
  { name: 'Sep', revenue: 76000 },
  { name: 'Oct', revenue: 81000 },
  { name: 'Nov', revenue: 87000 },
  { name: 'Dec', revenue: 95000 },
];

const usersByRoleData = [
  { name: 'Patients', value: 2450, color: '#10b981' },
  { name: 'Doctors', value: 120, color: '#3b82f6' },
  { name: 'Pharmacists', value: 85, color: '#8b5cf6' },
  { name: 'Lab Techs', value: 65, color: '#f59e0b' },
  { name: 'Admins', value: 30, color: '#6b7280' },
];

const SystemOverview = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Overview</h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Users</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-bold mt-1">2,750</h3>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> 12%
                  </Badge>
                </div>
                <p className="text-green-600 text-sm mt-1">+48 this week</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-bold mt-1">1,254</h3>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> 8%
                  </Badge>
                </div>
                <p className="text-green-600 text-sm mt-1">+22 today</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Sessions</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-bold mt-1">543</h3>
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    <ArrowDownRight className="h-3 w-3 mr-1" /> 3%
                  </Badge>
                </div>
                <p className="text-amber-600 text-sm mt-1">87 new users</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Lab Reports</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-bold mt-1">832</h3>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> 15%
                  </Badge>
                </div>
                <p className="text-green-600 text-sm mt-1">+34 this week</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* User Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10847e"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usersByRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {usersByRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Daily Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Daily User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userActivityData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} actions`, 'Activity']} />
                <Legend />
                <Bar dataKey="value" fill="#10847e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* System Health */}
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">System Health</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Server className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">API Server</p>
                  <p className="text-xs text-gray-500">Main backend server</p>
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <Progress value={42} className="h-2" />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-500">CPU Load</span>
              <span className="font-medium">42%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Database className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-xs text-gray-500">PostgreSQL</p>
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <Progress value={28} className="h-2" />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-500">CPU Load</span>
              <span className="font-medium">28%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <HardDrive className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Storage</p>
                  <p className="text-xs text-gray-500">Object storage</p>
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <Progress value={72} className="h-2" />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-500">Disk Usage</span>
              <span className="font-medium">72%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Response Time</p>
                  <p className="text-xs text-gray-500">API endpoints</p>
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            </div>
            <Progress value={85} className="h-2" />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-500">Avg. Response</span>
              <span className="font-medium">238ms</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* System Logs */}
      <div className="mt-6 flex justify-end">
        <Button>View Full System Report</Button>
      </div>
    </div>
  );
};

export default SystemOverview;