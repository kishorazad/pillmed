import { Link } from 'wouter';
import { Pill, TestTube, UserCircle, Heart, Ambulance } from 'lucide-react';

const ServicesSection = () => {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link href="/products" className="bg-[#f8f8f8] rounded-lg p-4 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-[#ff6f61]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Pill className="h-8 w-8 text-[#ff6f61]" />
            </div>
            <h3 className="font-medium">Medicines</h3>
            <p className="text-sm text-gray-500">Over 25,000 products</p>
          </Link>
          
          <Link href="/lab-tests" className="bg-[#f8f8f8] rounded-lg p-4 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-[#14bef0]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <TestTube className="h-8 w-8 text-[#14bef0]" />
            </div>
            <h3 className="font-medium">Lab Tests</h3>
            <p className="text-sm text-gray-500">1,000+ certified labs</p>
          </Link>
          
          <Link href="/consult" className="bg-[#f8f8f8] rounded-lg p-4 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-[#10847e]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserCircle className="h-8 w-8 text-[#10847e]" />
            </div>
            <h3 className="font-medium">Consult Doctor</h3>
            <p className="text-sm text-gray-500">20+ Specialties</p>
          </Link>
          
          <Link href="/products/category/6" className="bg-[#f8f8f8] rounded-lg p-4 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-medium">Health Products</h3>
            <p className="text-sm text-gray-500">Personal care & more</p>
          </Link>
          
          <Link href="/services/emergency" className="bg-[#f8f8f8] rounded-lg p-4 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Ambulance className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="font-medium">Emergency</h3>
            <p className="text-sm text-gray-500">Urgent medical care</p>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
