// import { useEffect, useState, lazy, Suspense } from 'react';
// import { useMediaQuery } from '../hooks/use-media-query';
// import { HomeSEO } from '@/components/seo';
// import { useAuth } from '@/lib/auth-provider';

// // Define interfaces for product and category data
// interface Category {
//   id: number;
//   name: string;
//   imageUrl?: string;
//   description?: string;
// }

// interface Product {
//   id: number;
//   name: string;
//   description?: string;
//   price: number;
//   discountedPrice?: number | null;
//   imageUrl?: string | null;
//   rating?: number | null;
//   ratingCount?: number | null;
// }

// // Import critical components directly
// import HeroSection from '@/components/home/HeroSection';
// import ServicesSection from '@/components/home/ServicesSection';
// import QuickLinks from '@/components/home/QuickLinks';
// import MobileBannerCarousel from '@/components/home/MobileBannerCarousel';
// import MedicineCategorySlider from '@/components/home/MedicineCategorySlider';
// import MedicineSpecialtyCategories from '@/components/home/MedicineSpecialtyCategories';
// import PrescriptionUpload from '@/components/home/PrescriptionUpload';
// import FeaturedProductsSlider from '@/components/home/FeaturedProductsSlider';
// import CategoryCard from '@/components/categories/CategoryCard';
// import EmergencyCallButton from '@/components/EmergencyCallButton';
// import EmergencyServicesSection from '@/components/emergency/EmergencyServicesSection';

// // Lazy load non-critical components to improve initial load time
// const PromotionalBanner = lazy(() => import('@/components/home/PromotionalBanner'));
// const LabTests = lazy(() => import('@/components/services/LabTests'));
// const ConsultDoctors = lazy(() => import('@/components/services/ConsultDoctors'));
// const HealthArticles = lazy(() => import('@/components/home/HealthArticles'));
// const Testimonials = lazy(() => import('@/components/home/Testimonials'));
// const AppPromotion = lazy(() => import('@/components/home/AppPromotion'));
// const HealthTipOfTheDay = lazy(() => import('@/components/home/HealthTipOfTheDay'));
// const PreviouslyBrowsedItems = lazy(() => import('@/components/browsing/PreviouslyBrowsedItems'));
// const BrandPromotions = lazy(() => import('@/components/home/BrandPromotions'));
// const FestivalOffers = lazy(() => import('@/components/home/FestivalOffers'));
// const SpecialOffers = lazy(() => import('@/components/home/SpecialOffers'));
// const TopDeals = lazy(() => import('@/components/home/TopDeals'));
// const OrderHistory = lazy(() => import('@/components/orders/OrderHistory'));
// const HealthServices = lazy(() => import('@/components/home/HealthServices'));
// const NearbyHospitals = lazy(() => import('@/components/hospitals/NearbyHospitals'));
// const MedicalEquipmentSection = lazy(() => import('@/components/equipment/MedicalEquipmentSection'));
// const MedicalServicesSection = lazy(() => import('@/components/medical-services/MedicalServicesSection'));
// const CategoryGrid = lazy(() => import('@/components/home/CategoryGrid'));
// const OffersCarousel = lazy(() => import('@/components/home/OffersCarousel'));
// const ProductSlider = lazy(() => import('@/components/products/ProductSlider'));
// const MedicineSearch = lazy(() => import('@/components/search/MedicineSearch'));

// // Data fetching
// import { useQuery, useQueries } from '@tanstack/react-query';
// import { Loader } from 'lucide-react';

// const Home = () => {
//   const isMobile = useMediaQuery('(max-width: 768px)');
//   const { user } = useAuth(); // Get user from auth context
  
//   // Using useQueries to parallelize API calls for better performance
//   // const results = useQueries({
//   //   queries: [
//   //     {
//   //       queryKey: ['/api/categories'],
//   //       staleTime: 10 * 60 * 1000, // 10 minutes
//   //     },
//   //     {
//   //       queryKey: ['/api/products/featured'],
//   //       staleTime: 5 * 60 * 1000, // 5 minutes
//   //     }
//   //   ]
//   // });
// const results = useQueries({
//   queries: [
//     {
//       queryKey: ['categories'],
//       queryFn: async () => {
//         const res = await fetch('/api/categories');
//         const data = await res.json();
        
//         //return data.data || [];
//       return Array.isArray(data) ? data : data?.data || [];
//       },
//       staleTime: 10 * 60 * 1000,
//     },
//     {
//       queryKey: ['products'],
//       queryFn: async () => {
//         const res = await fetch('/api/products');   // ✅ YOUR WORKING API
//         const data = await res.json();
//         //return data.data || [];
//       return Array.isArray(data) ? data : data?.data || [];
//       },
//       staleTime: 5 * 60 * 1000,
//     }
//   ]
// });
  
  
//   //const categories = results[0].data || [];
//   return Array.isArray(data) ? data : data?.data || [];
//   const categoriesLoading = results[0].isLoading;
  
//   //const featuredProducts = results[1].data || [];
//   const featuredProducts = Array.isArray(results[1].data) ? results[1].data : [];
//   const productsLoading = results[1].isLoading;

//   // Sample offer slides for demonstration
//   const offerSlides = [
//     {
//       id: 1,
//       imageUrl: '/medadock.png',
//       alt: 'Flat 20% off on medicines',
//       link: '/products'
//     },
//     {
//       id: 2,
//       imageUrl: '/medadock.png',
//       alt: 'Up to 60% off on lab tests',
//       link: '/lab-tests'
//     },
//     {
//       id: 3,
//       imageUrl: '/medadock.png',
//       alt: 'Wellness Products',
//       link: '/products'
//     }
//   ];

//   // Scroll to top on page load
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);
  
//   // Extract category names for SEO
//   const categoryNames = categories.length > 0 
//     ? categories.map((cat: Category) => cat.name) 
//     : [];

//   return (
//     <>
//       {/* Advanced SEO component with structured data */}
//       <HomeSEO 
//         featuredProducts={featuredProducts.length}
//         featuredCategories={categoryNames}
//       />
      
//       <div className="container mx-auto px-4 pt-2 pb-16">
//         {isMobile ? (
//           <>
//             {/* Search bar moved to header component */}
            
//             {/* Mobile Quick Links */}
//             <QuickLinks />
            
//             {/* Mobile Banner Carousel */}
//             <MobileBannerCarousel />
            
//             {/* Doctor Consultation Banner - Added for better visibility */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <ConsultDoctors />
//             </Suspense>
            
//             {/* Categories slider for Mobile - MOVED TO TOP */}
//             {!categoriesLoading && categories?.length > 0 && (
//               <MedicineCategorySlider 
//                 categories={categories.map((cat: Category) => ({
//                   id: cat.id,
//                   name: cat.name,
//                   imageUrl: cat.imageUrl || null,
//                   link: `/products/category/${cat.id}`
//                 }))}
//               />
//             )}
            
//             {/* Prescription Upload Feature */}
//             <div className="my-6">
//               <PrescriptionUpload />
//             </div>
            
//             {/* Medicine Specialty Categories - Mobile */}
//             <MedicineSpecialtyCategories title="Medicines by Specialty" />
            
//             {/* Featured Products Slider (single column with sliding functionality) */}
//             <FeaturedProductsSlider 
//               products={featuredProducts} 
//               loading={productsLoading} 
//             />

//             {/* Product Deals (Top Deals) with same grid & sliding */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <TopDeals />
//             </Suspense>
            
//             {/* Browsing History with same grid & sliding */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <PreviouslyBrowsedItems />
//             </Suspense>
            
//             {/* Order History - only shown when user is logged in */}
//             {user && (
//               <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//                 <OrderHistory userId={user.id} />
//               </Suspense>
//             )}
            
//             {/* Health Services with smaller grid & sliding */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <HealthServices />
//             </Suspense>
            
//             {/* Medical Equipment Section */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <MedicalEquipmentSection />
//             </Suspense>
            
//             {/* Medical Services Section */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <MedicalServicesSection />
//             </Suspense>
            
//             {/* Emergency Services Section */}
//             <EmergencyServicesSection />
            
//             {/* Festival Offers */}
//             <div className="my-6">
//               <Suspense fallback={<div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//                 <FestivalOffers />
//               </Suspense>
//             </div>
            
//             {/* Brand Promotions */}
//             <div className="my-6">
//               <Suspense fallback={<div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//                 <BrandPromotions />
//               </Suspense>
//             </div>
            
//             {/* Nearby Hospitals Section with Google Maps integration */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <NearbyHospitals />
//             </Suspense>
            
//             {/* Emergency Call Button */}
//             <EmergencyCallButton />
//           </>
//         ) : (
//           /* Desktop View */
//           <>
//             <HeroSection />
//             <ServicesSection />
            
//             {/* Doctor Consultation Banner - Added for better visibility */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <ConsultDoctors />
//             </Suspense>
            
//             {/* Top Categories - MOVED TO TOP */}
//             <section className="py-8">
//               <div className="container mx-auto">
//                 <h2 className="text-2xl font-bold mb-6">Shop By Category</h2>
//                 {categoriesLoading ? (
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
//                     {Array(6).fill(0).map((_, i) => (
//                       <div key={i} className="text-center p-3 rounded-lg animate-pulse">
//                         <div className="h-24 w-24 mx-auto mb-2 bg-gray-200 rounded-full"></div>
//                         <div className="h-4 bg-gray-200 rounded mx-auto w-16"></div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
//                     {categories?.map((category: Category) => (
//                       <CategoryCard key={category.id} category={category} />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </section>
            
//             {/* Prescription Upload Feature */}
//             <div className="my-6">
//               <PrescriptionUpload />
//             </div>
            
//             {/* Medicine Specialty Categories - Desktop */}
//             <MedicineSpecialtyCategories title="Medicines by Specialty" />
            
//             {/* Featured Products Slider (single column with sliding functionality) */}
//             <FeaturedProductsSlider 
//               products={featuredProducts} 
//               loading={productsLoading} 
//             />
            
//             {/* Product Deals with same grid & sliding */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <TopDeals />
//             </Suspense>
            
//             {/* Browsing History with same grid & sliding */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <PreviouslyBrowsedItems />
//             </Suspense>
            
//             {/* Order History - only shown when user is logged in */}
//             {user && (
//               <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//                 <OrderHistory userId={user.id} />
//               </Suspense>
//             )}
            
//             {/* Health Services with smaller grid & sliding */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <HealthServices />
//             </Suspense>
            
//             {/* Medical Equipment Section */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <MedicalEquipmentSection />
//             </Suspense>
            
//             {/* Medical Services Section */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <MedicalServicesSection />
//             </Suspense>
            
//             {/* Emergency Services Section */}
//             <EmergencyServicesSection />
            
//             {/* Offers Carousel */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <OffersCarousel slides={offerSlides} />
//             </Suspense>
            
//             {/* Health Articles */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <HealthArticles />
//             </Suspense>
            
//             {/* Promotional Offers */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <PromotionalBanner />
//             </Suspense>
            
//             {/* Testimonials Section */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <Testimonials />
//             </Suspense>
            
//             {/* App Download Section */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <AppPromotion />
//             </Suspense>
            
//             {/* Nearby Hospitals Section with Google Maps integration */}
//             <Suspense fallback={<div className="my-6 h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
//               <NearbyHospitals />
//             </Suspense>
            
//             {/* Emergency Call Button */}
//             <EmergencyCallButton />
//           </>
//         )}
//       </div>
//     </>
//   );
// };

import { useEffect, lazy, Suspense } from 'react';
import { useMediaQuery } from '../hooks/use-media-query';
import { HomeSEO } from '@/components/seo';
import { useAuth } from '@/lib/auth-provider';

// Interfaces
interface Category {
  id: number;
  name: string;
  imageUrl?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  discountedPrice?: number | null;
  imageUrl?: string | null;
}

// Components
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import QuickLinks from '@/components/home/QuickLinks';
import MobileBannerCarousel from '@/components/home/MobileBannerCarousel';
import MedicineCategorySlider from '@/components/home/MedicineCategorySlider';
import MedicineSpecialtyCategories from '@/components/home/MedicineSpecialtyCategories';
import PrescriptionUpload from '@/components/home/PrescriptionUpload';
import FeaturedProductsSlider from '@/components/home/FeaturedProductsSlider';
import CategoryCard from '@/components/categories/CategoryCard';
import EmergencyCallButton from '@/components/EmergencyCallButton';
import EmergencyServicesSection from '@/components/emergency/EmergencyServicesSection';

// Lazy
const ConsultDoctors = lazy(() => import('@/components/services/ConsultDoctors'));
const TopDeals = lazy(() => import('@/components/home/TopDeals'));
const PreviouslyBrowsedItems = lazy(() => import('@/components/browsing/PreviouslyBrowsedItems'));
const HealthServices = lazy(() => import('@/components/home/HealthServices'));
const NearbyHospitals = lazy(() => import('@/components/hospitals/NearbyHospitals'));

// API
import { useQueries } from '@tanstack/react-query';

const Home = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useAuth();

  const results = useQueries({
    queries: [
      {
        queryKey: ['categories'],
        queryFn: async () => {
          const res = await fetch('/api/categories');
          const data = await res.json();
          return Array.isArray(data) ? data : data?.data || [];
        },
      },
      {
        queryKey: ['products'],
        queryFn: async () => {
          const res = await fetch('/api/products');
          const data = await res.json();
          return Array.isArray(data) ? data : data?.data || [];
        },
      }
    ]
  });

  const categories = Array.isArray(results[0].data) ? results[0].data : [];
  const categoriesLoading = results[0].isLoading;

  const featuredProducts = Array.isArray(results[1].data) ? results[1].data : [];
  const productsLoading = results[1].isLoading;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categoryNames = categories.map((c: Category) => c.name);

  return (
    <>
      <HomeSEO 
        featuredProducts={featuredProducts.length}
        featuredCategories={categoryNames}
      />

      <div className="container mx-auto px-4 pt-2 pb-16">
        {isMobile ? (
          <>
            <QuickLinks />
            <MobileBannerCarousel />

            <Suspense fallback={<div className="h-40 bg-gray-100" />}>
              <ConsultDoctors />
            </Suspense>

            {!categoriesLoading && categories.length > 0 && (
              <MedicineCategorySlider 
                categories={categories.map((cat: Category) => ({
                  id: cat.id,
                  name: cat.name,
                  imageUrl: cat.imageUrl || '',
                  link: `/products/category/${cat.id}`
                }))}
              />
            )}

            <PrescriptionUpload />
            <MedicineSpecialtyCategories title="Medicines by Specialty" />

            <FeaturedProductsSlider 
              products={featuredProducts} 
              loading={productsLoading} 
            />

            <Suspense fallback={<div className="h-40 bg-gray-100" />}>
              <TopDeals />
              <PreviouslyBrowsedItems />
              <HealthServices />
              <NearbyHospitals />
            </Suspense>

            <EmergencyCallButton />
          </>
        ) : (
          <>
            <HeroSection />
            <ServicesSection />

            <Suspense fallback={<div className="h-40 bg-gray-100" />}>
              <ConsultDoctors />
            </Suspense>

            <section className="py-8">
              <h2 className="text-2xl font-bold mb-6">Shop By Category</h2>

              {categoriesLoading ? (
                <div>Loading...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {categories.map((cat: Category) => (
                    <CategoryCard key={cat.id} category={cat} />
                  ))}
                </div>
              )}
            </section>

            <PrescriptionUpload />
            <MedicineSpecialtyCategories title="Medicines by Specialty" />

            <FeaturedProductsSlider 
              products={featuredProducts} 
              loading={productsLoading} 
            />

            <Suspense fallback={<div className="h-40 bg-gray-100" />}>
              <TopDeals />
              <PreviouslyBrowsedItems />
              <HealthServices />
              <NearbyHospitals />
            </Suspense>

            <EmergencyCallButton />
          </>
        )}
      </div>
    </>
  );
};

export default Home;

// export default Home;
