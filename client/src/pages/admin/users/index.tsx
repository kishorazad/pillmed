import AdminLayout from "@/components/admin/AdminLayout";
import UserManagement from "../../admin/UserManagement";

const UsersPage = () => {
  return (
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  );
};

export default UsersPage;