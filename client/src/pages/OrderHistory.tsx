import React, { useState } from 'react';
import OrderHistory from '../components/orders/OrderHistory';
import AutoRefill from '../components/orders/AutoRefill';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const OrderHistoryPage = () => {
  const [activeTab, setActiveTab] = useState<string>('orders');

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
          <OrderHistory />
        </TabsContent>
        
        <TabsContent value="refills">
          <AutoRefill />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderHistoryPage;