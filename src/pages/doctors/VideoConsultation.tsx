import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Phone, 
  MonitorStop, 
  MessageSquare, 
  X, 
  Maximize2, 
  Minimize2,
  User,
  Volume2,
  Volume1,
  VolumeX,
  Settings,
  Send,
  // PaperPlaneRight is not available in lucide-react, using Send instead
  Menu,
  Clock,
  Pill,
  FileText,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// Sample doctor data for the consultation
const doctorData = {
  id: 1,
  name: 'Dr. Priya Sharma',
  image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  specialty: 'Cardiologist'
};

// Sample patient data
const patientData = {
  name: 'Rahul Khanna',
  image: null
};

// Sample appointment data
const appointmentData = {
  appointmentId: 'APT123456',
  appointmentTime: '10:30 AM',
  duration: 15, // in minutes
};

// Sample chat messages
const initialChatMessages = [
  {
    id: 1,
    sender: 'doctor',
    message: 'Hello Rahul, how are you feeling today?',
    time: '10:30 AM'
  },
  {
    id: 2,
    sender: 'patient',
    message: "Hello Dr. Sharma, I'm experiencing chest pain when I exert myself. It started about a week ago.",
    time: '10:31 AM'
  },
  {
    id: 3,
    sender: 'doctor',
    message: 'I see. Can you describe the pain? Is it sharp, dull, or more like pressure?',
    time: '10:32 AM'
  }
];

const VideoConsultation: React.FC = () => {
  const [, navigate] = useLocation();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // State for video call controls
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(true);
  const [activeTab, setActiveTab] = useState('video');
  const [showSettings, setShowSettings] = useState(false);
  const [showEndCall, setShowEndCall] = useState(false);
  const [remainingTime, setRemainingTime] = useState(appointmentData.duration * 60);
  
  // State for chat
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // State for prescription
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState('');
  
  // Mock video streams with color canvases
  useEffect(() => {
    if (localVideoRef.current) {
      // Create a canvas for local video
      const localCanvas = document.createElement('canvas');
      localCanvas.width = 640;
      localCanvas.height = 480;
      const localCtx = localCanvas.getContext('2d');
      if (localCtx) {
        localCtx.fillStyle = '#f0f0f0';
        localCtx.fillRect(0, 0, localCanvas.width, localCanvas.height);
        localCtx.font = '20px Arial';
        localCtx.fillStyle = 'black';
        localCtx.textAlign = 'center';
        localCtx.fillText('Local Camera (You)', localCanvas.width/2, localCanvas.height/2);
        
        // Convert canvas to video stream
        const localStream = localCanvas.captureStream();
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play().catch(error => console.error('Error playing local video:', error));
      }
    }
    
    if (remoteVideoRef.current) {
      // Create a canvas for remote video
      const remoteCanvas = document.createElement('canvas');
      remoteCanvas.width = 640;
      remoteCanvas.height = 480;
      const remoteCtx = remoteCanvas.getContext('2d');
      if (remoteCtx) {
        remoteCtx.fillStyle = '#e6f7ff';
        remoteCtx.fillRect(0, 0, remoteCanvas.width, remoteCanvas.height);
        remoteCtx.font = '20px Arial';
        remoteCtx.fillStyle = 'black';
        remoteCtx.textAlign = 'center';
        remoteCtx.fillText(`Remote Camera (${doctorData.name})`, remoteCanvas.width/2, remoteCanvas.height/2);
        
        // Convert canvas to video stream
        const remoteStream = remoteCanvas.captureStream();
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch(error => console.error('Error playing remote video:', error));
      }
    }
  }, [isVideoOff]);
  
  // Timer effect for countdown
  useEffect(() => {
    if (!isCallActive) return;
    
    const timerInterval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [isCallActive]);
  
  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // Toggle mic
  const toggleMic = () => {
    setIsMicMuted(!isMicMuted);
    // In a real implementation, this would actually mute the audio track
  };
  
  // Toggle video
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // In a real implementation, this would actually turn off the video track
  };
  
  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };
  
  // End call
  const endCall = () => {
    setIsCallActive(false);
    // Navigate to consultation summary
    navigate(`/doctors/${doctorData.id}/summary`);
  };
  
  // Send chat message
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newChatMessage = {
      id: chatMessages.length + 1,
      sender: 'patient' as const,
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([...chatMessages, newChatMessage]);
    setNewMessage('');
  };
  
  // Format remaining time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle ending the prescription
  const handlePrescriptionSubmit = () => {
    // Here you would send the prescription to an API
    console.log("Sending prescription:", prescriptionText);
    setIsPrescriptionDialogOpen(false);
    
    // In a real app, would show a confirmation and update the UI
  };
  
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={doctorData.image} alt={doctorData.name} />
            <AvatarFallback>{doctorData.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-medium text-gray-900">{doctorData.name}</h1>
            <p className="text-sm text-gray-500">{doctorData.specialty}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Badge variant="outline" className="flex items-center bg-red-50 text-red-700 border-red-200 mr-4">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(remainingTime)}
          </Badge>
          
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Video Call Settings</DialogTitle>
                <DialogDescription>
                  Adjust your audio and video settings for the call.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Audio Input</Label>
                  <Select defaultValue="default">
                    <SelectTrigger>
                      <SelectValue placeholder="Select microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Microphone</SelectItem>
                      <SelectItem value="mic1">Microphone 1</SelectItem>
                      <SelectItem value="mic2">Microphone 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Audio Output</Label>
                  <Select defaultValue="default">
                    <SelectTrigger>
                      <SelectValue placeholder="Select speakers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Speakers</SelectItem>
                      <SelectItem value="speaker1">Speakers 1</SelectItem>
                      <SelectItem value="speaker2">Headphones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Video Input</Label>
                  <Select defaultValue="default">
                    <SelectTrigger>
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Camera</SelectItem>
                      <SelectItem value="cam1">Front Camera</SelectItem>
                      <SelectItem value="cam2">External Webcam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="echo-cancellation">Echo Cancellation</Label>
                  <Switch id="echo-cancellation" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="noise-suppression">Noise Suppression</Label>
                  <Switch id="noise-suppression" defaultChecked />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowSettings(false)}>
                  Apply Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showEndCall} onOpenChange={setShowEndCall}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Phone className="h-5 w-5 transform rotate-135" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>End Consultation</DialogTitle>
                <DialogDescription>
                  Are you sure you want to end this consultation?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEndCall(false)}>
                  Continue Consultation
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={endCall}
                >
                  End Consultation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Main content area - varies based on active tab on mobile */}
        <div className={`${activeTab === 'video' ? 'flex' : 'hidden'} md:flex flex-1 flex-col overflow-hidden relative`}>
          <div className="relative flex-1 bg-black overflow-hidden">
            {/* Remote Video (Doctor) */}
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted={isMicMuted}
            ></video>
            
            {/* Local Video (Patient) - Picture in Picture */}
            <div className="absolute bottom-4 right-4 w-1/4 md:w-1/5 aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <video
                ref={localVideoRef}
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                autoPlay
                playsInline
                muted
              ></video>
              {isVideoOff && (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{patientData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
            
            {/* Call controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 bg-gray-900/60 backdrop-blur-sm rounded-full px-4 py-2">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full ${isMicMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                onClick={toggleMic}
              >
                {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                onClick={toggleVideo}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-gray-700 text-white hover:bg-gray-600"
                onClick={toggleFullScreen}
              >
                {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-red-500 text-white hover:bg-red-600"
                onClick={() => setShowEndCall(true)}
              >
                <Phone className="h-5 w-5 transform rotate-135" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Chat Panel - Shown based on tabs on mobile */}
        <div className={`${activeTab === 'chat' ? 'flex' : 'hidden'} md:flex md:w-[350px] flex-col border-l bg-white`}>
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-medium">Chat</h2>
          </div>
          
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === 'patient'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'patient' ? 'text-orange-100' : 'text-gray-500'
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button size="icon" className="bg-orange-500 hover:bg-orange-600" onClick={sendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tools Panel - Shown based on tabs on mobile */}
        <div className={`${activeTab === 'tools' ? 'flex' : 'hidden'} md:flex md:w-[350px] flex-col border-l bg-white`}>
          <div className="p-4 border-b">
            <h2 className="font-medium">Medical Tools</h2>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Prescription Tool */}
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsPrescriptionDialogOpen(true)}>
              <CardContent className="p-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Write Prescription</h3>
                  <p className="text-sm text-gray-500">Generate digital prescription</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Medication Guide */}
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Medication Guide</h3>
                  <p className="text-sm text-gray-500">Share medication information</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Medical History */}
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Patient Records</h3>
                  <p className="text-sm text-gray-500">View medical history</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Follow-up Appointment */}
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Schedule Follow-up</h3>
                  <p className="text-sm text-gray-500">Book next appointment</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Bottom navigation for mobile */}
      <div className="md:hidden bg-white border-t p-2">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            className={`flex flex-col items-center ${activeTab === 'video' ? 'text-orange-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('video')}
          >
            <Video className="h-5 w-5" />
            <span className="text-xs mt-1">Video</span>
          </Button>
          
          <Button
            variant="ghost"
            className={`flex flex-col items-center ${activeTab === 'chat' ? 'text-orange-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Chat</span>
          </Button>
          
          <Button
            variant="ghost"
            className={`flex flex-col items-center ${activeTab === 'tools' ? 'text-orange-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('tools')}
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs mt-1">Tools</span>
          </Button>
        </div>
      </div>
      
      {/* Prescription Dialog */}
      <Dialog open={isPrescriptionDialogOpen} onOpenChange={setIsPrescriptionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Write Prescription</DialogTitle>
            <DialogDescription>
              Create a digital prescription for the patient.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient-name">Patient Name</Label>
              <Input id="patient-name" value={patientData.name} readOnly />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-id">Appointment ID</Label>
                <Input id="appointment-id" value={appointmentData.appointmentId} readOnly />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appointment-date">Date</Label>
                <Input id="appointment-date" value={new Date().toLocaleDateString()} readOnly />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prescription-text">Prescription Details</Label>
              <Textarea 
                id="prescription-text" 
                placeholder="Enter medication details, dosage, duration, and instructions..."
                className="min-h-[200px]"
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrescriptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrescriptionSubmit} disabled={!prescriptionText.trim()}>
              Generate Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoConsultation;