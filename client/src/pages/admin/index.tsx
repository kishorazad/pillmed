import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "./Dashboard";

// This is the main entry point for the Admin Panel
const AdminPage = () => {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
};

export default AdminPage;