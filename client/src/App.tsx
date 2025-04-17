import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "./lib/store";

// Layout
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import CartSidebar from "./components/cart/CartSidebar";
import MobileNavigation from "./components/layout/MobileNavigation";
import FloatingContactButtons from "./components/contact/FloatingContactButtons";

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

// New Features
import DeliveryDashboard from "./pages/Delivery/Dashboard";
import NearbyHospitalsPage from "./pages/Hospitals/NearbyHospitalsPage";

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
      <Route path="/achievements" component={Achievements} />
      <Route path="/medication-tracking" component={MedicationTracking} />
      <Route path="/orders" component={OrderHistory} />
      
      {/* Admin and Professional Dashboard Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/pharmacy" component={PharmacyDashboard} />
      <Route path="/doctor" component={DoctorDashboard} />
      <Route path="/laboratory" component={LaboratoryDashboard} />
      <Route path="/delivery" component={DeliveryDashboard} />
      
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
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
        <CartSidebar />
        <MobileNavigation />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
