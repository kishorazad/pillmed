import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Pill,
  ShoppingBag,
  FileText,
  ClipboardList,
  Calendar,
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

// Tabs for pharmacy detail view
type PharmacyDetailTab = "overview" | "inventory" | "orders" | "prescriptions";

const PharmacyManagement = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailTab, setDetailTab] = useState<PharmacyDetailTab>("overview");
  const [currentPharmacy, setCurrentPharmacy] = useState<any>(null);
  const [newPharmacy, setNewPharmacy] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    pincode: "",
    role: "pharmacy",
    pharmacyDetails: {
      pharmacyName: "",
      licenseNumber: "",
      licenseExpiryDate: "",
      ownerName: "",
      pharmacistName: "",
      pharmacistRegistrationNumber: "",
      gstNumber: "",
      establishmentYear: "",
      workingHours: "",
      acceptsInsurance: false,
      hasHomeDelivery: false,
      hasPrescriptionFilling: true
    }
  });
  const [editPharmacy, setEditPharmacy] = useState({
    id: "",
    username: "",
    email: "",
    name: "",
    phone: "",
    address: "",
    pincode: "",
    status: "",
    pharmacyDetails: {
      pharmacyName: "",
      licenseNumber: "",
      licenseExpiryDate: "",
      ownerName: "",
      pharmacistName: "",
      pharmacistRegistrationNumber: "",
      gstNumber: "",
      establishmentYear: "",
      workingHours: "",
      acceptsInsurance: false,
      hasHomeDelivery: false,
      hasPrescriptionFilling: true
    }
  });
  
  // Fetch pharmacies with pagination, search and status filter
  const { data: pharmacies, isLoading } = useQuery({
    queryKey: ['/api/admin/pharmacies', page, search, statusFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page.toString());
      if (search) queryParams.append('search', search);
      if (statusFilter) queryParams.append('status', statusFilter);
      
      const response = await apiRequest('GET', `/api/admin/pharmacies?${queryParams.toString()}`);
      return response.json();
    },
  });

  // Fetch pharmacy details including inventory, orders, and prescriptions
  const { data: pharmacyDetail, isLoading: isLoadingDetail, refetch: refetchDetail } = useQuery({
    queryKey: ['/api/admin/pharmacies/detail', currentPharmacy?.id],
    queryFn: async () => {
      if (!currentPharmacy?.id) return null;
      const response = await apiRequest('GET', `/api/admin/pharmacies/${currentPharmacy.id}`);
      return response.json();
    },
    enabled: !!currentPharmacy?.id && showDetailDialog,
  });

  // Add pharmacy mutation
  const addPharmacyMutation = useMutation({
    mutationFn: async (pharmacyData) => {
      const response = await apiRequest('POST', '/api/admin/pharmacies', pharmacyData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pharmacy created successfully",
        description: "The new pharmacy has been added to the system.",
      });
      setShowAddDialog(false);
      setNewPharmacy({
        username: "",
        email: "",
        password: "",
        name: "",
        phone: "",
        address: "",
        pincode: "",
        role: "pharmacy",
        pharmacyDetails: {
          pharmacyName: "",
          licenseNumber: "",
          licenseExpiryDate: "",
          ownerName: "",
          pharmacistName: "",
          pharmacistRegistrationNumber: "",
          gstNumber: "",
          establishmentYear: "",
          workingHours: "",
          acceptsInsurance: false,
          hasHomeDelivery: false,
          hasPrescriptionFilling: true
        }
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pharmacies'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create pharmacy",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update pharmacy mutation
  const updatePharmacyMutation = useMutation({
    mutationFn: async (pharmacyData) => {
      const { id, ...rest } = pharmacyData;
      const response = await apiRequest('PUT', `/api/admin/pharmacies/${id}`, rest);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pharmacy updated successfully",
        description: "The pharmacy information has been updated.",
      });
      setShowEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pharmacies'] });
      if (showDetailDialog) {
        refetchDetail();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update pharmacy",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update pharmacy status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await apiRequest('PATCH', `/api/admin/pharmacies/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated successfully",
        description: "The pharmacy status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pharmacies'] });
      if (showDetailDialog) {
        refetchDetail();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update status",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete pharmacy mutation
  const deletePharmacyMutation = useMutation({
    mutationFn: async (pharmacyId) => {
      const response = await apiRequest('DELETE', `/api/admin/pharmacies/${pharmacyId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pharmacy deleted successfully",
        description: "The pharmacy has been removed from the system.",
      });
      setShowDeleteDialog(false);
      setShowDetailDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pharmacies'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete pharmacy",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle add pharmacy
  const handleAddPharmacy = (e) => {
    e.preventDefault();
    addPharmacyMutation.mutate(newPharmacy);
  };

  // Handle edit pharmacy
  const handleEditPharmacy = (e) => {
    e.preventDefault();
    updatePharmacyMutation.mutate(editPharmacy);
  };

  // Handle delete pharmacy
  const handleDeletePharmacy = () => {
    deletePharmacyMutation.mutate(currentPharmacy.id);
  };

  // Handle opening edit dialog
  const openEditDialog = (pharmacy) => {
    setEditPharmacy({
      id: pharmacy.id,
      username: pharmacy.username,
      email: pharmacy.email,
      name: pharmacy.name || '',
      phone: pharmacy.phone || '',
      address: pharmacy.address || '',
      pincode: pharmacy.pincode || '',
      status: pharmacy.status || 'pending',
      pharmacyDetails: pharmacy.pharmacyDetails || {
        pharmacyName: '',
        licenseNumber: '',
        licenseExpiryDate: '',
        ownerName: '',
        pharmacistName: '',
        pharmacistRegistrationNumber: '',
        gstNumber: '',
        establishmentYear: '',
        workingHours: '',
        acceptsInsurance: false,
        hasHomeDelivery: false,
        hasPrescriptionFilling: true
      }
    });
    setCurrentPharmacy(pharmacy);
    setShowEditDialog(true);
  };

  // Handle opening delete dialog
  const openDeleteDialog = (pharmacy) => {
    setCurrentPharmacy(pharmacy);
    setShowDeleteDialog(true);
  };

  // Handle opening detail dialog
  const openDetailDialog = (pharmacy) => {
    setCurrentPharmacy(pharmacy);
    setDetailTab("overview");
    setShowDetailDialog(true);
  };

  // Handle updating pharmacy status
  const handleStatusChange = (pharmacy, status) => {
    updateStatusMutation.mutate({ id: pharmacy.id, status });
  };

  // Get total pages
  const totalPages = pharmacies?.totalPages || 1;

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch(status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'destructive';
      case 'suspended': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pharmacy Management</h1>
            <p className="text-muted-foreground">
              Register, onboard, and manage pharmacy partners and their operations.
            </p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Pharmacy
          </Button>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or license number..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pharmacies Table */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Pharmacies</CardTitle>
            <CardDescription>
              Showing {pharmacies?.pharmacies?.length || 0} of {pharmacies?.totalPharmacies || 0} pharmacies
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
                    <TableHead>License Number</TableHead>
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
                  ) : pharmacies?.pharmacies?.length > 0 ? (
                    pharmacies.pharmacies.map((pharmacy) => (
                      <TableRow key={pharmacy.id}>
                        <TableCell className="font-medium">
                          {pharmacy.pharmacyDetails?.pharmacyName || pharmacy.name || pharmacy.username}
                        </TableCell>
                        <TableCell>{pharmacy.email}</TableCell>
                        <TableCell>{pharmacy.phone || 'N/A'}</TableCell>
                        <TableCell>
                          {pharmacy.pharmacyDetails?.licenseNumber || 'Not provided'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusVariant(pharmacy.status)}
                          >
                            {pharmacy.status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openDetailDialog(pharmacy)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(pharmacy)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleStatusChange(pharmacy, 'approved')}>
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(pharmacy, 'rejected')}>
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(pharmacy, 'suspended')}>
                                Suspend
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(pharmacy)}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No pharmacies found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-center py-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1 || isLoading}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
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
                  
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <PaginationItem key={`page-${pageNumber}`}>
                      <PaginationLink
                        isActive={pageNumber === page}
                        onClick={() => setPage(pageNumber)}
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
                      <PaginationLink
                        onClick={() => setPage(totalPages)}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages || isLoading}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>

        {/* Add Pharmacy Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Pharmacy</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPharmacy}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                  <Input 
                    id="username" 
                    value={newPharmacy.username}
                    onChange={(e) => setNewPharmacy({...newPharmacy, username: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newPharmacy.email}
                    onChange={(e) => setNewPharmacy({...newPharmacy, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={newPharmacy.password}
                    onChange={(e) => setNewPharmacy({...newPharmacy, password: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Contact Person Name</Label>
                  <Input 
                    id="name" 
                    value={newPharmacy.name}
                    onChange={(e) => setNewPharmacy({...newPharmacy, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={newPharmacy.phone}
                    onChange={(e) => setNewPharmacy({...newPharmacy, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pharmacyName">Pharmacy Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="pharmacyName" 
                    value={newPharmacy.pharmacyDetails.pharmacyName}
                    onChange={(e) => setNewPharmacy({
                      ...newPharmacy, 
                      pharmacyDetails: {
                        ...newPharmacy.pharmacyDetails,
                        pharmacyName: e.target.value
                      }
                    })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number <span className="text-red-500">*</span></Label>
                  <Input 
                    id="licenseNumber" 
                    value={newPharmacy.pharmacyDetails.licenseNumber}
                    onChange={(e) => setNewPharmacy({
                      ...newPharmacy, 
                      pharmacyDetails: {
                        ...newPharmacy.pharmacyDetails,
                        licenseNumber: e.target.value
                      }
                    })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiryDate">License Expiry Date</Label>
                  <Input 
                    id="licenseExpiryDate"
                    type="date"
                    value={newPharmacy.pharmacyDetails.licenseExpiryDate}
                    onChange={(e) => setNewPharmacy({
                      ...newPharmacy, 
                      pharmacyDetails: {
                        ...newPharmacy.pharmacyDetails,
                        licenseExpiryDate: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={newPharmacy.address}
                    onChange={(e) => setNewPharmacy({...newPharmacy, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input 
                    id="pincode" 
                    value={newPharmacy.pincode}
                    onChange={(e) => setNewPharmacy({...newPharmacy, pincode: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addPharmacyMutation.isPending}>
                  {addPharmacyMutation.isPending && (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                  )}
                  Add Pharmacy
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Pharmacy Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Pharmacy</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditPharmacy}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input 
                    id="edit-username" 
                    value={editPharmacy.username}
                    onChange={(e) => setEditPharmacy({...editPharmacy, username: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email" 
                    type="email"
                    value={editPharmacy.email}
                    onChange={(e) => setEditPharmacy({...editPharmacy, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Contact Person Name</Label>
                  <Input 
                    id="edit-name" 
                    value={editPharmacy.name}
                    onChange={(e) => setEditPharmacy({...editPharmacy, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input 
                    id="edit-phone" 
                    value={editPharmacy.phone}
                    onChange={(e) => setEditPharmacy({...editPharmacy, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pharmacyName">Pharmacy Name</Label>
                  <Input 
                    id="edit-pharmacyName" 
                    value={editPharmacy.pharmacyDetails?.pharmacyName || ''}
                    onChange={(e) => setEditPharmacy({
                      ...editPharmacy, 
                      pharmacyDetails: {
                        ...editPharmacy.pharmacyDetails,
                        pharmacyName: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-licenseNumber">License Number</Label>
                  <Input 
                    id="edit-licenseNumber" 
                    value={editPharmacy.pharmacyDetails?.licenseNumber || ''}
                    onChange={(e) => setEditPharmacy({
                      ...editPharmacy, 
                      pharmacyDetails: {
                        ...editPharmacy.pharmacyDetails,
                        licenseNumber: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Input 
                    id="edit-address" 
                    value={editPharmacy.address}
                    onChange={(e) => setEditPharmacy({...editPharmacy, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pincode">Pincode</Label>
                  <Input 
                    id="edit-pincode" 
                    value={editPharmacy.pincode}
                    onChange={(e) => setEditPharmacy({...editPharmacy, pincode: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editPharmacy.status}
                    onValueChange={(value) => setEditPharmacy({...editPharmacy, status: value})}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePharmacyMutation.isPending}>
                  {updatePharmacyMutation.isPending && (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Pharmacy</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete the pharmacy "
              {currentPharmacy?.pharmacyDetails?.pharmacyName || currentPharmacy?.name || currentPharmacy?.username}"? 
              This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePharmacy} disabled={deletePharmacyMutation.isPending}>
                {deletePharmacyMutation.isPending && (
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pharmacy Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {pharmacyDetail?.pharmacyDetails?.pharmacyName || pharmacyDetail?.name || currentPharmacy?.username}
              </DialogTitle>
            </DialogHeader>
            {isLoadingDetail ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p>Loading pharmacy details...</p>
              </div>
            ) : pharmacyDetail ? (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getStatusVariant(pharmacyDetail.status)}>
                    {pharmacyDetail.status || 'pending'}
                  </Badge>
                  {pharmacyDetail.pharmacyDetails?.hasHomeDelivery && (
                    <Badge variant="outline">Home Delivery</Badge>
                  )}
                  {pharmacyDetail.pharmacyDetails?.acceptsInsurance && (
                    <Badge variant="outline">Accepts Insurance</Badge>
                  )}
                </div>

                <Tabs value={detailTab} onValueChange={(value) => setDetailTab(value as PharmacyDetailTab)}>
                  <TabsList className="w-full">
                    <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                    <TabsTrigger value="inventory" className="flex-1">Inventory</TabsTrigger>
                    <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
                    <TabsTrigger value="prescriptions" className="flex-1">Prescriptions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pharmacy Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Contact Person</h4>
                            <p>{pharmacyDetail.name || 'Not provided'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                            <p>{pharmacyDetail.email}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                            <p>{pharmacyDetail.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                            <p>{pharmacyDetail.address ? `${pharmacyDetail.address}, ${pharmacyDetail.pincode || ''}` : 'Not provided'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">License Number</h4>
                            <p>{pharmacyDetail.pharmacyDetails?.licenseNumber || 'Not provided'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">License Expiry</h4>
                            <p>{pharmacyDetail.pharmacyDetails?.licenseExpiryDate || 'Not provided'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">GST Number</h4>
                            <p>{pharmacyDetail.pharmacyDetails?.gstNumber || 'Not provided'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Working Hours</h4>
                            <p>{pharmacyDetail.pharmacyDetails?.workingHours || 'Not provided'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Orders</p>
                            <h3 className="text-2xl font-bold mt-1">{pharmacyDetail.stats?.orderCount || 0}</h3>
                          </div>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Pending Orders</p>
                            <h3 className="text-2xl font-bold mt-1">{pharmacyDetail.stats?.pendingOrderCount || 0}</h3>
                          </div>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Sales</p>
                            <h3 className="text-2xl font-bold mt-1">₹{(pharmacyDetail.stats?.totalSales || 0).toLocaleString()}</h3>
                          </div>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Inventory Items</p>
                            <h3 className="text-2xl font-bold mt-1">{pharmacyDetail.stats?.inventoryCount || 0}</h3>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="inventory" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Inventory</CardTitle>
                        <CardDescription>Manage pharmacy stock levels and pricing</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {pharmacyDetail.inventory?.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pharmacyDetail.inventory.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">
                                    {item.product?.name || `Product ID: ${item.productId}`}
                                  </TableCell>
                                  <TableCell>₹{item.price}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={
                                        item.status === 'available' ? 'success' :
                                        item.status === 'low_stock' ? 'warning' :
                                        'destructive'
                                      }
                                    >
                                      {item.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-4">
                            <Pill className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="mt-2">No inventory data available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="orders" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Orders</CardTitle>
                        <CardDescription>Order history and fulfillment status</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {pharmacyDetail.orders?.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pharmacyDetail.orders.map((order) => (
                                <TableRow key={order.id}>
                                  <TableCell className="font-medium">#{order.id}</TableCell>
                                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                  <TableCell>{order.customerName || `Customer #${order.customerId}`}</TableCell>
                                  <TableCell>₹{order.totalAmount}</TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={
                                        order.status === 'delivered' ? 'success' :
                                        order.status === 'processing' ? 'outline' :
                                        order.status === 'shipped' ? 'secondary' : 
                                        'default'
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
                            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="mt-2">No orders yet</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="prescriptions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pending Prescriptions</CardTitle>
                        <CardDescription>Prescriptions awaiting verification</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {pharmacyDetail.pendingPrescriptions?.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Upload Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pharmacyDetail.pendingPrescriptions.map((prescription) => (
                                <TableRow key={prescription.id}>
                                  <TableCell className="font-medium">{prescription.id}</TableCell>
                                  <TableCell>{prescription.customerName || `Customer #${prescription.customerId}`}</TableCell>
                                  <TableCell>{new Date(prescription.uploadDate).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <Badge variant="warning">
                                      {prescription.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button variant="outline" size="sm">
                                      <FileText className="h-4 w-4 mr-2" />
                                      View
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-4">
                            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="mt-2">No pending prescriptions</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p>Failed to load pharmacy details. Please try again.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default PharmacyManagement;