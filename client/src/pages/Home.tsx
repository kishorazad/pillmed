import { useEffect, useState } from 'react';
import { useMediaQuery } from '../hooks/use-media-query';
import { HomeSEO } from '@/components/seo';

// Define interfaces for product and category data
interface Category {
  id: number;
  name: string;
  imageUrl?: string;
  description?: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number | null;
  imageUrl?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
}

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
import PreviouslyBrowsedItems from '@/components/browsing/PreviouslyBrowsedItems';

// Mobile-optimized components
import MobileBannerCarousel from '@/components/home/MobileBannerCarousel';
import CategoryGrid from '@/components/home/CategoryGrid';
import OffersCarousel from '@/components/home/OffersCarousel';
import QuickLinks from '@/components/home/QuickLinks';
import ProductSlider from '@/components/products/ProductSlider';
import MedicineSearch from '@/components/search/MedicineSearch';
import MedicineCategorySlider from '@/components/home/MedicineCategorySlider';
import CategoryCard from '@/components/categories/CategoryCard';

// Data fetching
import { useQuery } from '@tanstack/react-query';

const Home = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  const { data: featuredProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/featured'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sample offer slides for demonstration
  const offerSlides = [
    {
      id: 1,
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/11d75cea0ea-GRAND20.jpg',
      alt: 'Flat 20% off on medicines',
      link: '/products'
    },
    {
      id: 2,
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/9fe349e05e7-LABTEST.jpg',
      alt: 'Up to 60% off on lab tests',
      link: '/lab-tests'
    },
    {
      id: 3,
      imageUrl: 'https://cdn01.pharmeasy.in/dam/banner/banner/414524ad3dd-WELLNESS.jpg',
      alt: 'Wellness Products',
      link: '/products'
    }
  ];

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Extract category names for SEO
  const categoryNames = categories.length > 0 
    ? categories.map((cat: Category) => cat.name) 
    : [];

  return (
    <>
      {/* Advanced SEO component with structured data */}
      <HomeSEO 
        featuredProducts={featuredProducts.length}
        featuredCategories={categoryNames}
      />
      
      <div className="container mx-auto px-4 pt-2 pb-16">
        {isMobile ? (
          <>
            {/* Search bar moved to header component */}
            
            {/* Mobile Quick Links */}
            <QuickLinks />
            
            {/* Mobile Banner Carousel */}
            <MobileBannerCarousel />
            
            {/* Offers for You */}
            <div className="my-4">
              <h2 className="text-lg font-bold mb-3">Offers for You</h2>
              <OffersCarousel offers={offerSlides} />
            </div>
            
            {/* Categories slider for Mobile */}
            {!categoriesLoading && categories?.length > 0 && (
              <MedicineCategorySlider 
                categories={categories.map((cat: Category) => ({
                  id: cat.id,
                  name: cat.name,
                  imageUrl: cat.imageUrl || null,
                  link: `/products/category/${cat.id}`
                }))}
              />
            )}
            
            {/* Featured Products Slider */}
            {!productsLoading && featuredProducts?.length > 0 && (
              <ProductSlider 
                title="Featured Products"
                viewMoreLink="/products?featured=true"
                products={featuredProducts}
              />
            )}
            
            {/* Top Deals Section */}
            {!productsLoading && featuredProducts?.length > 0 && (
              <ProductSlider 
                title="Top Deals"
                viewMoreLink="/products?sort=discountDesc"
                products={featuredProducts.filter((p: Product) => p.discountedPrice)}
              />
            )}
            
            {/* Previously Browsed Items */}
            <PreviouslyBrowsedItems />
            
            {/* Health Services */}
            <section className="my-6">
              <h2 className="text-lg font-bold mb-4">Health Services</h2>
              <div className="space-y-4">
                <PrescriptionUpload />
                <HealthTipOfTheDay />
              </div>
            </section>
          </>
        ) : (
          /* Desktop View */
          <>
            <HeroSection />
            <ServicesSection />
            
            <section className="py-8">
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
              <div className="container mx-auto">
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
                    {categories?.map((category: Category) => (
                      <CategoryCard key={category.id} category={category} />
                    ))}
                  </div>
                )}
              </div>
            </section>
            
            <FeaturedProducts />
            <PreviouslyBrowsedItems />
            <LabTests />
            <ConsultDoctors />
            <HealthArticles />
            <Testimonials />
          </>
        )}

        {/* App Promotion (both mobile and desktop) */}
        <AppPromotion />
      </div>
    </>
  );
};

export default Home;
