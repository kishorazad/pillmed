import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MedicationTracker from '@/components/pharmacy/MedicationTracker';
import MedicationStatusIndicator from '@/components/pharmacy/MedicationStatusIndicator';
import PharmacyLoader from '@/components/pharmacy/PharmacyLoader';
import { ShoppingBag, Users, Pill, ClipboardList, Upload } from 'lucide-react';

const PharmacyDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingState('success');
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <PharmacyLoader size="lg" loadingState={loadingState} text="Loading pharmacy dashboard..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage prescriptions, track medications, and more</p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Button className="bg-[#10847e] hover:bg-[#10847e]/90">
            <Upload className="mr-2 h-4 w-4" /> Upload Prescription
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                <h3 className="text-3xl font-bold mt-1">213</h3>
                <p className="text-green-600 text-sm mt-1">+18% this month</p>
              </div>
              <div className="w-12 h-12 bg-[#10847e]/10 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-[#10847e]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Patients</p>
                <h3 className="text-3xl font-bold mt-1">84</h3>
                <p className="text-green-600 text-sm mt-1">+5% this month</p>
              </div>
              <div className="w-12 h-12 bg-[#10847e]/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-[#10847e]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Medications</p>
                <h3 className="text-3xl font-bold mt-1">127</h3>
                <p className="text-amber-600 text-sm mt-1">12 due today</p>
              </div>
              <div className="w-12 h-12 bg-[#10847e]/10 rounded-full flex items-center justify-center">
                <Pill className="h-6 w-6 text-[#10847e]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Prescriptions</p>
                <h3 className="text-3xl font-bold mt-1">8</h3>
                <p className="text-red-600 text-sm mt-1">3 urgent</p>
              </div>
              <div className="w-12 h-12 bg-[#10847e]/10 rounded-full flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-[#10847e]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status indicators showcase */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Medication Status Indicators</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-4">
            <MedicationStatusIndicator status="upcoming" />
            <MedicationStatusIndicator status="due" />
            <MedicationStatusIndicator status="completed" />
            <MedicationStatusIndicator status="missed" />
            <MedicationStatusIndicator status="paused" />
          </div>
          
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Size Variations</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <MedicationStatusIndicator status="due" size="sm" />
              <MedicationStatusIndicator status="due" size="md" />
              <MedicationStatusIndicator status="due" size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="medications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="medications">Medication Timeline</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <MedicationTracker />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">This tab is under development</p>
                <PharmacyLoader size="md" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patients">
          <Card>
            <CardHeader>
              <CardTitle>Patient Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">This tab is under development</p>
                <PharmacyLoader size="md" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">This tab is under development</p>
                <PharmacyLoader size="md" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PharmacyDashboard;