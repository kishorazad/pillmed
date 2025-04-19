import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { Link } from 'wouter';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Layout and Admin Components
import AdminLayout from "@/components/admin/AdminLayout";

// Icons
import {
  Building,
  MoreHorizontal,
  Plus,
  Search,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  PauseCircle,
  Clock,
  Edit,
  Trash2,
  AlarmClock,
  Loader2,
} from "lucide-react";

// Types for pharmacy data
interface Pharmacy {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  pincode?: string;
  role: string;
  status?: string;
  pharmacyDetails?: {
    pharmacyName?: string;
    licenseNumber?: string;
    licenseExpiryDate?: string;
    ownerName?: string;
    pharmacistName?: string;
    pharmacistRegistrationNumber?: string;
    gstNumber?: string;
    establishmentYear?: string;
    workingHours?: string;
    deliveryOptions?: string[];
    acceptsInsurance?: boolean;
    hasHomeDelivery?: boolean;
    hasPrescriptionFilling?: boolean;
  };
}

interface PharmaciesResponse {
  pharmacies: Pharmacy[];
  totalPharmacies: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AdminPharmacyManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch pharmacies data with pagination and filters
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery<PharmaciesResponse>({
    queryKey: ['/api/admin/pharmacies', currentPage, searchTerm, statusFilter],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('page', currentPage.toString());
      searchParams.append('limit', '10');
      
      if (searchTerm) {
        searchParams.append('search', searchTerm);
      }
      
      if (statusFilter) {
        searchParams.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/admin/pharmacies?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pharmacies');
      }
      return response.json();
    }
  });

  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    refetch();
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
    refetch();
  };

  // Get status badge component with appropriate color
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'suspended':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => {
            const pageNumber = i + 1;
            // Show first page, current page, and pages around current
            const shouldShowPage = 
              pageNumber === 1 || 
              pageNumber === data.totalPages || 
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
            
            if (!shouldShowPage) {
              if (pageNumber === 2 || pageNumber === data.totalPages - 1) {
                return (
                  <PaginationItem key={`ellipsis-${pageNumber}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            }
            
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  onClick={() => setCurrentPage(pageNumber)}
                  isActive={currentPage === pageNumber}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.totalPages))} 
              disabled={currentPage === data.totalPages}
              className={currentPage === data.totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Pharmacy Management - PillNow Admin</title>
      </Helmet>

      <div className="flex flex-col w-full">
        {/* Header with title and add new button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pharmacy Management</h1>
            <p className="text-muted-foreground">
              Manage pharmacy partners, view inventory and verify prescriptions
            </p>
          </div>
          <Link href="/admin/pharmacies/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add New Pharmacy</span>
            </Button>
          </Link>
        </div>

        {/* Filters and search bar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, email, or phone..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>

          <div className="flex gap-2">
            <div className="w-[180px]">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs for different pharmacy states */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Pharmacies</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle>Pharmacy List</CardTitle>
                <CardDescription>
                  Showing all pharmacies ({data?.totalPharmacies || 0} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : isError ? (
                  <div className="text-center py-8 text-red-500">
                    Error loading pharmacies. Please try again.
                  </div>
                ) : data?.pharmacies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pharmacies found. Try adjusting your search.
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Pharmacy Name</TableHead>
                            <TableHead>Contact Person</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data?.pharmacies.map((pharmacy) => (
                            <TableRow key={pharmacy.id}>
                              <TableCell className="font-medium">{pharmacy.id}</TableCell>
                              <TableCell>{pharmacy.pharmacyDetails?.pharmacyName || pharmacy.name}</TableCell>
                              <TableCell>{pharmacy.name}</TableCell>
                              <TableCell>{pharmacy.email}</TableCell>
                              <TableCell>{pharmacy.phone || 'N/A'}</TableCell>
                              <TableCell>{pharmacy.address ? `${pharmacy.address}, ${pharmacy.pincode || ''}` : 'N/A'}</TableCell>
                              <TableCell>{getStatusBadge(pharmacy.status)}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <Link href={`/admin/pharmacies/${pharmacy.id}`}>
                                      <DropdownMenuItem>View Details</DropdownMenuItem>
                                    </Link>
                                    <Link href={`/admin/pharmacies/${pharmacy.id}/inventory`}>
                                      <DropdownMenuItem>Inventory</DropdownMenuItem>
                                    </Link>
                                    <Link href={`/admin/pharmacies/${pharmacy.id}/orders`}>
                                      <DropdownMenuItem>Orders</DropdownMenuItem>
                                    </Link>
                                    <Link href={`/admin/pharmacies/${pharmacy.id}/prescriptions`}>
                                      <DropdownMenuItem>Prescriptions</DropdownMenuItem>
                                    </Link>
                                    <Link href={`/admin/pharmacies/${pharmacy.id}/edit`}>
                                      <DropdownMenuItem>Edit Pharmacy</DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => {
                                        toast({
                                          title: "Not Implemented",
                                          description: "This feature is coming soon",
                                        });
                                      }}
                                    >
                                      Delete Pharmacy
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {renderPagination()}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle>Pending Approval</CardTitle>
                <CardDescription>
                  Pharmacies waiting for verification and approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  This tab will show pharmacies with pending approval status.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle>Approved Pharmacies</CardTitle>
                <CardDescription>
                  Active and approved pharmacy partners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  This tab will show approved pharmacies.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle>Rejected Pharmacies</CardTitle>
                <CardDescription>
                  Pharmacies that didn't meet verification criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  This tab will show rejected pharmacies.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPharmacyManagement;