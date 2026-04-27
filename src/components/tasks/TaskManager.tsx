import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

// Icons
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Check,
  X,
  Edit,
  Trash2,
  Search,
  Filter,
  AlarmClock,
  Bell,
  BellOff,
  BarChart,
  Tag,
  UserPlus,
  Loader2,
  CalendarClock,
  ArrowUpDown,
  LayoutGrid,
  List,
} from 'lucide-react';

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdBy: {
    id: number;
    name: string;
    role: string;
    avatar?: string;
  };
  assignedTo: {
    id: number;
    name: string;
    role: string;
    avatar?: string;
  };
  dueDate: Date;
  createdAt: Date;
  completedAt?: Date;
  reminders?: string[];
  category?: string;
  tags?: string[];
  related?: {
    type: 'prescription' | 'appointment' | 'medication' | 'test';
    id: string;
    name: string;
  };
}

interface TaskManagerProps {
  userId?: number;
  userRole?: string;
  viewMode?: 'all' | 'assigned' | 'created';
  initialFilter?: Partial<{
    status: Task['status'][];
    priority: Task['priority'][];
    category: string[];
    assignedToId: number[];
  }>;
  onTaskUpdate?: (task: Task) => void;
}

// Helper functions
const timeAgo = (date: Date) => {
  return formatDistanceToNow(date, { addSuffix: true });
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'doctor':
      return 'bg-blue-500';
    case 'pharmacy':
    case 'chemist':
      return 'bg-green-500';
    case 'admin':
      return 'bg-purple-500';
    case 'nurse':
      return 'bg-pink-500';
    case 'patient':
    default:
      return 'bg-orange-500';
  }
};

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-amber-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const TaskManager: React.FC<TaskManagerProps> = ({
  userId,
  userRole,
  viewMode = 'all',
  initialFilter,
  onTaskUpdate,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for task creation and editing
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    assignedToId: null as number | null,
    dueDate: '',
    category: '',
    tags: [] as string[],
  });
  
  // State for task filtering and view
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Task['status'][]>(
    initialFilter?.status || ['pending', 'in-progress']
  );
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'][]>(
    initialFilter?.priority || ['low', 'medium', 'high']
  );
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');
  
  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEditTask, setCurrentEditTask] = useState<Task | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  // Mock data for tasks
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Take morning medication',
      description: 'Take 1 tablet of Lisinopril 20mg with water',
      status: 'pending',
      priority: 'high',
      createdBy: {
        id: 2,
        name: 'Dr. Sarah Johnson',
        role: 'doctor',
      },
      assignedTo: {
        id: 1,
        name: 'John Smith',
        role: 'patient',
      },
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      reminders: ['8:00 AM'],
      category: 'Medication',
      related: {
        type: 'medication',
        id: 'med-123',
        name: 'Lisinopril 20mg',
      },
    },
    {
      id: '2',
      title: 'Blood pressure reading',
      description: 'Record blood pressure and note any symptoms',
      status: 'in-progress',
      priority: 'medium',
      createdBy: {
        id: 2,
        name: 'Dr. Sarah Johnson',
        role: 'doctor',
      },
      assignedTo: {
        id: 1,
        name: 'John Smith',
        role: 'patient',
      },
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      reminders: ['9:00 AM', '9:00 PM'],
      category: 'Test',
    },
    {
      id: '3',
      title: 'Prepare medication for patient #12345',
      description: 'Amoxicillin 500mg - 21 tablets',
      status: 'completed',
      priority: 'high',
      createdBy: {
        id: 2,
        name: 'Dr. Sarah Johnson',
        role: 'doctor',
      },
      assignedTo: {
        id: 3,
        name: 'City Pharmacy',
        role: 'pharmacy',
      },
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      category: 'Prescription',
      related: {
        type: 'prescription',
        id: 'rx-456',
        name: 'Amoxicillin Prescription',
      },
    },
    {
      id: '4',
      title: 'Follow-up appointment',
      description: 'Video consultation to discuss test results',
      status: 'pending',
      priority: 'medium',
      createdBy: {
        id: 2,
        name: 'Dr. Sarah Johnson',
        role: 'doctor',
      },
      assignedTo: {
        id: 1,
        name: 'John Smith',
        role: 'patient',
      },
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      category: 'Appointment',
      related: {
        type: 'appointment',
        id: 'apt-789',
        name: 'Follow-up Video Consultation',
      },
      tags: ['important', 'follow-up'],
    },
    {
      id: '5',
      title: 'Submit blood test results',
      description: 'Upload complete blood count results to patient portal',
      status: 'cancelled',
      priority: 'low',
      createdBy: {
        id: 2,
        name: 'Dr. Sarah Johnson',
        role: 'doctor',
      },
      assignedTo: {
        id: 4,
        name: 'City Labs',
        role: 'laboratory',
      },
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      category: 'Test',
      related: {
        type: 'test',
        id: 'test-101',
        name: 'Complete Blood Count',
      },
    },
  ];

  // Helper functions
  const filteredTasks = mockTasks
    .filter(task => {
      // Apply user role filter
      if (viewMode === 'assigned' && task.assignedTo.id !== (userId || user?.id)) {
        return false;
      }
      
      if (viewMode === 'created' && task.createdBy.id !== (userId || user?.id)) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter.length > 0 && !statusFilter.includes(task.status)) {
        return false;
      }
      
      // Apply priority filter
      if (priorityFilter.length > 0 && !priorityFilter.includes(task.priority)) {
        return false;
      }
      
      // Apply search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          task.title.toLowerCase().includes(searchLower) ||
          (task.description || '').toLowerCase().includes(searchLower) ||
          task.assignedTo.name.toLowerCase().includes(searchLower) ||
          task.createdBy.name.toLowerCase().includes(searchLower) ||
          (task.category || '').toLowerCase().includes(searchLower) ||
          (task.tags || []).some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return sortOrder === 'asc' 
          ? a.dueDate.getTime() - b.dueDate.getTime() 
          : b.dueDate.getTime() - a.dueDate.getTime();
      }
      
      if (sortBy === 'priority') {
        const priorityValue = { high: 3, medium: 2, low: 1 };
        return sortOrder === 'asc'
          ? priorityValue[a.priority] - priorityValue[b.priority]
          : priorityValue[b.priority] - priorityValue[a.priority];
      }
      
      return sortOrder === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime();
    });
  
  // Function to handle task creation
  const handleCreateTask = () => {
    // Validation
    if (!newTask.title || !newTask.dueDate || !newTask.assignedToId) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Task created",
      description: `Task "${newTask.title}" has been assigned successfully.`,
    });
    
    // Reset form
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assignedToId: null,
      dueDate: '',
      category: '',
      tags: [],
    });
    
    setIsCreateDialogOpen(false);
  };
  
  // Function to handle task edit
  const handleEditTask = () => {
    if (!currentEditTask) return;
    
    toast({
      title: "Task updated",
      description: `Task "${currentEditTask.title}" has been updated.`,
    });
    
    setIsEditDialogOpen(false);
    setCurrentEditTask(null);
  };
  
  // Function to handle task deletion
  const handleDeleteTask = () => {
    if (!taskToDelete) return;
    
    toast({
      title: "Task deleted",
      description: "The task has been permanently deleted.",
    });
    
    setIsDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };
  
  // Function to handle task status update
  const handleStatusUpdate = (taskId: string, newStatus: Task['status']) => {
    toast({
      title: "Task status updated",
      description: `Task status changed to ${newStatus}.`,
    });
    
    // In a real app, this would update the task in the database
  };

  return (
    <div className="flex flex-col h-full">
      {/* Task Manager Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Task Manager</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as any)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="p-2">
                <h4 className="mb-2 font-medium">Status</h4>
                <div className="space-y-2">
                  {(['pending', 'in-progress', 'completed', 'cancelled'] as const).map((status) => (
                    <div key={status} className="flex items-center">
                      <Checkbox 
                        id={`status-${status}`} 
                        checked={statusFilter.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setStatusFilter(prev => [...prev, status]);
                          } else {
                            setStatusFilter(prev => prev.filter(s => s !== status));
                          }
                        }}
                      />
                      <label 
                        htmlFor={`status-${status}`} 
                        className="ml-2 text-sm font-medium capitalize"
                      >
                        {status.replace('-', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-2" />
                
                <h4 className="mb-2 font-medium">Priority</h4>
                <div className="space-y-2">
                  {(['high', 'medium', 'low'] as const).map((priority) => (
                    <div key={priority} className="flex items-center">
                      <Checkbox 
                        id={`priority-${priority}`} 
                        checked={priorityFilter.includes(priority)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPriorityFilter(prev => [...prev, priority]);
                          } else {
                            setPriorityFilter(prev => prev.filter(p => p !== priority));
                          }
                        }}
                      />
                      <label 
                        htmlFor={`priority-${priority}`} 
                        className="ml-2 text-sm font-medium capitalize"
                      >
                        {priority}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setViewLayout(prev => prev === 'list' ? 'grid' : 'list')}
          >
            {viewLayout === 'list' ? (
              <LayoutGrid className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Task Categories/Tabs */}
      <Tabs defaultValue="all" className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="today">Due Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground max-w-sm">
            {searchTerm 
              ? "No tasks match your search criteria. Try adjusting your filters."
              : "You don't have any tasks that match the current filter. Create a new task to get started."}
          </p>
          <Button 
            className="mt-4"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      ) : (
        <div className={viewLayout === 'list' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
          {filteredTasks.map((task) => (
            <Card key={task.id} className={`${getStatusColor(task.status)} border`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{task.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-white/50">
                        {task.category || "General"}
                      </Badge>
                      <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                      {task.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-white/50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setCurrentEditTask(task);
                        setIsEditDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Task
                      </DropdownMenuItem>
                      
                      {task.status !== 'completed' && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate(task.id, 'completed')}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                      
                      {task.status !== 'in-progress' && task.status !== 'completed' && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate(task.id, 'in-progress')}>
                          <Clock className="h-4 w-4 mr-2" />
                          Mark as In Progress
                        </DropdownMenuItem>
                      )}
                      
                      {task.status !== 'cancelled' && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate(task.id, 'cancelled')}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Task
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem onClick={() => {
                        setTaskToDelete(task.id);
                        setIsDeleteConfirmOpen(true);
                      }} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                {task.description && (
                  <p className="text-sm mb-3">{task.description}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Due: {task.dueDate.toLocaleString()}</span>
                  </div>
                  
                  {task.reminders && task.reminders.length > 0 && (
                    <div className="flex items-center">
                      <AlarmClock className="h-4 w-4 mr-2" />
                      <span>Reminders: {task.reminders.join(', ')}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs">
                      <span className="mr-1">From:</span>
                      <Avatar className="h-4 w-4 mr-1">
                        <AvatarFallback className={getRoleColor(task.createdBy.role)}>
                          {getInitials(task.createdBy.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{task.createdBy.name}</span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <span className="mr-1">To:</span>
                      <Avatar className="h-4 w-4 mr-1">
                        <AvatarFallback className={getRoleColor(task.assignedTo.role)}>
                          {getInitials(task.assignedTo.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{task.assignedTo.name}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0 flex justify-between">
                <span className="text-xs text-muted-foreground">
                  Created {timeAgo(task.createdAt)}
                </span>
                {task.completedAt && (
                  <span className="text-xs text-green-700">
                    Completed {timeAgo(task.completedAt)}
                  </span>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Create and assign a task to a user. Tasks help track and manage work items.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Title</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="datetime-local"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign To</label>
              <Select
                value={newTask.assignedToId?.toString() || ''}
                onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedToId: Number(value) || null }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">John Smith (Patient)</SelectItem>
                  <SelectItem value="2">Dr. Sarah Johnson (Doctor)</SelectItem>
                  <SelectItem value="3">City Pharmacy (Pharmacy)</SelectItem>
                  <SelectItem value="4">City Labs (Laboratory)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={newTask.category}
                onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medication">Medication</SelectItem>
                  <SelectItem value="Appointment">Appointment</SelectItem>
                  <SelectItem value="Test">Test</SelectItem>
                  <SelectItem value="Prescription">Prescription</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          
          {currentEditTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title</label>
                <Input
                  value={currentEditTask.title}
                  onChange={(e) => setCurrentEditTask(prev => ({ ...prev!, title: e.target.value }))}
                  placeholder="Enter task title"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={currentEditTask.description || ''}
                  onChange={(e) => setCurrentEditTask(prev => ({ ...prev!, description: e.target.value }))}
                  placeholder="Enter task description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="datetime-local"
                    value={currentEditTask.dueDate.toISOString().slice(0, 16)}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      setCurrentEditTask(prev => ({ ...prev!, dueDate: newDate }));
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={currentEditTask.priority}
                    onValueChange={(value) => setCurrentEditTask(prev => ({ ...prev!, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={currentEditTask.status}
                  onValueChange={(value) => setCurrentEditTask(prev => ({ ...prev!, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManager;