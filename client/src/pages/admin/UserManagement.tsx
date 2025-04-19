import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Search, PlusCircle, Edit, Trash, UserPlus, RefreshCw, CircleAlert, CheckCircle, Lock, MailIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const userFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.string().nonempty({ message: "Please select a role" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  pincode: z.string().optional(),
});

const updateUserSchema = userFormSchema.omit({ password: true }).extend({
  password: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;
type UpdateUserValues = z.infer<typeof updateUserSchema>;

// Role badge component to display user roles with appropriate colors
const RoleBadge = ({ role }: { role: string }) => {
  const roleColors: Record<string, string> = {
    admin: "bg-red-500 hover:bg-red-600",
    subadmin: "bg-orange-500 hover:bg-orange-600",
    chemist: "bg-blue-500 hover:bg-blue-600",
    doctor: "bg-green-500 hover:bg-green-600",
    hospital: "bg-purple-500 hover:bg-purple-600",
    laboratory: "bg-cyan-500 hover:bg-cyan-600",
    customer: "bg-gray-500 hover:bg-gray-600",
    nurse: "bg-pink-500 hover:bg-pink-600",
    delivery: "bg-yellow-500 hover:bg-yellow-600",
  };
  
  return <Badge className={roleColors[role] || "bg-gray-500"}>{role}</Badge>;
};

// Create user dialog component
const CreateUserDialog = ({ onUserCreated }: { onUserCreated: () => void }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      role: "customer",
      phone: "",
      address: "",
      pincode: ""
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormValues) => {
      const res = await apiRequest("POST", "/api/admin/users", userData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create user");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "The user has been created successfully.",
      });
      setOpen(false);
      form.reset();
      onUserCreated();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormValues) => {
    createUserMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user account to the system with specific roles and permissions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="subadmin">Sub Admin</SelectItem>
                        <SelectItem value="chemist">Chemist</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="laboratory">Laboratory</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="delivery">Delivery Personnel</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This determines user's access level and permissions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input placeholder="400001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Edit user dialog component
const EditUserDialog = ({ user, onUserUpdated }: { user: any, onUserUpdated: () => void }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      address: user.address || "",
      pincode: user.pincode || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
        pincode: user.pincode || "",
      });
    }
  }, [open, user, form]);

  const updateUserMutation = useMutation({
    mutationFn: async (userData: UpdateUserValues) => {
      const res = await apiRequest("PUT", `/api/admin/users/${user.id}`, userData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update user");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "The user has been updated successfully.",
      });
      setOpen(false);
      onUserUpdated();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateUserValues) => {
    // If password is empty, remove it from the data
    if (data.password === "") {
      const { password, ...dataWithoutPassword } = data;
      updateUserMutation.mutate(dataWithoutPassword);
    } else {
      updateUserMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and role.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password (Leave blank to keep current)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="subadmin">Sub Admin</SelectItem>
                        <SelectItem value="chemist">Chemist</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="laboratory">Laboratory</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="delivery">Delivery Personnel</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This determines user's access level and permissions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input placeholder="400001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Main UserManagement component
const UserManagement = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkAction, setBulkAction] = useState("none");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("all-users");
  
  const itemsPerPage = 10;

  // Fetch users with query parameters
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/users', searchTerm, roleFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch user statistics by role
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/user-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/user-stats');
      if (!res.ok) throw new Error('Failed to fetch user statistics');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch users with pending approvals
  const { data: pendingUsers, isLoading: pendingLoading } = useQuery({
    queryKey: ['/api/admin/users/pending'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users/pending');
      if (!res.ok) throw new Error('Failed to fetch pending users');
      return res.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutation for deleting a user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete user");
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for bulk actions
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, userIds }: { action: string, userIds: number[] }) => {
      const res = await apiRequest("POST", `/api/admin/users/bulk-action`, { action, userIds });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to perform bulk action");
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Action Completed",
        description: "The selected action has been applied to the selected users.",
      });
      setSelectedUsers([]);
      setBulkAction("none");
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for approving a user
  const approveUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/approve`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to approve user");
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "User Approved",
        description: "The user has been approved successfully.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler for deleting a user
  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Handler for applying bulk actions
  const handleBulkAction = () => {
    if (bulkAction === "none" || selectedUsers.length === 0) {
      toast({
        title: "Warning",
        description: "Please select an action and at least one user.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to ${bulkAction} the selected users?`)) {
      bulkActionMutation.mutate({ action: bulkAction, userIds: selectedUsers });
    }
  };

  // Handler for approving a user
  const handleApproveUser = (userId: number) => {
    approveUserMutation.mutate(userId);
  };

  // Filter users based on search term and role
  const filteredUsers = usersData?.users || [];
  const totalUsers = usersData?.total || 0;
  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  // Role count for user statistics
  const roleCount = userStats?.roleCounts || {
    admin: 0,
    subadmin: 0,
    chemist: 0,
    doctor: 0,
    hospital: 0,
    laboratory: 0,
    customer: 0,
    nurse: 0,
    delivery: 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users and their roles in the system
          </p>
        </div>
      </div>

      {/* User statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsLoading ? <Loader2 className="animate-spin" /> : totalUsers}</div>
            <Progress className="mt-2" value={100} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsLoading ? <Loader2 className="animate-spin" /> : roleCount.customer}</div>
            <Progress className="mt-2" value={(roleCount.customer / totalUsers) * 100} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Chemists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsLoading ? <Loader2 className="animate-spin" /> : roleCount.chemist}</div>
            <Progress className="mt-2" value={(roleCount.chemist / totalUsers) * 100} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsLoading ? <Loader2 className="animate-spin" /> : roleCount.doctor}</div>
            <Progress className="mt-2" value={(roleCount.doctor / totalUsers) * 100} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Hospitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsLoading ? <Loader2 className="animate-spin" /> : roleCount.hospital}</div>
            <Progress className="mt-2" value={(roleCount.hospital / totalUsers) * 100} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-users" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="pending-approvals">
            Pending Approvals
            {pendingUsers?.length > 0 && (
              <Badge className="ml-2 bg-red-500">{pendingUsers.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-users">
          {/* Filters and actions */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="subadmin">Sub Admin</SelectItem>
                  <SelectItem value="chemist">Chemist</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <CreateUserDialog onUserCreated={refetch} />
            </div>
          </div>

          {/* Bulk actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-2 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedUsers.length} users selected</span>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Bulk Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Choose Action</SelectItem>
                  <SelectItem value="delete">Delete Selected</SelectItem>
                  <SelectItem value="changeRole">Change Role</SelectItem>
                  <SelectItem value="sendEmail">Send Email</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleBulkAction} disabled={bulkAction === "none"}>
                Apply
              </Button>
              <Button variant="ghost" onClick={() => setSelectedUsers([])}>
                Clear Selection
              </Button>
            </div>
          )}

          {/* Users table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(user => user.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <CircleAlert className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p>No users found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          disabled={user.id === currentUser?.id} // Can't select current user
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.role || 'customer'} />
                      </TableCell>
                      <TableCell>
                        {user.phone ? user.phone : <span className="text-muted-foreground">No phone</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <EditUserDialog user={user} onUserUpdated={refetch} />
                          
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={user.id === currentUser?.id} // Can't delete current user
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                          
                          <Button variant="outline" size="icon">
                            <Lock className="h-4 w-4" />
                          </Button>
                          
                          <Button variant="outline" size="icon">
                            <MailIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending-approvals">
          {pendingLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : pendingUsers?.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>All Clear!</AlertTitle>
              <AlertDescription>
                There are no pending approvals at this time.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Requested At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.requestedRole || user.role || 'customer'} />
                      </TableCell>
                      <TableCell>
                        {new Date(user.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveUser(user.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;