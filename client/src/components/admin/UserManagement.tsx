import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  User, 
  Check, 
  X, 
  Edit, 
  UserCheck, 
  UserX, 
  Shield, 
  MoreHorizontal,
  Stethoscope,
  Beaker,
  Building2,
  Pill, // Added missing Pill icon
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Type definitions
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: 'admin' | 'doctor' | 'pharmacy' | 'laboratory' | 'user' | 'chemist' | 'hospital' | 'customer';
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  lastActive: string;
  avatar?: string;
}

const UserManagement = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewUserDialogOpen, setIsViewUserDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Sample user data
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Dr. Anil Kumar',
      username: 'dranilk',
      email: 'anil.kumar@example.com',
      phone: '+91 98765 43210',
      role: 'doctor',
      status: 'active',
      joinDate: '2023-01-15',
      lastActive: '2025-04-09',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 2,
      name: 'Meera Patel',
      username: 'meerapatel',
      email: 'meera.patel@example.com',
      phone: '+91 87654 32109',
      role: 'pharmacy',
      status: 'active',
      joinDate: '2023-02-20',
      lastActive: '2025-04-08',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: 3,
      name: 'Raj Singh',
      username: 'rajsingh',
      email: 'raj.singh@example.com',
      phone: '+91 76543 21098',
      role: 'laboratory',
      status: 'active',
      joinDate: '2023-03-10',
      lastActive: '2025-04-07',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    {
      id: 4,
      name: 'Priya Sharma',
      username: 'priyasharma',
      email: 'priya.sharma@example.com',
      phone: '+91 65432 10987',
      role: 'admin',
      status: 'active',
      joinDate: '2022-12-05',
      lastActive: '2025-04-10',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
    },
    {
      id: 5,
      name: 'Vikram Mehta',
      username: 'vikrammehta',
      email: 'vikram.mehta@example.com',
      phone: '+91 54321 09876',
      role: 'user',
      status: 'active',
      joinDate: '2023-04-22',
      lastActive: '2025-04-05',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg'
    },
    {
      id: 6,
      name: 'Deepa Verma',
      username: 'deepaverma',
      email: 'deepa.verma@example.com',
      phone: '+91 43210 98765',
      role: 'doctor',
      status: 'pending',
      joinDate: '2025-04-08',
      lastActive: '2025-04-08',
      avatar: 'https://randomuser.me/api/portraits/women/6.jpg'
    },
    {
      id: 7,
      name: 'Rahul Gupta',
      username: 'rahulgupta',
      email: 'rahul.gupta@example.com',
      phone: '+91 32109 87654',
      role: 'pharmacy',
      status: 'suspended',
      joinDate: '2023-06-14',
      lastActive: '2025-03-20',
      avatar: 'https://randomuser.me/api/portraits/men/7.jpg'
    },
    {
      id: 8,
      name: 'Anand Kumar',
      username: 'chemist1',
      email: 'anand.kumar@example.com',
      phone: '+91 98765 12345',
      role: 'chemist',
      status: 'active',
      joinDate: '2023-05-10',
      lastActive: '2025-04-12',
      avatar: 'https://randomuser.me/api/portraits/men/8.jpg'
    },
    {
      id: 9,
      name: 'Apollo Hospital',
      username: 'hospital1',
      email: 'apollo.hospital@example.com',
      phone: '+91 76543 09876',
      role: 'hospital',
      status: 'active',
      joinDate: '2023-01-12',
      lastActive: '2025-04-11',
      avatar: 'https://randomuser.me/api/portraits/men/9.jpg'
    }
  ]);
  
  // Get filtered users based on tab, search and filters
  const getFilteredUsers = () => {
    return users.filter(user => {
      // Filter by tab
      if (activeTab === 'pending' && user.status !== 'pending') {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !user.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !user.username.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by role
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }
      
      // Filter by status
      if (statusFilter !== 'all' && user.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  };
  
  // Handle view user
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewUserDialogOpen(true);
  };
  
  // Handle add user
  const handleAddUser = () => {
    setIsAddUserDialogOpen(true);
  };
  
  // Handle save user
  const handleSaveUser = () => {
    // In a real app, you'd save the user here
    setIsAddUserDialogOpen(false);
  };
  
  // Handle update user status
  const handleUpdateStatus = (userId: number, status: 'active' | 'pending' | 'suspended') => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status } 
          : user
      )
    );
    setIsViewUserDialogOpen(false);
  };
  
  // Get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get role style
  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'doctor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pharmacy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'chemist':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'laboratory':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'hospital':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'user':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'doctor':
        return <Stethoscope className="h-4 w-4" />;
      case 'pharmacy':
        return <Building2 className="h-4 w-4" />;
      case 'chemist':
        return <Pill className="h-4 w-4" />;
      case 'laboratory':
        return <Beaker className="h-4 w-4" />;
      case 'hospital':
        return <Building2 className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4" />;
      case 'pending':
        return <User className="h-4 w-4" />;
      case 'suspended':
        return <UserX className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };
  
  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={handleAddUser}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue="all" 
        className="space-y-4"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>User Directory</CardTitle>
                <div className="flex gap-3">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="chemist">Chemist</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredUsers().length > 0 ? (
                    getFilteredUsers().map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleStyle(user.role)}>
                            <span className="flex items-center gap-1">
                              {getRoleIcon(user.role)}
                              <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusStyle(user.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(user.status)}
                              <span>{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>{user.joinDate}</div>
                          <div className="text-sm text-gray-500">Last active: {user.lastActive}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                <User className="mr-2 h-4 w-4" />
                                <span>View Profile</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === 'active' && (
                                <DropdownMenuItem 
                                  className="text-red-600" 
                                  onClick={() => handleUpdateStatus(user.id, 'suspended')}
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  <span>Suspend</span>
                                </DropdownMenuItem>
                              )}
                              {user.status === 'pending' && (
                                <DropdownMenuItem 
                                  className="text-green-600"
                                  onClick={() => handleUpdateStatus(user.id, 'active')}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  <span>Approve</span>
                                </DropdownMenuItem>
                              )}
                              {user.status === 'suspended' && (
                                <DropdownMenuItem 
                                  className="text-green-600"
                                  onClick={() => handleUpdateStatus(user.id, 'active')}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  <span>Reactivate</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <div className="text-gray-500">No users found matching your criteria</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Requested On</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredUsers().length > 0 ? (
                    getFilteredUsers().map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleStyle(user.role)}>
                            <span className="flex items-center gap-1">
                              {getRoleIcon(user.role)}
                              <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>{user.joinDate}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewUser(user)}
                            >
                              <User className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateStatus(user.id, 'active')}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => handleUpdateStatus(user.id, 'suspended')}
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        <div className="text-gray-500">No pending approval requests</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* View User Dialog */}
      <Dialog open={isViewUserDialogOpen} onOpenChange={setIsViewUserDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              View and manage user information
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-2 mb-4">
                <Avatar className="h-20 w-20 mb-2">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback className="text-2xl">{getInitials(selectedUser.name)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleStyle(selectedUser.role)}>
                    <span className="flex items-center gap-1">
                      {getRoleIcon(selectedUser.role)}
                      <span>{selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</span>
                    </span>
                  </Badge>
                  <Badge className={getStatusStyle(selectedUser.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedUser.status)}
                      <span>{selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}</span>
                    </span>
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-500">Username</Label>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Phone</Label>
                  <p className="font-medium">{selectedUser.phone}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Joined</Label>
                  <p className="font-medium">{selectedUser.joinDate}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Last Active</Label>
                  <p className="font-medium">{selectedUser.lastActive}</p>
                </div>
              </div>
              
              <div className="flex justify-between pt-4 border-t">
                <div>
                  {selectedUser.status === 'active' && (
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleUpdateStatus(selectedUser.id, 'suspended')}
                    >
                      <UserX className="h-4 w-4 mr-2" /> Suspend User
                    </Button>
                  )}
                  {selectedUser.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleUpdateStatus(selectedUser.id, 'suspended')}
                    >
                      <X className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  )}
                  {selectedUser.status === 'suspended' && (
                    <Button 
                      variant="outline" 
                      className="border-green-200 text-green-600 hover:bg-green-50"
                      onClick={() => handleUpdateStatus(selectedUser.id, 'active')}
                    >
                      <UserCheck className="h-4 w-4 mr-2" /> Reactivate
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsViewUserDialogOpen(false)}
                  >
                    Close
                  </Button>
                  {selectedUser.status === 'pending' && (
                    <Button 
                      onClick={() => handleUpdateStatus(selectedUser.id, 'active')}
                    >
                      <Check className="h-4 w-4 mr-2" /> Approve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm password" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>User Status</Label>
              <div className="flex items-center space-x-2">
                <Checkbox id="activeStatus" defaultChecked />
                <label
                  htmlFor="activeStatus"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active (User can log in immediately)
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;