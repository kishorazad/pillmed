import { useEffect } from 'react';
import { Helmet } from 'react-helmet';

// Components
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import PromotionalBanner from '@/components/home/PromotionalBanner';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import LabTests from '@/components/services/LabTests';
import ConsultDoctors from '@/components/services/ConsultDoctors';
import HealthArticles from '@/components/home/HealthArticles';
import Testimonials from '@/components/home/Testimonials';
import AppPromotion from '@/components/home/AppPromotion';
import HealthTipOfTheDay from '@/components/home/HealthTipOfTheDay';
import PrescriptionUpload from '@/components/home/PrescriptionUpload';

// Categories
import { useQuery } from '@tanstack/react-query';
import CategoryCard from '@/components/products/CategoryCard';

const Home = () => {
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Medadock - Online Pharmacy & Healthcare Products</title>
        <meta name="description" content="India's leading online pharmacy and healthcare platform. Order medicines, book lab tests, and consult with doctors." />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Helmet>
      
      <HeroSection />
      <ServicesSection />
      
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Health Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-full flex">
            <PrescriptionUpload />
          </div>
          <div className="h-full flex">
            <HealthTipOfTheDay />
          </div>
        </div>
      </section>
      
      <PromotionalBanner />
      
      {/* Top Categories */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Shop By Category</h2>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="text-center p-3 rounded-lg animate-pulse">
                  <div className="h-24 w-24 mx-auto mb-2 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded mx-auto w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories?.map((category: any) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      <FeaturedProducts />
      <LabTests />
      <ConsultDoctors />
      <HealthArticles />
      <Testimonials />
      <AppPromotion />
    </>
  );
};

export default Home;
