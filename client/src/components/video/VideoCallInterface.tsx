import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Share,
  MoreVertical,
  MessageSquare,
  Users,
  Settings,
  ScreenShare,
  StopScreenShare,
  Maximize,
  Minimize,
  PictureInPicture,
  Layout,
  X,
  VolumeX,
  Volume2,
  Clock,
  AlertCircle,
  Pill,
  FilePlus,
  MoveHorizontal,
} from "lucide-react";

interface VideoCallProps {
  sessionId?: string;
  recipientId?: number;
  recipientName?: string;
  recipientRole?: string;
  recipientAvatar?: string;
  callType?: 'doctor-patient' | 'general';
  onEndCall?: () => void;
  autoStart?: boolean;
  duration?: number; // in minutes
}

const VideoCallInterface: React.FC<VideoCallProps> = ({
  sessionId,
  recipientId,
  recipientName = "Dr. Sarah Johnson",
  recipientRole = "doctor",
  recipientAvatar,
  callType = 'doctor-patient',
  onEndCall,
  autoStart = false,
  duration = 15,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Video call state
  const [isCalling, setIsCalling] = useState(autoStart);
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callTime, setCallTime] = useState(0); // in seconds
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'spotlight'>('spotlight');
  const [showPrescription, setShowPrescription] = useState(false);
  
  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Timer ref for call duration
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Simulated connection handling
  useEffect(() => {
    if (isCalling && !isConnected) {
      // Simulate connection delay
      const connectionTimer = setTimeout(() => {
        setIsConnected(true);
        
        // Get local video stream (in a real app, this would use WebRTC)
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
              }
            })
            .catch((error) => {
              console.error("Error accessing media devices:", error);
              toast({
                title: "Camera access denied",
                description: "Please allow camera access to join the call",
                variant: "destructive",
              });
              setIsCalling(false);
            });
        }
        
        // Start call timer
        timerRef.current = setInterval(() => {
          setCallTime((prev) => prev + 1);
        }, 1000);
      }, 2000);
      
      return () => clearTimeout(connectionTimer);
    }
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Stop media streams when component unmounts
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCalling, isConnected, toast]);
  
  // Format call time as mm:ss
  const formatCallTime = () => {
    const minutes = Math.floor(callTime / 60);
    const seconds = callTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Function to toggle audio mute
  const toggleAudioMute = () => {
    setIsAudioMuted(!isAudioMuted);
    
    // In a real app, this would mute the audio track from the local stream
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = isAudioMuted;
      });
    }
  };
  
  // Function to toggle video
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    
    // In a real app, this would disable the video track from the local stream
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
    }
  };
  
  // Function to toggle screen sharing
  const toggleScreenShare = () => {
    if (!isScreenSharing) {
      // In a real app, this would use browser's screen capture API
      if (navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices) {
        navigator.mediaDevices.getDisplayMedia({ video: true })
          .then((stream) => {
            if (localVideoRef.current) {
              // Store the original stream to restore it later
              const originalStream = localVideoRef.current.srcObject as MediaStream;
              // Replace with screen sharing stream
              localVideoRef.current.srcObject = stream;
              
              // Listen for the end of screen sharing
              stream.getVideoTracks()[0].onended = () => {
                if (localVideoRef.current) {
                  localVideoRef.current.srcObject = originalStream;
                  setIsScreenSharing(false);
                }
              };
              
              setIsScreenSharing(true);
            }
          })
          .catch((error) => {
            console.error("Error sharing screen:", error);
            toast({
              title: "Screen sharing failed",
              description: "Could not share your screen. Please try again.",
              variant: "destructive",
            });
          });
      } else {
        toast({
          title: "Screen sharing not supported",
          description: "Your browser does not support screen sharing",
          variant: "destructive",
        });
      }
    } else {
      // In a real implementation, this would need to restore the camera stream
      setIsScreenSharing(false);
    }
  };
  
  // Function to toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(err => {
        toast({
          title: "Fullscreen error",
          description: `Error attempting to enable fullscreen: ${err.message}`,
          variant: "destructive",
        });
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };
  
  // Function to end the call
  const endCall = () => {
    // Clean up
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Stop media streams
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    setIsCalling(false);
    setIsConnected(false);
    
    // Call the onEndCall callback if provided
    if (onEndCall) {
      onEndCall();
    }
  };
  
  // Function to switch between layouts
  const toggleLayout = () => {
    setLayout(prev => prev === 'spotlight' ? 'grid' : 'spotlight');
  };
  
  // Function to handle incoming call (in demo mode)
  const startCall = () => {
    setIsCalling(true);
  };

  // Demo video elements to represent a real video call
  const renderVideoElements = () => {
    if (!isCalling) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={recipientAvatar} alt={recipientName} />
            <AvatarFallback className={
              recipientRole === 'doctor' ? 'bg-blue-500' : 
              recipientRole === 'pharmacy' ? 'bg-green-500' : 'bg-orange-500'
            }>
              {recipientName?.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold mb-2">{recipientName}</h2>
          <Badge className="mb-6">
            {recipientRole.charAt(0).toUpperCase() + recipientRole.slice(1)}
          </Badge>
          <div className="flex space-x-4">
            <Button
              className="bg-green-500 hover:bg-green-600 rounded-full h-14 w-14 flex items-center justify-center"
              onClick={startCall}
            >
              <Phone className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              className="rounded-full h-14 w-14 flex items-center justify-center"
              onClick={onEndCall}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      );
    }
    
    if (isCalling && !isConnected) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-pulse flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={recipientAvatar} alt={recipientName} />
              <AvatarFallback className={
                recipientRole === 'doctor' ? 'bg-blue-500' : 
                recipientRole === 'pharmacy' ? 'bg-green-500' : 'bg-orange-500'
              }>
                {recipientName?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold mb-2">{recipientName}</h2>
            <Badge className="mb-2">
              {recipientRole.charAt(0).toUpperCase() + recipientRole.slice(1)}
            </Badge>
            <p className="text-gray-500 animate-pulse">Calling...</p>
          </div>
          <Button
            variant="destructive"
            className="mt-8 rounded-full h-14 w-14 flex items-center justify-center"
            onClick={endCall}
          >
            <Phone className="h-6 w-6 rotate-135" />
          </Button>
        </div>
      );
    }
    
    return (
      <div className={`relative h-full ${
        layout === 'spotlight' ? 'flex flex-col' : 'grid grid-cols-2 gap-2'
      }`}>
        {/* Remote Video (Main participant) */}
        <div className={`relative ${
          layout === 'spotlight' ? 'flex-1 mb-2' : 'aspect-video'
        }`}>
          <div className="bg-gray-800 h-full w-full rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              className="h-full w-full object-cover"
              autoPlay
              muted={isSpeakerMuted}
              poster={recipientAvatar || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1470&auto=format&fit=crop"}
            />
            <div className="absolute bottom-2 left-2 bg-black/40 px-2 py-1 rounded-md flex items-center">
              <Badge variant="outline" className="text-white border-none mr-2">
                {recipientRole}
              </Badge>
              <span className="text-white text-sm">{recipientName}</span>
            </div>
          </div>
        </div>
        
        {/* Local Video */}
        <div className={`${
          layout === 'spotlight' 
            ? 'absolute top-2 right-2 w-1/4 h-auto z-10 rounded-lg overflow-hidden shadow-lg' 
            : 'aspect-video'
        }`}>
          <div className="bg-gray-800 h-full w-full rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              className="h-full w-full object-cover"
              autoPlay
              muted
              poster="https://images.unsplash.com/photo-1548449112-96a38a643324?q=80&w=1074&auto=format&fit=crop"
            />
            <div className="absolute bottom-2 left-2 bg-black/40 px-2 py-1 rounded-md">
              <span className="text-white text-sm">{user?.name || "You"}</span>
            </div>
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <VideoOff className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
        </div>
        
        {/* Call timer */}
        <div className="absolute top-2 left-2 bg-black/40 px-3 py-1 rounded-full flex items-center">
          <Clock className="h-4 w-4 text-white mr-1" />
          <span className="text-white text-sm">{formatCallTime()}</span>
        </div>
        
        {/* Call controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex justify-center">
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              className={`rounded-full h-10 w-10 p-0 ${isAudioMuted ? 'bg-red-500 text-white' : ''}`}
              onClick={toggleAudioMute}
            >
              {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button
              variant="secondary"
              className={`rounded-full h-10 w-10 p-0 ${isVideoOff ? 'bg-red-500 text-white' : ''}`}
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
            <Button
              variant="secondary"
              className={`rounded-full h-10 w-10 p-0 ${isSpeakerMuted ? 'bg-red-500 text-white' : ''}`}
              onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            >
              {isSpeakerMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Button
              variant="secondary"
              className={`rounded-full h-10 w-10 p-0 ${isScreenSharing ? 'bg-green-500 text-white' : ''}`}
              onClick={toggleScreenShare}
            >
              {isScreenSharing ? <StopScreenShare className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
            </Button>
            <Button
              variant="destructive"
              className="rounded-full h-12 w-12 p-0"
              onClick={endCall}
            >
              <Phone className="h-6 w-6 rotate-135" />
            </Button>
            <Button
              variant="secondary"
              className="rounded-full h-10 w-10 p-0"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              className="rounded-full h-10 w-10 p-0"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              className="rounded-full h-10 w-10 p-0"
              onClick={toggleLayout}
            >
              <Layout className="h-5 w-5" />
            </Button>
            
            {/* More options dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="rounded-full h-10 w-10 p-0">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={toggleFullScreen}>
                  {isFullScreen ? (
                    <>
                      <Minimize className="h-4 w-4 mr-2" />
                      <span>Exit Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize className="h-4 w-4 mr-2" />
                      <span>Enter Fullscreen</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                {callType === 'doctor-patient' && recipientRole === 'doctor' && (
                  <DropdownMenuItem onClick={() => setShowPrescription(true)}>
                    <FilePlus className="h-4 w-4 mr-2" />
                    <span>Request Prescription</span>
                  </DropdownMenuItem>
                )}
                {callType === 'doctor-patient' && recipientRole === 'doctor' && (
                  <DropdownMenuItem>
                    <Pill className="h-4 w-4 mr-2" />
                    <span>Medication Advisory</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  };
  
  // Settings dialog
  const renderSettingsDialog = () => (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Call Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Audio Input</h4>
            <select className="w-full p-2 border rounded-md">
              <option>Default Microphone</option>
              <option>Headset Microphone</option>
            </select>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Audio Output</h4>
            <select className="w-full p-2 border rounded-md">
              <option>Default Speakers</option>
              <option>Headphones</option>
            </select>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Video Input</h4>
            <select className="w-full p-2 border rounded-md">
              <option>Webcam</option>
              <option>External Camera</option>
            </select>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Video Quality</h4>
            <select className="w-full p-2 border rounded-md">
              <option>Auto (recommended)</option>
              <option>High Definition</option>
              <option>Standard Definition</option>
              <option>Low (save bandwidth)</option>
            </select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
  
  // Prescription request dialog
  const renderPrescriptionDialog = () => (
    <Dialog open={showPrescription} onOpenChange={setShowPrescription}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Prescription</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-500">
            Request a digital prescription from Dr. Sarah Johnson. The prescription will be sent to your account and can be forwarded to a pharmacy of your choice.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Medication</h4>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md" 
              placeholder="Enter medication name"
            />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Dosage</h4>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md" 
              placeholder="Enter dosage information"
            />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Instructions</h4>
            <textarea 
              className="w-full p-2 border rounded-md h-24" 
              placeholder="Enter any special instructions"
            ></textarea>
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowPrescription(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Prescription Requested",
                description: "Your prescription request has been sent to the doctor.",
              });
              setShowPrescription(false);
            }}>
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div 
      ref={containerRef} 
      className="flex flex-col h-[600px] rounded-lg overflow-hidden bg-gray-900 text-white relative"
    >
      {renderVideoElements()}
      {renderSettingsDialog()}
      {renderPrescriptionDialog()}
    </div>
  );
};

export default VideoCallInterface;