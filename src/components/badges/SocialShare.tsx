import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Share2, Facebook, Twitter, Linkedin, Mail, Link, Copy, Check, Award } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  isUnlocked: boolean;
  unlockedDate?: string;
  points: number;
}

interface SocialShareProps {
  achievement: Achievement;
  onClose: () => void;
  open: boolean;
}

const SocialShare = ({ achievement, onClose, open }: SocialShareProps) => {
  const [activeTab, setActiveTab] = useState('social');
  const [customMessage, setCustomMessage] = useState(
    `I just earned the "${achievement.name}" badge on HealthTracker! ${achievement.description}`
  );
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();

  const getBadgeColor = (level: Achievement['level']) => {
    switch (level) {
      case 'bronze':
        return 'amber';
      case 'silver':
        return 'gray';
      case 'gold':
        return 'yellow';
      case 'platinum':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const achievementUrl = `https://healthtracker.app/achievements/${achievement.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(achievementUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      
      toast({
        title: "Link copied!",
        description: "Achievement link has been copied to your clipboard.",
      });
    });
  };

  const handleShare = (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(achievementUrl)}&quote=${encodeURIComponent(customMessage)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(customMessage)}&url=${encodeURIComponent(achievementUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(achievementUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=My HealthTracker Achievement&body=${encodeURIComponent(customMessage + '\n\n' + achievementUrl)}`;
        break;
      default:
        return;
    }
    
    // Open share dialog in a new window
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    toast({
      title: "Sharing achievement!",
      description: `Your achievement is being shared on ${platform}.`,
    });
    
    onClose();
  };

  const generateShareImage = () => {
    // In a real implementation, this would generate a shareable image
    // For demo purposes, we'll just show a toast
    toast({
      title: "Image generated!",
      description: "Your achievement image has been generated and is ready to download.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Your Achievement</DialogTitle>
          <DialogDescription>
            Let others know about your "{achievement.name}" badge
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 p-4 border rounded-md bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-10 w-10 rounded-full bg-${getBadgeColor(achievement.level)}-500 flex items-center justify-center text-white`}>
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{achievement.name}</h3>
              <div className="flex items-center">
                <Badge className={`bg-${getBadgeColor(achievement.level)}-100 text-${getBadgeColor(achievement.level)}-800 border-${getBadgeColor(achievement.level)}-200`}>
                  {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
                </Badge>
                <span className="text-xs text-gray-500 ml-2">+{achievement.points} points</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-2">{achievement.description}</p>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-12"
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                <span>Facebook</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-12"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="h-5 w-5 text-blue-400" />
                <span>Twitter</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-12"
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin className="h-5 w-5 text-blue-700" />
                <span>LinkedIn</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-12"
                onClick={() => handleShare('email')}
              >
                <Mail className="h-5 w-5 text-gray-600" />
                <span>Email</span>
              </Button>
            </div>
            
            <div className="flex mt-4">
              <Input 
                value={achievementUrl} 
                readOnly 
                className="rounded-r-none"
              />
              <Button
                variant="secondary"
                className="rounded-l-none"
                onClick={handleCopyLink}
              >
                {linkCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="customize" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="custom-message">
                Customize Your Message
              </label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                placeholder="Tell people about your achievement"
              />
            </div>
            
            <div className="mt-4">
              <Button 
                className="w-full"
                onClick={generateShareImage}
              >
                Generate Shareable Image
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Create a beautiful image of your achievement to share on social media
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            // In a real implementation, this would trigger sharing based on the current tab
            if (activeTab === 'social') {
              handleCopyLink();
            } else {
              generateShareImage();
            }
          }}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Achievement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShare;