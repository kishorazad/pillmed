import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TestManagement from '@/components/laboratory/TestManagement';
import { ActivitySquare, Beaker, FileCheck, Clock, PlusCircle, TestTube, LineChart, Users, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const LaboratoryDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laboratory Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage lab tests, samples, and results
          </p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Test
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Tests</p>
                <h3 className="text-3xl font-bold mt-1">18</h3>
                <p className="text-amber-600 text-sm mt-1">4 urgent</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Tests In Progress</p>
                <h3 className="text-3xl font-bold mt-1">7</h3>
                <p className="text-blue-600 text-sm mt-1">2 due today</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TestTube className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Completed Today</p>
                <h3 className="text-3xl font-bold mt-1">12</h3>
                <p className="text-green-600 text-sm mt-1">+3 from yesterday</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Patients</p>
                <h3 className="text-3xl font-bold mt-1">342</h3>
                <p className="text-indigo-600 text-sm mt-1">+8 this week</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Status */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Lab Equipment Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Beaker className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Hematology Analyzer</p>
                    <p className="text-xs text-gray-500">Model XN-1000</p>
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <Progress value={85} className="h-2" />
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Usage</span>
                <span className="font-medium">85%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <TestTube className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Chemistry Analyzer</p>
                    <p className="text-xs text-gray-500">Model AU680</p>
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <Progress value={62} className="h-2" />
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Usage</span>
                <span className="font-medium">62%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                    <ActivitySquare className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">PCR Machine</p>
                    <p className="text-xs text-gray-500">Model RT-9600</p>
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              </div>
              <Progress value={92} className="h-2" />
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Usage</span>
                <span className="font-medium">92%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <LineChart className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Flow Cytometer</p>
                    <p className="text-xs text-gray-500">Model FC-500</p>
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
              </div>
              <Progress value={25} className="h-2" />
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Maintenance Required</span>
                <span className="font-medium">Error</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tests">
            <Beaker className="mr-2 h-4 w-4" /> 
            Test Management
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="mr-2 h-4 w-4" /> 
            Test Schedule
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <LineChart className="mr-2 h-4 w-4" /> 
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tests">
          <TestManagement />
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Test Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Schedule Module</h3>
                <p className="text-gray-500 max-w-md">
                  This feature is currently under development. The test scheduling calendar will be available soon.
                </p>
                <Button className="mt-6">
                  View Current Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Laboratory Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <LineChart className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Analytics Dashboard</h3>
                <p className="text-gray-500 max-w-md">
                  This feature is currently under development. The analytics dashboard will provide insights on lab performance and test metrics.
                </p>
                <Button className="mt-6">
                  View Sample Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LaboratoryDashboard;