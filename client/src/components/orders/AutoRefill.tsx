import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, Repeat, Check, Clock, X, AlertCircle, RefreshCw, Pill, Info, Plus 
} from 'lucide-react';

// Types
interface MedicationRefill {
  id: number;
  medicationName: string;
  dosage: string;
  orderDate: string;
  nextRefillDate: string;
  frequency: 'Monthly' | 'Bi-weekly' | 'Weekly';
  status: 'active' | 'paused' | 'cancelled';
  lastRefilled?: string;
  autoRefill: boolean;
}

// Sample data
const activeRefills: MedicationRefill[] = [
  {
    id: 101,
    medicationName: 'Lisinopril',
    dosage: '10mg',
    orderDate: '2025-03-15',
    nextRefillDate: '2025-04-15',
    frequency: 'Monthly',
    status: 'active',
    lastRefilled: '2025-03-15',
    autoRefill: true
  },
  {
    id: 102,
    medicationName: 'Metformin',
    dosage: '500mg',
    orderDate: '2025-03-15',
    nextRefillDate: '2025-04-15',
    frequency: 'Monthly',
    status: 'active',
    lastRefilled: '2025-03-15',
    autoRefill: true
  },
  {
    id: 103,
    medicationName: 'Glucose Test Strips',
    dosage: 'Pack of 50',
    orderDate: '2025-01-10',
    nextRefillDate: '2025-04-10',
    frequency: 'Monthly',
    status: 'active',
    lastRefilled: '2025-03-10',
    autoRefill: true
  },
  {
    id: 104,
    medicationName: 'Lancets',
    dosage: 'Pack of 100',
    orderDate: '2025-01-10',
    nextRefillDate: '2025-05-10',
    frequency: 'Monthly',
    status: 'paused',
    lastRefilled: '2025-01-10',
    autoRefill: false
  }
];

// Helper components
const RefillStatusBadge = ({ status }: { status: MedicationRefill['status'] }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800 border-green-200', icon: <Check className="h-3 w-3 mr-1" /> },
    paused: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock className="h-3 w-3 mr-1" /> },
    cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: <X className="h-3 w-3 mr-1" /> }
  };
  
  return (
    <Badge className={statusConfig[status].color}>
      {statusConfig[status].icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Main component
const AutoRefill = () => {
  const [selectedRefill, setSelectedRefill] = useState<MedicationRefill | null>(null);
  const [refillDialogOpen, setRefillDialogOpen] = useState(false);
  const [newRefillDialogOpen, setNewRefillDialogOpen] = useState(false);
  const [refillFrequency, setRefillFrequency] = useState<MedicationRefill['frequency']>('Monthly');
  const [autoRefill, setAutoRefill] = useState(true);
  
  const { toast } = useToast();
  
  const handleManageRefill = (refill: MedicationRefill) => {
    setSelectedRefill(refill);
    setRefillFrequency(refill.frequency);
    setAutoRefill(refill.autoRefill);
    setRefillDialogOpen(true);
  };
  
  const handleUpdateRefill = () => {
    if (selectedRefill) {
      // In a real app, this would update the refill in the database
      toast({
        title: "Refill settings updated",
        description: `Your refill settings for ${selectedRefill.medicationName} have been updated.`,
      });
      
      setRefillDialogOpen(false);
    }
  };
  
  const handleToggleRefillStatus = (refill: MedicationRefill) => {
    const newStatus = refill.status === 'active' ? 'paused' : 'active';
    
    // In a real app, this would update the status in the database
    toast({
      title: newStatus === 'active' ? "Refill activated" : "Refill paused",
      description: `Auto-refill for ${refill.medicationName} has been ${newStatus}.`,
    });
  };
  
  const handleToggleAutoRefill = (refillId: number, newStatus: boolean) => {
    // In a real app, this would update the auto-refill status in the database
    toast({
      title: newStatus ? "Auto-refill activated" : "Auto-refill deactivated",
      description: `Auto-refill has been ${newStatus ? 'activated' : 'deactivated'} for this medication.`,
    });
  };
  
  const handleRefillNow = (refill: MedicationRefill) => {
    // In a real app, this would create a new order for the refill
    toast({
      title: "Refill order placed",
      description: `Your refill order for ${refill.medicationName} has been placed.`,
    });
  };

  const handleCreateNewRefill = () => {
    // In a real app, this would create a new refill in the database
    toast({
      title: "New refill created",
      description: "Your new automatic refill has been set up successfully.",
    });
    setNewRefillDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automatic Refills</h2>
          <p className="text-gray-500">Manage your recurring medication refills</p>
        </div>
        
        <Button onClick={() => setNewRefillDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Refill
        </Button>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">How Auto-Refill Works</h3>
            <p className="text-sm text-blue-600">
              With auto-refill enabled, we'll automatically process your refill before you run out 
              and deliver it to your door. You'll receive a notification before each refill is processed.
            </p>
          </div>
        </div>
      </div>
      
      {/* Refill List */}
      <div className="space-y-4">
        {activeRefills.length > 0 ? (
          activeRefills.map((refill) => (
            <Card key={refill.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <div className="flex items-center">
                      <CardTitle className="text-lg">{refill.medicationName}</CardTitle>
                      <RefillStatusBadge status={refill.status} className="ml-2" />
                    </div>
                    <CardDescription>
                      {refill.dosage} | {refill.frequency} Refill
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center mt-2 sm:mt-0 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRefillNow(refill)}
                      disabled={refill.status !== 'active'}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refill Now
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleManageRefill(refill)}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Last Refilled</h4>
                      <p className="text-sm text-gray-600">
                        {refill.lastRefilled ? new Date(refill.lastRefilled).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Next Refill Date</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(refill.nextRefillDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Auto-Refill</h4>
                      <div className="flex items-center">
                        <Switch 
                          checked={refill.autoRefill} 
                          onCheckedChange={(checked) => handleToggleAutoRefill(refill.id, checked)}
                          disabled={refill.status !== 'active'}
                          id={`auto-refill-${refill.id}`}
                        />
                        <Label 
                          htmlFor={`auto-refill-${refill.id}`}
                          className="ml-2 text-sm text-gray-600"
                        >
                          {refill.autoRefill ? 'Enabled' : 'Disabled'}
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  {refill.status === 'active' && refill.autoRefill && (
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="font-medium text-green-800">Auto-Refill Active</p>
                          <p className="text-sm text-green-600">
                            Your next refill will be automatically processed on {new Date(refill.nextRefillDate).toLocaleDateString()}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {refill.status === 'paused' && (
                    <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-amber-600 mr-2" />
                        <div>
                          <p className="font-medium text-amber-800">Refill Paused</p>
                          <p className="text-sm text-amber-600">
                            Your automatic refills for this medication are currently paused.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {refill.status === 'cancelled' && (
                    <div className="bg-red-50 p-3 rounded-md border border-red-200">
                      <div className="flex items-center">
                        <X className="h-5 w-5 text-red-600 mr-2" />
                        <div>
                          <p className="font-medium text-red-800">Refill Cancelled</p>
                          <p className="text-sm text-red-600">
                            This refill has been cancelled. Contact customer support if you need assistance.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50 flex justify-between border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Started on {new Date(refill.orderDate).toLocaleDateString()}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleRefillStatus(refill)}
                  className="text-sm"
                >
                  {refill.status === 'active' ? 'Pause Refill' : 'Resume Refill'}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-gray-100 p-4 mb-4">
                <Repeat className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">No active refills</h3>
              <p className="text-gray-500 text-center max-w-md mt-2">
                You don't have any medications set up for automatic refills. 
                Set up auto-refill to ensure you never run out of your essential medications.
              </p>
              <Button 
                className="mt-4"
                onClick={() => setNewRefillDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Set Up Auto-Refill
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Edit Refill Dialog */}
      {selectedRefill && (
        <Dialog open={refillDialogOpen} onOpenChange={setRefillDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Manage Medication Refill</DialogTitle>
              <DialogDescription>
                {selectedRefill.medicationName} {selectedRefill.dosage}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refill">Auto-Refill</Label>
                <Switch 
                  id="auto-refill" 
                  checked={autoRefill} 
                  onCheckedChange={setAutoRefill}
                  disabled={selectedRefill.status !== 'active'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="refill-frequency">Refill Frequency</Label>
                <Select 
                  value={refillFrequency} 
                  onValueChange={(value) => setRefillFrequency(value as MedicationRefill['frequency'])}
                  disabled={selectedRefill.status !== 'active'}
                >
                  <SelectTrigger id="refill-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="next-refill">Next Refill Date</Label>
                <Input 
                  id="next-refill" 
                  type="date" 
                  value={selectedRefill ? new Date(selectedRefill.nextRefillDate).toISOString().split('T')[0] : ''}
                  disabled
                />
                <p className="text-xs text-gray-500">
                  Next refill date is automatically calculated based on your last refill date and frequency.
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">How Auto-Refill Works</p>
                    <p className="text-xs text-blue-600">
                      With auto-refill enabled, we'll automatically process your refill before you run out and deliver it to your door. 
                      You'll receive a notification before each refill is processed.
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedRefill.status === 'paused' && (
                <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium">Refill Currently Paused</p>
                      <p className="text-xs text-amber-600">
                        Your automatic refills for this medication are currently paused. 
                        Resume refills to enable automatic processing.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleToggleRefillStatus(selectedRefill)}
                      >
                        Resume Refills
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setRefillDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleUpdateRefill}
                disabled={selectedRefill.status !== 'active'}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Refill Dialog */}
      <Dialog open={newRefillDialogOpen} onOpenChange={setNewRefillDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Set Up New Automatic Refill</DialogTitle>
            <DialogDescription>
              Create a new automatic refill for your medication
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="medication">Medication</Label>
              <Select defaultValue="">
                <SelectTrigger id="medication">
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lisinopril">Lisinopril 10mg</SelectItem>
                  <SelectItem value="metformin">Metformin 500mg</SelectItem>
                  <SelectItem value="atorvastatin">Atorvastatin 20mg</SelectItem>
                  <SelectItem value="levothyroxine">Levothyroxine 50mcg</SelectItem>
                  <SelectItem value="amlodipine">Amlodipine 5mg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Refill Frequency</Label>
              <Select defaultValue="Monthly">
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-auto-refill">Enable Auto-Refill</Label>
              <Switch id="enable-auto-refill" defaultChecked />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Choose from Your Medications</p>
                  <p className="text-xs text-blue-600">
                    You can only set up automatic refills for medications you've previously ordered. 
                    If you need a new medication, please place an order first.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRefillDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateNewRefill}>Set Up Refill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutoRefill;