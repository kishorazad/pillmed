import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, FilePlus, Check, Mic, MicOff } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const PrescriptionUpload = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceSearchResults, setVoiceSearchResults] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Handle results
      recognitionRef.current.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        searchMedicationsVoice(result);
      };
      
      // Handle ending
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      // Handle errors
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast({
          title: "Voice search failed",
          description: `Error: ${event.error}. Please try again or use text search.`,
          variant: "destructive"
        });
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);
  
  // Start voice search
  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice search not available",
        description: "Your browser doesn't support voice search. Please use text search instead.",
        variant: "destructive"
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      setVoiceSearchResults([]);
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  
  // Process voice search
  const searchMedicationsVoice = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    // Simulate search results
    setTimeout(() => {
      // Example medications that might match the voice query
      const mockResults = [
        "Aspirin 100mg tablets",
        "Paracetamol 500mg",
        "Ibuprofen 400mg",
        "Cetirizine 10mg",
        "Omeprazole 20mg",
        "Amlodipine 5mg",
        "Metformin 500mg"
      ];
      
      // Filter based on query (basic simulation)
      const filteredResults = mockResults.filter(med => 
        med.toLowerCase().includes(query.toLowerCase())
      );
      
      // If no direct matches found, show a subset of options as suggestions
      const results = filteredResults.length > 0 
        ? filteredResults 
        : mockResults.slice(0, 3);
        
      setVoiceSearchResults(results);
      setIsSearching(false);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileObj(file);
    }
  };

  const handleUpload = async () => {
    if (!fileObj) {
      toast({
        title: "No file selected",
        description: "Please select a valid prescription file first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('prescription', fileObj);
      formData.append('userName', name || 'Guest User');
      formData.append('userPhone', phone || '');
      formData.append('userAddress', address || '');
      formData.append('notes', notes || '');
      
      // Send to the backend API
      console.log('Uploading prescription...');
      const response = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Prescription upload response:', data);
      
      setIsUploading(false);
      setIsSuccess(true);
      
      // Reset form state after successful upload
      setTimeout(() => {
        setIsSuccess(false);
        setFileName('');
        setFileObj(null);
        setName('');
        setPhone('');
        setAddress('');
        setNotes('');
        setIsDialogOpen(false);
        
        // Invalidate prescription queries to ensure fresh data
        queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
        
        toast({
          title: "Prescription uploaded successfully",
          description: "Our pharmacist will review your prescription and contact you soon.",
        });
      }, 1500);
    } catch (error) {
      console.error('Error uploading prescription:', error);
      setIsUploading(false);
      
      toast({
        title: "Upload failed",
        description: `There was a problem uploading your prescription. Please try again. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Card className="flex-1 w-full bg-gradient-to-r from-[#f8f9fa] to-[#e9f5f4] border-[#d4e9e7] shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="px-5 py-6">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-3">Upload your prescription</h2>
              <p className="text-gray-600 mb-4">
                Get your medicines delivered at your doorstep. We'll contact you for confirmation and process your order.
              </p>
              <ul className="list-disc list-inside mb-4 text-gray-600">
                <li>Quick upload & processing</li>
                <li>Secure & confidential</li>
                <li>Prescription verification by licensed pharmacists</li>
              </ul>
            </div>
            
            <div className="mt-4 flex justify-between items-end">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#10847e]/10 flex items-center justify-center mr-3">
                  <FileText size={20} className="text-[#10847e]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Have a prescription?</p>
                  <p className="text-xs text-gray-500">Upload now for quick processing</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={toggleVoiceSearch}
                  variant="outline"
                  size="icon"
                  className={isListening ? "bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 animate-pulse" : "text-[#10847e] hover:text-[#10847e]/90"}
                  title={isListening ? "Stop voice search" : "Search by voice"}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </Button>
                
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-[#FF8F00] text-white hover:bg-[#FF8F00]/90 flex items-center gap-2"
                >
                  <Upload size={16} /> Upload Now
                </Button>
              </div>
            </div>
            
            {/* Voice search detected - showing transcript */}
            {transcript && (
              <div className="mt-3 p-3 bg-[#fff8e1] rounded-md border border-[#FFD54F]">
                <p className="text-sm font-medium mb-1">Voice search detected:</p>
                <p className="text-sm text-gray-600">"{transcript}"</p>
                {isSearching && (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-8 h-8 relative">
                      <div className="absolute top-0 w-2 h-2 rounded-full bg-[#FF8F00] animate-pulse"></div>
                      <div className="absolute top-0 left-3 w-2 h-2 rounded-full bg-[#FF8F00] animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="absolute top-0 left-6 w-2 h-2 rounded-full bg-[#FF8F00] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <p className="ml-2 text-sm text-gray-600">Searching medicines...</p>
                  </div>
                )}
                
                {voiceSearchResults.length > 0 && !isSearching && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-2">We found these medicines:</p>
                    <div className="grid gap-2">
                      {voiceSearchResults.map((result, index) => (
                        <div 
                          key={index} 
                          className="p-2 bg-white rounded-md border border-gray-200 hover:border-[#FF8F00] hover:bg-[#fff8e1] cursor-pointer transition-colors"
                          onClick={() => {
                            // Add to cart logic would go here
                            toast({
                              title: "Added to cart",
                              description: `${result} has been added to your cart.`,
                            });
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{result}</p>
                            <Button size="sm" variant="outline" className="text-[#FF8F00] border-[#FF8F00]">Add</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
        
      {/* Prescription Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Prescription</DialogTitle>
            <DialogDescription>
              Upload your prescription image or PDF file. We accept .jpg, .png, and .pdf files.
            </DialogDescription>
          </DialogHeader>
            
          <div className="grid gap-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              {fileName ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <FileText size={28} className="text-green-600" />
                  </div>
                  <p className="text-sm font-medium break-all max-w-full">{fileName}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setFileName('');
                      setFileObj(null);
                    }} 
                    className="mt-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                    <FilePlus size={28} className="text-[#FF8F00]" />
                  </div>
                  <p className="text-sm font-medium mb-1">Drag and drop or click to upload</p>
                  <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".jpg,.jpeg,.png,.pdf" 
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter your full name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="Enter your contact number" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Textarea 
                id="address" 
                placeholder="Enter your complete delivery address with pincode"
                className="resize-none"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Any specific instructions for the pharmacist"
                className="resize-none"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              className={isSuccess ? "bg-green-600 hover:bg-green-700" : "bg-[#FF8F00] hover:bg-[#FF8F00]/90"}
              disabled={isUploading || isSuccess}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : isSuccess ? (
                <span className="flex items-center gap-2">
                  <Check size={16} /> Uploaded Successfully
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload size={16} /> Upload Prescription
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrescriptionUpload;