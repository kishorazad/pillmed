import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ChatInterface from '@/components/chat/ChatInterface';
import VideoCallInterface from '@/components/video/VideoCallInterface';
import TaskManager from '@/components/tasks/TaskManager';
import { CommunicationSEO } from '@/components/seo';

const CommunicationPage = () => {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="container mx-auto p-4 pt-16">
      <CommunicationSEO />
      <h1 className="text-3xl font-bold mb-6">Communication Center</h1>
      
      <Tabs defaultValue="chat" onValueChange={setActiveTab as any} className="mb-8">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="video">Video Calls</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Chat Interface</CardTitle>
              <CardDescription>
                Communicate securely with doctors, pharmacies, and other healthcare professionals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatInterface />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Video Consultation</CardTitle>
              <CardDescription>
                Conduct virtual appointments and consultations with healthcare providers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VideoCallInterface 
                recipientName="Dr. Sarah Johnson"
                recipientRole="doctor"
                callType="doctor-patient"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task Manager</CardTitle>
              <CardDescription>
                Manage healthcare tasks, medication reminders, and follow-up appointments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskManager viewMode="all" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationPage;