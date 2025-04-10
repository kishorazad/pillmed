import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, Calendar, CheckCircle, Clock, Heart, Medal, Star, 
  Zap, Shield, Gift, Activity, TrendingUp, Trophy, Share2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import SocialShare from './SocialShare';

// Types
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'medication' | 'activity' | 'checkup' | 'special';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress: number; // 0-100
  isCompleted: boolean;
  completedDate?: string;
  pointsAwarded: number;
  nextMilestone?: {
    description: string;
    pointsToAward: number;
  };
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  healthPoints: number;
  level: number;
  levelProgress: number;
  medicationAdherence: number;
  joinDate: string;
  achievementsCount: {
    total: number;
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  streak: {
    current: number;
    longest: number;
    lastActivity: string;
  };
}

// Sample data for user profile
const userProfileData: UserProfile = {
  id: 1001,
  name: "Priya Sharma",
  email: "priya.sharma@example.com",
  phone: "+91 9876543210",
  avatar: "https://randomuser.me/api/portraits/women/45.jpg",
  healthPoints: 1250,
  level: 6,
  levelProgress: 45,
  medicationAdherence: 87, // percentage
  joinDate: "2024-09-15",
  achievementsCount: {
    total: 24,
    bronze: 12,
    silver: 8,
    gold: 3,
    platinum: 1
  },
  streak: {
    current: 28,
    longest: 45,
    lastActivity: "2025-04-10"
  }
};

// Sample data for achievements
const achievementsData: Achievement[] = [
  // Medication achievements
  {
    id: "med-1",
    name: "First Dose",
    description: "Took your first medication on time",
    icon: <CheckCircle className="h-5 w-5" />,
    category: "medication",
    level: "bronze",
    progress: 100,
    isCompleted: true,
    completedDate: "2024-09-16",
    pointsAwarded: 10
  },
  {
    id: "med-2",
    name: "One-Week Streak",
    description: "Took all your medications on time for a week",
    icon: <Calendar className="h-5 w-5" />,
    category: "medication",
    level: "bronze",
    progress: 100,
    isCompleted: true,
    completedDate: "2024-09-23",
    pointsAwarded: 25
  },
  {
    id: "med-3",
    name: "One-Month Streak",
    description: "Took all your medications on time for a month",
    icon: <Calendar className="h-5 w-5" />,
    category: "medication",
    level: "silver",
    progress: 100,
    isCompleted: true,
    completedDate: "2024-10-15",
    pointsAwarded: 100
  },
  {
    id: "med-4",
    name: "90-Day Adherence",
    description: "Maintained medication adherence above 90% for 3 months",
    icon: <Star className="h-5 w-5" />,
    category: "medication",
    level: "gold",
    progress: 78,
    isCompleted: false,
    pointsAwarded: 250,
    nextMilestone: {
      description: "Keep your adherence above 90% for 12 more days",
      pointsToAward: 250
    }
  },
  {
    id: "med-5",
    name: "Perfect Timing",
    description: "Took medications within 15 minutes of scheduled time for a week",
    icon: <Clock className="h-5 w-5" />,
    category: "medication",
    level: "silver",
    progress: 100,
    isCompleted: true,
    completedDate: "2024-11-05",
    pointsAwarded: 75
  },
  {
    id: "med-6",
    name: "Full Course Completed",
    description: "Completed a full course of prescribed medication",
    icon: <CheckCircle className="h-5 w-5" />,
    category: "medication",
    level: "silver",
    progress: 100,
    isCompleted: true,
    completedDate: "2024-12-10",
    pointsAwarded: 150
  },
  {
    id: "med-7",
    name: "Medication Master",
    description: "Maintained 95%+ adherence for 6 consecutive months",
    icon: <Trophy className="h-5 w-5" />,
    category: "medication",
    level: "platinum",
    progress: 42,
    isCompleted: false,
    pointsAwarded: 500,
    nextMilestone: {
      description: "Maintain 95%+ adherence for 3 more months",
      pointsToAward: 500
    }
  },
  
  // Activity achievements
  {
    id: "act-1",
    name: "Step Starter",
    description: "Walked 5,000 steps in a day",
    icon: <Activity className="h-5 w-5" />,
    category: "activity",
    level: "bronze",
    progress: 100,
    isCompleted: true,
    completedDate: "2024-10-01",
    pointsAwarded: 25
  },
  {
    id: "act-2",
    name: "Active Week",
    description: "Completed recommended activity levels for a week",
    icon: <Zap className="h-5 w-5" />,
    category: "activity",
    level: "bronze",
    progress: 100,
    isCompleted: true,
    completedDate: "2024-10-08",
    pointsAwarded: 50
  },
  {
    id: "act-3",
    name: "Heart Health Hero",
    description: "Maintained healthy heart rate during exercises for a month",
    icon: <Heart className="h-5 w-5" />,
    category: "activity",
    level: "gold",
    progress: 63,
    isCompleted: false,
    pointsAwarded: 200,
    nextMilestone: {
      description: "Keep up your heart-healthy activities for 11 more days",
      pointsToAward: 200
    }
  },
  
  // Checkup achievements
  {
    id: "chk-1",
    name: "First Checkup",
    description: "Completed your first health checkup",
    icon: <Shield className="h-5 w-5" />,
    category: "checkup",
    level: "bronze",
    progress: 100,
    isCompleted: true,
    completedDate: "2024-09-30",
    pointsAwarded: 30
  },
  {
    id: "chk-2",
    name: "Regular Monitoring",
    description: "Recorded vital signs for 30 consecutive days",
    icon: <TrendingUp className="h-5 w-5" />,
    category: "checkup",
    level: "silver",
    progress: 100,
    isCompleted: true,
    completedDate: "2024-11-15",
    pointsAwarded: 120
  },
  
  // Special achievements
  {
    id: "spc-1",
    name: "Health Advocate",
    description: "Referred 3 friends who signed up",
    icon: <Gift className="h-5 w-5" />,
    category: "special",
    level: "gold",
    progress: 100,
    isCompleted: true,
    completedDate: "2025-01-20",
    pointsAwarded: 300
  },
  {
    id: "spc-2",
    name: "Community Guardian",
    description: "Participated in a health awareness campaign",
    icon: <Medal className="h-5 w-5" />,
    category: "special",
    level: "bronze",
    progress: 100,
    isCompleted: true,
    completedDate: "2025-02-05",
    pointsAwarded: 100
  }
];

// Helper components
const BadgeCard = ({ achievement, onView }: { achievement: Achievement, onView: (achievement: Achievement) => void }) => {
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
  
  const getIconBgStyles = (level: Achievement['level']) => {
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
    <Card className={`border-2 ${achievement.isCompleted ? '' : 'opacity-75'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${getIconBgStyles(achievement.level)}`}>
              {achievement.icon}
            </div>
            <div>
              <CardTitle className="text-base">{achievement.name}</CardTitle>
              <Badge className={getBadgeStyles(achievement.level)}>
                {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
              </Badge>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold text-green-600">+{achievement.pointsAwarded} pts</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
        {achievement.isCompleted ? (
          <div className="flex items-center text-sm text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Completed on {new Date(achievement.completedDate!).toLocaleDateString()}</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{achievement.progress}%</span>
            </div>
            <Progress value={achievement.progress} className="h-2" />
            {achievement.nextMilestone && (
              <p className="text-xs text-gray-500 mt-2">{achievement.nextMilestone.description}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="w-full" onClick={() => onView(achievement)}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

// Main component
const AchievementBadges = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState<boolean>(false);
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Filter achievements based on selected category
  const filteredAchievements = achievementsData.filter(achievement => 
    activeCategory === 'all' || achievement.category === activeCategory
  );
  
  // Calculate statistics
  const completedAchievements = achievementsData.filter(a => a.isCompleted).length;
  const completionPercentage = Math.round((completedAchievements / achievementsData.length) * 100);
  const inProgressAchievements = achievementsData.filter(a => !a.isCompleted).length;
  
  // Level up requirements calculation
  const nextLevelPoints = userProfileData.level * 300;
  const currentLevelPoints = userProfileData.level * 200;
  const pointsNeededForNextLevel = nextLevelPoints - currentLevelPoints + 
    Math.round((nextLevelPoints - currentLevelPoints) * (1 - userProfileData.levelProgress / 100));
  
  // Handle viewing achievement details
  const handleViewAchievement = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setViewDetailsOpen(true);
  };
  
  // Share achievement
  const handleShareAchievement = () => {
    if (selectedAchievement) {
      setShareDialogOpen(true);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health Achievements</h1>
        <p className="text-gray-500">Track your medication adherence and health activities</p>
      </div>
      
      {/* User Profile Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            <Avatar className="h-24 w-24 mx-auto md:mx-0">
              <AvatarImage src={userProfileData.avatar} alt={userProfileData.name} />
              <AvatarFallback>{userProfileData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-grow space-y-4 text-center md:text-left">
              <div>
                <h2 className="text-2xl font-bold">{userProfileData.name}</h2>
                <p className="text-gray-500">Member since {new Date(userProfileData.joinDate).toLocaleDateString()}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{userProfileData.healthPoints}</div>
                  <div className="text-sm text-green-800">Health Points</div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">Level {userProfileData.level}</div>
                  <div className="text-sm text-blue-800">{pointsNeededForNextLevel} pts to next</div>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{userProfileData.streak.current} days</div>
                  <div className="text-sm text-purple-800">Current Streak</div>
                </div>
                
                <div className="bg-amber-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{userProfileData.medicationAdherence}%</div>
                  <div className="text-sm text-amber-800">Medication Adherence</div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Level Progress</span>
                  <span>{userProfileData.levelProgress}%</span>
                </div>
                <Progress value={userProfileData.levelProgress} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Achievement Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Total Achievements</h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{completedAchievements}</span>
                  <span className="text-sm text-gray-500">/ {achievementsData.length}</span>
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <Progress value={completionPercentage} className="h-2 mt-4" />
            <div className="mt-1 text-xs text-gray-500 text-right">{completionPercentage}% Complete</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">In Progress</h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{inProgressAchievements}</span>
                  <span className="text-sm text-gray-500">achievements</span>
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 mt-4">
              <div className="h-2 bg-amber-400 rounded-l-full"></div>
              <div className="h-2 bg-gray-400"></div>
              <div className="h-2 bg-yellow-400"></div>
              <div className="h-2 bg-blue-400 rounded-r-full"></div>
            </div>
            <div className="mt-1 text-xs text-gray-500 flex justify-between">
              <div>{userProfileData.achievementsCount.bronze} Bronze</div>
              <div>{userProfileData.achievementsCount.silver} Silver</div>
              <div>{userProfileData.achievementsCount.gold} Gold</div>
              <div>{userProfileData.achievementsCount.platinum} Platinum</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Medication Adherence</h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{userProfileData.medicationAdherence}%</span>
                  <span className="text-sm text-gray-500">last 30 days</span>
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 bg-gray-100 h-10 rounded-md overflow-hidden relative">
              <div className="absolute inset-0 grid grid-cols-3 divide-x divide-dashed divide-gray-300 pointer-events-none">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <div 
                className={`h-full rounded-l-md ${
                  userProfileData.medicationAdherence >= 90 ? 'bg-green-400' :
                  userProfileData.medicationAdherence >= 75 ? 'bg-amber-400' :
                  'bg-red-400'
                }`}
                style={{ width: `${userProfileData.medicationAdherence}%` }}
              ></div>
              <div className="absolute inset-0 flex justify-between items-center px-3 text-xs text-gray-700 pointer-events-none">
                <div>Poor</div>
                <div>Good</div>
                <div>Excellent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Achievement List */}
      <Tabs defaultValue="all" onValueChange={setActiveCategory}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="medication">Medication</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="checkup">Checkups</TabsTrigger>
            <TabsTrigger value="special">Special</TabsTrigger>
          </TabsList>
          
          <div className="flex-shrink-0">
            <Badge className="ml-2 bg-green-100 text-green-800">
              {filteredAchievements.length} Achievements
            </Badge>
          </div>
        </div>
        
        <ScrollArea className="h-[500px] mt-4 pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <BadgeCard 
                key={achievement.id} 
                achievement={achievement} 
                onView={handleViewAchievement}
              />
            ))}
          </div>
        </ScrollArea>
      </Tabs>
      
      {/* Selected Achievement Details */}
      {selectedAchievement && viewDetailsOpen && (
        <Card className="mt-6 border-2 border-blue-200">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-3 ${
                  selectedAchievement.level === 'bronze' ? 'bg-amber-500 text-white' :
                  selectedAchievement.level === 'silver' ? 'bg-gray-400 text-white' :
                  selectedAchievement.level === 'gold' ? 'bg-yellow-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  {selectedAchievement.icon}
                </div>
                <div>
                  <CardTitle>{selectedAchievement.name}</CardTitle>
                  <Badge className={
                    selectedAchievement.level === 'bronze' ? 'bg-amber-100 text-amber-800' :
                    selectedAchievement.level === 'silver' ? 'bg-gray-100 text-gray-800' :
                    selectedAchievement.level === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }>
                    {selectedAchievement.level.charAt(0).toUpperCase() + selectedAchievement.level.slice(1)}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewDetailsOpen(false)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Description</h3>
              <p className="text-gray-600">{selectedAchievement.description}</p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-1">Category</h3>
                <p className="text-gray-600 capitalize">{selectedAchievement.category}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Points</h3>
                <p className="text-green-600 font-semibold">+{selectedAchievement.pointsAwarded} points</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-1">Status</h3>
              {selectedAchievement.isCompleted ? (
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-medium text-green-800">Achievement Completed!</p>
                      <p className="text-sm text-green-600">
                        You earned this achievement on {new Date(selectedAchievement.completedDate!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                    <div className="flex items-start">
                      <TrendingUp className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">In Progress</p>
                        <p className="text-sm text-blue-600">
                          {selectedAchievement.nextMilestone?.description || "Keep going to complete this achievement!"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{selectedAchievement.progress}%</span>
                    </div>
                    <Progress value={selectedAchievement.progress} className="h-2" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {selectedAchievement.isCompleted && (
              <Button variant="outline" onClick={handleShareAchievement}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Achievement
              </Button>
            )}
            {!selectedAchievement.isCompleted && (
              <div className="text-gray-500 text-sm">
                Complete this achievement to earn {selectedAchievement.pointsAwarded} health points!
              </div>
            )}
          </CardFooter>
        </Card>
      )}
      
      {/* Social Sharing Dialog */}
      {selectedAchievement && (
        <SocialShare 
          achievement={{
            id: selectedAchievement.id,
            name: selectedAchievement.name,
            description: selectedAchievement.description,
            level: selectedAchievement.level,
            isUnlocked: selectedAchievement.isCompleted,
            unlockedDate: selectedAchievement.completedDate,
            points: selectedAchievement.pointsAwarded
          }}
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default AchievementBadges;