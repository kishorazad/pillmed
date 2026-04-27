import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

interface FloatingContactButtonsProps {
  phoneNumber: string;
  whatsappNumber: string;
  message?: string;
}

/**
 * Floating contact buttons for WhatsApp and phone call
 * Displays fixed position buttons for quick access to contact methods
 */
const FloatingContactButtons: React.FC<FloatingContactButtonsProps> = ({ 
  phoneNumber,
  whatsappNumber,
  message = "Hello! I'm interested in your products/services."
}) => {
  // Format phone number for href
  const formattedPhoneNumber = phoneNumber.replace(/\D/g, '');
  
  // Create WhatsApp URL with pre-filled message
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed right-5 bottom-24 z-50 flex flex-col gap-4">
      {/* WhatsApp Button */}
      <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <SiWhatsapp className="h-6 w-6" />
      </a>
      
      {/* Phone Call Button */}
      <a 
        href={`tel:${formattedPhoneNumber}`}
        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all flex items-center justify-center"
        aria-label="Call us"
      >
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
};

export default FloatingContactButtons;