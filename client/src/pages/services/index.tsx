import React from 'react';
import { Link, useLocation } from 'wouter';
import { Ambulance, User, Stethoscope, ThermometerSnowflake, Bed, MapPin, HeartPulse, Phone, ShieldCheck, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const Services: React.FC = () => {
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
            <BreadcrumbLink>Services</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 mb-12 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Healthcare Services At Your Doorstep</h1>
          <p className="text-lg md:text-xl text-white/90 mb-6">Access professional healthcare services, medical equipment, and emergency assistance from the comfort of your home.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/services/medical-equipment">
              <Button className="bg-white text-orange-600 hover:bg-orange-50">
                Explore Medical Equipment
              </Button>
            </Link>
            <Link href="/services/ambulance-request">
              <Button variant="outline" className="text-white border-white hover:bg-white/10">
                <Ambulance className="mr-2 h-4 w-4" />
                Emergency Services
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Services Sections */}
      <div className="mb-12">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 max-w-lg mx-auto mb-8">
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger value="medical">Medical Care</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-8">
            {/* Featured Services */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Featured Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ServiceCard 
                  icon={<User className="h-8 w-8 text-orange-500" />}
                  title="Home Doctor Visit"
                  description="Get a qualified doctor to visit your home for consultation, diagnosis, and treatment."
                  link="/services/medical-services"
                  cta="Book Now"
                  featured
                />
                <ServiceCard 
                  icon={<Bed className="h-8 w-8 text-orange-500" />}
                  title="Medical Equipment"
                  description="Rent or purchase high-quality medical equipment for home care needs."
                  link="/services/medical-equipment"
                  cta="Explore Equipment"
                />
                <ServiceCard 
                  icon={<Ambulance className="h-8 w-8 text-orange-500" />}
                  title="Emergency Ambulance"
                  description="Request emergency ambulance services with trained paramedics for immediate medical transport."
                  link="/services/ambulance-request"
                  cta="Request Now"
                  urgent
                />
              </div>
            </div>
            
            {/* Medical Services */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Medical Home Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ServiceCard 
                  icon={<Stethoscope className="h-8 w-8 text-orange-500" />}
                  title="Doctor Home Visit"
                  description="Get a qualified doctor to visit your home for consultation, diagnosis, and treatment."
                  price="₹1,499"
                  duration="30-45 minutes"
                  link="/services/medical-services"
                  cta="Book Now"
                />
                <ServiceCard 
                  icon={<Stethoscope className="h-8 w-8 text-orange-500" />}
                  title="Specialist Doctor Visit"
                  description="Specialist doctors visit your home for focused medical needs and specialized care."
                  price="₹2,999"
                  duration="45-60 minutes"
                  link="/services/medical-services"
                  cta="Book Now"
                />
                <ServiceCard 
                  icon={<User className="h-8 w-8 text-orange-500" />}
                  title="Nurse Home Visit"
                  description="Professional nursing care at home including medication administration and dressing changes."
                  price="₹699"
                  duration="30-60 minutes"
                  link="/services/medical-services"
                  cta="Book Now"
                />
              </div>
            </div>
            
            {/* Medical Equipment */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Medical Equipment</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ServiceCard 
                  icon={<ThermometerSnowflake className="h-8 w-8 text-orange-500" />}
                  title="Oxygen Concentrator"
                  description="Rent or purchase oxygen concentrators for respiratory support at home."
                  price="₹599/day"
                  link="/services/medical-equipment"
                  cta="Rent/Buy"
                />
                <ServiceCard 
                  icon={<Bed className="h-8 w-8 text-orange-500" />}
                  title="Hospital Bed"
                  description="Comfortable hospital beds for home care with adjustable positions and side rails."
                  price="₹799/day"
                  link="/services/medical-equipment"
                  cta="Rent/Buy"
                />
                <ServiceCard 
                  icon={<HeartPulse className="h-8 w-8 text-orange-500" />}
                  title="Patient Monitoring"
                  description="Medical-grade monitoring equipment for keeping track of vital parameters at home."
                  price="₹399/day"
                  link="/services/medical-equipment"
                  cta="Rent/Buy"
                />
              </div>
            </div>
            
            {/* Emergency Services */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Emergency Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ServiceCard 
                  icon={<Ambulance className="h-8 w-8 text-orange-500" />}
                  title="Emergency Ambulance"
                  description="Request emergency ambulance services with trained paramedics for immediate medical transport."
                  link="/services/ambulance-request"
                  cta="Request Now"
                  urgent
                />
                <ServiceCard 
                  icon={<Building2 className="h-8 w-8 text-orange-500" />}
                  title="Nearby Hospitals"
                  description="Find hospitals near your location with real-time availability information."
                  link="/hospitals"
                  cta="Find Hospitals"
                />
                <ServiceCard 
                  icon={<Stethoscope className="h-8 w-8 text-orange-500" />}
                  title="Emergency Doctor"
                  description="Request an emergency doctor visit at home for urgent medical situations."
                  price="₹1,999"
                  link="/services/medical-services"
                  cta="Book Now"
                  urgent
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="medical">
            <div>
              <h2 className="text-2xl font-bold mb-6">Medical Home Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ServiceCard 
                  icon={<Stethoscope className="h-8 w-8 text-orange-500" />}
                  title="Doctor Home Visit"
                  description="Get a qualified doctor to visit your home for consultation, diagnosis, and treatment."
                  price="₹1,499"
                  duration="30-45 minutes"
                  link="/services/medical-services"
                  cta="Book Now"
                />
                <ServiceCard 
                  icon={<Stethoscope className="h-8 w-8 text-orange-500" />}
                  title="Specialist Doctor Visit"
                  description="Specialist doctors visit your home for focused medical needs and specialized care."
                  price="₹2,999"
                  duration="45-60 minutes"
                  link="/services/medical-services"
                  cta="Book Now"
                />
                <ServiceCard 
                  icon={<User className="h-8 w-8 text-orange-500" />}
                  title="Nurse Home Visit"
                  description="Professional nursing care at home including medication administration and dressing changes."
                  price="₹699"
                  duration="30-60 minutes"
                  link="/services/medical-services"
                  cta="Book Now"
                />
                <ServiceCard 
                  icon={<User className="h-8 w-8 text-orange-500" />}
                  title="Daily Nursing Care"
                  description="Extended nursing care for patients requiring regular medical attention at home."
                  price="₹1,499"
                  duration="3-8 hours"
                  link="/services/medical-services"
                  cta="Book Now"
                />
                <ServiceCard 
                  icon={<HeartPulse className="h-8 w-8 text-orange-500" />}
                  title="Physiotherapy Session"
                  description="Professional physiotherapy sessions at home to improve mobility and manage pain."
                  price="₹899"
                  duration="45-60 minutes"
                  link="/services/medical-services"
                  cta="Book Now"
                />
                <ServiceCard 
                  icon={<User className="h-8 w-8 text-orange-500" />}
                  title="Elder Care Visit"
                  description="Specialized geriatric care for elderly patients with focus on aging-related concerns."
                  price="₹999"
                  duration="60-90 minutes"
                  link="/services/medical-services"
                  cta="Book Now"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="equipment">
            <div>
              <h2 className="text-2xl font-bold mb-6">Medical Equipment</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ServiceCard 
                  icon={<ThermometerSnowflake className="h-8 w-8 text-orange-500" />}
                  title="Oxygen Concentrator"
                  description="Rent or purchase oxygen concentrators for respiratory support at home."
                  price="₹599/day"
                  link="/services/medical-equipment"
                  cta="Rent/Buy"
                />
                <ServiceCard 
                  icon={<Bed className="h-8 w-8 text-orange-500" />}
                  title="Hospital Bed"
                  description="Comfortable hospital beds for home care with adjustable positions and side rails."
                  price="₹799/day"
                  link="/services/medical-equipment"
                  cta="Rent/Buy"
                />
                <ServiceCard 
                  icon={<HeartPulse className="h-8 w-8 text-orange-500" />}
                  title="CPAP Machine"
                  description="CPAP machines for sleep apnea therapy with auto-adjusting pressure settings."
                  price="₹499/day"
                  link="/services/medical-equipment"
                  cta="Rent/Buy"
                />
                <ServiceCard 
                  icon={<Bed className="h-8 w-8 text-orange-500" />}
                  title="Patient Lift"
                  description="Hydraulic patient lifts for safe transfers between bed, wheelchair, and other surfaces."
                  price="₹699/day"
                  link="/services/medical-equipment"
                  cta="Rent/Buy"
                />
                <ServiceCard 
                  icon={<Bed className="h-8 w-8 text-orange-500" />}
                  title="Wheelchair"
                  description="Lightweight, foldable wheelchairs for easy transport and improved mobility."
                  price="₹299/day"
                  link="/services/medical-equipment"
                  cta="Rent/Buy"
                />
                <ServiceCard 
                  icon={<HeartPulse className="h-8 w-8 text-orange-500" />}
                  title="Nebulizer"
                  description="Compact nebulizers for medication delivery to treat respiratory conditions."
                  price="₹149/day"
                  link="/services/medical-equipment"
                  cta="Rent/Buy"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="emergency">
            <div>
              <h2 className="text-2xl font-bold mb-6">Emergency Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ServiceCard 
                  icon={<Ambulance className="h-8 w-8 text-orange-500" />}
                  title="Emergency Ambulance"
                  description="Request emergency ambulance services with trained paramedics for immediate medical transport."
                  link="/services/ambulance-request"
                  cta="Request Now"
                  urgent
                />
                <ServiceCard 
                  icon={<Building2 className="h-8 w-8 text-orange-500" />}
                  title="Nearby Hospitals"
                  description="Find hospitals near your location with real-time availability information."
                  link="/hospitals"
                  cta="Find Hospitals"
                />
                <ServiceCard 
                  icon={<Stethoscope className="h-8 w-8 text-orange-500" />}
                  title="Emergency Doctor"
                  description="Request an emergency doctor visit at home for urgent medical situations."
                  price="₹1,999"
                  link="/services/medical-services"
                  cta="Book Now"
                  urgent
                />
                <ServiceCard 
                  icon={<HeartPulse className="h-8 w-8 text-orange-500" />}
                  title="Cardiac Emergency"
                  description="Specialized cardiac emergency response with ECG equipment and cardiac specialists."
                  price="₹2,499"
                  link="/services/ambulance-request"
                  cta="Request Now"
                  urgent
                />
                <ServiceCard 
                  icon={<ThermometerSnowflake className="h-8 w-8 text-orange-500" />}
                  title="Emergency Oxygen"
                  description="Emergency oxygen delivery for respiratory distress situations."
                  price="₹999"
                  link="/services/medical-equipment"
                  cta="Request Now"
                  urgent
                />
                <ServiceCard 
                  icon={<Phone className="h-8 w-8 text-orange-500" />}
                  title="Emergency Helpline"
                  description="24/7 medical emergency helpline with access to doctors for guidance during emergencies."
                  link="/services/emergency-helpline"
                  cta="Call Now"
                  urgent
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Map Section */}
      <div className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Service Coverage Area</CardTitle>
            <CardDescription>
              Our services are available in major cities and surrounding areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-80 w-full rounded-lg overflow-hidden border">
              <div className="absolute inset-0 bg-orange-50 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-10 w-10 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Service Coverage Map</h3>
                  <p className="text-gray-500 mb-4">Enter your pincode to check service availability in your area</p>
                  <div className="flex max-w-sm mx-auto">
                    <input 
                      type="text" 
                      placeholder="Enter pincode" 
                      className="px-4 py-2 border rounded-l-md flex-1"
                    />
                    <Button className="rounded-l-none bg-orange-500 hover:bg-orange-600">Check</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-orange-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-500">1</span>
            </div>
            <h3 className="font-semibold mb-2">Select a Service</h3>
            <p className="text-gray-600 text-sm">Choose from our range of healthcare services and medical equipment.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-500">2</span>
            </div>
            <h3 className="font-semibold mb-2">Book an Appointment</h3>
            <p className="text-gray-600 text-sm">Select a date, time, and professional based on your requirements.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-500">3</span>
            </div>
            <h3 className="font-semibold mb-2">Confirm & Pay</h3>
            <p className="text-gray-600 text-sm">Complete your booking with secure payment options and receive confirmation.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-500">4</span>
            </div>
            <h3 className="font-semibold mb-2">Service Delivery</h3>
            <p className="text-gray-600 text-sm">Our professionals arrive at your doorstep at the scheduled time.</p>
          </div>
        </div>
      </div>

      {/* Contact & Help */}
      <div className="mb-12">
        <Card>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-orange-500 mt-1 mr-4" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
                  <p className="text-gray-600 mb-2">Our support team is available round the clock to assist you.</p>
                  <p className="text-lg font-medium text-orange-600">1800-123-4567</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <ShieldCheck className="h-6 w-6 text-orange-500 mt-1 mr-4" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Quality Assurance</h3>
                  <p className="text-gray-600 mb-2">All our professionals are verified and equipment is sanitized.</p>
                  <Link href="/quality-standards">
                    <Button variant="link" className="p-0 h-auto text-orange-600">
                      Learn about our standards
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="flex items-start">
                <HeartPulse className="h-6 w-6 text-orange-500 mt-1 mr-4" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Health Insurance</h3>
                  <p className="text-gray-600 mb-2">Many of our services are covered under health insurance.</p>
                  <Link href="/insurance-partners">
                    <Button variant="link" className="p-0 h-auto text-orange-600">
                      View insurance partners
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  price?: string;
  duration?: string;
  link: string;
  cta: string;
  featured?: boolean;
  urgent?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  icon, 
  title, 
  description, 
  price, 
  duration, 
  link, 
  cta,
  featured,
  urgent
}) => {
  return (
    <Card className={`overflow-hidden ${featured ? 'border-orange-500 shadow-md' : ''} ${urgent ? 'border-red-500' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="p-2 rounded-lg bg-orange-50">
            {icon}
          </div>
          {urgent && (
            <div className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded flex items-center">
              <span className="mr-1">●</span> Urgent Care
            </div>
          )}
          {featured && (
            <div className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-1 rounded flex items-center">
              <span className="mr-1">★</span> Featured
            </div>
          )}
        </div>
        <CardTitle className="text-lg mt-4">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {(price || duration) && (
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
            {price && (
              <div>
                <span className="font-medium">Price:</span> {price}
              </div>
            )}
            {duration && (
              <div>
                <span className="font-medium">Duration:</span> {duration}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={link} className="w-full">
          <Button 
            className={`w-full ${urgent ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            {cta}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default Services;