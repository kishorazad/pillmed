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

// Pages
import Home from "./pages/Home";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import NotFound from "@/pages/not-found";

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { setCart, tempUserId } = useStore();
  
  // Fetch cart data on initial load
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(`/api/cart/${tempUserId}`);
        const data = await response.json();
        setCart(data);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    };
    
    fetchCart();
  }, [tempUserId, setCart]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
        <CartSidebar />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
