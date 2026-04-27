import { useQuery } from '@tanstack/react-query';

const Testimonials = () => {
  const { data: testimonials, isLoading, isError } = useQuery({
    queryKey: ['/api/testimonials'],
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
  
  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                  <div>
                    <div className="bg-gray-200 h-4 w-24 mb-2 rounded"></div>
                    <div className="bg-gray-200 h-3 w-16 rounded"></div>
                  </div>
                </div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (isError || !testimonials) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">What Our Customers Say</h2>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-500 text-center">Failed to load testimonials. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">What Our Customers Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial: any) => (
            <div key={testimonial.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#ff6f61]/10 rounded-full flex items-center justify-center mr-3">
                  <span className="font-bold text-[#ff6f61]">{testimonial.initials}</span>
                </div>
                <div>
                  <h3 className="font-medium">{testimonial.name}</h3>
                  <div className="flex text-yellow-400 text-sm">
                    {Array(5).fill(0).map((_, i) => (
                      <i key={i} className={`fas ${i < testimonial.rating ? 'fa-star' : 'fa-star-half-alt'}`}></i>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
