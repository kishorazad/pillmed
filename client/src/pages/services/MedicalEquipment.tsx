import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Search, Filter, Clock, Phone, MapPin, Calendar, DollarSign, Tag, BadgePercent, ShoppingCart, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';

// Sample equipment data
const equipmentData = [
  {
    id: 1,
    name: 'Oxygen Concentrator - 5L',
    image: 'https://images.unsplash.com/photo-1612483767034-45398c5ae6e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    category: 'Respiratory',
    rentalPrice: 599,
    purchasePrice: 27999,
    deposit: 5000,
    deliveryTime: '24 hours',
    availability: true,
    rating: 4.7,
    reviewCount: 86,
    description: 'A 5L oxygen concentrator providing continuous oxygen therapy at home. Suitable for patients with COPD, pneumonia, asthma, or other respiratory conditions.',
    features: [
      '5L oxygen flow per minute',
      'Low noise operation (≤40dB)',
      'Built-in nebulizer',
      'Oxygen concentration: 93% ± 3%',
      'LCD display with intelligent monitoring',
      'Continuous operation capacity'
    ],
    specifications: {
      dimensions: '31.5 × 18.5 × 53.5 cm',
      weight: '14.5 kg',
      powerConsumption: '≤300W',
      noiseLevel: '≤40dB',
      warrantyRental: 'Full coverage during rental period',
      warrantyPurchase: '1 year manufacturer warranty'
    }
  },
  {
    id: 2,
    name: 'Hospital Bed - Semi Electric',
    image: 'https://images.unsplash.com/photo-1631248055158-edec7a3c072b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    category: 'Mobility',
    rentalPrice: 799,
    purchasePrice: 35999,
    deposit: 8000,
    deliveryTime: '24-48 hours',
    availability: true,
    rating: 4.5,
    reviewCount: 64,
    description: 'Semi-electric hospital bed with adjustable head and foot positions. Perfect for home care of patients requiring prolonged bed rest.',
    features: [
      'Semi-electric controls for head and foot adjustments',
      'Manual height adjustment',
      'Heavy-duty steel frame',
      'Includes mattress and side rails',
      'Weight capacity: 180kg',
      'Trendelenburg and reverse Trendelenburg positions'
    ],
    specifications: {
      dimensions: '210 × 90 × 50 cm',
      weight: '75 kg',
      materialsFrame: 'Heavy-duty steel with powder coating',
      materialsMattress: 'High-density foam with waterproof cover',
      warrantyRental: 'Full coverage during rental period',
      warrantyPurchase: '2 year warranty on frame, 1 year on electrical components'
    }
  },
  {
    id: 3,
    name: 'Wheelchair - Folding Lightweight',
    image: 'https://images.unsplash.com/photo-1609120623383-b9f67bf50171?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    category: 'Mobility',
    rentalPrice: 299,
    purchasePrice: 7999,
    deposit: 3000,
    deliveryTime: 'Same day',
    availability: true,
    rating: 4.8,
    reviewCount: 125,
    description: 'Lightweight, foldable wheelchair for easy transport and storage. Ideal for temporary mobility issues or travel use.',
    features: [
      'Lightweight aluminum frame',
      'Quick-release folding mechanism',
      'Padded armrests and seat',
      'Swing-away footrests',
      'Rear wheel locks',
      'Weight capacity: 100kg'
    ],
    specifications: {
      dimensions: '66 × 25 × 91 cm (folded)',
      weight: '8.5 kg',
      seatWidth: '46 cm',
      seatDepth: '40 cm',
      warrantyRental: 'Full coverage during rental period',
      warrantyPurchase: '1 year warranty'
    }
  },
  {
    id: 4,
    name: 'CPAP Machine - Auto',
    image: 'https://images.unsplash.com/photo-1616012481336-c49265611424?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    category: 'Respiratory',
    rentalPrice: 499,
    purchasePrice: 25999,
    deposit: 5000,
    deliveryTime: '24 hours',
    availability: true,
    rating: 4.6,
    reviewCount: 94,
    description: 'Auto-adjusting CPAP machine for sleep apnea therapy. Features advanced pressure monitoring and comfort settings.',
    features: [
      'Auto-adjusting pressure settings',
      'Built-in humidifier',
      'Quiet operation',
      'Data tracking and reporting',
      'Includes mask, tubing, and carrying case',
      'Automatic leak compensation'
    ],
    specifications: {
      dimensions: '22 × 14 × 10 cm',
      weight: '1.2 kg',
      pressureRange: '4-20 cmH2O',
      noiseLevel: '≤26dB',
      warrantyRental: 'Full coverage during rental period',
      warrantyPurchase: '2 year warranty'
    }
  },
  {
    id: 5,
    name: 'Patient Lift - Hydraulic',
    image: 'https://images.unsplash.com/photo-1625046586730-4ee002b609da?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    category: 'Mobility',
    rentalPrice: 699,
    purchasePrice: 29999,
    deposit: 7000,
    deliveryTime: '24-48 hours',
    availability: true,
    rating: 4.4,
    reviewCount: 56,
    description: 'Hydraulic patient lift for safe transfers between bed, wheelchair, and other surfaces. Reduces risk of injury for both patient and caregiver.',
    features: [
      'Hydraulic pump operation',
      'Adjustable base width',
      'Six-point cradle for sling attachment',
      'Includes standard mesh sling',
      'Weight capacity: 150kg',
      'Low maintenance design'
    ],
    specifications: {
      dimensions: '110 × 64 × 130 cm',
      weight: '38 kg',
      liftRange: '65-165 cm',
      baseWidth: '64-104 cm (adjustable)',
      warrantyRental: 'Full coverage during rental period',
      warrantyPurchase: '2 year warranty'
    }
  },
  {
    id: 6,
    name: 'Nebulizer - Compact',
    image: 'https://images.unsplash.com/photo-1631248207065-771018fdc6f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    category: 'Respiratory',
    rentalPrice: 149,
    purchasePrice: 2999,
    deposit: 1000,
    deliveryTime: 'Same day',
    availability: true,
    rating: 4.9,
    reviewCount: 238,
    description: 'Compact nebulizer for medication delivery to the lungs. Treats asthma, COPD, and other respiratory conditions.',
    features: [
      'Compressor nebulizer system',
      'Nearly silent operation',
      'Quick and efficient medication delivery',
      'Complete accessory kit included',
      'Portable design with carrying case',
      'Child and adult masks included'
    ],
    specifications: {
      dimensions: '22 × 14 × 9 cm',
      weight: '1.3 kg',
      nebulizationRate: '≥0.25ml/min',
      particleSize: 'MMAD ≤5μm',
      warrantyRental: 'Full coverage during rental period',
      warrantyPurchase: '1 year warranty'
    }
  }
];

const MedicalEquipment: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 40000]);
  const [availability, setAvailability] = useState(true);
  const [equipmentMode, setEquipmentMode] = useState<'rent' | 'purchase'>('rent');
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null);
  const [rentalDuration, setRentalDuration] = useState('7');
  
  // Filter equipment based on search and filters
  const filteredEquipment = equipmentData.filter(item => {
    // Search filter
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    // Price filter (based on mode)
    const price = equipmentMode === 'rent' ? item.rentalPrice : item.purchasePrice;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    // Availability filter
    const matchesAvailability = !availability || item.availability;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
  });
  
  // Get all unique categories
  const categories = Array.from(new Set(equipmentData.map(item => item.category)));
  
  const handleAddToCart = (equipment: any, mode: 'rent' | 'purchase') => {
    const duration = mode === 'rent' ? parseInt(rentalDuration) : undefined;
    
    addToCart({
      id: equipment.id,
      name: equipment.name,
      price: mode === 'rent' ? equipment.rentalPrice : equipment.purchasePrice,
      image: equipment.image,
      quantity: 1,
      equipmentType: mode,
      rentalDuration: duration
    });
    
    toast({
      title: `${equipment.name} added to cart`,
      description: mode === 'rent' 
        ? `Rental for ${duration} days` 
        : 'Purchase',
    });
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
            <BreadcrumbLink>Medical Equipment</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Equipment</h1>
        <p className="text-gray-600">
          Rent or purchase high-quality medical equipment for home care needs. All equipment is sanitized, maintained, and delivered to your doorstep.
        </p>
      </div>
      
      {/* Mode Selection */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="bg-orange-50 p-1 rounded-lg inline-flex">
                <button
                  className={`px-6 py-2 rounded-md text-sm font-medium ${
                    equipmentMode === 'rent'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-orange-100'
                  }`}
                  onClick={() => setEquipmentMode('rent')}
                >
                  Rent Equipment
                </button>
                <button
                  className={`px-6 py-2 rounded-md text-sm font-medium ${
                    equipmentMode === 'purchase'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-orange-100'
                  }`}
                  onClick={() => setEquipmentMode('purchase')}
                >
                  Purchase Equipment
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search Equipment</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="search"
                    placeholder="Search by name or keyword..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <RadioGroup 
                  value={selectedCategory || ''} 
                  onValueChange={(value) => setSelectedCategory(value === '' ? null : value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="category-all" />
                    <Label htmlFor="category-all" className="cursor-pointer">All Categories</Label>
                  </div>
                  
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <RadioGroupItem value={category} id={`category-${category}`} />
                      <Label htmlFor={`category-${category}`} className="cursor-pointer">{category}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {/* Price Range */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Price Range</Label>
                  <span className="text-sm text-gray-500">
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                  </span>
                </div>
                <Slider
                  defaultValue={priceRange}
                  min={0}
                  max={40000}
                  step={1000}
                  onValueChange={setPriceRange}
                />
              </div>
              
              {/* Availability */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="available" 
                    checked={availability}
                    onCheckedChange={(checked) => setAvailability(checked as boolean)}
                  />
                  <Label htmlFor="available">Show only available items</Label>
                </div>
              </div>
              
              {/* Clear Filters */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setPriceRange([0, 40000]);
                  setAvailability(true);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Equipment List */}
        <div className="lg:col-span-3">
          {selectedEquipment !== null ? (
            <EquipmentDetail 
              equipment={equipmentData.find(item => item.id === selectedEquipment)!}
              onBack={() => setSelectedEquipment(null)}
              equipmentMode={equipmentMode}
              rentalDuration={rentalDuration}
              setRentalDuration={setRentalDuration}
              onAddToCart={handleAddToCart}
            />
          ) : (
            <>
              {/* Results Summary */}
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-500">
                  Showing {filteredEquipment.length} of {equipmentData.length} items
                </p>
                <Select defaultValue="featured">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Equipment Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredEquipment.map(equipment => (
                  <Card key={equipment.id} className="overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={equipment.image} 
                          alt={equipment.name}
                          className="w-full h-full object-cover"
                        />
                        {!equipment.availability && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Badge variant="destructive" className="text-md py-1.5">Currently Unavailable</Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {equipment.category}
                        </Badge>
                        <div className="flex items-center text-yellow-500">
                          <span>★</span>
                          <span className="ml-1 text-sm text-gray-700">{equipment.rating} ({equipment.reviewCount})</span>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2">{equipment.name}</h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{equipment.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Delivery: {equipment.deliveryTime}</span>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          {equipmentMode === 'rent' ? (
                            <div>
                              <p className="text-gray-500 text-sm">Rental Price</p>
                              <p className="text-2xl font-bold text-orange-600">₹{equipment.rentalPrice}<span className="text-sm font-normal text-gray-500">/day</span></p>
                              <p className="text-xs text-gray-500">Deposit: ₹{equipment.deposit}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-gray-500 text-sm">Purchase Price</p>
                              <p className="text-2xl font-bold text-orange-600">₹{equipment.purchasePrice}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedEquipment(equipment.id)}
                          >
                            Details
                          </Button>
                          
                          <Button 
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600"
                            disabled={!equipment.availability}
                            onClick={() => handleAddToCart(equipment, equipmentMode)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            {equipmentMode === 'rent' ? 'Rent' : 'Buy'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredEquipment.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                      setPriceRange([0, 40000]);
                      setAvailability(true);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface EquipmentDetailProps {
  equipment: any;
  onBack: () => void;
  equipmentMode: 'rent' | 'purchase';
  rentalDuration: string;
  setRentalDuration: (duration: string) => void;
  onAddToCart: (equipment: any, mode: 'rent' | 'purchase') => void;
}

const EquipmentDetail: React.FC<EquipmentDetailProps> = ({ 
  equipment, 
  onBack, 
  equipmentMode,
  rentalDuration,
  setRentalDuration,
  onAddToCart
}) => {
  return (
    <div>
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Equipment
      </Button>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Equipment Image */}
            <div className="rounded-lg overflow-hidden">
              <img 
                src={equipment.image} 
                alt={equipment.name}
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Equipment Details */}
            <div>
              <Badge variant="outline" className="mb-2 bg-orange-50 text-orange-700 border-orange-200">
                {equipment.category}
              </Badge>
              
              <h1 className="text-2xl font-bold mb-2">{equipment.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center text-yellow-500 mr-3">
                  <span>★</span>
                  <span className="ml-1 text-sm text-gray-700">{equipment.rating}</span>
                </div>
                <span className="text-sm text-gray-500">{equipment.reviewCount} reviews</span>
              </div>
              
              <p className="text-gray-700 mb-6">{equipment.description}</p>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Availability</h3>
                <div className="flex items-center text-sm text-gray-700 mb-2">
                  <Clock className="h-4 w-4 mr-2 text-orange-500" />
                  <span>Delivery Time: {equipment.deliveryTime}</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                  <span>Delivery available across all service areas</span>
                </div>
              </div>
              
              {/* Price and Options */}
              <div>
                <Tabs defaultValue={equipmentMode} className="mb-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="rent">Rent</TabsTrigger>
                    <TabsTrigger value="purchase">Purchase</TabsTrigger>
                  </TabsList>
                  
                  {/* Rental Tab */}
                  <TabsContent value="rent" className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-gray-500 text-sm">Rental Price</p>
                        <p className="text-3xl font-bold text-orange-600">₹{equipment.rentalPrice}<span className="text-sm font-normal text-gray-500">/day</span></p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Security Deposit</p>
                        <p className="text-xl font-semibold">₹{equipment.deposit}</p>
                        <p className="text-xs text-gray-500">(Refundable)</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rental-duration">Rental Duration</Label>
                      <Select 
                        value={rentalDuration} 
                        onValueChange={setRentalDuration}
                      >
                        <SelectTrigger id="rental-duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="15">15 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">Rental for {rentalDuration} days</span>
                        <span>₹{equipment.rentalPrice * parseInt(rentalDuration)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Refundable deposit</span>
                        <span>₹{equipment.deposit}</span>
                      </div>
                      <div className="border-t border-orange-200 mt-3 pt-3 flex justify-between font-semibold">
                        <span>Total upfront payment</span>
                        <span>₹{equipment.rentalPrice * parseInt(rentalDuration) + equipment.deposit}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600 mt-4"
                      onClick={() => onAddToCart(equipment, 'rent')}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add Rental to Cart
                    </Button>
                  </TabsContent>
                  
                  {/* Purchase Tab */}
                  <TabsContent value="purchase" className="space-y-4">
                    <div>
                      <p className="text-gray-500 text-sm">Purchase Price</p>
                      <p className="text-3xl font-bold text-orange-600">₹{equipment.purchasePrice}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-700">
                        <BadgePercent className="h-4 w-4 mr-2 text-orange-500" />
                        <span>Free shipping on orders above ₹5000</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CalendarRange className="h-4 w-4 mr-2 text-orange-500" />
                        <span>Extended warranty available</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600 mt-4"
                      onClick={() => onAddToCart(equipment, 'purchase')}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          
          {/* Features and Specifications */}
          <div className="mt-10">
            <Tabs defaultValue="features">
              <TabsList>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="warranty">Warranty & Support</TabsTrigger>
              </TabsList>
              
              <TabsContent value="features" className="pt-4">
                <ul className="space-y-2">
                  {equipment.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-orange-500 mr-2">✓</div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="specifications" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(equipment.specifications).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between border-b pb-2">
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="warranty" className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">For Rental</h3>
                    <p className="text-gray-700">{equipment.specifications.warrantyRental}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">For Purchase</h3>
                    <p className="text-gray-700">{equipment.specifications.warrantyPurchase}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">Technical Support</h3>
                    <p className="text-gray-700">Our team provides 24/7 technical support for all equipment. If you encounter any issues, please contact our support line at <span className="text-orange-600 font-medium">1800-123-4567</span>.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalEquipment;