import AdminLayout from "@/components/admin/AdminLayout";
import TestimonialManagement from "@/components/admin/TestimonialManagement";
import { MessageSquareQuote } from "lucide-react";

// Testimonial Management Page in Admin Panel
const AdminTestimonialsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageSquareQuote className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Testimonials</h1>
            <p className="text-muted-foreground">Manage customer testimonials and reviews</p>
          </div>
        </div>

        {/* Testimonial Management Component */}
        <TestimonialManagement />
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonialsPage;