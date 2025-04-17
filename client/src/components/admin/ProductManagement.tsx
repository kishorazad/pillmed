import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Image, Edit, Trash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define form schema
const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().optional(),
  brand: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  discountedPrice: z.coerce.number().positive("Discounted price must be positive").optional(),
  categoryId: z.coerce.number().int("Category must be selected"),
  quantity: z.string().min(1, "Quantity is required"),
  inStock: z.boolean().default(true),
  imageUrl: z.string().optional(),
  isFeatured: z.boolean().default(false),
  rating: z.coerce.number().min(0).max(5).optional(),
  ratingCount: z.coerce.number().int().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductManagement: React.FC = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  // Fetch categories for dropdown
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormValues) => {
      // If there's a file selected, upload it first
      if (selectedFile) {
        setIsUploading(true);
        
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        try {
          // Upload the image
          const uploadResponse = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image');
          }
          
          const { imageUrl } = await uploadResponse.json();
          // Add the image URL to the product data
          productData.imageUrl = imageUrl;
        } catch (error) {
          console.error('Image upload error:', error);
          throw new Error('Failed to upload image');
        } finally {
          setIsUploading(false);
        }
      }
      
      // Now create the product with image URL if available
      const response = await apiRequest('POST', '/api/admin/products', productData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product created",
        description: "The product has been added successfully.",
      });
      setIsAddDialogOpen(false);
      setSelectedFile(null);
      setImagePreview(null);
      form.reset();
    },
    onError: (error: Error) => {
      console.error('Create product error:', error);
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      price: 0,
      discountedPrice: 0,
      categoryId: 0,
      quantity: "",
      inStock: true,
      imageUrl: "",
      isFeatured: false,
      rating: 0,
      ratingCount: 0,
    },
  });

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Clean up the preview URL when component unmounts
      return () => URL.revokeObjectURL(previewUrl);
    }
  };

  // Form submission handler
  const onSubmit = (data: ProductFormValues) => {
    createProductMutation.mutate(data);
  };

  // If loading
  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#10847e] hover:bg-[#10847e]/90">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill out the form below to add a new product to the database.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                  </TabsList>
                  
                  {/* Basic Information */}
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category*</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter brand name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)*</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="discountedPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discounted Price (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Size/Quantity*</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., 10ml, 30 tablets, 100g" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Details */}
                  <TabsContent value="details" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter product description" 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating (0-5)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" min="0" max="5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ratingCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating Count</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="inStock"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">In Stock</FormLabel>
                              <FormDescription>
                                Is this product currently available?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Featured</FormLabel>
                              <FormDescription>
                                Show in featured products?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  {/* Images */}
                  <TabsContent value="images" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <Label htmlFor="product-image">Product Image</Label>
                      <div className="grid gap-4">
                        <Input
                          id="product-image"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        
                        {imagePreview && (
                          <div className="mt-2 relative border rounded-md overflow-hidden">
                            <img 
                              src={imagePreview} 
                              alt="Product Preview" 
                              className="w-full h-auto max-h-[200px] object-contain"
                            />
                          </div>
                        )}
                        
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL (optional)</FormLabel>
                              <FormDescription>
                                If you don't upload an image, you can provide an image URL instead.
                              </FormDescription>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/image.jpg" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#10847e] hover:bg-[#10847e]/90"
                    disabled={createProductMutation.isPending || isUploading}
                  >
                    {(createProductMutation.isPending || isUploading) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Product
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your product inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Array.isArray(products) && products.length > 0 ? (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: any) => {
                    const category = Array.isArray(categories) 
                      ? categories.find((c: any) => c.id === product.categoryId)
                      : undefined;
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              <Image className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.brand || "—"}</TableCell>
                        <TableCell>
                          ₹{product.discountedPrice || product.price}
                          {product.discountedPrice && (
                            <span className="text-xs text-gray-500 line-through ml-2">
                              ₹{product.price}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{category?.name || "—"}</TableCell>
                        <TableCell>
                          {product.inStock ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                              In Stock
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                              Out of Stock
                            </Badge>
                          )}
                          {product.isFeatured && (
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 hover:bg-blue-50">
                              Featured
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No products found. Add your first product using the button above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagement;