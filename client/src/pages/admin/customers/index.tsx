import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  ShoppingBasket,
  History,
  FileSpreadsheet,
  Pill
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

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

// Tabs for customer detail view
type CustomerDetailTab = "overview" | "medicines" | "purchases" | "cart";

const CustomerManagement = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailTab, setDetailTab] = useState<CustomerDetailTab>("overview");
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    pincode: ""
  });
  const [editCustomer, setEditCustomer] = useState({
    id: "",
    username: "",
    email: "",
    name: "",
    phone: "",
    address: "",
    pincode: ""
  });
  
  // Fetch customers with pagination and search
  const { data: customers, isLoading } = useQuery({
    queryKey: ['/api/admin/customers', page, search],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page.toString());
      if (search) queryParams.append('search', search);
      
      const response = await apiRequest('GET', `/api/admin/customers?${queryParams.toString()}`);
      return response.json();
    },
  });

  // Fetch customer details including their purchases, medicine usage, and cart
  const { data: customerDetail, isLoading: isLoadingDetail, refetch: refetchDetail } = useQuery({
    queryKey: ['/api/admin/customers/detail', currentCustomer?.id],
    queryFn: async () => {
      if (!currentCustomer?.id) return null;
      const response = await apiRequest('GET', `/api/admin/customers/${currentCustomer.id}`);
      return response.json();
    },
    enabled: !!currentCustomer?.id && showDetailDialog,
  });

  // Add customer mutation
  const addCustomerMutation = useMutation({
    mutationFn: async (customerData) => {
      const response = await apiRequest('POST', '/api/admin/customers', customerData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Customer created successfully",
        description: "The new customer has been added to the system.",
      });
      setShowAddDialog(false);
      setNewCustomer({
        username: "",
        email: "",
        password: "",
        name: "",
        phone: "",
        address: "",
        pincode: ""
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/customers'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create customer",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async (customerData) => {
      const { id, ...rest } = customerData;
      const response = await apiRequest('PUT', `/api/admin/customers/${id}`, rest);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Customer updated successfully",
        description: "The customer information has been updated.",
      });
      setShowEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/customers'] });
      if (showDetailDialog) {
        refetchDetail();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update customer",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId) => {
      const response = await apiRequest('DELETE', `/api/admin/customers/${customerId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Customer deleted successfully",
        description: "The customer has been removed from the system.",
      });
      setShowDeleteDialog(false);
      setShowDetailDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/customers'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete customer",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle add customer
  const handleAddCustomer = (e) => {
    e.preventDefault();
    // Add role as 'customer'
    const customerData = { ...newCustomer, role: 'customer' };
    addCustomerMutation.mutate(customerData);
  };

  // Handle edit customer
  const handleEditCustomer = (e) => {
    e.preventDefault();
    updateCustomerMutation.mutate(editCustomer);
  };

  // Handle delete customer
  const handleDeleteCustomer = () => {
    deleteCustomerMutation.mutate(currentCustomer.id);
  };

  // Handle opening edit dialog
  const openEditDialog = (customer) => {
    setEditCustomer({
      id: customer.id,
      username: customer.username,
      email: customer.email,
      name: customer.name || '',
      phone: customer.phone || '',
      address: customer.address || '',
      pincode: customer.pincode || ''
    });
    setCurrentCustomer(customer);
    setShowEditDialog(true);
  };

  // Handle opening delete dialog
  const openDeleteDialog = (customer) => {
    setCurrentCustomer(customer);
    setShowDeleteDialog(true);
  };

  // Handle opening detail dialog
  const openDetailDialog = (customer) => {
    setCurrentCustomer(customer);
    setDetailTab("overview");
    setShowDetailDialog(true);
  };

  // Get total pages
  const totalPages = customers?.totalPages || 1;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
            <p className="text-muted-foreground">
              View and manage all customer profiles, purchase history, and cart data.
            </p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Customer
          </Button>
        </div>

        {/* Search */}
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
              <Button variant="outline" onClick={() => setSearch("")}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Customers</CardTitle>
            <CardDescription>
              Showing {customers?.customers?.length || 0} of {customers?.totalCustomers || 0} customers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
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
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-9 w-20 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : customers?.customers?.length > 0 ? (
                    customers.customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.name || customer.username}
                        </TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone || 'N/A'}</TableCell>
                        <TableCell>
                          {customer.address ? `${customer.address}, ${customer.pincode || ''}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.active ? "success" : "secondary"}>
                            {customer.active ? "Active" : "Inactive"}
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
                              <DropdownMenuItem onClick={() => openDetailDialog(customer)}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(customer)}>
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
                      <TableCell colSpan={6} className="text-center py-6">
                        No customers found. Adjust your search or add a new customer.
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

        {/* Add Customer Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCustomer}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newCustomer.username}
                    onChange={(e) => setNewCustomer({ ...newCustomer, username: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newCustomer.password}
                    onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={newCustomer.pincode}
                    onChange={(e) => setNewCustomer({ ...newCustomer, pincode: e.target.value })}
                  />
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
                  disabled={addCustomerMutation.isPending}
                >
                  {addCustomerMutation.isPending ? (
                    <>Creating...</>
                  ) : (
                    <>Create Customer</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditCustomer}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={editCustomer.username}
                    onChange={(e) => setEditCustomer({ ...editCustomer, username: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editCustomer.email}
                    onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editCustomer.name}
                    onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    value={editCustomer.phone}
                    onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Input
                    id="edit-address"
                    value={editCustomer.address}
                    onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-pincode">Pincode</Label>
                  <Input
                    id="edit-pincode"
                    value={editCustomer.pincode}
                    onChange={(e) => setEditCustomer({ ...editCustomer, pincode: e.target.value })}
                  />
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
                  disabled={updateCustomerMutation.isPending}
                >
                  {updateCustomerMutation.isPending ? (
                    <>Updating...</>
                  ) : (
                    <>Update Customer</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Customer Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Customer</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this customer?</p>
              <p className="text-muted-foreground mt-2">
                This action cannot be undone. All data associated with this customer will be permanently removed.
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteCustomer}
                disabled={deleteCustomerMutation.isPending}
              >
                {deleteCustomerMutation.isPending ? "Deleting..." : "Delete Customer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Customer Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            
            {isLoadingDetail ? (
              <div className="py-8 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : customerDetail ? (
              <div className="py-4">
                <div className="flex flex-col md:flex-row gap-4 items-start mb-6">
                  <div className="bg-muted p-4 rounded-md w-full md:w-1/3">
                    <h3 className="font-semibold text-lg">{customerDetail.name || customerDetail.username}</h3>
                    <div className="mt-2 space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{customerDetail.email}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{customerDetail.phone || 'N/A'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-muted-foreground">Address:</span>
                        <span>{customerDetail.address ? `${customerDetail.address}, ${customerDetail.pincode || ''}` : 'N/A'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-muted-foreground">Joined:</span>
                        <span>{new Date(customerDetail.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md w-full md:w-2/3">
                    <div className="flex justify-between">
                      <div className="text-center px-4">
                        <p className="text-xl font-semibold">₹{customerDetail.stats?.totalSpent || 0}</p>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                      </div>
                      <div className="text-center px-4 border-l border-r">
                        <p className="text-xl font-semibold">{customerDetail.stats?.orderCount || 0}</p>
                        <p className="text-sm text-muted-foreground">Orders</p>
                      </div>
                      <div className="text-center px-4">
                        <p className="text-xl font-semibold">{customerDetail.stats?.cartSize || 0}</p>
                        <p className="text-sm text-muted-foreground">Cart Items</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Tabs defaultValue="overview" value={detailTab} onValueChange={(value) => setDetailTab(value as CustomerDetailTab)}>
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="medicines">Medicine Usage</TabsTrigger>
                    <TabsTrigger value="purchases">Purchase History</TabsTrigger>
                    <TabsTrigger value="cart">Cart Data</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Customer Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold">Recent Activity</h4>
                            {customerDetail.recentActivity?.length > 0 ? (
                              <ul className="mt-2 space-y-2">
                                {customerDetail.recentActivity.map((activity, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</span>
                                    <span>{activity.action}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted-foreground">No recent activity</p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold">Top Purchased Categories</h4>
                            {customerDetail.topCategories?.length > 0 ? (
                              <ul className="mt-2 space-y-2">
                                {customerDetail.topCategories.map((category, index) => (
                                  <li key={index} className="flex items-center justify-between">
                                    <span>{category.name}</span>
                                    <Badge variant="outline">{category.count} items</Badge>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted-foreground">No purchase data available</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="medicines" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Medicine Usage</CardTitle>
                        <CardDescription>Track the medicines this customer has purchased or uses</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {customerDetail.medicines?.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Medicine</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Frequency</TableHead>
                                <TableHead>Last Purchased</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {customerDetail.medicines.map((medicine) => (
                                <TableRow key={medicine.id}>
                                  <TableCell className="font-medium">{medicine.name}</TableCell>
                                  <TableCell>{medicine.category}</TableCell>
                                  <TableCell>{medicine.frequency} times</TableCell>
                                  <TableCell>{new Date(medicine.lastPurchased).toLocaleDateString()}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-4">
                            <Pill className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="mt-2">No medicine usage data available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="purchases" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Purchase History</CardTitle>
                        <CardDescription>All orders and transactions by this customer</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {customerDetail.orders?.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {customerDetail.orders.map((order) => (
                                <TableRow key={order.id}>
                                  <TableCell className="font-medium">#{order.id}</TableCell>
                                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                  <TableCell>₹{order.amount}</TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={
                                        order.status === 'Delivered' ? 'success' :
                                        order.status === 'Processing' ? 'outline' :
                                        order.status === 'Shipped' ? 'secondary' : 'default'
                                      }
                                    >
                                      {order.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-4">
                            <History className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="mt-2">No purchase history available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="cart" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Current Cart</CardTitle>
                        <CardDescription>Items currently in the customer's cart</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {customerDetail.cart?.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {customerDetail.cart.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">{item.name}</TableCell>
                                  <TableCell>₹{item.price}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>₹{item.price * item.quantity}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell colSpan={3} className="text-right font-semibold">Total:</TableCell>
                                <TableCell className="font-semibold">₹{
                                  customerDetail.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                                }</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-4">
                            <ShoppingBasket className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="mt-2">Cart is empty</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p>Failed to load customer details. Please try again.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default CustomerManagement;