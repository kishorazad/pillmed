import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Bot,
  Send,
  User,
  Mic,
  Pill,
  Search,
  RefreshCcw,
  HelpCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  MinusCircle,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Define types
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

interface MedicationInfo {
  generic_name: string;
  drug_class: string;
  primary_uses: string[];
  common_side_effects: string[];
  precautions: string[];
  typical_dosage: string;
}

interface Interaction {
  medications: string[];
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
}

interface InteractionsResult {
  interactions: Interaction[];
}

// API response types
interface ChatResponse {
  response: string;
}

interface InteractionsResponse {
  interactions: Interaction[];
}

const HealthcareAssistant = () => {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m the 1mg AI Health Assistant. I can help you with health-related questions, medication information, and general wellness advice. How may I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [medicationName, setMedicationName] = useState('');
  const [medicationsToCheck, setMedicationsToCheck] = useState<string[]>([]);
  const [medicationInput, setMedicationInput] = useState('');
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
  const [expandedInteraction, setExpandedInteraction] = useState<number | null>(null);
  const [voiceRecognitionSupported, setVoiceRecognitionSupported] = useState(true);
  const [voiceSynthesisSupported, setVoiceSynthesisSupported] = useState(true);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [listeningStatus, setListeningStatus] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  
  // Scrolls to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Initialize Web Speech API for recognition and synthesis
  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure the recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      // Set up event handlers
      recognitionRef.current.onstart = () => {
        setIsVoiceInputActive(true);
        setVoiceTranscript('');
        setListeningStatus('Listening...');
      };
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        setVoiceTranscript(transcript);
        setInputMessage(transcript);
        setListeningStatus('Heard: ' + transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsVoiceInputActive(false);
        setListeningStatus('');
        if (voiceTranscript && voiceTranscript.trim().length > 0) {
          setTimeout(() => {
            handleSendMessage();
          }, 500);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsVoiceInputActive(false);
        setListeningStatus(`Error: ${event.error}`);
        setTimeout(() => setListeningStatus(''), 3000);
      };
      
    } else {
      setVoiceRecognitionSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }
    
    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
      
      // Get available voices
      const loadVoices = () => {
        const voices = synthesisRef.current?.getVoices() || [];
        setAvailableVoices(voices);
        
        // Try to select a female voice by default
        const femaleVoice = voices.find(voice => 
          voice.name.includes('female') || 
          voice.name.includes('Samantha') || 
          voice.name.includes('Google UK English Female')
        );
        
        // Or any English voice
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en-') || 
          voice.lang.includes('en_')
        );
        
        setSelectedVoice(femaleVoice || englishVoice || (voices.length > 0 ? voices[0] : null));
      };
      
      // Voices might not be available immediately
      if (synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
    } else {
      setVoiceSynthesisSupported(false);
      console.warn('Speech synthesis not supported in this browser');
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthesisRef.current && synthesisRef.current.speaking) {
        synthesisRef.current.cancel();
      }
    };
  }, []);
  
  // Speak text using speech synthesis
  const speakText = (text: string) => {
    if (!voiceSynthesisSupported || !isVoiceOutputEnabled || !synthesisRef.current) {
      return;
    }
    
    // Cancel any ongoing speech
    if (synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
    }
    
    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set selected voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Set properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Speak
    synthesisRef.current.speak(utterance);
  };
  
  // Toggle voice output
  const toggleVoiceOutput = () => {
    if (synthesisRef.current?.speaking) {
      synthesisRef.current.cancel();
    }
    setIsVoiceOutputEnabled(prev => !prev);
  };
  
  // Query mutations
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const messageHistory = messages.filter(m => m.role !== 'system');
      return apiRequest<ChatResponse>('/api/ai/health-query', 'POST', { query: message, messageHistory });
    },
    onSuccess: (data: ChatResponse) => {
      const assistantMessage = {
        role: 'assistant' as const,
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the assistant's response if voice output is enabled
      if (isVoiceOutputEnabled) {
        speakText(data.response);
      }
    }
  });
  
  // Query for medication info
  const medicationQuery = useQuery({
    queryKey: ['medication', medicationName],
    queryFn: async () => {
      if (!medicationName) return null;
      const response = await fetch(`/api/ai/medication/${encodeURIComponent(medicationName)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch medication information');
      }
      return response.json() as Promise<MedicationInfo>;
    },
    enabled: !!medicationName && medicationName.length > 0,
    staleTime: 1000 * 60 * 30 // 30 minutes
  });
  
  // Mutation for medication interactions
  const interactionsMutation = useMutation({
    mutationFn: async (medications: string[]) => {
      return apiRequest('/api/ai/medications/interactions', 'POST', { medications });
    }
  });
  
  // Handle send message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send to API
    chatMutation.mutate(inputMessage);
    
    // Clear input
    setInputMessage('');
  };
  
  // Handle key press - send on Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Toggle voice input
  const handleVoiceInput = () => {
    if (isVoiceInputActive) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      // Start listening
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else if (!voiceRecognitionSupported) {
        // Fallback for browsers that don't support speech recognition
        alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      }
    }
  };
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Add medication to the interaction check list
  const addMedicationToCheck = () => {
    if (!medicationInput.trim()) return;
    
    setMedicationsToCheck(prev => [...prev, medicationInput.trim()]);
    setMedicationInput('');
  };
  
  // Remove medication from the interaction check list
  const removeMedicationFromCheck = (index: number) => {
    setMedicationsToCheck(prev => prev.filter((_, i) => i !== index));
  };
  
  // Check for interactions
  const checkInteractions = () => {
    if (medicationsToCheck.length >= 2) {
      interactionsMutation.mutate(medicationsToCheck);
    }
  };
  
  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'mild':
        return <Info className="h-4 w-4" />;
      case 'moderate':
        return <AlertCircle className="h-4 w-4" />;
      case 'severe':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  // Toggle expanded interaction
  const toggleInteraction = (index: number) => {
    if (expandedInteraction === index) {
      setExpandedInteraction(null);
    } else {
      setExpandedInteraction(index);
    }
  };
  
  return (
    <Card className="shadow-lg border-t-4 border-t-blue-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-blue-100">
              <Bot className="h-6 w-6 text-blue-600" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">AI Health Assistant</CardTitle>
              <CardDescription>Get medical information and health advice</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {voiceSynthesisSupported && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Voice:</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`p-1 h-auto ${isVoiceOutputEnabled ? 'text-green-600' : 'text-gray-400'}`}
                  onClick={toggleVoiceOutput}
                >
                  {isVoiceOutputEnabled ? 'On' : 'Off'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6">
          <TabsList className="w-full mb-2">
            <TabsTrigger value="chat" className="flex-1">
              <HelpCircle className="h-4 w-4 mr-2" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex-1">
              <Pill className="h-4 w-4 mr-2" />
              <span>Medication Info</span>
            </TabsTrigger>
            <TabsTrigger value="interactions" className="flex-1">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>Interactions</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-2">
          <TabsContent value="chat" className="m-0">
            <div className="h-[400px] overflow-y-auto border rounded-md p-4 bg-gray-50">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex gap-3 mb-4 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                      <Bot className="h-5 w-5 text-blue-600" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div 
                    className={cn(
                      "py-2 px-3 rounded-lg max-w-[80%]",
                      message.role === 'user' 
                        ? "bg-blue-500 text-white" 
                        : "bg-white border shadow-sm"
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    {message.timestamp && (
                      <div className={cn(
                        "text-xs mt-1 text-right",
                        message.role === 'user' ? "text-blue-100" : "text-gray-400"
                      )}>
                        {formatTime(message.timestamp)}
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                      <User className="h-5 w-5" />
                      <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
              
              {chatMutation.isPending && (
                <div className="flex items-center gap-2 text-gray-500 italic">
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>AI is thinking...</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className={isVoiceInputActive ? "text-red-500" : ""}
                onClick={handleVoiceInput}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Type your health question here..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={chatMutation.isPending || isVoiceInputActive}
                className="flex-grow"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || chatMutation.isPending}
              >
                {chatMutation.isPending ? (
                  <RefreshCcw className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              <p>Note: This AI assistant provides general information only and is not a substitute for professional medical advice. Always consult a healthcare provider for health concerns.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="medications" className="m-0">
            <div className="mb-4">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search for a medication..."
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setMedicationName('')}
                  disabled={!medicationName}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="h-[370px] overflow-y-auto border rounded-md">
              {medicationName && (
                <>
                  {medicationQuery.isLoading && (
                    <div className="p-8 text-center">
                      <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">Retrieving medication information...</p>
                    </div>
                  )}
                  
                  {medicationQuery.isError && (
                    <div className="p-8 text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <p className="font-medium text-red-600 mb-1">Error retrieving information</p>
                      <p className="text-gray-500 text-sm">
                        Unable to find information for "{medicationName}". Please check the spelling or try a different medication.
                      </p>
                    </div>
                  )}
                  
                  {medicationQuery.isSuccess && medicationQuery.data && (
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{medicationName}</h3>
                          <p className="text-gray-500">{medicationQuery.data.generic_name}</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50">
                          {medicationQuery.data.drug_class}
                        </Badge>
                      </div>
                      
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="uses">
                          <AccordionTrigger className="py-3 hover:no-underline">
                            <span className="font-medium">Primary Uses</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-6 space-y-1">
                              {medicationQuery.data.primary_uses.map((use, index) => (
                                <li key={index} className="text-gray-700">{use}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="side-effects">
                          <AccordionTrigger className="py-3 hover:no-underline">
                            <span className="font-medium">Common Side Effects</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-6 space-y-1">
                              {medicationQuery.data.common_side_effects.map((effect, index) => (
                                <li key={index} className="text-gray-700">{effect}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="precautions">
                          <AccordionTrigger className="py-3 hover:no-underline">
                            <span className="font-medium">Precautions</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-6 space-y-1">
                              {medicationQuery.data.precautions.map((precaution, index) => (
                                <li key={index} className="text-gray-700">{precaution}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="dosage">
                          <AccordionTrigger className="py-3 hover:no-underline">
                            <span className="font-medium">Typical Dosage</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-gray-700">{medicationQuery.data.typical_dosage}</p>
                            <p className="mt-2 text-xs text-gray-500 italic">
                              Note: Dosage information is general. Always follow your doctor's prescribed dosage.
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  )}
                </>
              )}
              
              {!medicationName && (
                <div className="p-8 text-center">
                  <Pill className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-600 mb-1">Medication Information</h3>
                  <p className="text-gray-500 text-sm">
                    Search for a medication to view detailed information about its uses, side effects, and dosage.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              <p>Information provided is for educational purposes only. Always consult a healthcare provider before starting, stopping, or changing medications.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="interactions" className="m-0">
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add medication name..."
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMedicationToCheck()}
                />
                <Button onClick={addMedicationToCheck} disabled={!medicationInput.trim()}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
            
            {medicationsToCheck.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {medicationsToCheck.map((med, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1.5">
                    {med}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 p-0 ml-1 hover:bg-transparent hover:text-red-500" 
                      onClick={() => removeMedicationFromCheck(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            
            <Button 
              className="mb-4 w-full" 
              disabled={medicationsToCheck.length < 2 || interactionsMutation.isPending}
              onClick={checkInteractions}
            >
              {interactionsMutation.isPending ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Checking Interactions...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Check Interactions
                </>
              )}
            </Button>
            
            <div className="h-[330px] overflow-y-auto border rounded-md">
              {!interactionsMutation.data && !interactionsMutation.isPending && (
                <div className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-600 mb-1">Drug Interaction Checker</h3>
                  <p className="text-gray-500 text-sm">
                    Add two or more medications to check for potential interactions between them.
                  </p>
                </div>
              )}
              
              {interactionsMutation.data && (
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-3">Interaction Results</h3>
                  
                  {interactionsMutation.data.interactions.length === 0 ? (
                    <div className="p-4 text-center bg-green-50 border border-green-200 rounded-md">
                      <p className="text-green-700 font-medium">No significant interactions found</p>
                      <p className="text-sm text-gray-600 mt-1">
                        No known significant interactions were found between the medications you specified.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {interactionsMutation.data.interactions.map((interaction, index) => (
                        <div 
                          key={index} 
                          className="border rounded-md overflow-hidden"
                        >
                          <div 
                            className="flex justify-between items-center p-3 cursor-pointer bg-gray-50"
                            onClick={() => toggleInteraction(index)}
                          >
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(interaction.severity)}>
                                <span className="flex items-center gap-1">
                                  {getSeverityIcon(interaction.severity)}
                                  <span className="capitalize">{interaction.severity}</span>
                                </span>
                              </Badge>
                              <span className="font-medium">
                                {interaction.medications.join(' + ')}
                              </span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              {expandedInteraction === index ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          
                          {expandedInteraction === index && (
                            <div className="p-3 border-t">
                              <div className="mb-2">
                                <div className="text-sm font-medium mb-1">Description</div>
                                <p className="text-sm text-gray-700">{interaction.description}</p>
                              </div>
                              
                              <div>
                                <div className="text-sm font-medium mb-1">Recommendation</div>
                                <p className="text-sm text-gray-700">{interaction.recommendation}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              <p>This tool checks for known drug interactions based on available medical information. The absence of an interaction doesn't guarantee safety. Always consult a healthcare provider or pharmacist.</p>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default HealthcareAssistant;