import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-[#14bef0]/10 to-[#10847e]/10 py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Take care of your health from home</h1>
            <p className="text-gray-600 mb-6">Order medicines online and get them delivered at your doorstep</p>
            <div className="flex flex-col md:flex-row gap-4">
              <Button asChild className="bg-[#ff6f61] text-white hover:bg-[#ff6f61]/90">
                <Link href="/products">
                  Order Medicines
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#10847e] text-[#10847e] hover:bg-gray-50">
                <Link href="/lab-tests">
                  Book Lab Test
                </Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800&h=600&fit=crop" 
              alt="Pharmacy services" 
              className="rounded-lg shadow-md max-w-full md:max-w-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
