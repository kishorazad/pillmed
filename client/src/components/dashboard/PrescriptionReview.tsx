import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageSwitcher';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileText, Eye, Loader2, Clock, User, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Medicine {
  id: number;
  name: string;
  quantity: number | string;
  inStock: boolean;
  price: number;
  currentPrice: number;
  priceChanged: boolean;
}

export interface Prescription {
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

interface PrescriptionReviewProps {
  prescription: Prescription;
  onMarkReadable: (prescription: Prescription) => void;
  onMarkNotReadable: (prescription: Prescription, reason: string) => void;
}

const PrescriptionReview: React.FC<PrescriptionReviewProps> = ({ 
  prescription, 
  onMarkReadable, 
  onMarkNotReadable 
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isFullImageOpen, setIsFullImageOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkReadable = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onMarkReadable(prescription);
    
    toast({
      title: t('prescription_verified'),
      description: t('prescription_verified_message'),
    });
    
    setIsLoading(false);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: t('rejection_reason_required'),
        description: t('please_provide_rejection_reason'),
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onMarkNotReadable(prescription, rejectReason);
    
    toast({
      title: t('prescription_rejected'),
      description: t('prescription_rejection_notification_sent'),
      variant: "destructive"
    });
    
    setIsRejectDialogOpen(false);
    setRejectReason('');
    setIsLoading(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>{t('prescription_review')}</CardTitle>
            <CardDescription>
              {t('uploaded')}: {formatDate(prescription.uploadDate)}
            </CardDescription>
          </div>
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
            <Clock className="h-3 w-3 mr-1" />
            {t('waiting_for_review')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2">{t('customer_information')}</h3>
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
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">{t('order_information')}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('order_id')}:</span>
                <span className="font-medium">#{prescription.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('customer_id')}:</span>
                <span className="font-medium">#{prescription.customerId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('status')}:</span>
                <Badge>{prescription.status}</Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">{t('prescription_image')}</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsFullImageOpen(true)}>
              <Eye className="h-4 w-4 mr-1" />
              {t('view_full_image')}
            </Button>
          </div>
          <div className="relative border rounded-md overflow-hidden bg-gray-50">
            <img 
              src={prescription.prescriptionImage} 
              alt="Prescription"
              className="w-full object-contain max-h-72"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
              <Button onClick={() => setIsFullImageOpen(true)}>
                <Eye className="h-4 w-4 mr-1" />
                {t('enlarge')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={() => setIsRejectDialogOpen(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              {t('processing')}
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-1" />
              {t('not_readable')}
            </>
          )}
        </Button>
        <Button 
          onClick={handleMarkReadable}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              {t('processing')}
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              {t('readable')}
            </>
          )}
        </Button>
      </CardFooter>
      
      <Dialog open={isFullImageOpen} onOpenChange={setIsFullImageOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('prescription_image')}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-1">
            <img 
              src={prescription.prescriptionImage} 
              alt="Prescription"
              className="w-full h-auto object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('mark_prescription_not_readable')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-gray-600">
              {t('rejection_explanation')}
            </p>
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
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectReason('');
              }}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                t('confirm_not_readable')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PrescriptionReview;