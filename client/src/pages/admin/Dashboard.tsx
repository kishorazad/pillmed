import { Database } from 'lucide-react';
import MongoDBDashboard from '@/components/admin/MongoDBDashboard';

// Simplified Dashboard component for the admin panel
// This version directly displays the MongoDB collections for faster loading
const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">MongoDB Collections Dashboard</h1>
          <p className="text-muted-foreground">View and manage all data collections in one place</p>
        </div>
      </div>

      {/* Full MongoDB Dashboard */}
      <MongoDBDashboard />
    </div>
  );
};

export default AdminDashboard;