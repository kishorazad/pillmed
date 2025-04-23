import { useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Heart, Stethoscope, Bone, Clock, Video, FileText, Sparkles } from 'lucide-react';
import { usePreload } from '@/hooks/use-preload';
import UserMdIcon from '@/components/icons/UserMdIcon';
import FemaleIcon from '@/components/icons/FemaleIcon';
import BrainIcon from '@/components/icons/BrainIcon';
import LungsIcon from '@/components/icons/LungsIcon';
import MobileGridItem from '@/components/common/MobileGridItem';
import MobileGridContent from '@/components/common/MobileGridContent';
import SliderContainer from '@/components/common/SliderContainer';

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
  
  // For preloading doctor data
  const preload = usePreload();
  
  // Preload doctor search page data
  useEffect(() => {
    // Preload the doctors search page
    preload.json('/api/doctors');
  }, [preload]);
  
  // Doctor service features
  const features = [
    { icon: <UserMdIcon />, title: 'Experienced Doctors' },
    { icon: <Video />, title: 'Video Consultation' },
    { icon: <FileText />, title: 'Digital Prescription' },
    { icon: <Clock />, title: 'Available 24/7' }
  ];
  
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-[#FF8F00]/5 to-[#FF8F00]/10 rounded-xl shadow p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 order-2 md:order-1">
              <div className="flex items-center mb-3">
                <h2 className="text-xl md:text-2xl font-bold">Consult with Top Doctors</h2>
                <Sparkles className="h-5 w-5 ml-2 text-yellow-500" />
              </div>
              <p className="text-gray-600 mb-5">Get medical advice from expert doctors through video consultation</p>
              
              {/* Services grid with enhanced design */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {features.map((feature, index) => (
                  <MobileGridItem 
                    key={index} 
                    hoverEffect="lift"
                    className="mx-auto"
                    shadowColor="rgba(255, 143, 0, 0.15)"
                  >
                    <MobileGridContent
                      icon={feature.icon}
                      title={feature.title}
                      useGradient={true}
                    />
                  </MobileGridItem>
                ))}
              </div>
              
              <Button asChild className="bg-[#FF8F00] text-white hover:bg-[#FF8F00]/90 rounded-xl shadow-md transition-transform hover:scale-105">
                <Link href="/doctors">
                  Consult Now
                </Link>
              </Button>
            </div>
            
            <div className="md:w-1/2 mb-6 md:mb-0 flex justify-center order-1 md:order-2">
              <img 
                src="/doctor-consultation.png" 
                alt="Doctor Consultation" 
                className="rounded-xl shadow-lg object-cover h-64 transform -rotate-1 hover:rotate-0 transition-transform duration-300"
                loading="lazy"
                style={{ boxShadow: '0 10px 25px rgba(255, 143, 0, 0.1)' }}
              />
            </div>
          </div>
          
          {/* Popular Specialties slider - using the new SliderContainer component */}
          <div className="mt-6 pt-5 border-t border-[#FF8F00]/20">
            <SliderContainer
              title="Popular Specialties"
              viewAllLink="/doctors"
              theme="colorful"
              highlight={true}
              accentColor="#FF8F00"
            >
              {specialties.map((specialty, index) => (
                <Link 
                  key={index} 
                  href={`/doctors?specialty=${specialty.name.toLowerCase()}`}
                >
                  <MobileGridItem 
                    hoverEffect="scale"
                    shadowColor={`${specialty.color.replace('text-', 'rgba(')}, 0.15)`}
                  >
                    <MobileGridContent
                      icon={<specialty.icon />}
                      title={specialty.name}
                      iconBackground={specialty.bgColor}
                      iconColor={specialty.color}
                      useGradient={false}
                    />
                  </MobileGridItem>
                </Link>
              ))}
            </SliderContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultDoctors;
