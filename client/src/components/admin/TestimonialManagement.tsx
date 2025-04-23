import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  MoreHorizontal,
  Calendar,
  AlertCircle,
  ThumbsUp,
  Image as ImageIcon,
  Star,
  Check,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import OptimizedImage from './OptimizedImage';

// Type definitions
interface Testimonial {
  id: number;
  name: string;
  content: string;
  rating: number;
  image?: string;
  location?: string;
  status: 'published' | 'pending' | 'rejected';
  serviceType?: 'Medication Purchase' | 'Doctor Consultation' | 'Lab Test' | 'Health Checkup' | 'Delivery Experience';
  featured: boolean;
  verifiedPurchase: boolean;
  createdAt: string;
}

const TestimonialManagement = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // New testimonial form state
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({
    name: '',
    content: '',
    rating: 5,
    status: 'pending',
    featured: false,
    verifiedPurchase: true
  });
  
  // File input ref for image uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  
  // Fetch testimonials
  const { 
    data: testimonials = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/testimonials'],
    queryFn: async () => {
      try {
        // For development purposes, returning mock data
        // In production, this would be an API call
        return getMockTestimonials();
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        throw err;
      }
    }
  });
  
  // Mock data for development
  const getMockTestimonials = (): Testimonial[] => {
    return [
      {
        id: 1,
        name: "Rajesh Singh",
        content: "I've been using PillNow for ordering my monthly medicines for over a year now. The service is always prompt, and the medicines are delivered on time. The reminders for refills are particularly helpful.",
        rating: 5,
        image: "https://randomuser.me/api/portraits/men/11.jpg",
        location: "Delhi",
        status: "published",
        serviceType: "Medication Purchase",
        featured: true,
        verifiedPurchase: true,
        createdAt: "2025-01-15"
      },
      {
        id: 2,
        name: "Anjali Patel",
        content: "The lab test service is excellent! They came to my home for sample collection exactly at the scheduled time. The reports were delivered digitally within 24 hours, and the technician was very professional.",
        rating: 4,
        image: "https://randomuser.me/api/portraits/women/12.jpg",
        location: "Mumbai",
        status: "published",
        serviceType: "Lab Test",
        featured: false,
        verifiedPurchase: true,
        createdAt: "2025-02-22"
      },
      {
        id: 3,
        name: "Varun Kumar",
        content: "I consulted with a doctor through the app when I was traveling and couldn't visit a clinic. The video consultation was smooth, and the doctor was very attentive. Got my prescription digitally and could order medicines from the same app.",
        rating: 5,
        location: "Bangalore",
        status: "published",
        serviceType: "Doctor Consultation",
        featured: false,
        verifiedPurchase: true,
        createdAt: "2025-03-10"
      },
      {
        id: 4,
        name: "Priya Sharma",
        content: "The delivery service is quite fast, but I received a wrong medicine once. However, their customer service was quick to respond and they replaced it the same day. Overall satisfied with how they handled the issue.",
        rating: 3,
        image: "https://randomuser.me/api/portraits/women/14.jpg",
        location: "Pune",
        status: "published",
        serviceType: "Delivery Experience",
        featured: false,
        verifiedPurchase: true,
        createdAt: "2025-03-28"
      },
      {
        id: 5,
        name: "Ankit Verma",
        content: "Had a comprehensive health checkup package from PillNow. Very professional service. The doctor explained all my reports in detail and gave me practical advice for improvement. Will definitely use again.",
        rating: 5,
        location: "Hyderabad",
        status: "pending",
        serviceType: "Health Checkup",
        featured: false,
        verifiedPurchase: true,
        createdAt: "2025-04-05"
      },
      {
        id: 6,
        name: "Deepika Reddy",
        content: "Used PillNow for getting my elderly parents' medicines delivered monthly. The subscription service works seamlessly. Sometimes I need to remind them about specific medicines, but overall it's been helpful.",
        rating: 4,
        location: "Chennai",
        status: "pending",
        serviceType: "Medication Purchase",
        featured: false,
        verifiedPurchase: true,
        createdAt: "2025-04-12"
      }
    ];
  };
  
  // Get service types
  const serviceTypes = [
    "Medication Purchase",
    "Doctor Consultation",
    "Lab Test",
    "Health Checkup",
    "Delivery Experience"
  ];
  
  // Get filtered testimonials
  const getFilteredTestimonials = () => {
    return testimonials.filter(testimonial => {
      // Filter by search query
      if (searchQuery && !testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !testimonial.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(testimonial.location && testimonial.location.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Filter by status
      if (statusFilter !== 'all' && testimonial.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  };
  
  // Handle view testimonial
  const handleViewTestimonial = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsViewDialogOpen(true);
  };
  
  // Handle add new testimonial dialog
  const handleAddTestimonialDialog = () => {
    setNewTestimonial({
      name: '',
      content: '',
      rating: 5,
      status: 'pending',
      featured: false,
      verifiedPurchase: true
    });
    setIsAddDialogOpen(true);
  };
  
  // Handle edit testimonial dialog
  const handleEditTestimonialDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setNewTestimonial({ ...testimonial });
    setIsEditDialogOpen(true);
  };
  
  // Handle delete testimonial
  const handleDeleteTestimonial = (testimonialId: number) => {
    // Show confirmation dialog
    if (confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) {
      // Here you would call an API to delete the testimonial
      toast({
        title: "Testimonial Deleted",
        description: "The testimonial has been deleted successfully",
        variant: "default",
      });
    }
  };
  
  // Handle input change for new testimonial form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTestimonial(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select change for new testimonial form
  const handleSelectChange = (name: string, value: string) => {
    setNewTestimonial(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle switch change for new testimonial form
  const handleSwitchChange = (name: string, checked: boolean) => {
    setNewTestimonial(prev => ({ ...prev, [name]: checked }));
  };
  
  // Handle rating change
  const handleRatingChange = (rating: number) => {
    setNewTestimonial(prev => ({ ...prev, rating }));
  };
  
  // Handle image upload
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Handle file selection
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server and get a URL
      // For now, we'll just use a placeholder
      setNewTestimonial(prev => ({
        ...prev,
        image: URL.createObjectURL(file)
      }));
    }
  };
  
  // Handle save testimonial
  const handleSaveTestimonial = () => {
    // Validate form
    if (!newTestimonial.name || !newTestimonial.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSaving(false);
      
      // If editing an existing testimonial
      if (selectedTestimonial) {
        toast({
          title: "Testimonial Updated",
          description: "The testimonial has been updated successfully",
          variant: "default",
        });
        setIsEditDialogOpen(false);
      } 
      // If adding a new testimonial
      else {
        toast({
          title: "Testimonial Created",
          description: "The new testimonial has been created successfully",
          variant: "default",
        });
        setIsAddDialogOpen(false);
      }
      
      // Reset form
      setNewTestimonial({
        name: '',
        content: '',
        rating: 5,
        status: 'pending',
        featured: false,
        verifiedPurchase: true
      });
    }, 1000);
  };
  
  // Handle approve testimonial
  const handleApproveTestimonial = (testimonialId: number) => {
    // Here you would call an API to update the testimonial status
    toast({
      title: "Testimonial Approved",
      description: "The testimonial has been published successfully",
      variant: "default",
    });
  };
  
  // Handle reject testimonial
  const handleRejectTestimonial = (testimonialId: number) => {
    // Here you would call an API to update the testimonial status
    toast({
      title: "Testimonial Rejected",
      description: "The testimonial has been rejected",
      variant: "default",
    });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
  
  // Render stars for rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Testimonial Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search testimonials..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={handleAddTestimonialDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Customer Testimonials</CardTitle>
              <CardDescription>
                View and manage testimonials from users
              </CardDescription>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load testimonials. Please try again later.</AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredTestimonials().length > 0 ? (
                    getFilteredTestimonials().map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={testimonial.image} alt={testimonial.name} />
                              <AvatarFallback>{getInitials(testimonial.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{testimonial.name}</div>
                              {testimonial.location && (
                                <div className="text-xs text-gray-500">
                                  {testimonial.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs text-sm line-clamp-2">
                            {testimonial.content}
                          </div>
                          {testimonial.serviceType && (
                            <Badge variant="outline" className="mt-1 text-xs bg-gray-50">
                              {testimonial.serviceType}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {renderStars(testimonial.rating)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getStatusBadgeStyle(testimonial.status)}>
                              {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}
                            </Badge>
                            {testimonial.featured && (
                              <Badge className="bg-primary text-white">
                                Featured
                              </Badge>
                            )}
                            {testimonial.verifiedPurchase && (
                              <div className="flex items-center text-xs text-green-600 gap-1">
                                <Check className="h-3 w-3" />
                                <span>Verified</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(testimonial.createdAt)}
                          </div>
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
                              <DropdownMenuItem onClick={() => handleViewTestimonial(testimonial)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditTestimonialDialog(testimonial)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              {testimonial.status === 'pending' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-green-600"
                                    onClick={() => handleApproveTestimonial(testimonial.id)}
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    <span>Approve</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleRejectTestimonial(testimonial.id)}
                                  >
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    <span>Reject</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTestimonial(testimonial.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        <div className="text-gray-500">No testimonials found matching your criteria</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View Testimonial Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Testimonial Details</DialogTitle>
            <DialogDescription>
              View testimonial information
            </DialogDescription>
          </DialogHeader>
          
          {selectedTestimonial && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedTestimonial.image} alt={selectedTestimonial.name} />
                  <AvatarFallback className="text-lg">{getInitials(selectedTestimonial.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedTestimonial.name}</h3>
                  {selectedTestimonial.location && (
                    <p className="text-sm text-gray-500">{selectedTestimonial.location}</p>
                  )}
                  <div className="mt-1">
                    {renderStars(selectedTestimonial.rating)}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm italic">"{selectedTestimonial.content}"</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusBadgeStyle(selectedTestimonial.status)}>
                  {selectedTestimonial.status.charAt(0).toUpperCase() + selectedTestimonial.status.slice(1)}
                </Badge>
                {selectedTestimonial.featured && (
                  <Badge className="bg-primary text-white">
                    Featured
                  </Badge>
                )}
                {selectedTestimonial.verifiedPurchase && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Check className="h-3 w-3 mr-1" />
                    Verified Purchase
                  </Badge>
                )}
                {selectedTestimonial.serviceType && (
                  <Badge variant="outline" className="bg-gray-50">
                    {selectedTestimonial.serviceType}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Submitted on {formatDate(selectedTestimonial.createdAt)}</span>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                if (selectedTestimonial) {
                  handleEditTestimonialDialog(selectedTestimonial);
                  setIsViewDialogOpen(false);
                }
              }}
            >
              <Edit className="h-4 w-4" />
              Edit Testimonial
            </Button>
            <Button 
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add/Edit Testimonial Dialog */}
      <Dialog 
        open={isAddDialogOpen || isEditDialogOpen} 
        onOpenChange={(open) => {
          if (isAddDialogOpen) setIsAddDialogOpen(open);
          if (isEditDialogOpen) setIsEditDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? 'Edit Testimonial' : 'Add New Testimonial'}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen 
                ? 'Update the testimonial information' 
                : 'Create a new testimonial'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter customer name"
                  value={newTestimonial.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="City, State"
                  value={newTestimonial.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Testimonial Content *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Enter testimonial content"
                value={newTestimonial.content}
                onChange={handleInputChange}
                className="min-h-[120px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-2 pt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className="focus:outline-none"
                      onClick={() => handleRatingChange(i + 1)}
                    >
                      <Star 
                        className={`h-6 w-6 ${i < (newTestimonial.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select 
                  value={newTestimonial.serviceType} 
                  onValueChange={(value) => handleSelectChange('serviceType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Customer Photo</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition"
                onClick={handleImageUpload}
              >
                {newTestimonial.image ? (
                  <div className="space-y-2">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden">
                      <OptimizedImage
                        src={newTestimonial.image}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-500">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <ImageIcon className="h-10 w-10 text-gray-300 mx-auto" />
                    <p className="text-gray-500">Click to upload customer photo</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelection}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={newTestimonial.status} 
                  onValueChange={(value) => handleSelectChange('status', value as 'published' | 'pending' | 'rejected')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="verifiedPurchase" className="cursor-pointer">
                    Verified Purchase
                  </Label>
                  <Switch
                    id="verifiedPurchase"
                    checked={newTestimonial.verifiedPurchase}
                    onCheckedChange={(checked) => handleSwitchChange('verifiedPurchase', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="cursor-pointer">
                    Featured Testimonial
                  </Label>
                  <Switch
                    id="featured"
                    checked={newTestimonial.featured}
                    onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                if (isAddDialogOpen) setIsAddDialogOpen(false);
                if (isEditDialogOpen) setIsEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTestimonial}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  {isEditDialogOpen ? 'Update Testimonial' : 'Save Testimonial'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialManagement;