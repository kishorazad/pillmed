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
  Heart,
  Calendar,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import OptimizedImage from './OptimizedImage';

// Type definitions
interface HealthTip {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  authorType: 'admin' | 'doctor' | 'hospital';
  image?: string;
  featured: boolean;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt?: string;
  visibilityLevel: 'public' | 'subscribers' | 'members';
}

const HealthTipsManagement = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddTipDialogOpen, setIsAddTipDialogOpen] = useState(false);
  const [isEditTipDialogOpen, setIsEditTipDialogOpen] = useState(false);
  const [isViewTipDialogOpen, setIsViewTipDialogOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState<HealthTip | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // New tip form state
  const [newTip, setNewTip] = useState<Partial<HealthTip>>({
    title: '',
    content: '',
    category: '',
    tags: [],
    authorType: 'admin',
    featured: false,
    status: 'draft',
    visibilityLevel: 'public'
  });
  
  // Tag input state
  const [tagInput, setTagInput] = useState('');
  
  // File input ref for image uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  
  // Fetch health tips
  const { 
    data: healthTips = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/health-tips'],
    queryFn: async () => {
      try {
        // For development purposes, returning mock data
        // In production, this would be an API call
        return getMockHealthTips();
      } catch (err) {
        console.error('Error fetching health tips:', err);
        throw err;
      }
    }
  });
  
  // Mock data for development
  const getMockHealthTips = (): HealthTip[] => {
    return [
      {
        id: 1,
        title: "Stay Hydrated Throughout the Day",
        content: "Drinking at least 8 glasses of water daily helps maintain energy levels, improves skin health, and supports proper organ function. Try keeping a water bottle with you as a reminder to drink regularly.",
        category: "Wellness",
        tags: ["hydration", "water", "health"],
        author: "Dr. Anil Kumar",
        authorType: "doctor",
        image: "https://via.placeholder.com/400x250?text=Hydration",
        featured: true,
        status: "published",
        createdAt: "2025-02-15",
        updatedAt: "2025-03-10",
        visibilityLevel: "public"
      },
      {
        id: 2,
        title: "Importance of Regular Exercise",
        content: "Regular physical activity for at least 30 minutes daily can significantly reduce the risk of heart disease, improve mental health, and help maintain a healthy weight. Even simple activities like walking can make a difference.",
        category: "Fitness",
        tags: ["exercise", "fitness", "heart health"],
        author: "Dr. Priya Sharma",
        authorType: "doctor",
        image: "https://via.placeholder.com/400x250?text=Exercise",
        featured: true,
        status: "published",
        createdAt: "2025-01-20",
        visibilityLevel: "public"
      },
      {
        id: 3,
        title: "Managing Stress with Meditation",
        content: "Practice mindfulness meditation for 10-15 minutes daily to reduce stress levels, improve focus, and promote emotional well-being. Find a quiet space, focus on your breathing, and gently bring your attention back when your mind wanders.",
        category: "Mental Health",
        tags: ["meditation", "stress", "mindfulness"],
        author: "Apollo Hospital",
        authorType: "hospital",
        image: "https://via.placeholder.com/400x250?text=Meditation",
        featured: false,
        status: "published",
        createdAt: "2025-03-05",
        visibilityLevel: "public"
      },
      {
        id: 4,
        title: "Balanced Diet for Better Health",
        content: "A balanced diet rich in fruits, vegetables, whole grains, lean proteins, and healthy fats provides essential nutrients for optimal body function. Try to include a variety of colorful foods in your meals to ensure you're getting a wide range of nutrients.",
        category: "Nutrition",
        tags: ["diet", "nutrition", "healthy eating"],
        author: "Admin Team",
        authorType: "admin",
        image: "https://via.placeholder.com/400x250?text=Balanced+Diet",
        featured: true,
        status: "published",
        createdAt: "2025-02-28",
        visibilityLevel: "public"
      },
      {
        id: 5,
        title: "Improving Sleep Quality",
        content: "Quality sleep is essential for physical and mental recovery. Maintain a regular sleep schedule, create a comfortable sleep environment, limit screen time before bed, and avoid caffeine and heavy meals in the evening for better sleep quality.",
        category: "Wellness",
        tags: ["sleep", "rest", "wellness"],
        author: "Dr. Vikram Singh",
        authorType: "doctor",
        featured: false,
        status: "draft",
        createdAt: "2025-03-12",
        visibilityLevel: "subscribers"
      },
      {
        id: 6,
        title: "Understanding Cholesterol Levels",
        content: "Knowing your cholesterol numbers is important for heart health. Aim for total cholesterol under 200 mg/dL, LDL (bad) cholesterol under 100 mg/dL, and HDL (good) cholesterol over 60 mg/dL. Regular testing and a heart-healthy lifestyle can help maintain optimal levels.",
        category: "Heart Health",
        tags: ["cholesterol", "heart health", "prevention"],
        author: "City Heart Hospital",
        authorType: "hospital",
        image: "https://via.placeholder.com/400x250?text=Cholesterol",
        featured: false,
        status: "published",
        createdAt: "2025-01-05",
        visibilityLevel: "members"
      }
    ];
  };
  
  // Health tip categories
  const categories = [
    "Wellness",
    "Fitness",
    "Nutrition",
    "Mental Health",
    "Heart Health",
    "Diabetes Care",
    "Women's Health",
    "Men's Health",
    "Child Health",
    "Senior Health",
    "Seasonal Health"
  ];
  
  // Get filtered health tips
  const getFilteredHealthTips = () => {
    return healthTips.filter(tip => {
      // Filter by search query
      if (searchQuery && !tip.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !tip.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !tip.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Filter by category
      if (categoryFilter !== 'all' && tip.category !== categoryFilter) {
        return false;
      }
      
      // Filter by status
      if (statusFilter !== 'all' && tip.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  };
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredTips = getFilteredHealthTips();
  const currentTips = filteredTips.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTips.length / itemsPerPage);
  
  // Handle view tip
  const handleViewTip = (tip: HealthTip) => {
    setSelectedTip(tip);
    setIsViewTipDialogOpen(true);
  };
  
  // Handle add new tip dialog
  const handleAddTipDialog = () => {
    setNewTip({
      title: '',
      content: '',
      category: '',
      tags: [],
      authorType: 'admin',
      featured: false,
      status: 'draft',
      visibilityLevel: 'public'
    });
    setTagInput('');
    setIsAddTipDialogOpen(true);
  };
  
  // Handle edit tip dialog
  const handleEditTipDialog = (tip: HealthTip) => {
    setSelectedTip(tip);
    setNewTip({ ...tip });
    setTagInput('');
    setIsEditTipDialogOpen(true);
  };
  
  // Handle delete tip
  const handleDeleteTip = (tipId: number) => {
    // Show confirmation dialog
    if (confirm('Are you sure you want to delete this health tip? This action cannot be undone.')) {
      // Here you would call an API to delete the tip
      toast({
        title: "Health Tip Deleted",
        description: "The health tip has been deleted successfully",
        variant: "default",
      });
    }
  };
  
  // Handle input change for new tip form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTip(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select change for new tip form
  const handleSelectChange = (name: string, value: string) => {
    setNewTip(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle switch change for new tip form
  const handleSwitchChange = (name: string, checked: boolean) => {
    setNewTip(prev => ({ ...prev, [name]: checked }));
  };
  
  // Handle add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !newTip.tags?.includes(tagInput.trim())) {
      setNewTip(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  // Handle remove tag
  const handleRemoveTag = (tag: string) => {
    setNewTip(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
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
      setNewTip(prev => ({
        ...prev,
        image: URL.createObjectURL(file)
      }));
    }
  };
  
  // Handle save new tip
  const handleSaveTip = () => {
    // Validate form
    if (!newTip.title || !newTip.content || !newTip.category) {
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
      
      // If editing an existing tip
      if (selectedTip) {
        toast({
          title: "Health Tip Updated",
          description: "The health tip has been updated successfully",
          variant: "default",
        });
        setIsEditTipDialogOpen(false);
      } 
      // If adding a new tip
      else {
        toast({
          title: "Health Tip Created",
          description: "The new health tip has been created successfully",
          variant: "default",
        });
        setIsAddTipDialogOpen(false);
      }
      
      // Reset form
      setNewTip({
        title: '',
        content: '',
        category: '',
        tags: [],
        authorType: 'admin',
        featured: false,
        status: 'draft',
        visibilityLevel: 'public'
      });
    }, 1000);
  };
  
  // Get author icon
  const getAuthorTypeIcon = (authorType: string) => {
    switch (authorType) {
      case 'admin':
        return <User className="h-4 w-4" />;
      case 'doctor':
        return <User className="h-4 w-4" />;
      case 'hospital':
        return <Building className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
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
    return status === 'published' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-amber-100 text-amber-800 border-amber-200';
  };
  
  // Get visibility badge style
  const getVisibilityBadgeStyle = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'subscribers':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'members':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Health Tips Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search health tips..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={handleAddTipDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Health Tip
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Health Tips</CardTitle>
              <CardDescription>
                Create and manage health tips for your users
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
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
              <AlertDescription>Failed to load health tips. Please try again later.</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTips.length > 0 ? (
                      currentTips.map((tip) => (
                        <TableRow key={tip.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {tip.image ? (
                                <div className="h-12 w-12 border rounded-md overflow-hidden flex-shrink-0">
                                  <OptimizedImage
                                    src={tip.image}
                                    alt={tip.title}
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="h-12 w-12 border rounded-md overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                                  <Heart className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{tip.title}</div>
                                {tip.featured && (
                                  <Badge className="bg-primary text-white mt-1">Featured</Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gray-50">
                              {tip.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getAuthorTypeIcon(tip.authorType)}
                              <span>{tip.author}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge className={getStatusBadgeStyle(tip.status)}>
                                {tip.status.charAt(0).toUpperCase() + tip.status.slice(1)}
                              </Badge>
                              <div>
                                <Badge className={getVisibilityBadgeStyle(tip.visibilityLevel)}>
                                  {tip.visibilityLevel.charAt(0).toUpperCase() + tip.visibilityLevel.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              <span>{formatDate(tip.createdAt)}</span>
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
                                <DropdownMenuItem onClick={() => handleViewTip(tip)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>View</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditTipDialog(tip)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteTip(tip.id)}
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
                          <div className="text-gray-500">No health tips found matching your criteria</div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination controls */}
              {filteredTips.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTips.length)} of {filteredTips.length} health tips
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <Button
                          key={index}
                          variant={currentPage === index + 1 ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
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
            </>
          )}
        </CardContent>
      </Card>
      
      {/* View Health Tip Dialog */}
      <Dialog open={isViewTipDialogOpen} onOpenChange={setIsViewTipDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Health Tip Details</DialogTitle>
            <DialogDescription>
              View health tip information
            </DialogDescription>
          </DialogHeader>
          
          {selectedTip && (
            <div className="space-y-4">
              {selectedTip.image && (
                <div className="rounded-lg overflow-hidden aspect-video">
                  <OptimizedImage
                    src={selectedTip.image}
                    alt={selectedTip.title}
                    width={700}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{selectedTip.title}</h3>
                {selectedTip.featured && (
                  <Badge className="bg-primary text-white">Featured</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  {getAuthorTypeIcon(selectedTip.authorType)}
                  <span>{selectedTip.author}</span>
                </div>
                <div>•</div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(selectedTip.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusBadgeStyle(selectedTip.status)}>
                  {selectedTip.status.charAt(0).toUpperCase() + selectedTip.status.slice(1)}
                </Badge>
                <Badge className={getVisibilityBadgeStyle(selectedTip.visibilityLevel)}>
                  {selectedTip.visibilityLevel.charAt(0).toUpperCase() + selectedTip.visibilityLevel.slice(1)}
                </Badge>
                <Badge variant="outline" className="bg-gray-50">
                  {selectedTip.category}
                </Badge>
              </div>
              
              <div className="whitespace-pre-line">
                {selectedTip.content}
              </div>
              
              {selectedTip.tags && selectedTip.tags.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="text-sm font-medium mb-1">Tags:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedTip.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-50">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                if (selectedTip) {
                  handleEditTipDialog(selectedTip);
                  setIsViewTipDialogOpen(false);
                }
              }}
            >
              <Edit className="h-4 w-4" />
              Edit Health Tip
            </Button>
            <Button 
              onClick={() => setIsViewTipDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add/Edit Health Tip Dialog */}
      <Dialog 
        open={isAddTipDialogOpen || isEditTipDialogOpen} 
        onOpenChange={(open) => {
          if (isAddTipDialogOpen) setIsAddTipDialogOpen(open);
          if (isEditTipDialogOpen) setIsEditTipDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {isEditTipDialogOpen ? 'Edit Health Tip' : 'Add New Health Tip'}
            </DialogTitle>
            <DialogDescription>
              {isEditTipDialogOpen 
                ? 'Update the health tip information' 
                : 'Create a new health tip for your users'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter health tip title"
                    value={newTip.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={newTip.category} 
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleAddTag}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {newTip.tags && newTip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {newTip.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            className="rounded-full w-4 h-4 inline-flex items-center justify-center text-gray-500 hover:text-gray-700"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Featured Image</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition"
                    onClick={handleImageUpload}
                  >
                    {newTip.image ? (
                      <div className="space-y-2">
                        <div className="relative w-full aspect-video mx-auto rounded-lg overflow-hidden">
                          <OptimizedImage
                            src={newTip.image}
                            alt="Preview"
                            width={600}
                            height={300}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm text-gray-500">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <ImageIcon className="h-10 w-10 text-gray-300 mx-auto" />
                        <p className="text-gray-500">Click to upload an image</p>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF up to 2MB</p>
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
              </TabsContent>
              
              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Enter health tip content"
                    value={newTip.content}
                    onChange={handleInputChange}
                    className="min-h-[200px]"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    name="author"
                    placeholder="Enter author name"
                    value={newTip.author}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="authorType">Author Type</Label>
                  <Select 
                    value={newTip.authorType} 
                    onValueChange={(value) => handleSelectChange('authorType', value as 'admin' | 'doctor' | 'hospital')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select author type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Publication Status</Label>
                  <Select 
                    value={newTip.status} 
                    onValueChange={(value) => handleSelectChange('status', value as 'published' | 'draft')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="visibilityLevel">Visibility Level</Label>
                  <Select 
                    value={newTip.visibilityLevel} 
                    onValueChange={(value) => handleSelectChange('visibilityLevel', value as 'public' | 'subscribers' | 'members')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public (All Users)</SelectItem>
                      <SelectItem value="subscribers">Subscribers Only</SelectItem>
                      <SelectItem value="members">Members Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="featured">Featured Tip</Label>
                    <div className="text-sm text-gray-500">
                      Featured health tips appear prominently on the homepage
                    </div>
                  </div>
                  <Switch
                    id="featured"
                    checked={newTip.featured}
                    onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                if (isAddTipDialogOpen) setIsAddTipDialogOpen(false);
                if (isEditTipDialogOpen) setIsEditTipDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTip}
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
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isEditTipDialogOpen ? 'Update Tip' : 'Save Tip'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthTipsManagement;