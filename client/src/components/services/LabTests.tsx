import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

const LabTests = () => {
  const { data: labTests, isLoading, isError } = useQuery({
    queryKey: ['/api/lab-tests'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  if (isLoading) {
    return (
      <section className="py-8 bg-[#f8f8f8]">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row justify-between animate-pulse">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <div className="bg-gray-200 h-8 w-64 mb-4 rounded"></div>
                <div className="bg-gray-200 h-4 w-3/4 mb-6 rounded"></div>
                <div className="space-y-3 mb-6">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-gray-200 h-4 rounded"></div>
                  ))}
                </div>
                <div className="bg-gray-200 h-10 w-32 rounded"></div>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gray-200 h-64 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (isError || !labTests) {
    return (
      <section className="py-8 bg-[#f8f8f8]">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-500">Failed to load lab tests. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-8 bg-[#f8f8f8]">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-4">Book Lab Tests</h2>
              <p className="text-gray-600 mb-6">Get accurate diagnostics from certified laboratories</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  <span>Free sample collection at your home</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  <span>Timely and accurate reports</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  <span>Up to 70% off on tests</span>
                </li>
              </ul>
              <Button asChild className="bg-[#14bef0] text-white hover:bg-[#14bef0]/90">
                <Link href="/lab-tests">
                  Book Now
                </Link>
              </Button>
            </div>
            <div className="md:w-1/2">
              <div className="flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1579165466949-3180a3d056d5?w=600&h=400&fit=crop" 
                  alt="Lab Test Professionals" 
                  className="rounded-lg object-cover h-64"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-medium mb-4">Popular Health Packages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {labTests.map((test: any) => (
                <div key={test.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <h4 className="font-medium mb-2">{test.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{test.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold">₹{test.discountedPrice}</span>
                      <span className="text-xs text-gray-500 line-through ml-1">₹{test.price}</span>
                    </div>
                    <Button className="text-[#14bef0] border border-[#14bef0] bg-transparent rounded px-2 py-1 text-sm hover:bg-[#14bef0] hover:text-white transition">
                      Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LabTests;
