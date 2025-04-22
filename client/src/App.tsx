import { lazy, Suspense, useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "./lib/store";
import { LanguageProvider } from "./components/LanguageSwitcher";
import { AuthProvider, useAuth } from "./lib/auth-provider";
import { Loader2 } from "lucide-react";

// Critical Layout Components - these are needed for initial render
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import NotificationHandler from "./components/notifications/NotificationHandler";

// Frequently used pages - load these eagerly
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "@/pages/not-found";

// Lazily load less critical layout components
const CartSidebar = lazy(() => import("./components/cart/CartSidebar"));
const MobileNavigation = lazy(() => import("./components/layout/MobileNavigation"));
const FloatingContactButtons = lazy(() => import("./components/contact/FloatingContactButtons"));

// Lazily load main pages - these load only when needed
const ProductListing = lazy(() => import("./pages/ProductListing"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Profile = lazy(() => import("./pages/Profile"));
const Checkout = lazy(() => import("./pages/Checkout"));
const AIHealthcare = lazy(() => import("./pages/AIHealthcare"));
const Achievements = lazy(() => import("./pages/Achievements"));
const MedicationTracking = lazy(() => import("./pages/MedicationTracking"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const CommunicationPage = lazy(() => import("./pages/Communication"));

// Lazily load admin dashboards - these are accessed less frequently
const AdminPanel = lazy(() => import("./pages/admin"));
const AdminUserManagement = lazy(() => import("./pages/admin/users"));
const AdminCustomerManagement = lazy(() => import("./pages/admin/customers"));
const AdminPharmacyManagement = lazy(() => import("./pages/admin/pharmacies"));
const AdminDoctorManagement = lazy(() => import("./pages/admin/doctors"));
const AdminAnalytics = lazy(() => import("./pages/admin/analytics"));
const EmailManagement = lazy(() => import("./pages/admin/EmailManagement"));
const PharmacyDashboard = lazy(() => import("./pages/Pharmacy/Dashboard"));
const DoctorDashboard = lazy(() => import("./pages/Doctor/Dashboard"));
const LaboratoryDashboard = lazy(() => import("./pages/Laboratory/Dashboard"));
const ChemistDashboard = lazy(() => import("./pages/dashboard/ChemistDashboard"));

// Lazily load new features
const DeliveryDashboard = lazy(() => import("./pages/Delivery/Dashboard"));
const NearbyHospitalsPage = lazy(() => import("./pages/Hospitals/NearbyHospitalsPage"));
const HospitalsList = lazy(() => import("./pages/hospitals/HospitalsList"));
const HospitalDetail = lazy(() => import("./pages/hospitals/HospitalDetail"));

// Lazily load services
const ServicesPage = lazy(() => import("./pages/services"));
const MedicalEquipment = lazy(() => import("./pages/services/MedicalEquipment"));
const MedicalServices = lazy(() => import("./pages/services/MedicalServices"));
const AmbulanceRequest = lazy(() => import("./pages/services/AmbulanceRequest"));
const EmergencyServicesPage = lazy(() => import("./pages/EmergencyServicesPage"));

// Lazily load doctor-related pages
const DoctorSearch = lazy(() => import("./pages/doctors/DoctorSearch"));
const DoctorDetail = lazy(() => import("./pages/doctors/DoctorDetail"));
const AppointmentConfirmation = lazy(() => import("./pages/doctors/AppointmentConfirmation"));
const AppointmentSuccess = lazy(() => import("./pages/doctors/AppointmentSuccess"));
const VideoConsultation = lazy(() => import("./pages/doctors/VideoConsultation"));
const EPrescription = lazy(() => import("./pages/doctors/EPrescription"));

// Role-based route protection
interface RoleBasedRouteProps {
  path: string;
  component: React.ComponentType;
  allowedRoles: string[];
}

function RoleBasedRoute({ path, component: Component, allowedRoles }: RoleBasedRouteProps) {
  const { user, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }
  
  // Check if user is authenticated
  if (!user) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen flex-col">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="mb-4">You need to log in to access this area.</p>
          <a 
            href="/login"
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Go to Login Page
          </a>
        </div>
      </Route>
    );
  }
  
  // Check if user has the required role
  const userRole = user.role?.toLowerCase();
  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <Route path={path}>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">You don't have permission to access this page.</p>
          <a 
            href="/"
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Return to Home
          </a>
        </div>
      </Route>
    );
  }
  
  // If we get here, the user is authenticated and has the correct role
  return <Route path={path}><Component /></Route>;
}

function Router() {
  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center p-4 min-h-[50vh]">
      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
      <span>Loading page...</span>
    </div>
  );

  // Wrap lazy-loaded component with Suspense
  const SuspenseRoute = ({ component: Component, ...rest }: any) => (
    <Route {...rest}>
      <Suspense fallback={<LoadingFallback />}>
        <Component />
      </Suspense>
    </Route>
  );
  
  return (
    <Switch>
      {/* Critical routes loaded eagerly */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      
      {/* Lazy-loaded routes */}
      <SuspenseRoute path="/products" component={ProductListing} />
      <SuspenseRoute path="/products/category/:categoryId" component={ProductListing} />
      <SuspenseRoute path="/products/:id" component={ProductDetail} />
      <SuspenseRoute path="/cart" component={Cart} />
      <SuspenseRoute path="/profile" component={Profile} />
      <SuspenseRoute path="/checkout" component={Checkout} />
      <SuspenseRoute path="/ai-healthcare" component={AIHealthcare} />
      <SuspenseRoute path="/nearby-hospitals" component={NearbyHospitalsPage} />
      <SuspenseRoute path="/hospitals" component={HospitalsList} />
      <SuspenseRoute path="/hospitals/:id" component={HospitalDetail} />
      <SuspenseRoute path="/achievements" component={Achievements} />
      <SuspenseRoute path="/medication-tracking" component={MedicationTracking} />
      <SuspenseRoute path="/orders" component={OrderHistory} />
    
      {/* Services Routes */}
      <SuspenseRoute path="/services" component={ServicesPage} />
      <SuspenseRoute path="/services/medical-equipment" component={MedicalEquipment} />
      <SuspenseRoute path="/services/medical-services" component={MedicalServices} />
      <SuspenseRoute path="/services/ambulance-request" component={AmbulanceRequest} />
      <SuspenseRoute path="/services/emergency" component={EmergencyServicesPage} />
      <SuspenseRoute path="/communication" component={CommunicationPage} />
      
      {/* Doctor Routes */}
      <SuspenseRoute path="/doctors" component={DoctorSearch} />
      <SuspenseRoute path="/doctors/:id" component={DoctorDetail} />
      <SuspenseRoute path="/doctors/:id/book" component={AppointmentConfirmation} />
      <SuspenseRoute path="/doctors/:id/success" component={AppointmentSuccess} />
      <SuspenseRoute path="/doctors/:id/video" component={VideoConsultation} />
      <SuspenseRoute path="/doctors/:id/prescription" component={EPrescription} />
      
      {/* Admin and Professional Dashboard Routes with Role Protection */}
      <RoleBasedRoute path="/admin" component={AdminPanel} allowedRoles={['admin', 'subadmin']} />
      <RoleBasedRoute path="/admin/users" component={AdminUserManagement} allowedRoles={['admin', 'subadmin']} />
      <RoleBasedRoute path="/admin/customers" component={AdminCustomerManagement} allowedRoles={['admin', 'subadmin']} />
      <RoleBasedRoute path="/admin/pharmacies" component={AdminPharmacyManagement} allowedRoles={['admin', 'subadmin']} />
      <RoleBasedRoute path="/admin/doctors" component={AdminDoctorManagement} allowedRoles={['admin', 'subadmin']} />
      <RoleBasedRoute path="/admin/analytics" component={AdminAnalytics} allowedRoles={['admin', 'subadmin']} />
      <RoleBasedRoute path="/admin/email" component={EmailManagement} allowedRoles={['admin', 'subadmin']} />
      <RoleBasedRoute path="/pharmacy" component={PharmacyDashboard} allowedRoles={['pharmacy']} />
      <RoleBasedRoute path="/doctor" component={DoctorDashboard} allowedRoles={['doctor']} />
      <RoleBasedRoute path="/laboratory" component={LaboratoryDashboard} allowedRoles={['laboratory', 'hospital']} />
      <RoleBasedRoute path="/delivery" component={DeliveryDashboard} allowedRoles={['delivery']} />
      <RoleBasedRoute path="/chemist" component={ChemistDashboard} allowedRoles={['chemist', 'pharmacy']} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { fetchCart, user, tempUserId } = useStore();
  const [componentsLoaded, setComponentsLoaded] = useState({
    cartSidebar: false,
    mobileNav: false,
    contactButtons: false
  });
  
  // Fetch cart data whenever user changes or on initial load
  useEffect(() => {
    fetchCart();
  }, [user, tempUserId, fetchCart]);
  
  // Preload critical UI components after the main page loads
  useEffect(() => {
    // Add resource hints for important assets
    const addResourceHint = (type: 'preload' | 'prefetch', href: string, as: string) => {
      const link = document.createElement('link');
      link.rel = type;
      link.href = href;
      link.as = as;
      if (as === 'image') {
        link.type = 'image/webp'; // Prefer WebP if available
      }
      document.head.appendChild(link);
    };
    
    // Prefetch common assets that will be needed soon
    addResourceHint('preload', '/api/categories', 'fetch');
    addResourceHint('preload', '/api/products/featured', 'fetch');
    
    // Asynchronously load non-critical UI components
    setTimeout(() => {
      import("./components/cart/CartSidebar").then(() => {
        setComponentsLoaded(prev => ({ ...prev, cartSidebar: true }));
      });
    }, 1000);
    
    setTimeout(() => {
      import("./components/layout/MobileNavigation").then(() => {
        setComponentsLoaded(prev => ({ ...prev, mobileNav: true }));
      });
    }, 1500);
    
    setTimeout(() => {
      import("./components/contact/FloatingContactButtons").then(() => {
        setComponentsLoaded(prev => ({ ...prev, contactButtons: true }));
      });
    }, 2000);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Add padding at the bottom on mobile to account for the navigation bar */}
      <main className="flex-grow pb-16 md:pb-0">
        <Router />
      </main>
      <Footer />
      
      {/* Conditionally render lazy-loaded components after they've been loaded */}
      {componentsLoaded.cartSidebar && (
        <Suspense fallback={null}>
          <CartSidebar />
        </Suspense>
      )}
      
      {componentsLoaded.mobileNav && (
        <Suspense fallback={null}>
          <MobileNavigation />
        </Suspense>
      )}
      
      {componentsLoaded.contactButtons && (
        <Suspense fallback={null}>
          <FloatingContactButtons 
            phoneNumber="8770762307"
            whatsappNumber="918770762307"
            message="Hello! I'm interested in ordering medicines from PillNow."
          />
        </Suspense>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
          <NotificationHandler />
          <Toaster />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;