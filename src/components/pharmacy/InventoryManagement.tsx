import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Truck, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  Edit, 
  MoreHorizontal,
  Box,
  BarChart4,
  Calendar,
  AlertCircle,
  PlusCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  PackageCheck,
  X,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";


// Define types
interface MedicationInventory {
  id: number;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  currentStock: number;
  batchNumber: string;
  expiryDate: string;
  reorderLevel: number;
  mrp: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  location: string;
}

interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  items: PurchaseOrderItem[];
  totalAmount: number;
}

interface PurchaseOrderItem {
  id: number;
  medicationName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
}

const InventoryManagement = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddMedicationDialogOpen, setIsAddMedicationDialogOpen] = useState(false);
  const [isCreatePODialogOpen, setIsCreatePODialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<MedicationInventory | null>(null);
  
  // Sample inventory data
  const [medications, setMedications] = useState<MedicationInventory[]>([
    {
      id: 1,
      name: 'Amlodipine 5mg Tablets',
      genericName: 'Amlodipine',
      manufacturer: 'Sun Pharma',
      category: 'Cardiovascular',
      currentStock: 432,
      batchNumber: 'AML23456',
      expiryDate: '2026-05-23',
      reorderLevel: 100,
      mrp: 85.50,
      status: 'in-stock',
      location: 'Shelf A-12'
    },
    {
      id: 2,
      name: 'Metformin 500mg Tablets',
      genericName: 'Metformin HCl',
      manufacturer: 'Cipla',
      category: 'Diabetes',
      currentStock: 278,
      batchNumber: 'MET78901',
      expiryDate: '2025-12-15',
      reorderLevel: 100,
      mrp: 65.75,
      status: 'in-stock',
      location: 'Shelf B-05'
    },
    {
      id: 3,
      name: 'Azithromycin 500mg Tablets',
      genericName: 'Azithromycin',
      manufacturer: 'Zydus',
      category: 'Antibiotics',
      currentStock: 58,
      batchNumber: 'AZT45678',
      expiryDate: '2025-08-30',
      reorderLevel: 50,
      mrp: 120.00,
      status: 'low-stock',
      location: 'Shelf C-08'
    },
    {
      id: 4,
      name: 'Paracetamol 500mg Tablets',
      genericName: 'Acetaminophen',
      manufacturer: 'GSK',
      category: 'Pain Management',
      currentStock: 534,
      batchNumber: 'PCM12345',
      expiryDate: '2026-02-10',
      reorderLevel: 150,
      mrp: 25.50,
      status: 'in-stock',
      location: 'Shelf A-03'
    },
    {
      id: 5,
      name: 'Atorvastatin 10mg Tablets',
      genericName: 'Atorvastatin',
      manufacturer: 'Sun Pharma',
      category: 'Cardiovascular',
      currentStock: 12,
      batchNumber: 'ATV56789',
      expiryDate: '2025-10-15',
      reorderLevel: 80,
      mrp: 95.25,
      status: 'low-stock',
      location: 'Shelf B-09'
    },
    {
      id: 6,
      name: 'Levothyroxine 50mcg Tablets',
      genericName: 'Levothyroxine Sodium',
      manufacturer: 'Abbott',
      category: 'Thyroid',
      currentStock: 0,
      batchNumber: 'LVT89012',
      expiryDate: '2026-04-20',
      reorderLevel: 50,
      mrp: 112.80,
      status: 'out-of-stock',
      location: 'Shelf C-12'
    }
  ]);
  
  // Sample purchase orders
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 101,
      poNumber: 'PO-2025-0421',
      supplier: 'MedSupply Distributors',
      orderDate: '2025-04-01',
      expectedDelivery: '2025-04-10',
      status: 'delivered',
      items: [
        {
          id: 1001,
          medicationName: 'Amlodipine 5mg Tablets',
          quantity: 500,
          unitPrice: 70.00,
          totalPrice: 35000.00
        },
        {
          id: 1002,
          medicationName: 'Metformin 500mg Tablets',
          quantity: 300,
          unitPrice: 55.00,
          totalPrice: 16500.00
        }
      ],
      totalAmount: 51500.00
    },
    {
      id: 102,
      poNumber: 'PO-2025-0422',
      supplier: 'Pharma Wholesale Ltd',
      orderDate: '2025-04-05',
      expectedDelivery: '2025-04-15',
      status: 'shipped',
      items: [
        {
          id: 1003,
          medicationName: 'Paracetamol 500mg Tablets',
          quantity: 600,
          unitPrice: 20.00,
          totalPrice: 12000.00
        }
      ],
      totalAmount: 12000.00
    },
    {
      id: 103,
      poNumber: 'PO-2025-0423',
      supplier: 'MedSupply Distributors',
      orderDate: '2025-04-08',
      expectedDelivery: '2025-04-18',
      status: 'pending',
      items: [
        {
          id: 1004,
          medicationName: 'Azithromycin 500mg Tablets',
          quantity: 200,
          unitPrice: 100.00,
          totalPrice: 20000.00
        },
        {
          id: 1005,
          medicationName: 'Atorvastatin 10mg Tablets',
          quantity: 150,
          unitPrice: 80.00,
          totalPrice: 12000.00
        },
        {
          id: 1006,
          medicationName: 'Levothyroxine 50mcg Tablets',
          quantity: 100,
          unitPrice: 95.00,
          totalPrice: 9500.00
        }
      ],
      totalAmount: 41500.00
    }
  ]);
  
  // Sample suppliers
  const suppliers: Supplier[] = [
    {
      id: 201,
      name: 'MedSupply Distributors',
      contactPerson: 'Rahul Joshi',
      email: 'rahul@medsupply.com',
      phone: '+91 98765 43210',
      address: '123 Industrial Area, Mumbai, Maharashtra',
      rating: 4.8
    },
    {
      id: 202,
      name: 'Pharma Wholesale Ltd',
      contactPerson: 'Priya Mehta',
      email: 'priya@pharmawholesale.com',
      phone: '+91 87654 32109',
      address: '456 Pharma District, Delhi, Delhi',
      rating: 4.5
    },
    {
      id: 203,
      name: 'HealthCare Suppliers',
      contactPerson: 'Ajay Singh',
      email: 'ajay@healthcaresuppliers.com',
      phone: '+91 76543 21098',
      address: '789 Medical Complex, Bangalore, Karnataka',
      rating: 4.2
    }
  ];
  
  // Get filtered medications
  const getFilteredMedications = () => {
    return medications.filter(medication => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medication.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medication.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = categoryFilter === 'all' || medication.category === categoryFilter;
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || medication.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };
  
  // Get medication categories (unique)
  const getMedicationCategories = () => {
    const categories = new Set(medications.map(medication => medication.category));
    return Array.from(categories);
  };
  
  // Get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low-stock':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'low-stock':
        return <AlertCircle className="h-4 w-4" />;
      case 'out-of-stock':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <PackageCheck className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };
  
  // Get stock level as percentage
  const getStockLevelPercentage = (currentStock: number, reorderLevel: number) => {
    // We'll consider twice the reorder level as "full stock" (100%)
    const fullStock = reorderLevel * 2;
    const percentage = Math.round((currentStock / fullStock) * 100);
    return Math.min(percentage, 100); // Cap at 100%
  };
  
  // Get stock level color
  const getStockLevelColor = (currentStock: number, reorderLevel: number) => {
    if (currentStock === 0) return 'bg-red-500';
    if (currentStock < reorderLevel) return 'bg-amber-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsCreatePODialogOpen(true)}
          >
            <Truck className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
          <Button onClick={() => setIsAddMedicationDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Medication
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inventory Stats */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label>Overall Stock Health</Label>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">In Stock Items</span>
                    <span className="font-medium">{medications.filter(m => m.status === 'in-stock').length}</span>
                  </div>
                  <Progress value={medications.filter(m => m.status === 'in-stock').length / medications.length * 100} className="h-1.5 mt-1 bg-gray-100" indicatorColor="bg-green-500" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Low Stock Items</span>
                    <span className="font-medium">{medications.filter(m => m.status === 'low-stock').length}</span>
                  </div>
                  <Progress value={medications.filter(m => m.status === 'low-stock').length / medications.length * 100} className="h-1.5 mt-1 bg-gray-100" indicatorColor="bg-amber-500" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Out of Stock Items</span>
                    <span className="font-medium">{medications.filter(m => m.status === 'out-of-stock').length}</span>
                  </div>
                  <Progress value={medications.filter(m => m.status === 'out-of-stock').length / medications.length * 100} className="h-1.5 mt-1 bg-gray-100" indicatorColor="bg-red-500" />
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <h4 className="font-medium mb-2">Recent Alerts</h4>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 border border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Low stock alert</p>
                      <p className="text-gray-600">Atorvastatin 10mg Tablets</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 p-2 rounded-md bg-red-50 border border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Out of stock</p>
                      <p className="text-gray-600">Levothyroxine 50mcg Tablets</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 p-2 rounded-md bg-blue-50 border border-blue-200">
                    <Truck className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">PO-2025-0423 shipped</p>
                      <p className="text-gray-600">ETA: Apr 18, 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Purchase Orders */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.poNumber}</TableCell>
                      <TableCell>{order.supplier}</TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusStyle(order.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{order.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Inventory List */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Medication Inventory</CardTitle>
            
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-grow w-full sm:w-64 md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search medications..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getMedicationCategories().map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Batch & Expiry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>MRP (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredMedications().map(medication => (
                  <TableRow key={medication.id}>
                    <TableCell>
                      <div className="font-medium">{medication.name}</div>
                      <div className="text-xs text-gray-500">{medication.genericName}</div>
                      <div className="text-xs text-gray-500">{medication.manufacturer}</div>
                    </TableCell>
                    <TableCell>{medication.category}</TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{medication.currentStock}</span>
                          <span className="text-gray-500">Reorder: {medication.reorderLevel}</span>
                        </div>
                        <Progress 
                          value={getStockLevelPercentage(medication.currentStock, medication.reorderLevel)} 
                          className="h-1.5"
                          indicatorColor={getStockLevelColor(medication.currentStock, medication.reorderLevel)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{medication.batchNumber}</div>
                      <div className="text-xs text-gray-500">Exp: {medication.expiryDate}</div>
                    </TableCell>
                    <TableCell>{medication.location}</TableCell>
                    <TableCell>{medication.mrp.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusStyle(medication.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(medication.status)}
                          <span>
                            {medication.status === 'in-stock' ? 'In Stock' : 
                             medication.status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </span>
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart4 className="mr-2 h-4 w-4" />
                            <span>View History</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Truck className="mr-2 h-4 w-4" />
                            <span>Create Order</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {getFilteredMedications().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      <div className="text-gray-500">No medications found matching your criteria</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Medication Dialog */}
      <Dialog open={isAddMedicationDialogOpen} onOpenChange={setIsAddMedicationDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
            <DialogDescription>
              Enter medication details to add to inventory
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medName">Medication Name</Label>
              <Input id="medName" placeholder="Enter full medication name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genericName">Generic Name</Label>
              <Input id="genericName" placeholder="Enter generic name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" placeholder="Enter manufacturer name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                  <SelectItem value="Diabetes">Diabetes</SelectItem>
                  <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                  <SelectItem value="Pain Management">Pain Management</SelectItem>
                  <SelectItem value="Thyroid">Thyroid</SelectItem>
                  <SelectItem value="Respiratory">Respiratory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input id="batchNumber" placeholder="Enter batch number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input id="expiryDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input id="currentStock" type="number" placeholder="Enter quantity" min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input id="reorderLevel" type="number" placeholder="Enter reorder point" min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mrp">MRP (₹)</Label>
              <Input id="mrp" type="number" placeholder="Enter MRP" min="0" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input id="location" placeholder="e.g. Shelf A-12" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMedicationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddMedicationDialogOpen(false)}>
              Add Medication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Purchase Order Dialog */}
      <Dialog open={isCreatePODialogOpen} onOpenChange={setIsCreatePODialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Create a new purchase order for medication inventory
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poNumber">PO Number</Label>
                <Input id="poNumber" value="PO-2025-0424" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date</Label>
                <Input id="orderDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select>
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedDelivery">Expected Delivery</Label>
                <Input id="expectedDelivery" type="date" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Order Items</Label>
                <Button variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="border rounded-md p-3">
                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-2">
                      <Label htmlFor="item1">Medication</Label>
                      <Select>
                        <SelectTrigger id="item1">
                          <SelectValue placeholder="Select medication" />
                        </SelectTrigger>
                        <SelectContent>
                          {medications.map(medication => (
                            <SelectItem key={medication.id} value={medication.id.toString()}>
                              {medication.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="qty1">Quantity</Label>
                      <Input id="qty1" type="number" min="1" />
                    </div>
                    <div>
                      <Label htmlFor="price1">Unit Price (₹)</Label>
                      <Input id="price1" type="number" min="0" step="0.01" />
                    </div>
                    <div>
                      <Label htmlFor="total1">Total (₹)</Label>
                      <Input id="total1" value="0.00" disabled />
                    </div>
                    <div className="flex items-end">
                      <Button variant="ghost" size="icon" className="text-red-500">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-2">
                      <Label htmlFor="item2">Medication</Label>
                      <Select>
                        <SelectTrigger id="item2">
                          <SelectValue placeholder="Select medication" />
                        </SelectTrigger>
                        <SelectContent>
                          {medications.map(medication => (
                            <SelectItem key={medication.id} value={medication.id.toString()}>
                              {medication.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="qty2">Quantity</Label>
                      <Input id="qty2" type="number" min="1" />
                    </div>
                    <div>
                      <Label htmlFor="price2">Unit Price (₹)</Label>
                      <Input id="price2" type="number" min="0" step="0.01" />
                    </div>
                    <div>
                      <Label htmlFor="total2">Total (₹)</Label>
                      <Input id="total2" value="0.00" disabled />
                    </div>
                    <div className="flex items-end">
                      <Button variant="ghost" size="icon" className="text-red-500">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4 font-medium">
                <div className="bg-gray-50 p-3 rounded-md">
                  Order Total: ₹0.00
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" placeholder="Enter any additional notes for this order" rows={3} />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatePODialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreatePODialogOpen(false)}>
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;