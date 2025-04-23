import { ReactNode, useState, useEffect } from 'react';
import { useLocation, Redirect, useRoute } from 'wouter';
import AdminNavigation from './AdminNavigation';
import { Loader2, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // Check loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is authenticated with admin role
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Check if user has admin or subadmin role
  if (user.role !== 'admin' && user.role !== 'subadmin') {
    return <Redirect to="/" />;
  }

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Check if we're on an admin page that can go back (not the main dashboard)
  const canGoBack = location !== '/admin' && location !== '/admin/';
  
  // Handle back button navigation
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to the admin dashboard if no history
      window.location.href = '/admin';
    }
  };

  // Register history event listener
  useEffect(() => {
    const handlePopState = () => {
      // When back button is pressed, this will trigger a re-render
      console.log('Back button pressed, current location:', window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 md:ml-64">
        {/* Welcome Header with Time */}
        <div className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {canGoBack && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleGoBack} 
                  className="rounded-full"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h1 className="text-xl font-semibold">Welcome, {user?.name || user?.username}</h1>
                <p className="text-sm text-muted-foreground">PillNow Admin Dashboard</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium">{currentTime}</div>
              <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;