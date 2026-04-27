import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { MapPin, Clock, Phone, AlertCircle, Ambulance, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const AmbulanceRequest: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [emergencyType, setEmergencyType] = useState('general');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [destination, setDestination] = useState('');
  const [isLifeThreatening, setIsLifeThreatening] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientName || !contactPhone || !pickupAddress) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Ambulance requested",
        description: "Your ambulance request has been submitted successfully. You will receive a confirmation call shortly.",
      });
      
      // Reset form or navigate
      navigate('/ambulance-confirmation');
    }, 1500);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/services">Services</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Ambulance Request</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardTitle className="text-2xl flex items-center">
                <Ambulance className="h-6 w-6 mr-2" /> Emergency Ambulance Request
              </CardTitle>
              <CardDescription className="text-white/90">
                Fill in the details below to request an ambulance service
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {/* Emergency Type Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emergency-type" className="text-base font-medium">
                        Emergency Type
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="life-threatening" className="text-sm text-red-600 font-medium">
                          Life-threatening emergency
                        </Label>
                        <Switch
                          id="life-threatening"
                          checked={isLifeThreatening}
                          onCheckedChange={setIsLifeThreatening}
                          className="data-[state=checked]:bg-red-600"
                        />
                      </div>
                    </div>
                    
                    <RadioGroup 
                      defaultValue="general" 
                      value={emergencyType} 
                      onValueChange={setEmergencyType}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div>
                        <RadioGroupItem value="general" id="general" className="peer sr-only" />
                        <Label
                          htmlFor="general"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-200 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50 [&:has([data-state=checked])]:border-orange-500 [&:has([data-state=checked])]:bg-orange-50 cursor-pointer"
                        >
                          <AlertCircle className="mb-2 h-6 w-6 text-gray-500 peer-data-[state=checked]:text-orange-600" />
                          <span className="text-sm font-medium">General Emergency</span>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem value="cardiac" id="cardiac" className="peer sr-only" />
                        <Label
                          htmlFor="cardiac"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-200 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50 [&:has([data-state=checked])]:border-orange-500 [&:has([data-state=checked])]:bg-orange-50 cursor-pointer"
                        >
                          <AlertCircle className="mb-2 h-6 w-6 text-gray-500 peer-data-[state=checked]:text-orange-600" />
                          <span className="text-sm font-medium">Cardiac Emergency</span>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem value="accident" id="accident" className="peer sr-only" />
                        <Label
                          htmlFor="accident"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-200 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50 [&:has([data-state=checked])]:border-orange-500 [&:has([data-state=checked])]:bg-orange-50 cursor-pointer"
                        >
                          <AlertCircle className="mb-2 h-6 w-6 text-gray-500 peer-data-[state=checked]:text-orange-600" />
                          <span className="text-sm font-medium">Accident/Trauma</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                
                  {/* Patient Info */}
                  <div className="space-y-3">
                    <Label htmlFor="patient-name" className="text-base font-medium">
                      Patient Information
                    </Label>
                    <Input
                      id="patient-name"
                      placeholder="Patient's Full Name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                    />
                    
                    <Input
                      id="contact-phone"
                      placeholder="Contact Phone Number"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Pickup Location */}
                  <div className="space-y-3">
                    <Label htmlFor="pickup-address" className="text-base font-medium">
                      Pickup Location
                    </Label>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-5 w-5 text-orange-500 mt-2.5" />
                      <div className="flex-1 space-y-3">
                        <Textarea
                          id="pickup-address"
                          placeholder="Full Address for Pickup"
                          className="min-h-[100px]"
                          value={pickupAddress}
                          onChange={(e) => setPickupAddress(e.target.value)}
                          required
                        />
                        
                        <Input
                          id="landmark"
                          placeholder="Nearby Landmark (Building, Shop, etc.)"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Destination Hospital */}
                  <div className="space-y-3">
                    <Label htmlFor="destination" className="text-base font-medium">
                      Destination Hospital (Optional)
                    </Label>
                    <Input
                      id="destination"
                      placeholder="Hospital Name (Leave blank if you want our recommendation)"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                  
                  {/* Additional Information */}
                  <div className="space-y-3">
                    <Label htmlFor="additional-info" className="text-base font-medium">
                      Additional Information
                    </Label>
                    <Textarea
                      id="additional-info"
                      placeholder="Any medical conditions, special needs, or additional information"
                      className="min-h-[100px]"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                    />
                  </div>
                  
                  {/* Submit Button */}
                  <div className="flex justify-end mt-6 space-x-3">
                    <Button 
                      type="button" 
                      onClick={() => navigate('/services')}
                      variant="outline"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-orange-500 hover:bg-orange-600 min-w-[150px]"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Request Ambulance Now'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Sidebar */}
        <div className="lg:col-span-1">
          {/* Emergency Contacts */}
          <Card className="mb-6">
            <CardHeader className="bg-red-600 text-white">
              <CardTitle className="text-lg">Emergency Helplines</CardTitle>
              <CardDescription className="text-white/90">
                Direct Emergency Numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium">National Emergency</p>
                  <p className="text-xl font-bold text-red-600">112</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium">Ambulance Services</p>
                  <p className="text-xl font-bold text-red-600">102</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium">Police</p>
                  <p className="text-xl font-bold text-red-600">100</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium">Fire</p>
                  <p className="text-xl font-bold text-red-600">101</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Important Information */}
          <Card>
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-lg">Important Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm"><strong>For life-threatening emergencies:</strong> Activate the toggle switch above to prioritize your request.</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Clock className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm"><strong>Response Times:</strong> Average response time is 15-20 minutes in urban areas and 30-40 minutes in rural areas.</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Types of Ambulances Available:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-orange-200 bg-orange-50">Basic Life Support</Badge>
                    <Badge variant="outline" className="border-orange-200 bg-orange-50">Advanced Life Support</Badge>
                    <Badge variant="outline" className="border-orange-200 bg-orange-50">Patient Transport</Badge>
                    <Badge variant="outline" className="border-orange-200 bg-orange-50">Neonatal</Badge>
                    <Badge variant="outline" className="border-orange-200 bg-orange-50">Cardiac</Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-4">
                  After submitting your request, you will receive a confirmation call from our emergency response team to verify details and provide estimated arrival time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceRequest;