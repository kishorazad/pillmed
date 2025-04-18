import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "./lib/store";
import { LanguageProvider } from "./components/LanguageSwitcher";

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

// Admin and Professional Dashboards
import AdminDashboard from "./pages/Admin/Dashboard";
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

// Doctors
import DoctorSearch from "./pages/doctors/DoctorSearch";
import DoctorDetail from "./pages/doctors/DoctorDetail";
import AppointmentConfirmation from "./pages/doctors/AppointmentConfirmation";
import AppointmentSuccess from "./pages/doctors/AppointmentSuccess";
import VideoConsultation from "./pages/doctors/VideoConsultation";
import EPrescription from "./pages/doctors/EPrescription";

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
      
      {/* Doctor Routes */}
      <Route path="/doctors" component={DoctorSearch} />
      <Route path="/doctors/:id" component={DoctorDetail} />
      <Route path="/doctors/:id/book" component={AppointmentConfirmation} />
      <Route path="/doctors/:id/success" component={AppointmentSuccess} />
      <Route path="/doctors/:id/video" component={VideoConsultation} />
      <Route path="/doctors/:id/prescription" component={EPrescription} />
      
      {/* Admin and Professional Dashboard Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/pharmacy" component={PharmacyDashboard} />
      <Route path="/doctor" component={DoctorDashboard} />
      <Route path="/laboratory" component={LaboratoryDashboard} />
      <Route path="/delivery" component={DeliveryDashboard} />
      <Route path="/chemist" component={ChemistDashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { fetchCart, user, tempUserId } = useStore();
  
  // Fetch cart data whenever user changes or on initial load
  useEffect(() => {
    // Use our store's fetchCart function
    fetchCart();
  }, [user, tempUserId, fetchCart]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
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
        <NotificationHandler />
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
