import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, AlertCircle, Phone, Clock, Ambulance } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

const emergencySchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  address: z.string().min(5, { message: 'Please enter your complete address' }),
  pincode: z.string().min(6, { message: 'Please enter a valid pincode' }),
  emergencyType: z.enum(['medical', 'ambulance', 'home_doctor', 'nursing']),
  urgencyLevel: z.enum(['urgent', 'scheduled']),
  description: z.string().min(10, { message: 'Please describe the emergency situation briefly' }),
  preferredTime: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms',
  }),
});

type EmergencyFormData = z.infer<typeof emergencySchema>;

interface EmergencyContactFormProps {
  onClose: () => void;
}

export function EmergencyContactForm({ onClose }: EmergencyContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<EmergencyFormData>({
    resolver: zodResolver(emergencySchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      pincode: '',
      emergencyType: 'medical',
      urgencyLevel: 'urgent',
      description: '',
      consent: false,
    },
  });
  
  const emergencyMutation = useMutation({
    mutationFn: async (data: EmergencyFormData) => {
      const response = await apiRequest('POST', '/api/emergency-requests', data);
      if (!response.ok) {
        throw new Error('Failed to submit emergency request');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Emergency request submitted',
        description: 'Our team will contact you as soon as possible.',
        variant: 'default',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error submitting request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (data: EmergencyFormData) => {
    setSubmitting(true);
    emergencyMutation.mutate(data);
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end md:pt-16 pt-0">
      <div className="relative bg-white rounded-lg shadow-lg md:w-[450px] w-full min-h-screen md:min-h-0 md:max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-primary text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-6 w-6" />
            <h2 className="text-xl font-bold">Emergency Services</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full hover:bg-white/20 p-1.5 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="bg-red-50 p-4 border-l-4 border-red-500 flex gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-medium text-red-800">Medical Emergency?</h3>
            <p className="text-sm text-red-700">
              For life-threatening emergencies, dial 102 or 108 immediately.
              This service is for urgent but non-life-threatening situations.
            </p>
          </div>
        </div>
        
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter your complete address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter pincode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="emergencyType"
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
                        <SelectItem value="medical">Medical Consultation</SelectItem>
                        <SelectItem value="ambulance">Ambulance Service</SelectItem>
                        <SelectItem value="home_doctor">Doctor Home Visit</SelectItem>
                        <SelectItem value="nursing">Nursing Care</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="urgencyLevel"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Urgency Level</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="urgent" id="urgent" />
                          <label htmlFor="urgent" className="flex items-center gap-1 text-sm font-medium">
                            <Ambulance className="h-4 w-4 text-red-500" /> Urgent (As soon as possible)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="scheduled" id="scheduled" />
                          <label htmlFor="scheduled" className="flex items-center gap-1 text-sm font-medium">
                            <Clock className="h-4 w-4 text-blue-500" /> Scheduled (Select time below)
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch('urgencyLevel') === 'scheduled' && (
                <FormField
                  control={form.control}
                  name="preferredTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe the Situation</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Briefly describe the medical situation or requirements" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to share my information with medical service providers and consent to follow-up communications.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="flex gap-3">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Request Emergency Service'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}