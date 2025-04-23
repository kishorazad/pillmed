import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Stethoscope, Bone, Clock, Video, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { usePreload } from '@/hooks/use-preload';
import UserMdIcon from '@/components/icons/UserMdIcon';
import FemaleIcon from '@/components/icons/FemaleIcon';
import BrainIcon from '@/components/icons/BrainIcon';
import LungsIcon from '@/components/icons/LungsIcon';

const ConsultDoctors = () => {
  // Updated array of specialty items with custom icons
  const specialties = [
    { icon: Heart, color: 'text-red-500', bgColor: 'bg-red-100', name: 'Cardiology' },
    { icon: BrainIcon, color: 'text-blue-500', bgColor: 'bg-blue-100', name: 'Neurology' },
    { icon: LungsIcon, color: 'text-green-500', bgColor: 'bg-green-100', name: 'Pulmonology' },
    { icon: Stethoscope, color: 'text-purple-500', bgColor: 'bg-purple-100', name: 'General' },
    { icon: Bone, color: 'text-amber-500', bgColor: 'bg-amber-100', name: 'Orthopedics' },
    { icon: FemaleIcon, color: 'text-pink-500', bgColor: 'bg-pink-100', name: 'Gynecology' }
  ];
  
  // For horizontal scrolling with buttons
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const preload = usePreload();
  
  // Check if scroll buttons should be shown
  const checkScrollButtons = () => {
    if (sliderRef.current) {
      setShowLeftArrow(sliderRef.current.scrollLeft > 10);
      setShowRightArrow(sliderRef.current.scrollLeft < sliderRef.current.scrollWidth - sliderRef.current.clientWidth - 10);
    }
  };
  
  // Scroll function
  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 180; // Width of item + gap
      const newScrollLeft = direction === 'left' 
        ? sliderRef.current.scrollLeft - scrollAmount
        : sliderRef.current.scrollLeft + scrollAmount;
        
      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };
  
  // Preload doctor search page data
  useEffect(() => {
    // Preload the doctors search page
    preload.json('/api/doctors');
  }, [preload]);
  
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="bg-[#FF8F00]/5 rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 order-2 md:order-1">
              <h2 className="text-xl md:text-2xl font-bold mb-3">Consult with Top Doctors</h2>
              <p className="text-gray-600 mb-5">Get medical advice from expert doctors through video consultation</p>
              
              {/* Services grid with fixed dimensions */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Each service box is exactly 90px x 118px with 88.4px x 72.33px content area */}
                <div className="bg-white rounded-lg shadow-sm p-2 w-[90px] h-[118px] flex flex-col items-center justify-center">
                  <div className="w-[88.4px] h-[72.33px] flex items-center justify-center">
                    <div className="w-14 h-14 bg-[#FF8F00]/10 rounded-full flex items-center justify-center">
                      <UserMdIcon className="h-7 w-7 text-[#FF8F00]" />
                    </div>
                  </div>
                  <h3 className="font-medium text-xs text-center mt-1">Experienced Doctors</h3>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-2 w-[90px] h-[118px] flex flex-col items-center justify-center">
                  <div className="w-[88.4px] h-[72.33px] flex items-center justify-center">
                    <div className="w-14 h-14 bg-[#FF8F00]/10 rounded-full flex items-center justify-center">
                      <Video className="h-7 w-7 text-[#FF8F00]" />
                    </div>
                  </div>
                  <h3 className="font-medium text-xs text-center mt-1">Video Consultation</h3>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-2 w-[90px] h-[118px] flex flex-col items-center justify-center">
                  <div className="w-[88.4px] h-[72.33px] flex items-center justify-center">
                    <div className="w-14 h-14 bg-[#FF8F00]/10 rounded-full flex items-center justify-center">
                      <FileText className="h-7 w-7 text-[#FF8F00]" />
                    </div>
                  </div>
                  <h3 className="font-medium text-xs text-center mt-1">Digital Prescription</h3>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-2 w-[90px] h-[118px] flex flex-col items-center justify-center">
                  <div className="w-[88.4px] h-[72.33px] flex items-center justify-center">
                    <div className="w-14 h-14 bg-[#FF8F00]/10 rounded-full flex items-center justify-center">
                      <Clock className="h-7 w-7 text-[#FF8F00]" />
                    </div>
                  </div>
                  <h3 className="font-medium text-xs text-center mt-1">Available 24/7</h3>
                </div>
              </div>
              
              <Button asChild className="bg-[#FF8F00] text-white hover:bg-[#FF8F00]/90">
                <Link href="/doctors">
                  Consult Now
                </Link>
              </Button>
            </div>
            
            <div className="md:w-1/2 mb-6 md:mb-0 flex justify-center order-1 md:order-2">
              <img 
                src="/doctor-consultation.png" 
                alt="Doctor Consultation" 
                className="rounded-lg shadow-md object-cover h-64"
                loading="lazy"
              />
            </div>
          </div>
          
          {/* Popular Specialties slider */}
          <div className="mt-6 pt-5 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Popular Specialties</h3>
              <Link href="/doctors" className="text-sm font-medium text-[#FF8F00] flex items-center">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="relative">
              {showLeftArrow && (
                <button 
                  onClick={() => scroll('left')} 
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              
              {showRightArrow && (
                <button 
                  onClick={() => scroll('right')} 
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
              
              <div 
                ref={sliderRef} 
                className="flex overflow-x-auto no-scrollbar gap-4 pb-4"
                onScroll={checkScrollButtons}
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {specialties.map((specialty, index) => (
                  <Link 
                    key={index} 
                    href={`/doctors?specialty=${specialty.name.toLowerCase()}`}
                  >
                    <div 
                      className="flex-none w-[90px] h-[118px] flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-2 transition-shadow hover:shadow-md"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className="w-[88.4px] h-[72.33px] flex items-center justify-center">
                        <div className={`w-14 h-14 ${specialty.bgColor} rounded-full flex items-center justify-center`}>
                          <specialty.icon className={`h-7 w-7 ${specialty.color}`} />
                        </div>
                      </div>
                      <h4 className="text-xs font-medium text-center mt-1">{specialty.name}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultDoctors;
