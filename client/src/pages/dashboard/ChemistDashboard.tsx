import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageSwitcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Package, Truck, Clock, FileText, XCircle, MapPin, User, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Mock data - would be replaced with API calls
interface Prescription {
  id: number;
  customerId: number;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  prescriptionImage: string;
  status: 'new' | 'readable' | 'not_readable' | 'verified' | 'packed' | 'picked' | 'delivered';
  uploadDate: string;
  medicines: Medicine[];
  orderNotes?: string;
}

interface Medicine {
  id: number;
  name: string;
  quantity: number;
  inStock: boolean;
  price: number;
  currentPrice: number;
  priceChanged: boolean;
}

interface Customer {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

const ChemistDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [assignCourier, setAssignCourier] = useState('');
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  
  // Sample data - would be replaced with API data
  const prescriptions: Prescription[] = [
    {
      id: 1,
      customerId: 101,
      customerName: 'Amit Kumar',
      customerAddress: '123 Main Street, Sector 47, Gurugram',
      customerPhone: '+91 9876543210',
      prescriptionImage: 'https://images.unsplash.com/photo-1583912267648-d48299db5df5',
      status: 'new',
      uploadDate: '2025-04-17T14:30:00',
      medicines: [
        {
          id: 814,
          name: 'Telmibrex-AM Tablet',
          quantity: 2,
          inStock: true,
          price: 106,
          currentPrice: 106,
          priceChanged: false
        },
        {
          id: 245,
          name: 'Dolo 650mg Tablet',
          quantity: 1,
          inStock: true,
          price: 30,
          currentPrice: 30,
          priceChanged: false
        }
      ]
    },
    {
      id: 2,
      customerId: 102,
      customerName: 'Priya Singh',
      customerAddress: '456 Park Avenue, Andheri East, Mumbai',
      customerPhone: '+91 8765432109',
      prescriptionImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
      status: 'readable',
      uploadDate: '2025-04-17T10:15:00',
      medicines: [
        {
          id: 312,
          name: 'Azithral 500mg Tablet',
          quantity: 1,
          inStock: true,
          price: 95,
          currentPrice: 95,
          priceChanged: false
        },
        {
          id: 518,
          name: 'Montair LC Tablet',
          quantity: 1,
          inStock: true,
          price: 125,
          currentPrice: 149,
          priceChanged: true
        }
      ]
    },
    {
      id: 3,
      customerId: 103,
      customerName: 'Rajesh Sharma',
      customerAddress: '789 Lake View, Koramangala, Bangalore',
      customerPhone: '+91 7654321098',
      prescriptionImage: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88',
      status: 'not_readable',
      uploadDate: '2025-04-16T18:45:00',
      medicines: [],
      orderNotes: 'Prescription image is blurry and text is not readable. Please upload a clearer image.'
    },
    {
      id: 4,
      customerId: 104,
      customerName: 'Neha Verma',
      customerAddress: '101 High Street, Salt Lake, Kolkata',
      customerPhone: '+91 6543210987',
      prescriptionImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
      status: 'packed',
      uploadDate: '2025-04-16T09:30:00',
      medicines: [
        {
          id: 814,
          name: 'Telmibrex-AM Tablet',
          quantity: 3,
          inStock: true,
          price: 106,
          currentPrice: 106,
          priceChanged: false
        },
        {
          id: 621,
          name: 'Pantop 40mg Tablet',
          quantity: 2,
          inStock: true,
          price: 85,
          currentPrice: 75,
          priceChanged: true
        }
      ]
    },
    {
      id: 5,
      customerId: 105,
      customerName: 'Suresh Patel',
      customerAddress: '222 Ring Road, Navrangpura, Ahmedabad',
      customerPhone: '+91 5432109876',
      prescriptionImage: 'https://images.unsplash.com/photo-1583911650865-f6882549458a',
      status: 'picked',
      uploadDate: '2025-04-15T16:20:00',
      medicines: [
        {
          id: 418,
          name: 'Crocin Advance 500mg Tablet',
          quantity: 2,
          inStock: true,
          price: 24,
          currentPrice: 24,
          priceChanged: false
        }
      ]
    },
    {
      id: 6,
      customerId: 106,
      customerName: 'Kavita Gupta',
      customerAddress: '333 Jubilee Hills, Hyderabad',
      customerPhone: '+91 4321098765',
      prescriptionImage: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3',
      status: 'delivered',
      uploadDate: '2025-04-15T11:45:00',
      medicines: [
        {
          id: 814,
          name: 'Telmibrex-AM Tablet',
          quantity: 1,
          inStock: true,
          price: 106,
          currentPrice: 106,
          priceChanged: false
        },
        {
          id: 735,
          name: 'Ecosprin 75mg Tablet',
          quantity: 1,
          inStock: true,
          price: 12,
          currentPrice: 12,
          priceChanged: false
        },
        {
          id: 526,
          name: 'Shelcal 500mg Tablet',
          quantity: 1,
          inStock: true,
          price: 110,
          currentPrice: 110,
          priceChanged: false
        }
      ]
    }
  ];

  const handleMarkReadable = (prescription: Prescription) => {
    // In a real app, this would make an API call to update the status
    console.log('Marking prescription as readable:', prescription.id);
    toast({
      title: "Prescription verified",
      description: "Customer has been notified that their prescription is readable.",
    });
    
    // Mock notification to customer
    console.log(`NOTIFICATION to ${prescription.customerPhone}: Your prescription has been verified by our pharmacist. Your order is being processed.`);
  };

  const handleMarkNotReadable = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setOpenRejectDialog(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedPrescription) return;
    
    // In a real app, this would make an API call to reject the prescription
    console.log('Rejecting prescription:', selectedPrescription.id, 'Reason:', rejectReason);
    toast({
      title: "Prescription marked as not readable",
      description: "Customer has been notified to upload a clearer prescription image.",
      variant: "destructive"
    });
    
    // Mock notification to customer
    console.log(`NOTIFICATION to ${selectedPrescription.customerPhone}: Your prescription could not be verified. Reason: ${rejectReason}. Please upload a clearer image.`);
    
    setOpenRejectDialog(false);
    setRejectReason('');
    setSelectedPrescription(null);
  };

  const handleMarkPacked = (prescription: Prescription) => {
    // In a real app, this would make an API call to update the status
    console.log('Marking prescription as packed:', prescription.id);
    toast({
      title: "Order packed",
      description: "Order has been marked as packed and customer has been notified.",
    });
    
    // Mock notification to customer
    console.log(`NOTIFICATION to ${prescription.customerPhone}: Your order #${prescription.id} has been packed and is ready for pickup.`);
  };

  const handleAssignDelivery = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setOpenAssignDialog(true);
  };

  const handleAssignConfirm = () => {
    if (!selectedPrescription) return;
    
    // In a real app, this would make an API call to assign delivery
    console.log('Assigning delivery for prescription:', selectedPrescription.id, 'Courier:', assignCourier);
    toast({
      title: "Delivery assigned",
      description: `Order assigned to ${assignCourier} for delivery.`,
    });
    
    // Mock notification to customer
    console.log(`NOTIFICATION to ${selectedPrescription.customerPhone}: Your order #${selectedPrescription.id} has been picked up by ${assignCourier} for delivery.`);
    
    setOpenAssignDialog(false);
    setAssignCourier('');
    setSelectedPrescription(null);
  };

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">New</Badge>;
      case 'readable':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Verified</Badge>;
      case 'not_readable':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Not Readable</Badge>;
      case 'packed':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">Packed</Badge>;
      case 'picked':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Picked</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">Delivered</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filterPrescriptions = (status: string | string[]) => {
    if (Array.isArray(status)) {
      return prescriptions.filter(p => status.includes(p.status));
    }
    return prescriptions.filter(p => p.status === status);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('chemist_dashboard')}</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <Tabs defaultValue="new">
        <TabsList className="mb-4">
          <TabsTrigger value="new" className="relative">
            {t('new_prescriptions')}
            {filterPrescriptions('new').length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {filterPrescriptions('new').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="verified">{t('verified')}</TabsTrigger>
          <TabsTrigger value="not_readable">{t('not_readable')}</TabsTrigger>
          <TabsTrigger value="processing">{t('processing')}</TabsTrigger>
          <TabsTrigger value="completed">{t('completed')}</TabsTrigger>
          <TabsTrigger value="all">{t('all_prescriptions')}</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          {filterPrescriptions('new').length > 0 ? (
            filterPrescriptions('new').map(prescription => (
              <PrescriptionCard 
                key={prescription.id}
                prescription={prescription}
                onMarkReadable={handleMarkReadable}
                onMarkNotReadable={handleMarkNotReadable}
                onMarkPacked={handleMarkPacked}
                onAssignDelivery={handleAssignDelivery}
                renderStatusBadge={renderStatusBadge}
              />
            ))
          ) : (
            <EmptyState message={t('no_new_prescriptions')} />
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {filterPrescriptions('readable').length > 0 ? (
            filterPrescriptions('readable').map(prescription => (
              <PrescriptionCard 
                key={prescription.id}
                prescription={prescription}
                onMarkReadable={handleMarkReadable}
                onMarkNotReadable={handleMarkNotReadable}
                onMarkPacked={handleMarkPacked}
                onAssignDelivery={handleAssignDelivery}
                renderStatusBadge={renderStatusBadge}
              />
            ))
          ) : (
            <EmptyState message={t('no_verified_prescriptions')} />
          )}
        </TabsContent>

        <TabsContent value="not_readable" className="space-y-4">
          {filterPrescriptions('not_readable').length > 0 ? (
            filterPrescriptions('not_readable').map(prescription => (
              <PrescriptionCard 
                key={prescription.id}
                prescription={prescription}
                onMarkReadable={handleMarkReadable}
                onMarkNotReadable={handleMarkNotReadable}
                onMarkPacked={handleMarkPacked}
                onAssignDelivery={handleAssignDelivery}
                renderStatusBadge={renderStatusBadge}
              />
            ))
          ) : (
            <EmptyState message={t('no_unreadable_prescriptions')} />
          )}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          {filterPrescriptions(['packed', 'picked']).length > 0 ? (
            filterPrescriptions(['packed', 'picked']).map(prescription => (
              <PrescriptionCard 
                key={prescription.id}
                prescription={prescription}
                onMarkReadable={handleMarkReadable}
                onMarkNotReadable={handleMarkNotReadable}
                onMarkPacked={handleMarkPacked}
                onAssignDelivery={handleAssignDelivery}
                renderStatusBadge={renderStatusBadge}
              />
            ))
          ) : (
            <EmptyState message={t('no_processing_prescriptions')} />
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filterPrescriptions('delivered').length > 0 ? (
            filterPrescriptions('delivered').map(prescription => (
              <PrescriptionCard 
                key={prescription.id}
                prescription={prescription}
                onMarkReadable={handleMarkReadable}
                onMarkNotReadable={handleMarkNotReadable}
                onMarkPacked={handleMarkPacked}
                onAssignDelivery={handleAssignDelivery}
                renderStatusBadge={renderStatusBadge}
              />
            ))
          ) : (
            <EmptyState message={t('no_completed_prescriptions')} />
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {prescriptions.map(prescription => (
            <PrescriptionCard 
              key={prescription.id}
              prescription={prescription}
              onMarkReadable={handleMarkReadable}
              onMarkNotReadable={handleMarkNotReadable}
              onMarkPacked={handleMarkPacked}
              onAssignDelivery={handleAssignDelivery}
              renderStatusBadge={renderStatusBadge}
            />
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={openRejectDialog} onOpenChange={setOpenRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('mark_prescription_not_readable')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="rejectReason">{t('reason_for_rejection')}</Label>
              <Textarea 
                id="rejectReason" 
                placeholder={t('explain_why_prescription_not_readable')}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenRejectDialog(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              {t('confirm_not_readable')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openAssignDialog} onOpenChange={setOpenAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('assign_delivery')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="courierSelect">{t('select_delivery_service')}</Label>
              <Select value={assignCourier} onValueChange={setAssignCourier}>
                <SelectTrigger id="courierSelect">
                  <SelectValue placeholder={t('select_delivery_service')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-house-delivery">In-House Delivery</SelectItem>
                  <SelectItem value="delhivery">Delhivery</SelectItem>
                  <SelectItem value="bluedart">BlueDart</SelectItem>
                  <SelectItem value="dtdc">DTDC</SelectItem>
                  <SelectItem value="fedex">FedEx</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenAssignDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleAssignConfirm} disabled={!assignCourier}>
              {t('assign')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sub-components
interface PrescriptionCardProps {
  prescription: Prescription;
  onMarkReadable: (prescription: Prescription) => void;
  onMarkNotReadable: (prescription: Prescription) => void;
  onMarkPacked: (prescription: Prescription) => void;
  onAssignDelivery: (prescription: Prescription) => void;
  renderStatusBadge: (status: string) => React.ReactNode;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ 
  prescription, 
  onMarkReadable, 
  onMarkNotReadable, 
  onMarkPacked,
  onAssignDelivery,
  renderStatusBadge
}) => {
  const { t } = useLanguage();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  
  // Calculate order total
  const orderTotal = prescription.medicines.reduce((total, med) => total + (med.currentPrice * med.quantity), 0);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderActionButtons = () => {
    switch(prescription.status) {
      case 'new':
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              onClick={() => onMarkNotReadable(prescription)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              {t('not_readable')}
            </Button>
            <Button
              variant="outline"
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              onClick={() => onMarkReadable(prescription)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {t('readable')}
            </Button>
          </div>
        );
      case 'readable':
        return (
          <Button onClick={() => onMarkPacked(prescription)}>
            <Package className="h-4 w-4 mr-1" />
            {t('mark_packed')}
          </Button>
        );
      case 'packed':
        return (
          <Button onClick={() => onAssignDelivery(prescription)}>
            <Truck className="h-4 w-4 mr-1" />
            {t('assign_delivery')}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <span>{t('order')} #{prescription.id}</span>
              <span className="ml-3">{renderStatusBadge(prescription.status)}</span>
            </CardTitle>
            <CardDescription>
              {t('uploaded')}: {formatDate(prescription.uploadDate)}
            </CardDescription>
          </div>
          <Dialog open={openDetailsDialog} onOpenChange={setOpenDetailsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                {t('view_details')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{t('prescription_details')} #{prescription.id}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">{t('customer_information')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <User className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <span>{prescription.customerName}</span>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <span>{prescription.customerPhone}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <span>{prescription.customerAddress}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-700 mt-4 mb-2">{t('prescription_image')}</h3>
                  <img 
                    src={prescription.prescriptionImage} 
                    alt="Prescription" 
                    className="rounded-md border border-gray-200 w-full max-h-60 object-cover"
                  />
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">{t('order_details')}</h3>
                  {prescription.medicines.length > 0 ? (
                    <div className="space-y-3">
                      {prescription.medicines.map((medicine) => (
                        <div key={medicine.id} className="flex justify-between border-b pb-2">
                          <div>
                            <div className="font-medium">{medicine.name}</div>
                            <div className="text-sm text-gray-500">Qty: {medicine.quantity}</div>
                          </div>
                          <div className="text-right">
                            {medicine.priceChanged ? (
                              <div>
                                <div className="text-sm line-through text-gray-500">₹{medicine.price}</div>
                                <div className={medicine.currentPrice > medicine.price ? 'text-red-600' : 'text-green-600'}>
                                  ₹{medicine.currentPrice}
                                </div>
                              </div>
                            ) : (
                              <div>₹{medicine.price}</div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-between font-medium pt-2">
                        <div>{t('total')}</div>
                        <div>₹{orderTotal}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      {prescription.orderNotes || t('no_medicines_in_order')}
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end">
                    {renderActionButtons()}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-2 sm:mb-0">
            <div className="text-sm font-medium">{prescription.customerName}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {prescription.customerAddress.split(',')[0]}...
            </div>
          </div>
          
          <div className="flex items-center">
            {prescription.medicines.length > 0 && (
              <div className="mr-4">
                <div className="text-sm text-gray-500">{t('items')}</div>
                <div className="font-medium">{prescription.medicines.length}</div>
              </div>
            )}
            
            <div>
              <div className="text-sm text-gray-500">{t('total')}</div>
              <div className="font-medium">₹{orderTotal}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="flex gap-1">
          {prescription.medicines.map((medicine, idx) => (
            medicine.priceChanged && (
              <Badge key={idx} variant="outline" className={medicine.currentPrice > medicine.price ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}>
                {medicine.name.length > 15 ? `${medicine.name.substring(0, 15)}...` : medicine.name}: {medicine.currentPrice > medicine.price ? 'Price ↑' : 'Price ↓'}
              </Badge>
            )
          ))}
        </div>
        {renderActionButtons()}
      </CardFooter>
    </Card>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg">
      <Clock className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-1">{message}</h3>
      <p className="text-gray-500 max-w-md">
        When new prescriptions arrive, they will appear here for processing.
      </p>
    </div>
  );
};

export default ChemistDashboard;