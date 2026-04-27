import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, Calendar, CheckCircle, Clock, Pill, Plus, AlertCircle, 
  AlarmClock, BarChart2, Heart, Award, Trophy, Star, Medal, 
  FolderCheck, ArrowUpCircle, Settings, AlertTriangle, Package,
  Repeat, Info, PlusCircle, BadgeCheck, Activity, X
} from 'lucide-react';

// Types
interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[];
  instructions: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  refillDate?: string;
  refillRemaining: number;
  adherenceRate: number;
  medType: 'pill' | 'liquid' | 'injection' | 'inhaler' | 'topical' | 'other';
  schedule: {
    time: string;
    taken: boolean;
    skipped: boolean;
    date: string;
    takenAt?: string;
  }[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  isUnlocked: boolean;
  unlockedDate?: string;
  icon: React.ReactNode;
  points: number;
}

// Sample medication data
const medicationsData: Medication[] = [
  {
    id: 1,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    timeOfDay: ['morning'],
    instructions: "Take with or without food",
    startDate: "2025-01-15",
    status: 'active',
    refillDate: "2025-05-15",
    refillRemaining: 15,
    adherenceRate: 96,
    medType: 'pill',
    schedule: [
      { time: "08:00", taken: true, skipped: false, date: "2025-04-07", takenAt: "08:13" },
      { time: "08:00", taken: true, skipped: false, date: "2025-04-08", takenAt: "08:05" },
      { time: "08:00", taken: true, skipped: false, date: "2025-04-09", takenAt: "07:55" },
      { time: "08:00", taken: true, skipped: false, date: "2025-04-10", takenAt: "08:10" }
    ]
  },
  {
    id: 2,
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    timeOfDay: ['morning', 'evening'],
    instructions: "Take with meals",
    startDate: "2025-02-01",
    status: 'active',
    refillDate: "2025-05-01",
    refillRemaining: 22,
    adherenceRate: 89,
    medType: 'pill',
    schedule: [
      { time: "08:00", taken: true, skipped: false, date: "2025-04-07", takenAt: "08:15" },
      { time: "19:00", taken: true, skipped: false, date: "2025-04-07", takenAt: "19:20" },
      { time: "08:00", taken: true, skipped: false, date: "2025-04-08", takenAt: "08:05" },
      { time: "19:00", taken: true, skipped: false, date: "2025-04-08", takenAt: "19:10" },
      { time: "08:00", taken: true, skipped: false, date: "2025-04-09", takenAt: "08:30" },
      { time: "19:00", taken: false, skipped: true, date: "2025-04-09" },
      { time: "08:00", taken: true, skipped: false, date: "2025-04-10", takenAt: "08:15" },
      { time: "19:00", taken: false, skipped: false, date: "2025-04-10" }
    ]
  },
  {
    id: 3,
    name: "Ventolin Inhaler",
    dosage: "2 puffs",
    frequency: "As needed",
    timeOfDay: ['morning', 'afternoon', 'evening', 'night'],
    instructions: "Use for shortness of breath",
    startDate: "2025-03-10",
    status: 'active',
    refillDate: "2025-06-10",
    refillRemaining: 60,
    adherenceRate: 100,
    medType: 'inhaler',
    schedule: []
  },
  {
    id: 4,
    name: "Amoxicillin",
    dosage: "500mg",
    frequency: "Three times daily",
    timeOfDay: ['morning', 'afternoon', 'evening'],
    instructions: "Take until completed, even if feeling better",
    startDate: "2025-03-25",
    endDate: "2025-04-05",
    status: 'completed',
    refillRemaining: 0,
    adherenceRate: 94,
    medType: 'pill',
    schedule: []
  }
];

// Sample achievement data
const medicationAchievementsData: Achievement[] = [
  {
    id: "med-1",
    name: "First Step",
    description: "Logged your first medication",
    level: 'bronze',
    isUnlocked: true,
    unlockedDate: "2025-01-15",
    icon: <CheckCircle />,
    points: 10
  },
  {
    id: "med-2",
    name: "Consistency Is Key",
    description: "Achieved a 7-day perfect adherence streak",
    level: 'bronze',
    isUnlocked: true,
    unlockedDate: "2025-01-22",
    icon: <Repeat />,
    points: 25
  },
  {
    id: "med-3",
    name: "On Schedule",
    description: "Took all medications within 10 minutes of scheduled time for a week",
    level: 'silver',
    isUnlocked: true,
    unlockedDate: "2025-02-05",
    icon: <Clock />,
    points: 50
  },
  {
    id: "med-4",
    name: "Perfect Month",
    description: "Achieved 100% adherence for a full month",
    level: 'gold',
    isUnlocked: false,
    icon: <Trophy />,
    points: 100
  },
  {
    id: "med-5",
    name: "Health Champion",
    description: "Maintained 95%+ adherence for 90 consecutive days",
    level: 'platinum',
    isUnlocked: false,
    icon: <Award />,
    points: 250
  }
];

// Helper components
const MedicationStatusBadge = ({ status }: { status: Medication['status'] }) => {
  const statusMap = {
    'active': { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
    'completed': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <FolderCheck className="h-3 w-3 mr-1" /> },
    'cancelled': { color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertCircle className="h-3 w-3 mr-1" /> }
  };
  
  return (
    <Badge className={statusMap[status].color}>
      {statusMap[status].icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const AdherenceIndicator = ({ rate }: { rate: number }) => {
  const getColor = () => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className="flex items-center">
      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
        <div 
          className={`${getColor()} h-2 rounded-full`} 
          style={{ width: `${rate}%` }}
        ></div>
      </div>
      <span className="text-sm font-medium">{rate}%</span>
    </div>
  );
};

const TodayMedicationCard = ({ 
  medication, 
  onTakeMedication 
}: { 
  medication: Medication, 
  onTakeMedication: (medId: number, scheduleIndex: number) => void 
}) => {
  // Get today's schedule
  const today = new Date().toISOString().split('T')[0];
  const todaySchedule = medication.schedule.filter(s => s.date === today);
  
  // Check if all doses for today are taken
  const allTaken = todaySchedule.length > 0 && todaySchedule.every(s => s.taken || s.skipped);
  
  // Get the next dose that hasn't been taken yet
  const nextDose = todaySchedule.find(s => !s.taken && !s.skipped);
  
  // Format time for display
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{medication.name}</CardTitle>
            <CardDescription>{medication.dosage} - {medication.frequency}</CardDescription>
          </div>
          <MedicationStatusBadge status={medication.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Pill className="h-6 w-6 text-blue-600" />
          </div>
          
          <div className="flex-grow">
            {medication.status === 'active' ? (
              allTaken ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-medium text-green-800">All doses taken today</p>
                      <p className="text-sm text-green-600">Great job staying on track!</p>
                    </div>
                  </div>
                </div>
              ) : nextDose ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium">Next dose at {formatTime(nextDose.time)}</p>
                      <p className="text-sm text-gray-500">{medication.instructions}</p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => onTakeMedication(
                        medication.id, 
                        medication.schedule.findIndex(s => s.date === today && s.time === nextDose.time)
                      )}
                    >
                      Take Now
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {todaySchedule.filter(s => s.taken).length} of {todaySchedule.length} doses taken today
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No doses scheduled for today</div>
              )
            ) : (
              <div className="text-gray-500">
                {medication.status === 'completed' ? 'This medication course has been completed' : 'This medication has been cancelled'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3 text-xs text-gray-500">
        <div className="flex justify-between w-full">
          <div>Started: {new Date(medication.startDate).toLocaleDateString()}</div>
          {medication.refillRemaining > 0 && (
            <div className="flex items-center">
              <Package className="h-3 w-3 mr-1" />
              <span>{medication.refillRemaining} days remaining</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

const AchievementBadge = ({ achievement }: { achievement: Achievement }) => {
  const getBadgeStyles = (level: Achievement['level']) => {
    switch(level) {
      case 'bronze':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'silver':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'platinum':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getIconStyles = (level: Achievement['level']) => {
    switch(level) {
      case 'bronze':
        return 'bg-amber-500 text-white';
      case 'silver':
        return 'bg-gray-400 text-white';
      case 'gold':
        return 'bg-yellow-500 text-white';
      case 'platinum':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`relative ${achievement.isUnlocked ? 'cursor-pointer' : 'opacity-40'}`}>
            <div className={`h-14 w-14 rounded-full flex items-center justify-center ${getIconStyles(achievement.level)}`}>
              <div className="h-7 w-7">{achievement.icon}</div>
            </div>
            {achievement.isUnlocked && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                <BadgeCheck className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px]">
          <div className="space-y-1">
            <div className="font-medium">{achievement.name}</div>
            <div className="text-xs text-gray-500">{achievement.description}</div>
            <Badge className={`${getBadgeStyles(achievement.level)}`}>
              {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
            </Badge>
            {achievement.isUnlocked ? (
              <div className="text-xs text-green-600">
                Unlocked on {new Date(achievement.unlockedDate!).toLocaleDateString()}
              </div>
            ) : (
              <div className="text-xs text-blue-600">
                +{achievement.points} points when unlocked
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Main Component
const MedicationTracking = () => {
  const [medications, setMedications] = useState<Medication[]>(medicationsData);
  const [achievements] = useState<Achievement[]>(medicationAchievementsData);
  const [activeTab, setActiveTab] = useState('today');
  const [newMedicationDialog, setNewMedicationDialog] = useState(false);
  
  const { toast } = useToast();
  
  // Calculate adherence statistics
  const calcOverallAdherence = () => {
    if (medications.length === 0) return 0;
    return Math.round(medications.reduce((sum, med) => sum + med.adherenceRate, 0) / medications.length);
  };
  
  const handleTakeMedication = (medId: number, scheduleIndex: number) => {
    const updatedMedications = [...medications];
    const medIndex = updatedMedications.findIndex(m => m.id === medId);
    
    if (medIndex !== -1 && scheduleIndex !== -1) {
      // Mark as taken
      updatedMedications[medIndex].schedule[scheduleIndex] = {
        ...updatedMedications[medIndex].schedule[scheduleIndex],
        taken: true,
        takenAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMedications(updatedMedications);
      
      toast({
        title: "Medication taken!",
        description: `You've marked ${updatedMedications[medIndex].name} as taken.`,
      });
      
      // Check if a new achievement was unlocked
      const adherenceRate = calcOverallAdherence();
      if (adherenceRate >= 95) {
        toast({
          title: "Achievement unlocked!",
          description: "You're maintaining excellent medication adherence!",
          action: (
            <Button size="sm" variant="outline">
              View Achievements
            </Button>
          ),
        });
      }
    }
  };
  
  const handleSkipMedication = (medId: number, scheduleIndex: number) => {
    const updatedMedications = [...medications];
    const medIndex = updatedMedications.findIndex(m => m.id === medId);
    
    if (medIndex !== -1 && scheduleIndex !== -1) {
      // Mark as skipped
      updatedMedications[medIndex].schedule[scheduleIndex] = {
        ...updatedMedications[medIndex].schedule[scheduleIndex],
        skipped: true
      };
      
      setMedications(updatedMedications);
      
      toast({
        title: "Medication skipped",
        description: `You've marked ${updatedMedications[medIndex].name} as skipped.`,
      });
    }
  };
  
  // Filter active medications
  const activeMedications = medications.filter(med => med.status === 'active');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medication Tracking</h1>
        <p className="text-gray-500">Track your medications and adherence achievements</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Adherence Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Overall Adherence</h3>
                <p className="text-2xl font-bold">{calcOverallAdherence()}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${
                    calcOverallAdherence() >= 90 ? 'bg-green-500' :
                    calcOverallAdherence() >= 75 ? 'bg-yellow-500' :
                    'bg-red-500'
                  } h-2 rounded-full`} 
                  style={{ width: `${calcOverallAdherence()}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Active Medications Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Active Medications</h3>
                <p className="text-2xl font-bold">{activeMedications.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Pill className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              {activeMedications.length > 0 ? (
                <div className="flex gap-1 flex-wrap">
                  {activeMedications.slice(0, 3).map((med, i) => (
                    <Badge key={i} variant="outline" className="bg-gray-50">{med.name}</Badge>
                  ))}
                  {activeMedications.length > 3 && (
                    <Badge variant="outline" className="bg-gray-50">+{activeMedications.length - 3} more</Badge>
                  )}
                </div>
              ) : (
                <p>No active medications</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Current Streak Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Streak</h3>
                <p className="text-2xl font-bold">28 days</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="bg-purple-50 text-purple-700 text-xs p-1.5 rounded-md">
                You're on your longest streak ever! Keep it up!
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Achievements Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Achievements</h3>
                <p className="text-2xl font-bold">{achievements.filter(a => a.isUnlocked).length}/{achievements.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-3">
              <Progress 
                value={(achievements.filter(a => a.isUnlocked).length / achievements.length) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Achievements Showcase */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-lg">Medication Achievements</h3>
            <p className="text-sm text-gray-600">Earn badges by maintaining good medication adherence</p>
          </div>
          <Button size="sm" variant="outline" className="gap-1">
            <Award className="h-4 w-4" />
            <span>View All</span>
          </Button>
        </div>
        
        <div className="flex space-x-6 overflow-x-auto p-2">
          {achievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="all">All Medications</TabsTrigger>
          </TabsList>
          
          <Button 
            size="sm" 
            onClick={() => setNewMedicationDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Medication
          </Button>
        </div>
        
        {/* Today Tab */}
        <TabsContent value="today" className="space-y-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Today's Medications</h3>
                <p className="text-sm text-blue-600">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
          
          {activeMedications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMedications.map((medication) => (
                <TodayMedicationCard 
                  key={medication.id} 
                  medication={medication} 
                  onTakeMedication={handleTakeMedication}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Active Medications</h3>
              <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                You don't have any active medications scheduled. Click "Add Medication" to start tracking.
              </p>
              <Button className="mt-4" onClick={() => setNewMedicationDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Medication
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4 mt-4">
          <div className="bg-green-50 p-4 rounded-md border border-green-100 mb-6">
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">Weekly Schedule</h3>
                <p className="text-sm text-green-600">
                  View and manage your medication schedule
                </p>
              </div>
            </div>
          </div>
          
          {/* Weekly Calendar (simplified version) */}
          <Card>
            <CardHeader>
              <CardTitle>Week of April 7 - April 13, 2025</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Monday</TableHead>
                      <TableHead>Tuesday</TableHead>
                      <TableHead>Wednesday</TableHead>
                      <TableHead>Thursday</TableHead>
                      <TableHead>Friday</TableHead>
                      <TableHead>Saturday</TableHead>
                      <TableHead>Sunday</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeMedications.map((medication) => (
                      <TableRow key={medication.id}>
                        <TableCell className="font-medium">
                          {medication.name}
                          <div className="text-xs text-gray-500">{medication.dosage}</div>
                        </TableCell>
                        {['2025-04-07', '2025-04-08', '2025-04-09', '2025-04-10', '2025-04-11', '2025-04-12', '2025-04-13'].map((date, index) => (
                          <TableCell key={index} className="text-center">
                            {medication.schedule.some(s => s.date === date) ? (
                              <div className="space-y-2">
                                {medication.schedule
                                  .filter(s => s.date === date)
                                  .map((schedule, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-1">
                                      <div className="text-xs">{schedule.time}</div>
                                      {schedule.taken ? (
                                        <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                      ) : schedule.skipped ? (
                                        <div className="h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center">
                                          <X className="h-4 w-4 text-gray-600" />
                                        </div>
                                      ) : (
                                        <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                                          <AlarmClock className="h-4 w-4 text-blue-600" />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="text-gray-300 text-sm">-</div>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <div className="bg-purple-50 p-4 rounded-md border border-purple-100 mb-6">
            <div className="flex items-start">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <BarChart2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-purple-800">Medication History</h3>
                <p className="text-sm text-purple-600">
                  Track your adherence and refills
                </p>
              </div>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Adherence History</CardTitle>
              <CardDescription>Past 30 days medication adherence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart2 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>Adherence chart visualization would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Recent medication events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Lisinopril 10mg taken</p>
                        <p className="text-sm text-gray-500">Taken at 8:10 AM</p>
                      </div>
                      <div className="text-sm text-gray-500">Today</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Metformin 500mg taken</p>
                        <p className="text-sm text-gray-500">Taken at 8:15 AM</p>
                      </div>
                      <div className="text-sm text-gray-500">Today</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <X className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Metformin 500mg missed</p>
                        <p className="text-sm text-gray-500">Evening dose skipped</p>
                      </div>
                      <div className="text-sm text-gray-500">Yesterday</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Lisinopril refill reminder</p>
                        <p className="text-sm text-gray-500">15 days remaining</p>
                      </div>
                      <div className="text-sm text-gray-500">Yesterday</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Achievement Unlocked: On Schedule</p>
                        <p className="text-sm text-gray-500">+50 Health Points</p>
                      </div>
                      <div className="text-sm text-gray-500">2 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* All Medications Tab */}
        <TabsContent value="all" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Medications</CardTitle>
              <CardDescription>Complete list of your medications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Adherence</TableHead>
                    <TableHead>Refill</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((medication) => (
                    <TableRow key={medication.id}>
                      <TableCell className="font-medium">{medication.name}</TableCell>
                      <TableCell>{medication.dosage}</TableCell>
                      <TableCell>{medication.frequency}</TableCell>
                      <TableCell>
                        <MedicationStatusBadge status={medication.status} />
                      </TableCell>
                      <TableCell>
                        <AdherenceIndicator rate={medication.adherenceRate} />
                      </TableCell>
                      <TableCell>
                        {medication.refillRemaining > 0 ? (
                          medication.refillRemaining <= 7 ? (
                            <div className="text-red-600">{medication.refillRemaining} days</div>
                          ) : (
                            <div>{medication.refillRemaining} days</div>
                          )
                        ) : (
                          <div className="text-gray-500">-</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add New Medication Dialog */}
      <Dialog open={newMedicationDialog} onOpenChange={setNewMedicationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
            <DialogDescription>
              Enter the details of your medication to start tracking
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="name">
                Medication Name
              </label>
              <Input id="name" placeholder="Enter medication name" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="dosage">
                  Dosage
                </label>
                <Input id="dosage" placeholder="e.g. 10mg" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="frequency">
                  Frequency
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once daily</SelectItem>
                    <SelectItem value="twice">Twice daily</SelectItem>
                    <SelectItem value="thrice">Three times daily</SelectItem>
                    <SelectItem value="as-needed">As needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Time of Day
              </label>
              <div className="flex flex-wrap gap-3 pt-1">
                {['Morning', 'Afternoon', 'Evening', 'Night'].map((time, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox id={`time-${i}`} />
                    <label htmlFor={`time-${i}`} className="text-sm">{time}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="instructions">
                Instructions
              </label>
              <Input id="instructions" placeholder="e.g. Take with food" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="start-date">
                  Start Date
                </label>
                <Input id="start-date" type="date" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="end-date">
                  End Date (Optional)
                </label>
                <Input id="end-date" type="date" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="type">
                Medication Type
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pill">Pill/Tablet</SelectItem>
                  <SelectItem value="liquid">Liquid</SelectItem>
                  <SelectItem value="injection">Injection</SelectItem>
                  <SelectItem value="inhaler">Inhaler</SelectItem>
                  <SelectItem value="topical">Topical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewMedicationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setNewMedicationDialog(false);
              toast({
                title: "Medication Added",
                description: "Your new medication has been added successfully.",
              });
            }}>
              Add Medication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicationTracking;