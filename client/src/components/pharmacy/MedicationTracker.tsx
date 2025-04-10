import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Clock, Pill, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

// Define medication status types
type MedicationStatus = 'upcoming' | 'due' | 'completed' | 'missed';

// Define medication interface
interface Medication {
  id: number;
  name: string;
  dosage: string;
  time: string;
  status: MedicationStatus;
  instructions: string;
  daysCompleted: number;
  totalDays: number;
}

const getStatusColor = (status: MedicationStatus) => {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'due':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'missed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: MedicationStatus) => {
  switch (status) {
    case 'upcoming':
      return <Clock size={16} />;
    case 'due':
      return <Pill size={16} />;
    case 'completed':
      return <Check size={16} />;
    case 'missed':
      return <AlertTriangle size={16} />;
    default:
      return <Pill size={16} />;
  }
};

const MedicationTracker = () => {
  // Sample medication data
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: 1,
      name: 'Lisinopril',
      dosage: '10mg',
      time: '8:00 AM',
      status: 'completed',
      instructions: 'Take with food',
      daysCompleted: 7,
      totalDays: 10
    },
    {
      id: 2,
      name: 'Atorvastatin',
      dosage: '20mg',
      time: '9:00 PM',
      status: 'due',
      instructions: 'Take at night',
      daysCompleted: 3,
      totalDays: 30
    },
    {
      id: 3,
      name: 'Metformin',
      dosage: '500mg',
      time: '1:00 PM',
      status: 'upcoming',
      instructions: 'Take after lunch',
      daysCompleted: 14,
      totalDays: 30
    },
    {
      id: 4,
      name: 'Aspirin',
      dosage: '81mg',
      time: '8:30 AM',
      status: 'missed',
      instructions: 'Take with breakfast',
      daysCompleted: 5,
      totalDays: 10
    }
  ]);

  // Current day and active medication
  const [currentDay, setCurrentDay] = useState(1);
  const totalDays = 7;
  const [activeMedicationId, setActiveMedicationId] = useState<number | null>(1);

  const handleMarkAsComplete = (id: number) => {
    setMedications(prevMeds => 
      prevMeds.map(med => 
        med.id === id 
          ? { 
              ...med, 
              status: 'completed',
              daysCompleted: med.daysCompleted + 1
            } 
          : med
      )
    );
  };

  const handleMarkAsMissed = (id: number) => {
    setMedications(prevMeds => 
      prevMeds.map(med => 
        med.id === id 
          ? { ...med, status: 'missed' } 
          : med
      )
    );
  };

  // Function to get the active medication
  const getActiveMedication = () => {
    return medications.find(med => med.id === activeMedicationId) || null;
  };

  const activeMedication = getActiveMedication();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Medication Timeline</h2>
      
      {/* Day slider */}
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentDay(prev => Math.max(1, prev - 1))}
            disabled={currentDay <= 1}
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="text-center">
            <h3 className="font-medium">Day {currentDay} of {totalDays}</h3>
            <p className="text-sm text-gray-500">April {9 + currentDay}, 2025</p>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentDay(prev => Math.min(totalDays, prev + 1))}
            disabled={currentDay >= totalDays}
          >
            <ArrowRight size={16} />
          </Button>
        </div>
        <Slider 
          defaultValue={[currentDay]} 
          max={totalDays} 
          min={1}
          step={1}
          value={[currentDay]}
          onValueChange={(value) => setCurrentDay(value[0])}
          className="mt-2"
        />
      </div>
      
      {/* Medication list */}
      <div className="grid grid-cols-1 gap-4">
        {medications.map(medication => (
          <Card 
            key={medication.id} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              activeMedicationId === medication.id ? 'ring-2 ring-[#10847e]' : ''
            }`}
            onClick={() => setActiveMedicationId(medication.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getStatusColor(medication.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(medication.status)}
                        <span className="capitalize">{medication.status}</span>
                      </span>
                    </Badge>
                    <span className="text-sm text-gray-500">{medication.time}</span>
                  </div>
                  <h3 className="font-semibold text-lg">{medication.name} {medication.dosage}</h3>
                  <p className="text-sm text-gray-600">{medication.instructions}</p>
                </div>
                
                {/* Show action buttons for medications that can have their status changed */}
                {(medication.status === 'due' || medication.status === 'upcoming') && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-green-500 text-green-600 hover:bg-green-50" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsComplete(medication.id);
                      }}
                    >
                      <Check size={16} className="mr-1" /> Take
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsMissed(medication.id);
                      }}
                    >
                      <AlertTriangle size={16} className="mr-1" /> Skip
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress: {medication.daysCompleted}/{medication.totalDays} days</span>
                  <span>{Math.round((medication.daysCompleted / medication.totalDays) * 100)}%</span>
                </div>
                <Progress 
                  value={(medication.daysCompleted / medication.totalDays) * 100} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Detailed view of selected medication */}
      {activeMedication && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">
              Medication Details: {activeMedication.name}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-500 mb-1">Dosage</h4>
                <p className="font-semibold">{activeMedication.dosage}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-500 mb-1">Time</h4>
                <p className="font-semibold">{activeMedication.time}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-500 mb-1">Status</h4>
                <Badge className={getStatusColor(activeMedication.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(activeMedication.status)}
                    <span className="capitalize">{activeMedication.status}</span>
                  </span>
                </Badge>
              </div>
              <div>
                <h4 className="font-medium text-gray-500 mb-1">Treatment Duration</h4>
                <p className="font-semibold">{activeMedication.totalDays} days</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-500 mb-1">Instructions</h4>
                <p className="font-semibold">{activeMedication.instructions}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-500 mb-1">Progress</h4>
                <div className="flex flex-col">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Day {activeMedication.daysCompleted} of {activeMedication.totalDays}</span>
                    <span>{Math.round((activeMedication.daysCompleted / activeMedication.totalDays) * 100)}% complete</span>
                  </div>
                  <Progress 
                    value={(activeMedication.daysCompleted / activeMedication.totalDays) * 100} 
                    className="h-3" 
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              {activeMedication.status === 'due' && (
                <>
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => handleMarkAsMissed(activeMedication.id)}
                  >
                    <AlertTriangle size={16} className="mr-2" /> Mark as Missed
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleMarkAsComplete(activeMedication.id)}
                  >
                    <Check size={16} className="mr-2" /> Mark as Taken
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicationTracker;