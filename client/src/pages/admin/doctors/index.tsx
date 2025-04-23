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
  CardFooter,
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
  DropdownMenuSeparator,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Layout and Admin Components
import AdminLayout from "@/components/admin/AdminLayout";

// Icons
import {
  MoreHorizontal,
  Plus,
  Search,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle,
  XCircle,
  PauseCircle,
  Clock,
  Edit,
  Trash2,
  Stethoscope,
  Calendar,
  Star,
  StarHalf,
  Video,
  Users,
  UserCog,
  BarChart3,
  ExternalLink,
  FileText,
  MessageSquare,
  Loader2,
  Filter,
} from "lucide-react";

// Types for doctor data
interface Doctor {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  pincode?: string;
  role: string;
  status?: string;
  specialty?: string;
  qualification?: string;
  experience?: number;
  rating?: number;
  totalPatients?: number;
  totalAppointments?: number;
  photoUrl?: string;
  fee?: number;
  availableTimes?: string[];
  consultationDuration?: number;
  bio?: string;
  languages?: string[];
  registrationNumber?: string;
  doctorDetails?: {
    specialty?: string;
    qualification?: string;
    experience?: number;
    registrationNumber?: string;
    clinicName?: string;
    clinicAddress?: string;
    consultationFee?: number;
    availableDays?: string[];
    availableTimeSlots?: string[];
    awards?: string[];
    languages?: string[];
    bio?: string;
  };
}

interface DoctorsResponse {
  doctors: Doctor[];
  totalDoctors: number;
  page: number;
  limit: number;
  totalPages: number;
}

// List of medical specialties
const specialties = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Endocrinologist",
  "Gastroenterologist",
  "Gynecologist",
  "Neurologist",
  "Oncologist",
  "Ophthalmologist",
  "Orthopedist",
  "Pediatrician",
  "Psychiatrist",
  "Pulmonologist",
  "Urologist",
  "ENT Specialist",
  "Dentist",
  "Ayurvedic"
];

const AdminDoctorManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  // Lazy loading optimization - only load and render what's needed
  const [tabsInitialized, setTabsInitialized] = useState({
    all: true, // Initialize the "all" tab since it's the default
    pending: false,
    approved: false,
    rejected: false
  });

  // Update initialized tabs when tab changes
  useEffect(() => {
    setTabsInitialized(prev => ({
      ...prev,
      [activeTab]: true
    }));
  }, [activeTab]);

  // Fetch doctors data with pagination and filters - with optimization
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery<DoctorsResponse>({
    queryKey: ['/api/admin/doctors', currentPage, searchTerm, statusFilter, specialtyFilter],
    staleTime: 60000, // Consider data fresh for 1 minute (60000ms) to reduce refetches
    gcTime: 300000, // Keep unused data in cache for 5 minutes
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('page', currentPage.toString());
      searchParams.append('limit', '10');

      if (searchTerm) {
        searchParams.append('search', searchTerm);
      }

      if (statusFilter && statusFilter !== 'all') {
        searchParams.append('status', statusFilter);
      }

      if (specialtyFilter && specialtyFilter !== 'all') {
        searchParams.append('specialty', specialtyFilter);
      }

      // Performance optimization: Cache results for 1 minute when no search/filter applied
      const useCache = !searchTerm && (!statusFilter || statusFilter === 'all') && (!specialtyFilter || specialtyFilter === 'all');

      // This API doesn't exist yet, so we're returning mock data for now
      // Eventually replace with actual API call
      // const response = await fetch(`/api/admin/doctors?${searchParams.toString()}`);

      // Mock data for preview purposes
      const mockData: DoctorsResponse = {
        doctors: [
          {
            id: 1,
            username: "dr.sharma",
            name: "Dr. Rahul Sharma",
            email: "dr.sharma@example.com",
            phone: "9876543210",
            role: "doctor",
            status: "approved",
            specialty: "Cardiologist",
            qualification: "MBBS, MD (Cardiology)",
            experience: 15,
            rating: 4.8,
            totalPatients: 1200,
            totalAppointments: 3500,
            photoUrl: "/profile1.jpg",
            fee: 800,
            doctorDetails: {
              specialty: "Cardiologist",
              qualification: "MBBS, MD (Cardiology)",
              experience: 15,
              registrationNumber: "MCI-12345",
              clinicName: "Heart Care Clinic",
              clinicAddress: "123 Main St, Mumbai",
              consultationFee: 800,
              availableDays: ["Monday", "Wednesday", "Friday"],
              availableTimeSlots: ["10:00 AM - 1:00 PM", "5:00 PM - 8:00 PM"],
              languages: ["English", "Hindi", "Marathi"],
              bio: "Dr. Sharma is a renowned cardiologist with over 15 years of experience in treating heart conditions."
            }
          },
          {
            id: 2,
            username: "dr.patel",
            name: "Dr. Anita Patel",
            email: "dr.patel@example.com",
            phone: "9876543211",
            role: "doctor",
            status: "approved",
            specialty: "Dermatologist",
            qualification: "MBBS, MD (Dermatology)",
            experience: 10,
            rating: 4.6,
            totalPatients: 980,
            totalAppointments: 2800,
            photoUrl: "/profile2.jpg",
            fee: 700,
            doctorDetails: {
              specialty: "Dermatologist",
              qualification: "MBBS, MD (Dermatology)",
              experience: 10,
              registrationNumber: "MCI-23456",
              clinicName: "Skin & Hair Clinic",
              clinicAddress: "456 Park Avenue, Delhi",
              consultationFee: 700,
              availableDays: ["Tuesday", "Thursday", "Saturday"],
              availableTimeSlots: ["11:00 AM - 2:00 PM", "4:00 PM - 7:00 PM"],
              languages: ["English", "Hindi", "Gujarati"],
              bio: "Dr. Patel is specialized in treating skin, hair and nail disorders with a focus on cosmetic dermatology."
            }
          },
          {
            id: 3,
            username: "dr.gupta",
            name: "Dr. Aman Gupta",
            email: "dr.gupta@example.com",
            phone: "9876543212",
            role: "doctor",
            status: "pending",
            specialty: "Pediatrician",
            qualification: "MBBS, DCH",
            experience: 8,
            rating: 4.5,
            totalPatients: 750,
            totalAppointments: 2000,
            photoUrl: "/profile3.jpg",
            fee: 600,
            doctorDetails: {
              specialty: "Pediatrician",
              qualification: "MBBS, DCH",
              experience: 8,
              registrationNumber: "MCI-34567",
              clinicName: "Child Care Center",
              clinicAddress: "789 Children's Road, Bangalore",
              consultationFee: 600,
              availableDays: ["Monday", "Tuesday", "Thursday", "Saturday"],
              availableTimeSlots: ["9:00 AM - 12:00 PM", "4:00 PM - 6:00 PM"],
              languages: ["English", "Hindi", "Kannada"],
              bio: "Dr. Gupta specializes in pediatric care, focusing on child development and adolescent health."
            }
          },
          {
            id: 4,
            username: "dr.reddy",
            name: "Dr. Sanjay Reddy",
            email: "dr.reddy@example.com",
            phone: "9876543213",
            role: "doctor",
            status: "approved",
            specialty: "Orthopedist",
            qualification: "MBBS, MS (Orthopedics)",
            experience: 12,
            rating: 4.7,
            totalPatients: 920,
            totalAppointments: 2700,
            photoUrl: "/profile4.jpg",
            fee: 900,
            doctorDetails: {
              specialty: "Orthopedist",
              qualification: "MBBS, MS (Orthopedics)",
              experience: 12,
              registrationNumber: "MCI-45678",
              clinicName: "Joint & Bone Care",
              clinicAddress: "567 Hospital Road, Hyderabad",
              consultationFee: 900,
              availableDays: ["Monday", "Wednesday", "Friday"],
              availableTimeSlots: ["10:00 AM - 1:00 PM", "5:00 PM - 8:00 PM"],
              languages: ["English", "Hindi", "Telugu"],
              bio: "Dr. Reddy specializes in joint replacements, sports injuries, and spine surgeries."
            }
          },
          {
            id: 5,
            username: "dr.khan",
            name: "Dr. Zoya Khan",
            email: "dr.khan@example.com",
            phone: "9876543214",
            role: "doctor",
            status: "rejected",
            specialty: "Gynecologist",
            qualification: "MBBS, MD (Obstetrics & Gynecology)",
            experience: 9,
            rating: 4.4,
            totalPatients: 650,
            totalAppointments: 1900,
            photoUrl: "/profile5.jpg",
            fee: 750,
            doctorDetails: {
              specialty: "Gynecologist",
              qualification: "MBBS, MD (Obstetrics & Gynecology)",
              experience: 9,
              registrationNumber: "MCI-56789",
              clinicName: "Women's Health Center",
              clinicAddress: "890 Ladies Road, Kolkata",
              consultationFee: 750,
              availableDays: ["Tuesday", "Thursday", "Saturday"],
              availableTimeSlots: ["11:00 AM - 2:00 PM", "4:00 PM - 7:00 PM"],
              languages: ["English", "Hindi", "Bengali"],
              bio: "Dr. Khan focuses on women's reproductive health, pregnancy care, and infertility treatments."
            }
          }
        ],
        totalDoctors: 25,
        page: currentPage,
        limit: 10,
        totalPages: 3
      };

      return mockData;
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
    // If "all" is selected, set empty string to remove filter
    setStatusFilter(value === 'all' ? '' : value);
    setCurrentPage(1); // Reset to first page on filter change
    refetch();
  };

  // Handle specialty filter change
  const handleSpecialtyFilterChange = (value: string) => {
    // If "all" is selected, set empty string to remove filter
    setSpecialtyFilter(value === 'all' ? '' : value);
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

  // Get rating stars
  const getRatingStars = (rating?: number) => {
    if (!rating) return "Not rated";

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const starArray = [];

    for (let i = 0; i < fullStars; i++) {
      starArray.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      starArray.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    return (
      <div className="flex items-center">
        <div className="flex mr-1">
          {starArray}
        </div>
        <span>({rating.toFixed(1)})</span>
      </div>
    );
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, data?.totalPages || 1))} 
              disabled={currentPage === (data?.totalPages || 1)}
              className={currentPage === (data?.totalPages || 1) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Quick stats cards
  const StatsCards = () => {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Doctors</p>
                <h3 className="text-2xl font-bold mt-1">25</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Progress value={78} className="mt-4" />
            <p className="text-xs text-muted-foreground mt-2">78% are actively practicing</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                <h3 className="text-2xl font-bold mt-1">1,248</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <Progress value={65} className="mt-4 bg-blue-100" />
            <p className="text-xs text-muted-foreground mt-2">+12% from previous month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Virtual Consultations</p>
                <h3 className="text-2xl font-bold mt-1">428</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Video className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <Progress value={42} className="mt-4 bg-purple-100" />
            <p className="text-xs text-muted-foreground mt-2">34% of total appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <h3 className="text-2xl font-bold mt-1">7</h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <Progress value={28} className="mt-4 bg-amber-100" />
            <p className="text-xs text-muted-foreground mt-2">Requires verification</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Doctor Management - PillNow Admin</title>
      </Helmet>

      <div className="flex flex-col w-full">
        {/* Header with title and add new button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Doctor Management</h1>
            <p className="text-muted-foreground">
              Manage doctor profiles, specialties, and appointment settings
            </p>
          </div>
          <Link href="/admin/doctors/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add New Doctor</span>
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <StatsCards />

        {/* Filters and search bar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, email, or specialty..."
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
              <Select value={specialtyFilter} onValueChange={handleSpecialtyFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[180px]">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
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

        {/* Tabs for different doctor statuses */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Doctors</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {tabsInitialized.all && (
              <Card>
                <CardHeader className="py-4">
                  <CardTitle>Doctor List</CardTitle>
                  <CardDescription>
                    Showing all doctors ({data?.totalDoctors || 0} total)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : isError ? (
                  <div className="text-center py-8 text-red-500">
                    Error loading doctors. Please try again.
                  </div>
                ) : data?.doctors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No doctors found. Try adjusting your search.
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Specialty</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Patients</TableHead>
                            <TableHead>Fee</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data?.doctors.map((doctor) => (
                            <TableRow key={doctor.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={doctor.photoUrl} alt={doctor.name} />
                                    <AvatarFallback>{doctor.name.substr(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{doctor.name}</div>
                                    <div className="text-xs text-muted-foreground">{doctor.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {doctor.specialty || doctor.doctorDetails?.specialty || "Not specified"}
                                </Badge>
                              </TableCell>
                              <TableCell>{doctor.experience || doctor.doctorDetails?.experience || "N/A"} years</TableCell>
                              <TableCell>{getRatingStars(doctor.rating)}</TableCell>
                              <TableCell>{doctor.totalPatients?.toLocaleString() || "N/A"}</TableCell>
                              <TableCell>₹{doctor.fee || doctor.doctorDetails?.consultationFee || 0}</TableCell>
                              <TableCell>{getStatusBadge(doctor.status)}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <Link href={`/admin/doctors/${doctor.id}`}>
                                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                                    </Link>
                                    <Link href={`/admin/doctors/${doctor.id}/appointments`}>
                                      <DropdownMenuItem>Appointments</DropdownMenuItem>
                                    </Link>
                                    <Link href={`/admin/doctors/${doctor.id}/schedule`}>
                                      <DropdownMenuItem>Manage Schedule</DropdownMenuItem>
                                    </Link>
                                    <Link href={`/admin/doctors/${doctor.id}/edit`}>
                                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuSeparator />
                                    <Link href={`/doctors/${doctor.id}`} target="_blank">
                                      <DropdownMenuItem>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Public Profile
                                      </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => {
                                        toast({
                                          title: "Not Implemented",
                                          description: "This feature is coming soon",
                                        });
                                      }}
                                    >
                                      Delete Doctor
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
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {tabsInitialized.pending && (
              <Card>
                <CardHeader className="py-4">
                  <CardTitle>Pending Approval</CardTitle>
                  <CardDescription>
                    Doctors waiting for verification and approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Specialty</TableHead>
                          <TableHead>Documents</TableHead>
                          <TableHead>Submission Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.doctors.filter(d => d.status === 'pending').map((doctor) => (
                          <TableRow key={doctor.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={doctor.photoUrl} alt={doctor.name} />
                                  <AvatarFallback>{doctor.name.substr(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{doctor.name}</div>
                                  <div className="text-xs text-muted-foreground">{doctor.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {doctor.specialty || doctor.doctorDetails?.specialty || "Not specified"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                <span>4 Documents</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>5 days ago</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" size="sm" className="h-8">
                                  <FileText className="h-3.5 w-3.5 mr-1" />
                                  Review
                                </Button>
                                <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  Approve
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!data?.doctors.some(d => d.status === 'pending') && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No pending approvals at the moment
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {tabsInitialized.approved && (
              <Card>
                <CardHeader className="py-4">
                  <CardTitle>Approved Doctors</CardTitle>
                  <CardDescription>
                    Active and verified doctor accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Specialty</TableHead>
                          <TableHead>Experience</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Patients</TableHead>
                          <TableHead>Consultations</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.doctors.filter(d => d.status === 'approved').map((doctor) => (
                          <TableRow key={doctor.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={doctor.photoUrl} alt={doctor.name} />
                                  <AvatarFallback>{doctor.name.substr(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{doctor.name}</div>
                                  <div className="text-xs text-muted-foreground">{doctor.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {doctor.specialty || doctor.doctorDetails?.specialty || "Not specified"}
                              </Badge>
                            </TableCell>
                            <TableCell>{doctor.experience || doctor.doctorDetails?.experience || "N/A"} years</TableCell>
                            <TableCell>{getRatingStars(doctor.rating)}</TableCell>
                            <TableCell>{doctor.totalPatients?.toLocaleString() || "N/A"}</TableCell>
                            <TableCell>{doctor.totalAppointments?.toLocaleString() || "N/A"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" size="sm" className="h-8">
                                  <UserCog className="h-3.5 w-3.5 mr-1" />
                                  Manage
                                </Button>
                                <Button variant="outline" size="sm" className="h-8">
                                  <BarChart3 className="h-3.5 w-3.5 mr-1" />
                                  Stats
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!data?.doctors.some(d => d.status === 'approved') && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No approved doctors match your search criteria
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {tabsInitialized.rejected && (
              <Card>
                <CardHeader className="py-4">
                  <CardTitle>Rejected Doctors</CardTitle>
                  <CardDescription>
                    Doctors that didn't meet verification criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Specialty</TableHead>
                          <TableHead>Rejection Reason</TableHead>
                          <TableHead>Rejected Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.doctors.filter(d => d.status === 'rejected').map((doctor) => (
                          <TableRow key={doctor.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={doctor.photoUrl} alt={doctor.name} />
                                  <AvatarFallback>{doctor.name.substr(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{doctor.name}</div>
                                  <div className="text-xs text-muted-foreground">{doctor.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {doctor.specialty || doctor.doctorDetails?.specialty || "Not specified"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-red-600">Invalid license documentation</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>14 days ago</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" size="sm" className="h-8">
                                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                  Contact
                                </Button>
                                <Button size="sm" className="h-8">
                                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                  Reconsider
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!data?.doctors.some(d => d.status === 'rejected') && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No rejected doctors found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDoctorManagement;