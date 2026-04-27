import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Clock, AlertTriangle, CheckCircle, User, Pill, Eye, Calendar, Download, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define types
interface DrugInteraction {
  id: number;
  drug1: string;
  drug2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

interface CommonSideEffect {
  name: string;
  frequency: number; // percentage
  medications: string[];
}

interface PrescriptionStat {
  name: string;
  value: number;
}

interface MedicationTrend {
  date: string;
  prescriptions: number;
}

interface PrescriptionsByCategory {
  name: string;
  value: number;
  color: string;
}

// Sample data
const drugInteractions: DrugInteraction[] = [
  {
    id: 1,
    drug1: 'Amlodipine',
    drug2: 'Atorvastatin',
    severity: 'mild',
    description: 'May increase the blood levels of atorvastatin. Monitor for muscle pain or weakness.'
  },
  {
    id: 2,
    drug1: 'Metformin',
    drug2: 'Furosemide',
    severity: 'moderate',
    description: 'Furosemide may reduce the efficacy of metformin. Blood glucose monitoring advised.'
  },
  {
    id: 3,
    drug1: 'Lisinopril',
    drug2: 'Spironolactone',
    severity: 'severe',
    description: 'May cause hyperkalemia (high potassium). Regular potassium monitoring required.'
  },
  {
    id: 4,
    drug1: 'Levothyroxine',
    drug2: 'Calcium supplements',
    severity: 'moderate',
    description: 'Calcium may reduce absorption of levothyroxine. Take at least 4 hours apart.'
  }
];

const commonSideEffects: CommonSideEffect[] = [
  {
    name: 'Headache',
    frequency: 23,
    medications: ['Amlodipine', 'Lisinopril', 'Metoprolol']
  },
  {
    name: 'Dizziness',
    frequency: 18,
    medications: ['Losartan', 'Hydrochlorothiazide', 'Furosemide']
  },
  {
    name: 'Nausea',
    frequency: 15,
    medications: ['Metformin', 'Ferrous Sulfate', 'Atorvastatin']
  },
  {
    name: 'Dry Mouth',
    frequency: 12,
    medications: ['Amlodipine', 'Montelukast', 'Cetirizine']
  },
  {
    name: 'Constipation',
    frequency: 9,
    medications: ['Calcium supplements', 'Iron supplements', 'Opioid painkillers']
  }
];

const prescriptionStats: PrescriptionStat[] = [
  { name: 'Cardiac', value: 145 },
  { name: 'Diabetes', value: 120 },
  { name: 'Hypertension', value: 178 },
  { name: 'Thyroid', value: 89 },
  { name: 'Antibiotics', value: 67 },
  { name: 'Pain Relief', value: 98 },
  { name: 'Respiratory', value: 76 }
];

const medicationTrends: MedicationTrend[] = [
  { date: 'Apr 01', prescriptions: 45 },
  { date: 'Apr 05', prescriptions: 52 },
  { date: 'Apr 10', prescriptions: 49 },
  { date: 'Apr 15', prescriptions: 58 },
  { date: 'Apr 20', prescriptions: 63 },
  { date: 'Apr 25', prescriptions: 71 },
  { date: 'Apr 30', prescriptions: 68 },
  { date: 'May 05', prescriptions: 74 },
  { date: 'May 10', prescriptions: 79 }
];

const prescriptionsByCategory: PrescriptionsByCategory[] = [
  { name: 'Cardiac Medications', value: 30, color: '#10b981' },
  { name: 'Diabetes Treatment', value: 25, color: '#f59e0b' },
  { name: 'Hypertension Management', value: 35, color: '#3b82f6' },
  { name: 'Pain Relief', value: 10, color: '#ec4899' },
  { name: 'Other', value: 20, color: '#6b7280' }
];

const PrescriptionAnalysis = () => {
  // Get severity style
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'mild':
        return <Clock className="h-4 w-4" />;
      case 'moderate':
        return <AlertTriangle className="h-4 w-4" />;
      case 'severe':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Prescription Analysis</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            View History
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overview Stats */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Prescription Overview</CardTitle>
            <CardDescription>
              Summary of recent prescription activities and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Prescriptions</p>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-green-600 text-sm">+12% from last month</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Pill className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Medications</p>
                  <p className="text-2xl font-bold">328</p>
                  <p className="text-green-600 text-sm">+5 new this week</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Pill className="h-6 w-6 text-green-600" />
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Patients</p>
                  <p className="text-2xl font-bold">682</p>
                  <p className="text-green-600 text-sm">+8% from last month</p>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Drug Interactions</p>
                  <p className="text-2xl font-bold">37</p>
                  <p className="text-red-600 text-sm">5 severe</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="interactions" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
          <TabsTrigger value="trends">Prescription Trends</TabsTrigger>
          <TabsTrigger value="categories">Medication Categories</TabsTrigger>
          <TabsTrigger value="sideEffects">Common Side Effects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="interactions">
          <Card>
            <CardHeader>
              <CardTitle>Potential Drug Interactions</CardTitle>
              <CardDescription>
                Identified potential interactions between prescribed medications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drugInteractions.map(interaction => (
                  <div 
                    key={interaction.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityStyle(interaction.severity)}>
                            <span className="flex items-center gap-1">
                              {getSeverityIcon(interaction.severity)}
                              <span>
                                {interaction.severity.charAt(0).toUpperCase() + interaction.severity.slice(1)}
                              </span>
                            </span>
                          </Badge>
                          <h3 className="font-medium text-lg">
                            {interaction.drug1} + {interaction.drug2}
                          </h3>
                        </div>
                        
                        <p className="mt-2 text-gray-600">
                          {interaction.description}
                        </p>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Trends</CardTitle>
              <CardDescription>
                Number of prescriptions processed over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={medicationTrends}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="prescriptions"
                    stroke="#10847e"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prescriptions by Category</CardTitle>
                <CardDescription>
                  Distribution of prescriptions across medication categories
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prescriptionsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {prescriptionsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Medication by Type</CardTitle>
                <CardDescription>
                  Number of prescriptions by medication type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={prescriptionStats}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 70,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Prescriptions" fill="#10847e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sideEffects">
          <Card>
            <CardHeader>
              <CardTitle>Common Side Effects</CardTitle>
              <CardDescription>
                Frequently reported side effects from prescribed medications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="space-y-4">
                  {commonSideEffects.map((effect, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{effect.name}</h3>
                          <p className="text-gray-600 mt-1">
                            Related medications: {effect.medications.join(', ')}
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center">
                          <div className="w-full md:w-48 bg-gray-200 rounded-full h-4 mr-4">
                            <div 
                              className={cn(
                                "h-4 rounded-full",
                                effect.frequency > 20 ? "bg-red-500" : 
                                effect.frequency > 15 ? "bg-orange-500" : 
                                effect.frequency > 10 ? "bg-yellow-500" : 
                                "bg-green-500"
                              )}
                              style={{ width: `${effect.frequency}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {effect.frequency}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button>
          View Full Analysis Report
        </Button>
      </div>
    </div>
  );
};

export default PrescriptionAnalysis;