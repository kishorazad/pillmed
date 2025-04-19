import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// UI Components
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Icons
import { ArrowLeft, Building2, CalendarIcon, HelpCircle, Save } from "lucide-react";

// Layout
import AdminLayout from "@/components/admin/AdminLayout";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Define schema for form validation
const pharmacyFormSchema = z.object({
  // Basic user information
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }).optional(),
  address: z.string().optional(),
  pincode: z.string().min(6, { message: "Pincode must be 6 digits" }).optional(),
  role: z.enum(["pharmacy", "chemist"]),
  
  // Pharmacy-specific details
  pharmacyDetails: z.object({
    pharmacyName: z.string().min(2, { message: "Pharmacy name must be at least 2 characters" }),
    licenseNumber: z.string().min(5, { message: "License number must be at least 5 characters" }),
    licenseExpiryDate: z.date(),
    ownerName: z.string().optional(),
    pharmacistName: z.string().optional(),
    pharmacistRegistrationNumber: z.string().optional(),
    gstNumber: z.string().optional(),
    establishmentYear: z.string().optional(),
    workingHours: z.string().optional(),
    deliveryOptions: z.array(z.string()).optional(),
    acceptsInsurance: z.boolean().optional(),
    hasHomeDelivery: z.boolean().optional(),
    hasPrescriptionFilling: z.boolean().optional()
  }),
  status: z.enum(["pending", "approved", "rejected", "suspended"]).default("pending")
});

type PharmacyFormValues = z.infer<typeof pharmacyFormSchema>;

const NewPharmacyPage = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("basic-info");
  
  // Initialize the form
  const form = useForm<PharmacyFormValues>({
    resolver: zodResolver(pharmacyFormSchema),
    defaultValues: {
      role: "pharmacy",
      status: "pending",
      pharmacyDetails: {
        deliveryOptions: ["pickup", "delivery"],
        acceptsInsurance: false,
        hasHomeDelivery: true,
        hasPrescriptionFilling: true
      }
    }
  });
  
  // Create pharmacy mutation
  const createPharmacyMutation = useMutation({
    mutationFn: async (data: PharmacyFormValues) => {
      // Format the licenseExpiryDate to ISO string format
      const formattedData = {
        ...data,
        pharmacyDetails: {
          ...data.pharmacyDetails,
          licenseExpiryDate: data.pharmacyDetails.licenseExpiryDate.toISOString()
        }
      };
      
      const response = await apiRequest("POST", "/api/admin/pharmacies", formattedData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create pharmacy");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pharmacy Created",
        description: "The pharmacy has been created successfully",
        variant: "success",
      });
      navigate("/admin/pharmacies");
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Pharmacy",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (values: PharmacyFormValues) => {
    createPharmacyMutation.mutate(values);
  };
  
  // Delivery options
  const deliveryOptions = [
    { id: "pickup", label: "In-store Pickup" },
    { id: "delivery", label: "Home Delivery" },
    { id: "express", label: "Express Delivery" },
    { id: "scheduled", label: "Scheduled Delivery" }
  ];
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Add New Pharmacy - PillNow Admin</title>
      </Helmet>
      
      <div className="flex flex-col w-full space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/admin/pharmacies")}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Add New Pharmacy</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/pharmacies")}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={createPharmacyMutation.isPending}
              className="flex items-center space-x-2"
            >
              {createPharmacyMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  <span>Save Pharmacy</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
                <TabsTrigger value="pharmacy-details">Pharmacy Details</TabsTrigger>
                <TabsTrigger value="business-settings">Business Settings</TabsTrigger>
              </TabsList>
              
              {/* Basic Information */}
              <TabsContent value="basic-info">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Enter the basic information for the pharmacy account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="pharmacy1" {...field} />
                            </FormControl>
                            <FormDescription>
                              This will be used for login purposes.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              Minimum 6 characters required.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormDescription>
                              The name of the person managing this account.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              We'll send account notifications to this email.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="9876543210" {...field} />
                            </FormControl>
                            <FormDescription>
                              Primary contact number for the pharmacy.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                                <SelectItem value="chemist">Chemist Shop</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose the appropriate role for this account.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="123 Main St, City, State" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Complete address of the pharmacy location.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="400001" {...field} />
                            </FormControl>
                            <FormDescription>
                              Postal code of the pharmacy location.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Set the initial status of this pharmacy account.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/admin/pharmacies")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setActiveTab("pharmacy-details")}
                    >
                      Next: Pharmacy Details
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Pharmacy Details */}
              <TabsContent value="pharmacy-details">
                <Card>
                  <CardHeader>
                    <CardTitle>Pharmacy Information</CardTitle>
                    <CardDescription>
                      Enter details specific to the pharmacy business
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pharmacyDetails.pharmacyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pharmacy Name</FormLabel>
                            <FormControl>
                              <Input placeholder="City Pharmacy" {...field} />
                            </FormControl>
                            <FormDescription>
                              The registered business name of the pharmacy.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pharmacyDetails.ownerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Owner Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Smith" {...field} />
                            </FormControl>
                            <FormDescription>
                              Name of the pharmacy's owner.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pharmacyDetails.licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pharmacy License Number</FormLabel>
                            <FormControl>
                              <Input placeholder="DL-12345" {...field} />
                            </FormControl>
                            <FormDescription>
                              Valid drug license number issued by authorities.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pharmacyDetails.licenseExpiryDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>License Expiry Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date()
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              The date when the pharmacy license expires.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pharmacyDetails.pharmacistName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registered Pharmacist Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Dr. Jane Smith" {...field} />
                            </FormControl>
                            <FormDescription>
                              Name of the registered pharmacist managing the pharmacy.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pharmacyDetails.pharmacistRegistrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pharmacist Registration Number</FormLabel>
                            <FormControl>
                              <Input placeholder="REG-12345" {...field} />
                            </FormControl>
                            <FormDescription>
                              Registration number of the registered pharmacist.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pharmacyDetails.gstNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GST Number</FormLabel>
                            <FormControl>
                              <Input placeholder="22AAAAA0000A1Z5" {...field} />
                            </FormControl>
                            <FormDescription>
                              Goods and Services Tax registration number.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pharmacyDetails.establishmentYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year of Establishment</FormLabel>
                            <FormControl>
                              <Input placeholder="2020" {...field} />
                            </FormControl>
                            <FormDescription>
                              Year when the pharmacy was established.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="pharmacyDetails.workingHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Working Hours</FormLabel>
                          <FormControl>
                            <Input placeholder="Mon-Sat: 9 AM - 9 PM, Sun: 10 AM - 7 PM" {...field} />
                          </FormControl>
                          <FormDescription>
                            Regular operating hours of the pharmacy.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("basic-info")}
                    >
                      Back: Basic Information
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setActiveTab("business-settings")}
                    >
                      Next: Business Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Business Settings */}
              <TabsContent value="business-settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Settings</CardTitle>
                    <CardDescription>
                      Configure operational settings for the pharmacy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="pharmacyDetails.deliveryOptions"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Delivery Options</FormLabel>
                            <FormDescription>
                              Select the delivery options offered by this pharmacy.
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {deliveryOptions.map((option) => (
                              <FormField
                                key={option.id}
                                control={form.control}
                                name="pharmacyDetails.deliveryOptions"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.id)}
                                          onCheckedChange={(checked) => {
                                            const currentValue = field.value || [];
                                            if (checked) {
                                              field.onChange([...currentValue, option.id]);
                                            } else {
                                              field.onChange(
                                                currentValue.filter((value) => value !== option.id)
                                              );
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pharmacyDetails.acceptsInsurance"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Accept Insurance</FormLabel>
                              <FormDescription>
                                This pharmacy accepts health insurance for payment.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pharmacyDetails.hasHomeDelivery"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Home Delivery Available</FormLabel>
                              <FormDescription>
                                This pharmacy provides home delivery services.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="pharmacyDetails.hasPrescriptionFilling"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Prescription Filling</FormLabel>
                            <FormDescription>
                              This pharmacy can fill and verify prescriptions.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("pharmacy-details")}
                    >
                      Back: Pharmacy Details
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createPharmacyMutation.isPending}
                    >
                      {createPharmacyMutation.isPending ? (
                        <>
                          <span className="loading loading-spinner loading-sm mr-2"></span>
                          <span>Creating Pharmacy...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          <span>Create Pharmacy</span>
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default NewPharmacyPage;