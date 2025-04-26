import AdminLayout from "@/components/admin/AdminLayout";
import HealthTipsManagement from "@/components/admin/HealthTipsManagement";
import { NotebookPen } from "lucide-react";

// Health Tips Management Page in Admin Panel
const AdminHealthTipsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <NotebookPen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Health Tips</h1>
            <p className="text-muted-foreground">Create and manage health tips for your customers</p>
          </div>
        </div>

        {/* Health Tips Management Component */}
        <HealthTipsManagement />
      </div>
    </AdminLayout>
  );
};

export default AdminHealthTipsPage;