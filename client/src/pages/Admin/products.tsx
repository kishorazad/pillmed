import AdminLayout from "@/components/admin/AdminLayout";
import ProductManagement from "@/components/admin/ProductManagement";
import { Package } from "lucide-react";

// Product Management Page in Admin Panel
const AdminProductsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Product Management</h1>
            <p className="text-muted-foreground">Manage your entire product catalog efficiently</p>
          </div>
        </div>

        {/* Product Management Component */}
        <ProductManagement />
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;