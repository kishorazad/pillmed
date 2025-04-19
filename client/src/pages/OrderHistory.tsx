import React, { useState, useEffect } from 'react';
import OrderHistory from '../components/orders/OrderHistory';
import AutoRefill from '../components/orders/AutoRefill';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

const OrderHistoryPage = () => {
  const [activeTab, setActiveTab] = useState<string>('orders');
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your orders",
        variant: "destructive",
      });
      setLocation('/profile');
    }
  }, [user, isLoading, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="container min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-gray-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This will be handled by the redirect effect
  }

  return (
    <div className="container py-8">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <TabsList>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="refills">Auto Refills</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="orders">
          <OrderHistory userId={user.id} />
        </TabsContent>
        
        <TabsContent value="refills">
          <AutoRefill userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderHistoryPage;