import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Check,
  Pencil,
  Trash2,
  Search,
  Plus,
  X,
  Filter,
  MoreHorizontal,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Info
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Role definitions with color mappings
const roleColors = {
  admin: "bg-red-100 text-red-800",
  subadmin: "bg-orange-100 text-orange-800",
  customer: "bg-blue-100 text-blue-800",
  pharmacy: "bg-green-100 text-green-800",
  doctor: "bg-purple-100 text-purple-800",
  hospital: "bg-indigo-100 text-indigo-800",
  laboratory: "bg-pink-100 text-pink-800",
  delivery: "bg-yellow-100 text-yellow-800",
  chemist: "bg-emerald-100 text-emerald-800",
};

const roleLabels = {
  admin: "Admin",
  subadmin: "Sub Admin",
  customer: "Customer",
  pharmacy: "Pharmacy",
  doctor: "Doctor",
  hospital: "Hospital",
  laboratory: "Laboratory",
  delivery: "Delivery Agent",
  chemist: "Chemist",
};

// User Management Component
const UserManagement = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
    address: "",
    pincode: "",
    status: "active",
  });
  const [editUser, setEditUser] = useState({
    _id: "",
    username: "",
    name: "",
    email: "",
    role: "",
    phone: "",
    address: "",
    pincode: "",
    status: "",
  });
  
  // Fetch MongoDB users directly 
  const { data: mongoUsers, isLoading: isLoadingMongoUsers } = useQuery({
    queryKey: ['/api/admin/mongodb-users', page, search, roleFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page.toString());
      if (search) queryParams.append('search', search);
      if (roleFilter) queryParams.append('role', roleFilter);
      
      // Directly query MongoDB collections
      const response = await apiRequest('GET', `/api/admin/mongodb-users?${queryParams.toString()}`);
      return response.json();
    },
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await apiRequest('POST', '/api/admin/mongodb-users', userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User created successfully",
        description: "The new user has been added to MongoDB.",
      });
      setShowAddDialog(false);
      setNewUser({
        username: "",
        name: "",
        email: "",
        password: "",
        role: "customer",
        phone: "",
        address: "",
        pincode: "",
        status: "active",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mongodb-users'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create user",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData) => {
      const { _id, ...rest } = userData;
      const response = await apiRequest('PUT', `/api/admin/mongodb-users/${_id}`, rest);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User updated successfully",
        description: "The user information has been updated in MongoDB.",
      });
      setShowEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mongodb-users'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update user",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await apiRequest('DELETE', `/api/admin/mongodb-users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User deleted successfully",
        description: "The user has been removed from MongoDB.",
      });
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mongodb-users'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete user",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleAddUser = (e) => {
    e.preventDefault();
    addUserMutation.mutate(newUser);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    updateUserMutation.mutate(editUser);
  };

  const handleDeleteUser = () => {
    if (!currentUser) return;
    deleteUserMutation.mutate(currentUser._id);
  };

  const openEditDialog = (user) => {
    setEditUser({
      _id: user._id,
      username: user.username || "",
      name: user.name || "",
      email: user.email || "",
      role: user.role || "customer",
      phone: user.phone || "",
      address: user.address || "",
      pincode: user.pincode || "",
      status: user.status || "active",
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (user) => {
    setCurrentUser(user);
    setShowDeleteDialog(true);
  };

  const openUserDetailsDialog = (user) => {
    setCurrentUser(user);
    setShowUserDetailsDialog(true);
  };

  const roleOptions = Object.keys(roleColors).map(role => ({
    value: role,
    label: roleLabels[role] || role.charAt(0).toUpperCase() + role.slice(1)
  }));

  const getRoleBadgeColor = (role) => {
    return roleColors[role] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadgeColor = (status) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? "Invalid Date" 
      : date.toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        });
  };

  // UI rendering
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              View and manage all users from MongoDB ({mongoUsers?.totalUsers || 0} total)
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All roles</SelectItem>
            {roleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {roleFilter && (
          <Button variant="outline" size="icon" onClick={() => setRoleFilter("")}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>MongoDB Users</CardTitle>
          <CardDescription>
            Complete user data from MongoDB collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingMongoUsers ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : mongoUsers?.users?.length > 0 ? (
                  mongoUsers.users.map((user) => (
                    <TableRow key={user._id} className="cursor-pointer hover:bg-muted/50" onClick={() => openUserDetailsDialog(user)}>
                      <TableCell className="font-mono text-xs">{String(user._id).substring(0, 6)}...</TableCell>
                      <TableCell>{user.username || "—"}</TableCell>
                      <TableCell>{user.name || "—"}</TableCell>
                      <TableCell>{user.email || "—"}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {roleLabels[user.role] || user.role || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'success' : 'secondary'} className={getStatusBadgeColor(user.status)}>
                          {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openUserDetailsDialog(user)}>
                              <Info className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(user)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No users found. Try a different search or add a new user.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          {mongoUsers?.totalPages > 1 && (
            <Pagination className="mx-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(prev => Math.max(1, prev - 1))} 
                    disabled={page === 1}
                  />
                </PaginationItem>
                
                {Array.from({ length: mongoUsers.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setPage(pageNum)}
                      isActive={page === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(prev => Math.min(mongoUsers.totalPages, prev + 1))} 
                    disabled={page === mongoUsers.totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardFooter>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New User to MongoDB</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser}>
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pincode" className="text-right">
                  Pincode
                </Label>
                <Input
                  id="pincode"
                  value={newUser.pincode}
                  onChange={(e) => setNewUser({ ...newUser, pincode: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={newUser.status} 
                  onValueChange={(value) => setNewUser({ ...newUser, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addUserMutation.isPending}>
                {addUserMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit MongoDB User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser}>
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-username" className="text-right">
                  Username
                </Label>
                <Input
                  id="edit-username"
                  value={editUser.username}
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="edit-name"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={editUser.role} 
                  onValueChange={(value) => setEditUser({ ...editUser, role: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  value={editUser.phone}
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-address" className="text-right">
                  Address
                </Label>
                <Input
                  id="edit-address"
                  value={editUser.address}
                  onChange={(e) => setEditUser({ ...editUser, address: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-pincode" className="text-right">
                  Pincode
                </Label>
                <Input
                  id="edit-pincode"
                  value={editUser.pincode}
                  onChange={(e) => setEditUser({ ...editUser, pincode: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={editUser.status} 
                  onValueChange={(value) => setEditUser({ ...editUser, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>User Details from MongoDB</DialogTitle>
          </DialogHeader>
          {currentUser && (
            <div className="py-4">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">User Details</TabsTrigger>
                  <TabsTrigger value="activity" className="flex-1">Activity & Orders</TabsTrigger>
                  <TabsTrigger value="raw" className="flex-1">Raw MongoDB Data</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-start gap-2">
                          <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Full Name</div>
                            <div>{currentUser.name || "—"}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Email</div>
                            <div>{currentUser.email || "—"}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Phone</div>
                            <div>{currentUser.phone || "—"}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Address</div>
                            <div>{currentUser.address || "—"}</div>
                            <div>{currentUser.pincode || "—"}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Account Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="text-sm font-medium">Role</div>
                          <Badge className={getRoleBadgeColor(currentUser.role)}>
                            {roleLabels[currentUser.role] || currentUser.role || "—"}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Status</div>
                          <Badge className={getStatusBadgeColor(currentUser.status)}>
                            {currentUser.status ? currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1) : "—"}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Username</div>
                          <div>{currentUser.username || "—"}</div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Account Created</div>
                            <div>{formatDate(currentUser.createdAt)}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Last Updated</div>
                            <div>{formatDate(currentUser.updatedAt)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => setShowUserDetailsDialog(false)}>
                      Close
                    </Button>
                    <Button variant="default" onClick={() => {
                      setShowUserDetailsDialog(false);
                      openEditDialog(currentUser);
                    }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit User
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="activity" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Recent Orders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {currentUser.orders && currentUser.orders.length > 0 ? (
                          <div className="space-y-4">
                            {currentUser.orders.map((order, i) => (
                              <div key={i} className="border rounded-md p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">Order #{order.orderId || i+1}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatDate(order.date)}
                                    </div>
                                  </div>
                                  <Badge>{order.status || "Processing"}</Badge>
                                </div>
                                <div className="mt-2 text-sm">
                                  {order.items && order.items.length} items • ₹{order.amount || "0"}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No orders found for this user
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Activity Log</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {currentUser.activityLog && currentUser.activityLog.length > 0 ? (
                          <div className="space-y-4">
                            {currentUser.activityLog.map((activity, i) => (
                              <div key={i} className="flex gap-3">
                                <div className="h-2 w-2 mt-2 rounded-full bg-primary"></div>
                                <div>
                                  <div className="text-sm">{activity.description}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(activity.date)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No activity recorded for this user
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => setShowUserDetailsDialog(false)}>
                      Close
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Raw MongoDB Document</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px] text-xs">
                        {JSON.stringify(currentUser, null, 2)}
                      </pre>
                    </CardContent>
                    <CardFooter>
                      <div className="flex justify-end gap-3 w-full">
                        <Button variant="outline" onClick={() => setShowUserDetailsDialog(false)}>
                          Close
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete user "{currentUser?.username || currentUser?.name || currentUser?.email}"? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;