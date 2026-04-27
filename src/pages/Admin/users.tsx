import AdminLayout from "@/components/admin/AdminLayout";
import UserManagementUpdated from "@/components/admin/UserManagementUpdated";
import { Users } from "lucide-react";

// Page for the User Management section
const AdminUsersPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
          </div>
        </div>

        {/* Enhanced User Management Component */}
        <UserManagementUpdated />
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;