import AdminLayout from "@/components/admin/AdminLayout";
import CustomerDetailsPanel from "@/components/admin/CustomerDetailsPanel";
import { Users } from "lucide-react";

// Customer Management Page in Admin Panel
const AdminCustomersPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Customer Management</h1>
            <p className="text-muted-foreground">View and manage customer profiles, purchase history, and cart data</p>
          </div>
        </div>

        {/* Customer Management Component */}
        <CustomerDetailsPanel />
      </div>
    </AdminLayout>
  );
};

export default AdminCustomersPage;