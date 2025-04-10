import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, Clock, ShoppingBag, Truck, Check, X, AlertCircle, RefreshCw, 
  Calendar, ChevronRight, FileText, Download, Share2, Search,
  CreditCard, ExternalLink, Pill, ShieldCheck, Printer
} from 'lucide-react';

// Types
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  image?: string;
  isRefillable: boolean;
  dosage?: string;
  medicationType?: string;
}

interface Order {
  id: string;
  orderDate: string;
  deliveryDate?: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  shippingAddress: string;
  trackingNumber?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  invoiceUrl?: string;
  prescriptionRequired: boolean;
  prescriptionVerified: boolean;
  prescriptionUrl?: string;
}

// Sample data
const pastOrders: Order[] = [
  {
    id: 'ORD-10025',
    orderDate: '2025-03-15T14:30:00',
    deliveryDate: '2025-03-17T13:45:00',
    status: 'delivered',
    paymentMethod: 'Credit Card ending in 4242',
    paymentStatus: 'paid',
    shippingAddress: '123 Main St, Apartment 4B, New Delhi, 110001',
    trackingNumber: 'DELI0023456789',
    items: [
      {
        id: 1,
        name: 'Lisinopril 10mg',
        quantity: 30,
        price: 120,
        totalPrice: 120,
        image: 'https://example.com/lisinopril.jpg',
        isRefillable: true,
        dosage: '10mg',
        medicationType: 'Tablet'
      },
      {
        id: 2,
        name: 'Metformin 500mg',
        quantity: 60,
        price: 240,
        totalPrice: 240,
        image: 'https://example.com/metformin.jpg',
        isRefillable: true,
        dosage: '500mg',
        medicationType: 'Tablet'
      }
    ],
    subtotal: 360,
    tax: 36,
    shippingCost: 50,
    discount: 0,
    total: 446,
    invoiceUrl: '/invoices/10025.pdf',
    prescriptionRequired: true,
    prescriptionVerified: true,
    prescriptionUrl: '/prescriptions/10025.pdf'
  },
  {
    id: 'ORD-10018',
    orderDate: '2025-02-28T11:15:00',
    deliveryDate: '2025-03-02T16:20:00',
    status: 'delivered',
    paymentMethod: 'UPI Payment',
    paymentStatus: 'paid',
    shippingAddress: '123 Main St, Apartment 4B, New Delhi, 110001',
    trackingNumber: 'DELI0023456123',
    items: [
      {
        id: 3,
        name: 'Multivitamin Capsules',
        quantity: 90,
        price: 450,
        totalPrice: 450,
        image: 'https://example.com/multivitamin.jpg',
        isRefillable: false
      },
      {
        id: 4,
        name: 'Calcium + Vitamin D3 Tablets',
        quantity: 30,
        price: 320,
        totalPrice: 320,
        image: 'https://example.com/calcium.jpg',
        isRefillable: true,
        dosage: '500mg + 250IU',
        medicationType: 'Tablet'
      }
    ],
    subtotal: 770,
    tax: 77,
    shippingCost: 0,
    discount: 100,
    total: 747,
    invoiceUrl: '/invoices/10018.pdf',
    prescriptionRequired: false,
    prescriptionVerified: false
  },
  {
    id: 'ORD-10005',
    orderDate: '2025-01-10T09:45:00',
    deliveryDate: '2025-01-12T14:30:00',
    status: 'delivered',
    paymentMethod: 'Credit Card ending in 4242',
    paymentStatus: 'paid',
    shippingAddress: '123 Main St, Apartment 4B, New Delhi, 110001',
    trackingNumber: 'DELI0023123789',
    items: [
      {
        id: 5,
        name: 'Blood Glucose Monitor',
        quantity: 1,
        price: 1800,
        totalPrice: 1800,
        image: 'https://example.com/glucose-monitor.jpg',
        isRefillable: false
      },
      {
        id: 6,
        name: 'Glucose Test Strips (Pack of 50)',
        quantity: 2,
        price: 900,
        totalPrice: 1800,
        image: 'https://example.com/test-strips.jpg',
        isRefillable: true,
        medicationType: 'Medical Supply'
      },
      {
        id: 7,
        name: 'Lancets (Pack of 100)',
        quantity: 1,
        price: 450,
        totalPrice: 450,
        image: 'https://example.com/lancets.jpg',
        isRefillable: true,
        medicationType: 'Medical Supply'
      }
    ],
    subtotal: 4050,
    tax: 405,
    shippingCost: 0,
    discount: 500,
    total: 3955,
    invoiceUrl: '/invoices/10005.pdf',
    prescriptionRequired: false,
    prescriptionVerified: false
  },
  {
    id: 'ORD-09992',
    orderDate: '2024-12-05T10:20:00',
    status: 'processing',
    paymentMethod: 'UPI Payment',
    paymentStatus: 'paid',
    shippingAddress: '123 Main St, Apartment 4B, New Delhi, 110001',
    items: [
      {
        id: 8,
        name: 'Aspirin 75mg',
        quantity: 30,
        price: 45,
        totalPrice: 45,
        image: 'https://example.com/aspirin.jpg',
        isRefillable: true,
        dosage: '75mg',
        medicationType: 'Tablet'
      }
    ],
    subtotal: 45,
    tax: 4.5,
    shippingCost: 50,
    discount: 0,
    total: 99.5,
    prescriptionRequired: false,
    prescriptionVerified: false
  }
];

// Helper components
const StatusBadge = ({ status, className = "" }: { status: Order['status']; className?: string }) => {
  const statusConfig = {
    processing: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Clock className="h-3 w-3 mr-1" /> },
    shipped: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Truck className="h-3 w-3 mr-1" /> },
    delivered: { color: 'bg-green-100 text-green-800 border-green-200', icon: <Check className="h-3 w-3 mr-1" /> },
    cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: <X className="h-3 w-3 mr-1" /> }
  };
  
  return (
    <Badge className={`${statusConfig[status].color} ${className}`}>
      {statusConfig[status].icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Reorder dialog component
const ReorderDialog = ({ 
  open, 
  onClose, 
  items 
}: { 
  open: boolean;
  onClose: () => void;
  items: OrderItem[];
}) => {
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>(
    Object.fromEntries(items.map(item => [item.id, true]))
  );
  
  const { toast } = useToast();
  
  const handleToggleItem = (itemId: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  const selectedItemsCount = Object.values(selectedItems).filter(Boolean).length;
  const totalAmount = items
    .filter(item => selectedItems[item.id])
    .reduce((sum, item) => sum + item.totalPrice, 0);
  
  const handleReorder = () => {
    // In a real app, this would add the selected items to the cart
    toast({
      title: "Items added to cart",
      description: `${selectedItemsCount} items have been added to your cart.`
    });
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Reorder Items</DialogTitle>
          <DialogDescription>
            Select the items you want to reorder from your previous purchase
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[400px] overflow-y-auto my-4 pr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedItems[item.id] || false}
                      onChange={() => handleToggleItem(item.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    {item.dosage && (
                      <div className="text-xs text-gray-500">
                        {item.dosage} {item.medicationType}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-right">₹{item.totalPrice.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <div className="flex justify-between font-medium">
            <span>Items selected:</span>
            <span>{selectedItemsCount} items</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Subtotal:</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Shipping, taxes, and discounts will be calculated at checkout.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleReorder} 
            disabled={selectedItemsCount === 0}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main component
const OrderHistory = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [orderToReorder, setOrderToReorder] = useState<Order | null>(null);
  // Remove the h1 heading since it's now in the parent component
  const containerStyle = { marginTop: 0 };
  
  const { toast } = useToast();
  
  // Filter orders based on search query and status
  const filteredOrders = pastOrders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };
  
  const handleReorder = (order: Order) => {
    setOrderToReorder(order);
    setReorderDialogOpen(true);
  };
  
  const handleDownloadInvoice = (order: Order) => {
    if (order.invoiceUrl) {
      // In a real app, this would download the invoice
      toast({
        title: "Downloading invoice",
        description: `Invoice for order ${order.id} is being downloaded.`
      });
    }
  };
  
  return (
    <div className="space-y-6" style={containerStyle}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Orders</h2>
        <p className="text-gray-500">View and manage your past orders</p>
      </div>
      
      {/* Search and filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search orders by ID or product name" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Order List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <div className="flex items-center">
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <StatusBadge status={order.status} className="ml-2" />
                    </div>
                    <CardDescription>
                      Placed on {new Date(order.orderDate).toLocaleDateString()} | {order.items.length} items
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 sm:mt-0"
                    onClick={() => handleViewOrder(order)}
                  >
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Delivery Address</h4>
                      <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Payment Method</h4>
                      <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Total Amount</h4>
                      <p className="text-lg font-bold text-green-700">₹{order.total.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Order Items</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center border rounded-md p-2">
                          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                            <Pill className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-grow">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} | ₹{item.price.toFixed(2)}</p>
                          </div>
                          {item.isRefillable && (
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-xs">
                              Refillable
                            </Badge>
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center justify-center border rounded-md p-2 bg-gray-50">
                          <p className="text-sm text-gray-600">+{order.items.length - 3} more items</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 flex flex-wrap gap-2 justify-between border-t">
                <div className="text-sm text-gray-600">
                  {order.status === 'delivered' && order.deliveryDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Delivered on {new Date(order.deliveryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {order.status === 'delivered' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReorder(order)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reorder
                    </Button>
                  )}
                  
                  {order.invoiceUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadInvoice(order)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Invoice
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-gray-100 p-4 mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">No orders found</h3>
              <p className="text-gray-500 text-center max-w-md mt-2">
                {searchQuery || statusFilter !== 'all' ? 
                  "Try adjusting your search or filters to find what you're looking for." : 
                  "You haven't placed any orders yet. Start shopping to see your orders here."}
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Order Details */}
      {selectedOrder && (
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>Order Details: {selectedOrder.id}</CardTitle>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <CardDescription>
                  Placed on {new Date(selectedOrder.orderDate).toLocaleDateString()} at {new Date(selectedOrder.orderDate).toLocaleTimeString()}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-700">₹{selectedOrder.total.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Accordion type="single" collapsible defaultValue="items">
              <AccordionItem value="items">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    <span>Order Items ({selectedOrder.items.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-gray-100 rounded-md flex items-center justify-center mr-2">
                                  <Pill className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <div>{item.name}</div>
                                  {item.dosage && (
                                    <div className="text-xs text-gray-500">{item.dosage} {item.medicationType}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.price.toFixed(2)}</TableCell>
                            <TableCell>₹{item.totalPrice.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between mb-1">
                        <span>Subtotal</span>
                        <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Tax</span>
                        <span>₹{selectedOrder.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Shipping</span>
                        <span>{selectedOrder.shippingCost > 0 ? `₹${selectedOrder.shippingCost.toFixed(2)}` : 'Free'}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between mb-1 text-green-600">
                          <span>Discount</span>
                          <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="shipping">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 mr-2" />
                    <span>Shipping & Delivery</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Shipping Address</h4>
                      <p className="text-gray-700">{selectedOrder.shippingAddress}</p>
                    </div>
                    
                    {selectedOrder.trackingNumber && (
                      <div>
                        <h4 className="font-medium mb-1">Tracking Information</h4>
                        <div className="flex items-center">
                          <p className="text-gray-700 mr-2">Tracking Number: {selectedOrder.trackingNumber}</p>
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium mb-1">Delivery Status</h4>
                      {selectedOrder.status === 'delivered' ? (
                        <div className="bg-green-50 p-3 rounded-md border border-green-200">
                          <div className="flex items-center">
                            <Check className="h-5 w-5 text-green-600 mr-2" />
                            <div>
                              <p className="font-medium text-green-800">Delivered</p>
                              <p className="text-sm text-green-600">
                                Your order was delivered on {new Date(selectedOrder.deliveryDate!).toLocaleDateString()} at {new Date(selectedOrder.deliveryDate!).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : selectedOrder.status === 'shipped' ? (
                        <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
                          <div className="flex items-center">
                            <Truck className="h-5 w-5 text-purple-600 mr-2" />
                            <div>
                              <p className="font-medium text-purple-800">In Transit</p>
                              <p className="text-sm text-purple-600">
                                Your order is on the way to your address
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : selectedOrder.status === 'processing' ? (
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                          <div className="flex items-center">
                            <Package className="h-5 w-5 text-blue-600 mr-2" />
                            <div>
                              <p className="font-medium text-blue-800">Processing</p>
                              <p className="text-sm text-blue-600">
                                Your order is being prepared for shipping
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 p-3 rounded-md border border-red-200">
                          <div className="flex items-center">
                            <X className="h-5 w-5 text-red-600 mr-2" />
                            <div>
                              <p className="font-medium text-red-800">Cancelled</p>
                              <p className="text-sm text-red-600">
                                This order has been cancelled
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="payment">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>Payment Information</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Payment Method</h4>
                      <p className="text-gray-700">{selectedOrder.paymentMethod}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Payment Status</h4>
                      {selectedOrder.paymentStatus === 'paid' ? (
                        <div className="bg-green-50 p-3 rounded-md border border-green-200">
                          <div className="flex items-center">
                            <Check className="h-5 w-5 text-green-600 mr-2" />
                            <p className="text-green-800">Paid</p>
                          </div>
                        </div>
                      ) : selectedOrder.paymentStatus === 'pending' ? (
                        <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-amber-600 mr-2" />
                            <p className="text-amber-800">Payment Pending</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 p-3 rounded-md border border-red-200">
                          <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                            <p className="text-red-800">Payment Failed</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {selectedOrder.invoiceUrl && (
                      <div>
                        <h4 className="font-medium mb-1">Invoice</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(selectedOrder)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </Button>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {selectedOrder.prescriptionRequired && (
                <AccordionItem value="prescription">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Prescription Information</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Prescription Status</h4>
                        {selectedOrder.prescriptionVerified ? (
                          <div className="bg-green-50 p-3 rounded-md border border-green-200">
                            <div className="flex items-center">
                              <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
                              <p className="text-green-800">Prescription Verified</p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                            <div className="flex items-center">
                              <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                              <p className="text-amber-800">Prescription Pending Verification</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {selectedOrder.prescriptionUrl && (
                        <div>
                          <h4 className="font-medium mb-1">Prescription</h4>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download Prescription
                            </Button>
                            <Button variant="outline" size="sm">
                              <Printer className="h-4 w-4 mr-2" />
                              Print
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
          
          <CardFooter className="border-t p-4 flex flex-wrap gap-2 justify-between">
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Back to Orders
            </Button>
            
            {selectedOrder.status === 'delivered' && (
              <Button 
                onClick={() => handleReorder(selectedOrder)}
                className="gap-1"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reorder Items
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
      
      {/* Reorder Dialog */}
      {orderToReorder && (
        <ReorderDialog
          open={reorderDialogOpen}
          onClose={() => setReorderDialogOpen(false)}
          items={orderToReorder.items}
        />
      )}
    </div>
  );
};

export default OrderHistory;