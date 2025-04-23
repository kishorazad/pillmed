import React, { ReactNode } from 'react';

interface MobileGridContentProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  iconBackground?: string;
  iconColor?: string;
  useGradient?: boolean;
  showShadow?: boolean;
  textColor?: string;
  subtitleColor?: string;
}

/**
 * A reusable component for displaying modern, visually appealing content within MobileGridItem
 * Used for icons, labels and subtitles in the grid layout with illustration-focused design
 */
const MobileGridContent: React.FC<MobileGridContentProps> = ({
  icon,
  title,
  subtitle,
  iconBackground = 'bg-[#FF8F00]/10',
  iconColor = 'text-[#FF8F00]',
  useGradient = false,
  showShadow = true,
  textColor = 'text-gray-800',
  subtitleColor = 'text-gray-500'
}) => {
  // Create gradient if requested
  const bgStyle = useGradient 
    ? `bg-gradient-to-br from-[#FF8F00]/10 to-[#FF8F00]/30` 
    : iconBackground;
  
  // Shadow styles
  const shadowStyle = showShadow 
    ? 'shadow-md' 
    : '';

  return (
    <>
      <div className="w-full h-full flex items-center justify-center relative">
        <div 
          className={`
            w-16 h-16 ${bgStyle} rounded-2xl 
            flex items-center justify-center 
            transform rotate-3 ${shadowStyle}
            transition-all duration-300 hover:rotate-0
          `}
          style={{
            boxShadow: showShadow ? '0 3px 10px rgba(255, 143, 0, 0.15)' : 'none'
          }}
        >
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement, { 
                className: `h-8 w-8 ${iconColor} ${(icon as React.ReactElement).props.className || ''}` 
              })
            : icon
          }
        </div>
      </div>
      <h4 className={`text-sm font-medium text-center line-clamp-1 mt-2 ${textColor}`}>{title}</h4>
      {subtitle && (
        <span className={`text-xs ${subtitleColor}`}>{subtitle}</span>
      )}
    </>
  );
};

export default MobileGridContent;