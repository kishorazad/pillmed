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

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <div className="flex-1 md:ml-64 pt-16">
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;