import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/LanguageSwitcher';
import { apiRequest } from '@/lib/queryClient';

// Create validation schema for emergency requests
export const emergencySchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  serviceType: z.enum(['ambulance', 'doctor_visit', 'nursing', 'scheduled']),
  address: z.string().min(5, { message: 'Please provide a detailed address' }),
  urgency: z.enum(['high', 'medium', 'low']),
  description: z.string().min(5, { message: 'Please describe your situation' }).max(500, { message: 'Description too long' }),
});

type EmergencyFormData = z.infer<typeof emergencySchema>;

interface EmergencyContactFormProps {
  onClose: () => void;
}

export function EmergencyContactForm({ onClose }: EmergencyContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const form = useForm<EmergencyFormData>({
    resolver: zodResolver(emergencySchema),
    defaultValues: {
      name: '',
      phone: '',
      serviceType: 'ambulance',
      address: '',
      urgency: 'medium',
      description: '',
    },
  });
  
  const onSubmit = async (data: EmergencyFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/emergency-requests', data);
      
      if (response.ok) {
        toast({
          title: 'Request Sent',
          description: 'Your emergency service request has been sent successfully. We will contact you shortly.',
          variant: 'default',
        });
        
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send request');
      }
    } catch (error) {
      toast({
        title: 'Request Failed',
        description: error instanceof Error ? error.message : 'Failed to send request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative max-h-[90vh] overflow-auto">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Emergency Service Request</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ambulance">Ambulance Service</SelectItem>
                        <SelectItem value="doctor_visit">Doctor Home Visit</SelectItem>
                        <SelectItem value="nursing">Nursing Care</SelectItem>
                        <SelectItem value="scheduled">Scheduled Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your full address for the service" 
                        className="resize-none h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High (Urgent medical attention)</SelectItem>
                        <SelectItem value="medium">Medium (Needed within 2-3 hours)</SelectItem>
                        <SelectItem value="low">Low (Scheduled care)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please describe your condition or requirements" 
                        className="resize-none h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                By submitting this form, you agree to our terms and conditions. For life-threatening emergencies, 
                please call your national emergency number immediately.
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}