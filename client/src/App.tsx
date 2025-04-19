import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "./lib/store";
import { LanguageProvider } from "./components/LanguageSwitcher";
import { AuthProvider, useAuth } from "./lib/auth-provider";
import { Loader2 } from "lucide-react";

// Layout
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import CartSidebar from "./components/cart/CartSidebar";
import MobileNavigation from "./components/layout/MobileNavigation";
import FloatingContactButtons from "./components/contact/FloatingContactButtons";
import NotificationHandler from "./components/notifications/NotificationHandler";

// Pages
import Home from "./pages/Home";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import NotFound from "@/pages/not-found";
import AIHealthcare from "./pages/AIHealthcare";
import Achievements from "./pages/Achievements";
import MedicationTracking from "./pages/MedicationTracking";
import OrderHistory from "./pages/OrderHistory";
import CommunicationPage from "./pages/Communication";

// Admin and Professional Dashboards
import AdminPanel from "./pages/admin";
import AdminUserManagement from "./pages/admin/users";
import AdminCustomerManagement from "./pages/admin/customers";
import AdminPharmacyManagement from "./pages/admin/pharmacies";
import AdminDoctorManagement from "./pages/admin/doctors";
import AdminAnalytics from "./pages/admin/analytics";
import PharmacyDashboard from "./pages/Pharmacy/Dashboard";
import DoctorDashboard from "./pages/Doctor/Dashboard";
import LaboratoryDashboard from "./pages/Laboratory/Dashboard";
import ChemistDashboard from "./pages/dashboard/ChemistDashboard";

// New Features
import DeliveryDashboard from "./pages/Delivery/Dashboard";
import NearbyHospitalsPage from "./pages/Hospitals/NearbyHospitalsPage";
import HospitalsList from "./pages/hospitals/HospitalsList";
import HospitalDetail from "./pages/hospitals/HospitalDetail";

// Services
import ServicesPage from "./pages/services";
import MedicalEquipment from "./pages/services/MedicalEquipment";
import MedicalServices from "./pages/services/MedicalServices";
import AmbulanceRequest from "./pages/services/AmbulanceRequest";
import EmergencyServicesPage from "./pages/EmergencyServicesPage";

// Doctors
import DoctorSearch from "./pages/doctors/DoctorSearch";
import DoctorDetail from "./pages/doctors/DoctorDetail";
import AppointmentConfirmation from "./pages/doctors/AppointmentConfirmation";
import AppointmentSuccess from "./pages/doctors/AppointmentSuccess";
import VideoConsultation from "./pages/doctors/VideoConsultation";
import EPrescription from "./pages/doctors/EPrescription";

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
            href="/profile"
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
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={ProductListing} />
      <Route path="/products/category/:categoryId" component={ProductListing} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/profile" component={Profile} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/ai-healthcare" component={AIHealthcare} />
      <Route path="/nearby-hospitals" component={NearbyHospitalsPage} />
      <Route path="/hospitals" component={HospitalsList} />
      <Route path="/hospitals/:id" component={HospitalDetail} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/medication-tracking" component={MedicationTracking} />
      <Route path="/orders" component={OrderHistory} />
    
      {/* Services Routes */}
      <Route path="/services" component={ServicesPage} />
      <Route path="/services/medical-equipment" component={MedicalEquipment} />
      <Route path="/services/medical-services" component={MedicalServices} />
      <Route path="/services/ambulance-request" component={AmbulanceRequest} />
      <Route path="/services/emergency" component={EmergencyServicesPage} />
      <Route path="/communication" component={CommunicationPage} />
      
      {/* Doctor Routes */}
      <Route path="/doctors" component={DoctorSearch} />
      <Route path="/doctors/:id" component={DoctorDetail} />
      <Route path="/doctors/:id/book" component={AppointmentConfirmation} />
      <Route path="/doctors/:id/success" component={AppointmentSuccess} />
      <Route path="/doctors/:id/video" component={VideoConsultation} />
      <Route path="/doctors/:id/prescription" component={EPrescription} />
      
      {/* Admin and Professional Dashboard Routes with Role Protection */}
      <RoleBasedRoute path="/admin" component={AdminPanel} allowedRoles={['admin', 'subadmin']} />
      <RoleBasedRoute path="/admin/users" component={AdminUserManagement} allowedRoles={['admin', 'subadmin']} />
      <RoleBasedRoute path="/admin/customers" component={AdminCustomerManagement} allowedRoles={['admin', 'subadmin']} />
      <RoleBasedRoute path="/admin/pharmacies" component={AdminPharmacyManagement} allowedRoles={['admin', 'subadmin']} />
      <RoleBasedRoute path="/admin/doctors" component={AdminDoctorManagement} allowedRoles={['admin', 'subadmin']} />
      <RoleBasedRoute path="/admin/analytics" component={AdminAnalytics} allowedRoles={['admin', 'subadmin']} />
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
  
  // Fetch cart data whenever user changes or on initial load
  useEffect(() => {
    fetchCart();
  }, [user, tempUserId, fetchCart]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Add padding at the bottom on mobile to account for the navigation bar */}
      <main className="flex-grow pb-16 md:pb-0">
        <Router />
      </main>
      <Footer />
      <CartSidebar />
      <MobileNavigation />
      
      {/* WhatsApp and Call Buttons */}
      <FloatingContactButtons 
        phoneNumber="8770762307"
        whatsappNumber="918770762307"
        message="Hello! I'm interested in ordering medicines from PillNow."
      />
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