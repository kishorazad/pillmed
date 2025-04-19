import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Check,
  Pencil,
  Trash2,
  Search,
  Plus,
  X,
  Filter,
  MoreHorizontal
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

// User Management Component
const UserManagement = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
  });
  const [editUser, setEditUser] = useState({
    id: "",
    username: "",
    email: "",
    role: "",
    phone: "",
  });
  
  // Fetch users with pagination and filters
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users', page, search, roleFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page.toString());
      if (search) queryParams.append('search', search);
      if (roleFilter) queryParams.append('role', roleFilter);
      
      const response = await apiRequest('GET', `/api/admin/users?${queryParams.toString()}`);
      return response.json();
    },
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await apiRequest('POST', '/api/admin/users', userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User created successfully",
        description: "The new user has been added to the system.",
      });
      setShowAddDialog(false);
      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "customer",
        phone: "",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
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
      const { id, ...rest } = userData;
      const response = await apiRequest('PUT', `/api/admin/users/${id}`, rest);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User updated successfully",
        description: "The user information has been updated.",
      });
      setShowEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
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
      const response = await apiRequest('DELETE', `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User deleted successfully",
        description: "The user has been removed from the system.",
      });
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete user",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle add user
  const handleAddUser = (e) => {
    e.preventDefault();
    addUserMutation.mutate(newUser);
  };

  // Handle edit user
  const handleEditUser = (e) => {
    e.preventDefault();
    updateUserMutation.mutate(editUser);
  };

  // Handle delete user
  const handleDeleteUser = () => {
    deleteUserMutation.mutate(currentUser.id);
  };

  // Handle opening edit dialog
  const openEditDialog = (user) => {
    setEditUser({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
    });
    setCurrentUser(user);
    setShowEditDialog(true);
  };

  // Handle opening delete dialog
  const openDeleteDialog = (user) => {
    setCurrentUser(user);
    setShowDeleteDialog(true);
  };

  // Get total pages
  const totalPages = users?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users and their roles in the system.
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
            >
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="subadmin">Subadmin</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="hospital">Hospital</SelectItem>
                <SelectItem value="laboratory">Laboratory</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="chemist">Chemist</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Showing {users?.users?.length || 0} of {users?.totalUsers || 0} users
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading state with skeleton rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-9 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : users?.users?.length > 0 ? (
                  users.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${roleColors[user.role] || "bg-gray-100 text-gray-800"}`}
                          variant="outline"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "success" : "secondary"}>
                          {user.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(user)}>
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
                    <TableCell colSpan={5} className="text-center py-6">
                      No users found. Adjust your filters or add a new user.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (page <= 3) {
                  pageNumber = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = page - 2 + i;
                }
                
                return (
                  <PaginationItem key={`page-${pageNumber}`}>
                    <PaginationLink
                      onClick={() => setPage(pageNumber)}
                      isActive={pageNumber === page}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && page < totalPages - 2 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink onClick={() => setPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="subadmin">Subadmin</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="chemist">Chemist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addUserMutation.isPending}
              >
                {addUserMutation.isPending ? (
                  <>Creating...</>
                ) : (
                  <>Create User</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editUser.username}
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editUser.phone}
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editUser.role}
                  onValueChange={(value) => setEditUser({ ...editUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="subadmin">Subadmin</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="chemist">Chemist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? (
                  <>Saving...</>
                ) : (
                  <>Save Changes</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p>
              Are you sure you want to delete the user "{currentUser?.username}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="destructive"
              disabled={deleteUserMutation.isPending}
              onClick={handleDeleteUser}
            >
              {deleteUserMutation.isPending ? (
                <>Deleting...</>
              ) : (
                <>Delete User</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;