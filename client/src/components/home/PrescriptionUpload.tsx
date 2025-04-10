import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, FilePlus, Check } from 'lucide-react';

const PrescriptionUpload = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleUpload = () => {
    if (!fileName) {
      toast({
        title: "No file selected",
        description: "Please select a valid prescription file first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      setIsUploading(false);
      setIsSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setFileName('');
        setIsDialogOpen(false);
        toast({
          title: "Prescription uploaded successfully",
          description: "Our pharmacist will review your prescription and contact you soon.",
        });
      }, 1500);
    }, 1500);
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
              
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-[#ff6f61] text-white hover:bg-[#ff6f61]/90 flex items-center gap-2"
              >
                <Upload size={16} /> Upload Now
              </Button>
            </div>
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
                    onClick={() => setFileName('')} 
                    className="mt-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <FilePlus size={28} className="text-blue-600" />
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
                <Input id="name" placeholder="Enter your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter your contact number" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Textarea 
                id="address" 
                placeholder="Enter your complete delivery address with pincode"
                className="resize-none"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Any specific instructions for the pharmacist"
                className="resize-none"
                rows={2}
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
              className={isSuccess ? "bg-green-600 hover:bg-green-700" : "bg-[#10847e] hover:bg-[#10847e]/90"}
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