import { useState, useEffect, useRef } from 'react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// Icons
import {
  Send,
  MoreVertical,
  Phone,
  Video,
  Image,
  Paperclip,
  Smile,
  Mic,
  Clock,
  Check,
  CheckCheck,
  Calendar,
  Trash2,
  FileText,
  ExternalLink,
  Search,
  UserPlus,
  AlertTriangle,
  AlarmClock,
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  senderRole: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  attachments?: Array<{
    id: string;
    type: 'image' | 'document' | 'audio';
    url: string;
    name: string;
  }>;
}

interface Chat {
  id: string;
  participants: Array<{
    id: number;
    name: string;
    role: string;
    avatar?: string;
    status?: 'online' | 'offline' | 'busy';
  }>;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

interface ChatInterfaceProps {
  recipientId?: number;
  recipientRole?: string;
  chatType?: 'patient-doctor' | 'doctor-pharmacy' | 'patient-pharmacy' | 'general';
  initialMode?: 'chat' | 'tasks';
}

// Helper function to generate a time ago string
const timeAgo = (date: Date) => {
  return formatDistanceToNow(date, { addSuffix: true });
};

// Helper to get avatar initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Helper to determine avatar color based on role
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

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  recipientId,
  recipientRole,
  chatType = 'general',
  initialMode = 'chat'
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [mode, setMode] = useState<'chat' | 'tasks'>(initialMode);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Task management state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskAssignee, setTaskAssignee] = useState<number | null>(null);
  
  // Mock data for chats - will be replaced with real API calls
  const mockChats: Chat[] = [
    {
      id: '1',
      participants: [
        {
          id: 1,
          name: 'John Smith',
          role: 'patient',
          status: 'online'
        },
        {
          id: 2,
          name: 'Dr. Sarah Johnson',
          role: 'doctor',
          status: 'online'
        }
      ],
      lastMessage: 'How are you feeling today?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      unreadCount: 2
    },
    {
      id: '2',
      participants: [
        {
          id: 1,
          name: 'John Smith',
          role: 'patient',
          status: 'online'
        },
        {
          id: 3,
          name: 'City Pharmacy',
          role: 'pharmacy',
          status: 'online'
        }
      ],
      lastMessage: 'Your prescription is ready for pickup',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      unreadCount: 0
    },
    {
      id: '3',
      participants: [
        {
          id: 2,
          name: 'Dr. Sarah Johnson',
          role: 'doctor',
          status: 'busy'
        },
        {
          id: 3,
          name: 'City Pharmacy',
          role: 'pharmacy',
          status: 'online'
        }
      ],
      lastMessage: 'Please confirm the medication dosage',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 1
    }
  ];
  
  // Mock data for messages - will be replaced with real API calls
  const mockMessages: Record<string, Message[]> = {
    '1': [
      {
        id: '101',
        senderId: 2,
        senderName: 'Dr. Sarah Johnson',
        senderRole: 'doctor',
        content: 'Hello Mr. Smith, how are you feeling today?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: 'read'
      },
      {
        id: '102',
        senderId: 1,
        senderName: 'John Smith',
        senderRole: 'patient',
        content: 'Hi Doctor, I\'ve been experiencing some headaches since yesterday.',
        timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
        status: 'read'
      },
      {
        id: '103',
        senderId: 2,
        senderName: 'Dr. Sarah Johnson',
        senderRole: 'doctor',
        content: 'I see. Have you taken any medication for it?',
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
        status: 'read'
      },
      {
        id: '104',
        senderId: 1,
        senderName: 'John Smith',
        senderRole: 'patient',
        content: 'I took some over-the-counter painkillers but it only provided temporary relief.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        status: 'read'
      },
      {
        id: '105',
        senderId: 2,
        senderName: 'Dr. Sarah Johnson',
        senderRole: 'doctor',
        content: 'Let\'s schedule a video consultation to discuss this further. How does tomorrow at 10 AM sound?',
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        status: 'read'
      },
      {
        id: '106',
        senderId: 1,
        senderName: 'John Smith',
        senderRole: 'patient',
        content: 'That works for me. Thank you, Doctor.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        status: 'read'
      },
      {
        id: '107',
        senderId: 2,
        senderName: 'Dr. Sarah Johnson',
        senderRole: 'doctor',
        content: 'Great. I\'ll send you a notification. In the meantime, try to rest and stay hydrated. How are you feeling now?',
        timestamp: new Date(Date.now() - 1000 * 60 * 4), // 4 minutes ago
        status: 'delivered'
      }
    ],
    '2': [
      {
        id: '201',
        senderId: 3,
        senderName: 'City Pharmacy',
        senderRole: 'pharmacy',
        content: 'Hello Mr. Smith, your prescription for Amoxicillin is ready for pickup.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        status: 'read'
      },
      {
        id: '202',
        senderId: 1,
        senderName: 'John Smith',
        senderRole: 'patient',
        content: 'Thank you. What are your opening hours?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
        status: 'read'
      },
      {
        id: '203',
        senderId: 3,
        senderName: 'City Pharmacy',
        senderRole: 'pharmacy',
        content: 'We\'re open from 9 AM to 9 PM every day. Would you like us to deliver the medication instead?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        status: 'read'
      }
    ],
    '3': [
      {
        id: '301',
        senderId: 2,
        senderName: 'Dr. Sarah Johnson',
        senderRole: 'doctor',
        content: 'Hello City Pharmacy, I\'m sending a new prescription for patient John Smith (ID: 12345).',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        status: 'read',
        attachments: [
          {
            id: 'a1',
            type: 'document',
            url: '/prescriptions/12345.pdf',
            name: 'John_Smith_Prescription.pdf'
          }
        ]
      },
      {
        id: '302',
        senderId: 3,
        senderName: 'City Pharmacy',
        senderRole: 'pharmacy',
        content: 'Received, Dr. Johnson. I notice the dosage for lisinopril is 20mg, but the patient was previously on 10mg. Can you confirm this change?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5), // 2.5 hours ago
        status: 'read'
      },
      {
        id: '303',
        senderId: 2,
        senderName: 'Dr. Sarah Johnson',
        senderRole: 'doctor',
        content: 'Yes, I\'ve increased the dosage based on their latest blood pressure readings. Please proceed with 20mg.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        status: 'delivered'
      }
    ]
  };
  
  // Mock tasks data - will be replaced with API calls
  const mockTasks = [
    {
      id: '1',
      title: 'Take morning medication',
      description: 'Take 1 tablet of Lisinopril 20mg with water',
      assignedBy: { id: 2, name: 'Dr. Sarah Johnson', role: 'doctor' },
      assignedTo: { id: 1, name: 'John Smith', role: 'patient' },
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
      status: 'pending',
      priority: 'high',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
      reminders: ['8:00 AM']
    },
    {
      id: '2',
      title: 'Blood pressure reading',
      description: 'Record blood pressure and note any symptoms',
      assignedBy: { id: 2, name: 'Dr. Sarah Johnson', role: 'doctor' },
      assignedTo: { id: 1, name: 'John Smith', role: 'patient' },
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48), // Day after tomorrow
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
      reminders: ['9:00 AM', '9:00 PM']
    },
    {
      id: '3',
      title: 'Prepare medication for patient #12345',
      description: 'Amoxicillin 500mg - 21 tablets',
      assignedBy: { id: 2, name: 'Dr. Sarah Johnson', role: 'doctor' },
      assignedTo: { id: 3, name: 'City Pharmacy', role: 'pharmacy' },
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours from now
      status: 'completed',
      priority: 'high',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
    }
  ];
  
  // Set initial active chat if recipientId is provided
  useEffect(() => {
    if (recipientId) {
      const chat = mockChats.find(c => 
        c.participants.some(p => p.id === recipientId)
      );
      if (chat) {
        setActiveChat(chat.id);
      }
    } else if (mockChats.length > 0) {
      setActiveChat(mockChats[0].id);
    }
  }, [recipientId]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat, mockMessages]);
  
  // Function to handle sending a new message
  const handleSendMessage = () => {
    if (!message.trim() || !activeChat || !user) return;
    
    // In a real implementation, this would be an API call
    // For now, we'll simulate adding a new message to the UI
    const newMessageObj: Message = {
      id: `new-${Date.now()}`,
      senderId: user.id,
      senderName: user.name || user.username,
      senderRole: user.role,
      content: message,
      timestamp: new Date(),
      status: 'sent'
    };
    
    // Add to mockMessages for demo purposes
    if (mockMessages[activeChat]) {
      mockMessages[activeChat] = [...mockMessages[activeChat], newMessageObj];
    } else {
      mockMessages[activeChat] = [newMessageObj];
    }
    
    // Clear the input field
    setMessage('');
    
    // In a real app, you'd update the message status after sending
    setTimeout(() => {
      newMessageObj.status = 'delivered';
      // Force a re-render
      setActiveChat(prev => prev);
    }, 1000);
  };
  
  // Function to handle creating a new task
  const handleCreateTask = () => {
    if (!taskTitle || !taskDueDate || !user) return;
    
    toast({
      title: "Task created",
      description: `Task "${taskTitle}" has been created and assigned.`,
    });
    
    // Clear the task form
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setTaskPriority('medium');
    setTaskAssignee(null);
  };
  
  // Function to handle marking a task as completed
  const handleCompleteTask = (taskId: string) => {
    toast({
      title: "Task completed",
      description: "The task has been marked as completed.",
    });
  };
  
  // Get other participant details for the active chat
  const getOtherParticipant = () => {
    if (!activeChat || !user) return null;
    
    const chat = mockChats.find(c => c.id === activeChat);
    if (!chat) return null;
    
    return chat.participants.find(p => p.id !== user.id);
  };
  
  const otherParticipant = getOtherParticipant();

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden bg-white">
      <Tabs defaultValue={mode} onValueChange={(value) => setMode(value as 'chat' | 'tasks')} className="w-full h-full flex flex-col">
        <div className="bg-white border-b px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - chat list */}
          <div className="w-1/3 border-r flex flex-col overflow-hidden">
            <div className="p-3 border-b">
              <Input placeholder="Search conversations..." />
            </div>
            <div className="flex-1 overflow-y-auto">
              {mockChats.map(chat => {
                // Find the other participant (not the current user)
                const otherParticipant = chat.participants.find(p => 
                  p.id !== (user?.id ?? 0)
                );
                
                if (!otherParticipant) return null;
                
                return (
                  <div 
                    key={chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                      activeChat === chat.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={otherParticipant.avatar} />
                          <AvatarFallback className={getRoleColor(otherParticipant.role)}>
                            {getInitials(otherParticipant.name)}
                          </AvatarFallback>
                        </Avatar>
                        {otherParticipant.status === 'online' && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                        {otherParticipant.status === 'busy' && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium truncate">{otherParticipant.name}</h3>
                          {chat.lastMessageTime && (
                            <span className="text-xs text-gray-500">
                              {timeAgo(chat.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500 truncate">
                            {chat.lastMessage}
                          </p>
                          {chat.unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {otherParticipant.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
              {activeChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 border-b flex justify-between items-center bg-white">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={otherParticipant?.avatar} />
                        <AvatarFallback className={otherParticipant ? getRoleColor(otherParticipant.role) : 'bg-gray-500'}>
                          {otherParticipant ? getInitials(otherParticipant.name) : '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{otherParticipant?.name}</h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <Badge variant="outline">
                            {otherParticipant?.role}
                          </Badge>
                          {otherParticipant?.status === 'online' && (
                            <span className="ml-2 flex items-center text-green-500">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              Online
                            </span>
                          )}
                          {otherParticipant?.status === 'busy' && (
                            <span className="ml-2 flex items-center text-red-500">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                              Busy
                            </span>
                          )}
                          {otherParticipant?.status === 'offline' && (
                            <span className="ml-2 flex items-center text-gray-500">
                              <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                              Offline
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View profile</DropdownMenuItem>
                          <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                          <DropdownMenuItem>Clear chat</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">Block</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {mockMessages[activeChat]?.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`mb-4 flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${msg.senderId === user?.id ? 'order-2' : 'order-1'}`}>
                          {msg.senderId !== user?.id && (
                            <div className="flex items-center mb-1 space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={msg.senderAvatar} />
                                <AvatarFallback className={getRoleColor(msg.senderRole)}>
                                  {getInitials(msg.senderName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">{msg.senderName}</span>
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {msg.senderRole}
                              </Badge>
                            </div>
                          )}
                          
                          <div 
                            className={`rounded-lg p-3 ${
                              msg.senderId === user?.id 
                                ? 'bg-blue-500 text-white rounded-br-none' 
                                : 'bg-white border rounded-bl-none'
                            }`}
                          >
                            <p>{msg.content}</p>
                            
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {msg.attachments.map(attachment => (
                                  <div 
                                    key={attachment.id} 
                                    className={`flex items-center p-2 rounded ${
                                      msg.senderId === user?.id ? 'bg-blue-600' : 'bg-gray-100'
                                    }`}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    <span className="text-sm flex-1 truncate">{attachment.name}</span>
                                    <Button 
                                      size="sm" 
                                      variant={msg.senderId === user?.id ? 'secondary' : 'outline'} 
                                      className="h-7 ml-2"
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      <span className="text-xs">View</span>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className={`flex items-center justify-end mt-1 text-xs ${
                              msg.senderId === user?.id ? 'text-blue-100' : 'text-gray-400'
                            }`}>
                              <span>{timeAgo(msg.timestamp)}</span>
                              {msg.senderId === user?.id && (
                                <span className="ml-1">
                                  {msg.status === 'sent' && <Check className="h-3 w-3" />}
                                  {msg.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
                                  {msg.status === 'read' && <CheckCheck className="h-3 w-3 text-green-300" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Chat Input */}
                  <div className="p-3 border-t bg-white">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Image className="h-4 w-4" />
                      </Button>
                      <Input 
                        placeholder="Type your message..." 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                      >
                        <Send className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="bg-gray-100 p-6 rounded-full mx-auto w-20 h-20 mb-4 flex items-center justify-center">
                      <Send className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                    <p className="text-gray-500 mb-4">Choose a conversation or start a new one</p>
                    <Button className="mx-auto">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Start New Chat
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tasks" className="flex-1 flex flex-col p-0 m-0">
              <div className="flex-1 overflow-auto">
                <div className="p-4">
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Create New Task</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Task Title</label>
                          <Input 
                            placeholder="Enter task title" 
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Description</label>
                          <Textarea 
                            placeholder="Enter task description" 
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Due Date</label>
                            <Input 
                              type="datetime-local" 
                              value={taskDueDate}
                              onChange={(e) => setTaskDueDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Priority</label>
                            <select 
                              className="w-full px-3 py-2 border rounded-md"
                              value={taskPriority}
                              onChange={(e) => setTaskPriority(e.target.value)}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Assign To</label>
                          <select 
                            className="w-full px-3 py-2 border rounded-md"
                            value={taskAssignee || ''}
                            onChange={(e) => setTaskAssignee(Number(e.target.value) || null)}
                          >
                            <option value="">Select assignee</option>
                            {mockChats.map(chat => 
                              chat.participants.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.role})
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleCreateTask} disabled={!taskTitle || !taskDueDate}>
                        Create Task
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <h3 className="text-lg font-medium mb-3">Pending Tasks</h3>
                  <div className="space-y-3 mb-6">
                    {mockTasks
                      .filter(task => task.status === 'pending')
                      .map(task => (
                        <Card key={task.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className="font-medium">{task.title}</h4>
                                  {task.priority === 'high' && (
                                    <Badge className="ml-2 bg-red-500">High</Badge>
                                  )}
                                  {task.priority === 'medium' && (
                                    <Badge className="ml-2 bg-yellow-500">Medium</Badge>
                                  )}
                                  {task.priority === 'low' && (
                                    <Badge className="ml-2 bg-green-500">Low</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>Due: {task.dueDate.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center mt-2">
                                  <div className="flex items-center text-xs">
                                    <span className="mr-1">From:</span>
                                    <Avatar className="h-4 w-4 mr-1">
                                      <AvatarFallback className={getRoleColor(task.assignedBy.role)}>
                                        {getInitials(task.assignedBy.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{task.assignedBy.name}</span>
                                  </div>
                                  <div className="flex items-center text-xs ml-3">
                                    <span className="mr-1">To:</span>
                                    <Avatar className="h-4 w-4 mr-1">
                                      <AvatarFallback className={getRoleColor(task.assignedTo.role)}>
                                        {getInitials(task.assignedTo.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{task.assignedTo.name}</span>
                                  </div>
                                </div>
                                {task.reminders && task.reminders.length > 0 && (
                                  <div className="flex items-center mt-2 text-xs">
                                    <AlarmClock className="h-3 w-3 mr-1 text-orange-500" />
                                    <span>Reminders: {task.reminders.join(', ')}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCompleteTask(task.id)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Complete
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit Task</DropdownMenuItem>
                                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                    <DropdownMenuItem>Add Reminder</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-500">
                                      Delete Task
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="text-lg font-medium mb-3">Completed Tasks</h3>
                  <div className="space-y-3 opacity-70">
                    {mockTasks
                      .filter(task => task.status === 'completed')
                      .map(task => (
                        <Card key={task.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className="font-medium line-through">{task.title}</h4>
                                  <Badge className="ml-2 bg-green-500">Completed</Badge>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                                {task.completedAt && (
                                  <div className="flex items-center mt-2 text-xs text-gray-500">
                                    <Check className="h-3 w-3 mr-1 text-green-500" />
                                    <span>Completed: {timeAgo(task.completedAt)}</span>
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default ChatInterface;