import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const ConsultDoctors = () => {
  // Array of specialty items for the grid
  const specialties = [
    { icon: 'fa-heartbeat', color: 'red', name: 'Cardiology' },
    { icon: 'fa-brain', color: 'blue', name: 'Neurology' },
    { icon: 'fa-lungs', color: 'green', name: 'Pulmonology' },
    { icon: 'fa-stethoscope', color: 'purple', name: 'General' },
    { icon: 'fa-bone', color: 'yellow', name: 'Orthopedics' },
    { icon: 'fa-venus', color: 'pink', name: 'Gynecology' }
  ];
  
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="bg-[#14bef0]/5 rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 order-2 md:order-1">
              <h2 className="text-2xl font-bold mb-4">Consult with Top Doctors</h2>
              <p className="text-gray-600 mb-6">Get medical advice from expert doctors through video consultation</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-3 rounded-lg">
                  <div className="w-12 h-12 bg-[#14bef0]/10 rounded-full flex items-center justify-center mb-2">
                    <i className="fas fa-user-md text-[#14bef0]"></i>
                  </div>
                  <h3 className="font-medium text-sm">Experienced Doctors</h3>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="w-12 h-12 bg-[#14bef0]/10 rounded-full flex items-center justify-center mb-2">
                    <i className="fas fa-video text-[#14bef0]"></i>
                  </div>
                  <h3 className="font-medium text-sm">Video Consultation</h3>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="w-12 h-12 bg-[#14bef0]/10 rounded-full flex items-center justify-center mb-2">
                    <i className="fas fa-file-prescription text-[#14bef0]"></i>
                  </div>
                  <h3 className="font-medium text-sm">Digital Prescription</h3>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="w-12 h-12 bg-[#14bef0]/10 rounded-full flex items-center justify-center mb-2">
                    <i className="fas fa-clock text-[#14bef0]"></i>
                  </div>
                  <h3 className="font-medium text-sm">Available 24/7</h3>
                </div>
              </div>
              <Button asChild className="bg-[#14bef0] text-white hover:bg-[#14bef0]/90">
                <Link href="/doctors">
                  Consult Now
                </Link>
              </Button>
            </div>
            <div className="md:w-1/2 mb-6 md:mb-0 flex justify-center order-1 md:order-2">
              <img 
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=400&fit=crop" 
                alt="Doctor Consultation" 
                className="rounded-lg object-cover h-64"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-medium mb-4">Popular Specialties</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {specialties.map((specialty, index) => (
                <Link key={index} href={`/doctors?specialty=${specialty.name.toLowerCase()}`} className="bg-white rounded-lg p-3 text-center hover:shadow-md transition">
                  <div className={`w-12 h-12 mx-auto bg-${specialty.color}-100 rounded-full flex items-center justify-center mb-2`}>
                    <i className={`fas ${specialty.icon} text-${specialty.color}-500`}></i>
                  </div>
                  <h4 className="text-sm">{specialty.name}</h4>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultDoctors;
