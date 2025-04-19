import { ReactNode } from 'react';
import { useLocation, Redirect } from 'wouter';
import AdminNavigation from './AdminNavigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';

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

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 md:ml-64">
        {/* Welcome Header with Time */}
        <div className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Welcome, {user?.name || user?.username}</h1>
              <p className="text-sm text-muted-foreground">PillNow Admin Dashboard</p>
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