import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Edit, 
  Trash2,
  MoreHorizontal,
  Download,
  Upload,
  Tag,
  Box,
  Pill,
  AlertCircle,
  PackageCheck,
  ImagePlus,
  Percent,
  Star,
  CheckCircle2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import OptimizedImage from "./OptimizedImage";

// Type definitions
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  subcategory?: string;
  brand: string;
  manufacturer: string;
  composition: string;
  stockQuantity: number;
  sku: string;
  images: string[];
  tags: string[];
  dosageForm: string;
  requiresPrescription: boolean;
  sideEffects?: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image?: string;
}

const ProductManagement = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewProductDialogOpen, setIsViewProductDialogOpen] = useState(false);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const { toast } = useToast();
  
  // File input ref for image uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch products query
  const { 
    data: products = [], 
    isLoading: isLoadingProducts, 
    error: productsError 
  } = useQuery({
    queryKey: ['/api/admin/products'],
    queryFn: async () => {
      try {
        // For development purposes, returning mock data
        // In production, this would be an API call
        return getMockProducts();
      } catch (err) {
        console.error('Error fetching products:', err);
        throw err;
      }
    }
  });
  
  // Fetch categories query
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      try {
        // For development purposes, returning mock data
        return getMockCategories();
      } catch (err) {
        console.error('Error fetching categories:', err);
        throw err;
      }
    }
  });
  
  // Mock data for development
  const getMockProducts = (): Product[] => {
    return [
      {
        id: 1,
        name: 'Paracetamol 500mg',
        description: 'Paracetamol is used to treat headaches, muscle aches, arthritis, backaches, toothaches, colds, and fevers.',
        price: 120,
        salePrice: 99,
        category: 'Pain Relief',
        subcategory: 'Analgesics',
        brand: 'Crocin',
        manufacturer: 'GSK Pharmaceuticals',
        composition: 'Paracetamol 500mg',
        stockQuantity: 500,
        sku: 'PARA-500-TAB',
        images: [
          'https://via.placeholder.com/300',
          'https://via.placeholder.com/300'
        ],
        tags: ['fever', 'headache', 'pain relief'],
        dosageForm: 'Tablet',
        requiresPrescription: false,
        sideEffects: ['Nausea', 'Rash', 'Liver damage (rare)'],
        rating: 4.5,
        reviewCount: 120,
        featured: true,
        status: 'active',
        createdAt: '2023-01-15',
        updatedAt: '2024-11-20'
      },
      {
        id: 2,
        name: 'Azithromycin 500mg',
        description: 'Azithromycin is used to treat a wide variety of bacterial infections.',
        price: 180,
        category: 'Antibiotics',
        subcategory: 'Macrolides',
        brand: 'Zithromax',
        manufacturer: 'Pfizer',
        composition: 'Azithromycin 500mg',
        stockQuantity: 250,
        sku: 'AZI-500-TAB',
        images: [
          'https://via.placeholder.com/300'
        ],
        tags: ['antibiotics', 'infection'],
        dosageForm: 'Tablet',
        requiresPrescription: true,
        sideEffects: ['Diarrhea', 'Nausea', 'Abdominal pain'],
        rating: 4.2,
        reviewCount: 85,
        featured: false,
        status: 'active',
        createdAt: '2023-02-18',
        updatedAt: '2024-10-05'
      },
      {
        id: 3,
        name: 'Vitamin D3 60000 IU',
        description: 'Vitamin D3 helps your body absorb calcium and phosphorus.',
        price: 220,
        salePrice: 199,
        category: 'Vitamins & Supplements',
        subcategory: 'Vitamin D',
        brand: 'HealthVit',
        manufacturer: 'Health Supplements Inc',
        composition: 'Cholecalciferol 60000 IU',
        stockQuantity: 300,
        sku: 'VITD3-60K-CAP',
        images: [
          'https://via.placeholder.com/300'
        ],
        tags: ['vitamin', 'bone health', 'immunity'],
        dosageForm: 'Capsule',
        requiresPrescription: false,
        rating: 4.7,
        reviewCount: 95,
        featured: true,
        status: 'active',
        createdAt: '2023-03-10',
        updatedAt: '2024-12-01'
      },
      {
        id: 4,
        name: 'Blood Glucose Monitor',
        description: 'Device for measuring blood glucose levels for diabetic patients.',
        price: 1800,
        salePrice: 1499,
        category: 'Medical Devices',
        subcategory: 'Diabetes Care',
        brand: 'AccuCheck',
        manufacturer: 'Roche Diagnostics',
        composition: 'N/A',
        stockQuantity: 50,
        sku: 'BGL-MON-001',
        images: [
          'https://via.placeholder.com/300',
          'https://via.placeholder.com/300',
          'https://via.placeholder.com/300'
        ],
        tags: ['diabetes', 'device', 'monitor'],
        dosageForm: 'Device',
        requiresPrescription: false,
        rating: 4.8,
        reviewCount: 65,
        featured: true,
        status: 'active',
        createdAt: '2023-04-05',
        updatedAt: '2024-11-15'
      },
      {
        id: 5,
        name: 'Insulin Pen Needles',
        description: 'Disposable needles for insulin pens for diabetic patients.',
        price: 350,
        category: 'Medical Supplies',
        subcategory: 'Diabetes Care',
        brand: 'NovoFine',
        manufacturer: 'Novo Nordisk',
        composition: 'N/A',
        stockQuantity: 200,
        sku: 'INS-PEN-NDL',
        images: [
          'https://via.placeholder.com/300'
        ],
        tags: ['diabetes', 'insulin', 'needles'],
        dosageForm: 'Medical Supply',
        requiresPrescription: true,
        rating: 4.3,
        reviewCount: 45,
        featured: false,
        status: 'active',
        createdAt: '2023-05-20',
        updatedAt: '2024-10-30'
      },
      {
        id: 6,
        name: 'Cetrizine 10mg',
        description: 'Antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, itching, and sneezing.',
        price: 90,
        category: 'Allergy & Sinus',
        subcategory: 'Antihistamines',
        brand: 'Zyrtec',
        manufacturer: 'Johnson & Johnson',
        composition: 'Cetirizine Hydrochloride 10mg',
        stockQuantity: 400,
        sku: 'CET-10-TAB',
        images: [
          'https://via.placeholder.com/300'
        ],
        tags: ['allergy', 'antihistamine'],
        dosageForm: 'Tablet',
        requiresPrescription: false,
        sideEffects: ['Drowsiness', 'Dry mouth', 'Fatigue'],
        rating: 4.0,
        reviewCount: 72,
        featured: false,
        status: 'inactive',
        createdAt: '2023-06-18',
        updatedAt: '2024-09-20'
      }
    ];
  };
  
  const getMockCategories = (): Category[] => {
    return [
      {
        id: 1,
        name: 'Pain Relief',
        description: 'Medications to alleviate pain',
        image: 'https://via.placeholder.com/100'
      },
      {
        id: 2,
        name: 'Antibiotics',
        description: 'Medications that kill or stop the growth of bacteria',
        image: 'https://via.placeholder.com/100'
      },
      {
        id: 3,
        name: 'Vitamins & Supplements',
        description: 'Nutritional supplements to promote health',
        image: 'https://via.placeholder.com/100'
      },
      {
        id: 4,
        name: 'Medical Devices',
        description: 'Equipment used for medical purposes',
        image: 'https://via.placeholder.com/100'
      },
      {
        id: 5,
        name: 'Medical Supplies',
        description: 'Consumable supplies used in medical care',
        image: 'https://via.placeholder.com/100'
      },
      {
        id: 6,
        name: 'Allergy & Sinus',
        description: 'Products for allergy and sinus symptoms',
        image: 'https://via.placeholder.com/100'
      }
    ];
  };
  
  // Get filtered products based on search query, category filter, and status filter
  const getFilteredProducts = () => {
    return products.filter(product => {
      // Filter by search query
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !product.brand.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.sku.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.composition.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by category
      if (categoryFilter !== 'all' && product.category !== categoryFilter) {
        return false;
      }
      
      // Filter by status
      if (statusFilter !== 'all' && product.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  };
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredProducts = getFilteredProducts();
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Handle view product details
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewProductDialogOpen(true);
  };
  
  // Handle add new product
  const handleAddProduct = () => {
    setIsAddProductDialogOpen(true);
  };
  
  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditProductDialogOpen(true);
  };
  
  // Handle delete product (in a real app this would call an API)
  const handleDeleteProduct = (productId: number) => {
    // Show confirmation dialog
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      // Here you would call an API to delete the product
      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully",
        variant: "default",
      });
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };
  
  // Calculate discount percentage
  const calculateDiscount = (originalPrice: number, salePrice: number) => {
    if (!salePrice || originalPrice <= 0) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };
  
  // Handle file selection
  const handleFileSelection = () => {
    fileInputRef.current?.click();
  };
  
  // Export products to CSV
  const handleExportProducts = () => {
    setIsExporting(true);
    
    // Simulate export delay
    setTimeout(() => {
      // Convert products to CSV format
      const headers = ["ID", "Name", "Price", "Sale Price", "Category", "Brand", "Stock", "SKU", "Status"];
      const csvContent = [
        headers.join(','),
        ...getFilteredProducts().map(product => [
          product.id,
          `"${product.name}"`,
          product.price,
          product.salePrice || '',
          `"${product.category}"`,
          `"${product.brand}"`,
          product.stockQuantity,
          product.sku,
          product.status
        ].join(','))
      ].join('\n');
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'pillnow_products.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
      
      toast({
        title: "Export Successful",
        description: "Product data has been exported to CSV",
        variant: "default",
      });
    }, 1500);
  };
  
  // Handle import products
  const handleImportProducts = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsImporting(true);
        
        // Simulate import delay
        setTimeout(() => {
          setIsImporting(false);
          
          toast({
            title: "Import Successful",
            description: "Product data has been imported",
            variant: "default",
          });
        }, 1500);
      }
    };
    input.click();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search products by name, brand, SKU..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={handleExportProducts}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={handleImportProducts}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import
                </>
              )}
            </Button>
            
            <Button onClick={handleAddProduct}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Products Database</CardTitle>
              <CardDescription>
                Manage your entire product catalog efficiently.
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
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : productsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load products. Please try again later.</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.length > 0 ? (
                      currentItems.map(product => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 border rounded-md overflow-hidden flex-shrink-0">
                                <OptimizedImage
                                  src={product.images[0] || "https://via.placeholder.com/100?text=No+Image"}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              {product.salePrice ? (
                                <>
                                  <div className="text-sm font-medium">{formatCurrency(product.salePrice)}</div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs line-through text-gray-500">{formatCurrency(product.price)}</span>
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      -{calculateDiscount(product.price, product.salePrice)}%
                                    </Badge>
                                  </div>
                                </>
                              ) : (
                                <div className="text-sm font-medium">{formatCurrency(product.price)}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gray-50">
                              <span className="whitespace-nowrap">{product.category}</span>
                            </Badge>
                            {product.subcategory && (
                              <div className="text-xs text-gray-500 mt-1">{product.subcategory}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className={`text-sm ${product.stockQuantity < 50 ? 'text-red-600 font-medium' : ''}`}>
                              {product.stockQuantity} units
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                product.status === 'active' 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : product.status === 'inactive'
                                    ? 'bg-gray-100 text-gray-800 border-gray-200'
                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                              }
                            >
                              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                            </Badge>
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
                                <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                                  <PackageCheck className="mr-2 h-4 w-4" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit Product</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteProduct(product.id)}
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
                          <div className="text-gray-500">No products found matching your criteria</div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination controls */}
              {filteredProducts.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
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
      
      {/* View Product Details Dialog */}
      <Dialog open={isViewProductDialogOpen} onOpenChange={setIsViewProductDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View complete information about this product
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Images Gallery */}
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden aspect-square">
                    <OptimizedImage
                      src={selectedProduct.images[0] || "https://via.placeholder.com/500?text=No+Image"}
                      alt={selectedProduct.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedProduct.images.map((image, index) => (
                        <div key={index} className="border rounded-md overflow-hidden w-16 h-16 flex-shrink-0">
                          <OptimizedImage
                            src={image}
                            alt={`${selectedProduct.name} - Image ${index + 1}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Product Basic Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(selectedProduct.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{selectedProduct.rating} ({selectedProduct.reviewCount} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    {selectedProduct.salePrice ? (
                      <>
                        <div className="text-2xl font-bold text-primary">{formatCurrency(selectedProduct.salePrice)}</div>
                        <div className="text-sm line-through text-gray-500">{formatCurrency(selectedProduct.price)}</div>
                        <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                          {calculateDiscount(selectedProduct.price, selectedProduct.salePrice)}% OFF
                        </Badge>
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-primary">{formatCurrency(selectedProduct.price)}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-100 text-gray-800">
                        {selectedProduct.category}
                      </Badge>
                      {selectedProduct.subcategory && (
                        <Badge variant="outline" className="bg-gray-50">
                          {selectedProduct.subcategory}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={selectedProduct.stockQuantity > 0 ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}>
                        {selectedProduct.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                      <span className="text-sm">{selectedProduct.stockQuantity} units available</span>
                    </div>
                    
                    {selectedProduct.requiresPrescription && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Prescription Required
                      </Badge>
                    )}
                    
                    {selectedProduct.featured && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        Featured Product
                      </Badge>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                    <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Product Details Tabs */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full mb-4 grid grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="composition">Composition</TabsTrigger>
                  <TabsTrigger value="sideEffects">Side Effects</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                </TabsList>
                
                {/* Details Tab */}
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-500">Brand</Label>
                        <div className="font-medium">{selectedProduct.brand}</div>
                      </div>
                      <div>
                        <Label className="text-gray-500">Manufacturer</Label>
                        <div className="font-medium">{selectedProduct.manufacturer}</div>
                      </div>
                      <div>
                        <Label className="text-gray-500">Dosage Form</Label>
                        <div className="font-medium">{selectedProduct.dosageForm}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-500">SKU</Label>
                        <div className="font-medium">{selectedProduct.sku}</div>
                      </div>
                      <div>
                        <Label className="text-gray-500">Tags</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedProduct.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-500">Last Updated</Label>
                        <div className="font-medium">{selectedProduct.updatedAt}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Composition Tab */}
                <TabsContent value="composition">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Composition Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-500">Active Ingredients</Label>
                          <div className="mt-1 font-medium">{selectedProduct.composition}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Side Effects Tab */}
                <TabsContent value="sideEffects">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Possible Side Effects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedProduct.sideEffects && selectedProduct.sideEffects.length > 0 ? (
                        <ul className="space-y-1 list-disc pl-5">
                          {selectedProduct.sideEffects.map((effect, index) => (
                            <li key={index} className="text-sm">
                              {effect}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No side effects information available.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Inventory Tab */}
                <TabsContent value="inventory">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Inventory Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-500">Current Stock</Label>
                          <div className="font-medium">{selectedProduct.stockQuantity} units</div>
                        </div>
                        <div>
                          <Label className="text-gray-500">Status</Label>
                          <div className="font-medium capitalize">{selectedProduct.status}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <DialogFooter className="flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => handleEditProduct(selectedProduct)}
                >
                  <Edit className="h-4 w-4" />
                  Edit Product
                </Button>
                <Button onClick={() => setIsViewProductDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Product and Edit Product dialogs would go here */}
      {/* These would be complex forms with multiple sections */}
      
      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        multiple
        onChange={(e) => {
          // Handle file upload logic here
          console.log('Files selected:', e.target.files);
          // Clear the input value to allow selecting the same file again
          e.target.value = '';
        }}
      />
    </div>
  );
};

export default ProductManagement;