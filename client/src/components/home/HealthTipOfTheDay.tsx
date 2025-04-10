import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Heart, ExternalLink, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface HealthTip {
  id: number;
  title: string;
  content: string;
  category: string;
  imageUrl: string;
  createdAt: string;
}

const HealthTipOfTheDay = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState<HealthTip | null>(null);
  
  // Fetch a random health tip from the API
  const { data: healthTip, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/health-tips/random'],
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
  
  useEffect(() => {
    if (healthTip) {
      setCurrentTip(healthTip);
    }
  }, [healthTip]);
  
  const handleNewTip = () => {
    refetch();
  };
  
  const handleShare = () => {
    if (!currentTip) return;
    
    // Create share text
    const shareText = `Health Tip: ${currentTip.title} - ${currentTip.content.substring(0, 100)}...`;
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Health Tip of the Day',
        text: shareText,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText)
        .then(() => alert('Health tip copied to clipboard!'))
        .catch(() => alert('Failed to copy health tip.'));
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-100 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
        <CardFooter className="flex justify-between pt-2 pb-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </CardFooter>
      </Card>
    );
  }
  
  if (isError || !currentTip) {
    return (
      <Card className="bg-red-50 border-red-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-red-600">Oops!</CardTitle>
          <CardDescription>We couldn't load today's health tip</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">Please try again later or contact support if the problem persists.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
        </CardFooter>
      </Card>
    );
  }
  
  const formattedDate = currentTip.createdAt 
    ? format(new Date(currentTip.createdAt), 'MMM d, yyyy') 
    : format(new Date(), 'MMM d, yyyy');
  
  return (
    <>
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-100 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardDescription className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
                {currentTip.category || 'Health Tip of the Day'}
              </CardDescription>
              <CardTitle className="text-lg md:text-xl">{currentTip.title}</CardTitle>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 line-clamp-3">{currentTip.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 pb-4">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleNewTip} className="text-xs flex items-center">
              <Clock className="h-3 w-3 mr-1" /> New Tip
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="text-xs">
              Read More
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Health Tip Full View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentTip.title}</DialogTitle>
            <DialogDescription>
              {currentTip.category} • {formattedDate}
            </DialogDescription>
          </DialogHeader>
          
          {currentTip.imageUrl && (
            <div className="relative w-full h-40 overflow-hidden rounded-md">
              <img 
                src={currentTip.imageUrl} 
                alt={currentTip.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="my-2">
            <p className="text-gray-700 whitespace-pre-line">{currentTip.content}</p>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" /> Share Tip
            </Button>
            <Button size="sm" onClick={handleNewTip} className="bg-[#10847e] hover:bg-[#10847e]/90">
              Get Another Tip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HealthTipOfTheDay;