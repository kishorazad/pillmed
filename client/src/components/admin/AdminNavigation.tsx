import { 
  LayoutDashboard,
  Users, 
  ShoppingBag, 
  BarChart3, 
  Bell, 
  Tag, 
  Palette, 
  Settings,
  FilePieChart,
  FileSpreadsheet,
  Home,
  LogOut,
  Pill,
  Building,
  Stethoscope,
  Mail,
  MailWarning
} from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { useAuth } from "@/lib/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Navigation item interface
interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const AdminNavigation = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  // Navigation items for the sidebar
  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/admin'
    },
    {
      label: 'User Management',
      icon: <Users className="h-5 w-5" />,
      href: '/admin/users'
    },
    {
      label: 'Customer Management',
      icon: <Users className="h-5 w-5" />,
      href: '/admin/customers'
    },
    {
      label: 'Pharmacy Management',
      icon: <Building className="h-5 w-5" />,
      href: '/admin/pharmacies'
    },
    {
      label: 'Doctor Management',
      icon: <Stethoscope className="h-5 w-5" />,
      href: '/admin/doctors'
    },
    {
      label: 'Medicine Management',
      icon: <Pill className="h-5 w-5" />,
      href: '/admin/medicines'
    },
    {
      label: 'Email Management',
      icon: <Mail className="h-5 w-5" />,
      href: '/admin/email'
    },
    {
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/admin/analytics'
    },
    {
      label: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      href: '/admin/notifications'
    },
    {
      label: 'Offers & Discounts',
      icon: <Tag className="h-5 w-5" />,
      href: '/admin/offers'
    },
    {
      label: 'Website Settings',
      icon: <Palette className="h-5 w-5" />,
      href: '/admin/website-settings'
    },
    {
      label: 'Data Import',
      icon: <FileSpreadsheet className="h-5 w-5" />,
      href: '/admin/data-import'
    },
    {
      label: 'Reports',
      icon: <FilePieChart className="h-5 w-5" />,
      href: '/admin/reports'
    },
    {
      label: 'Courier Tracking',
      icon: <ShoppingBag className="h-5 w-5" />,
      href: '/admin/courier'
    },
    {
      label: 'System Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/admin/settings'
    }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r shadow-sm z-30 hidden md:block">
      <div className="flex flex-col h-full">
        {/* Admin Logo & Header */}
        <div className="p-4 border-b flex items-center">
          <div className="font-bold text-xl text-primary">PillNow Admin</div>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b">
          <div className="font-medium">{user?.username || 'Admin'}</div>
          <div className="text-sm text-muted-foreground capitalize">{user?.role || 'Administrator'}</div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a 
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      location === item.href
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t mt-auto">
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              asChild
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                <span>Back to Site</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;