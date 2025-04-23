import React, { ReactNode } from 'react';

interface MobileGridContentProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  iconBackground?: string;
  iconColor?: string;
}

/**
 * A reusable component for displaying consistent content within MobileGridItem
 * Used for icons, labels and subtitles in the standard 90×118 grid layout
 */
const MobileGridContent: React.FC<MobileGridContentProps> = ({
  icon,
  title,
  subtitle,
  iconBackground = 'bg-[#FF8F00]/10',
  iconColor = 'text-[#FF8F00]'
}) => {
  return (
    <>
      <div className="w-full h-full flex items-center justify-center">
        <div className={`w-14 h-14 ${iconBackground} rounded-full flex items-center justify-center`}>
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement, { 
                className: `h-7 w-7 ${iconColor} ${(icon as React.ReactElement).props.className || ''}` 
              })
            : icon
          }
        </div>
      </div>
      <h4 className="text-xs font-medium text-center line-clamp-1 mt-1">{title}</h4>
      {subtitle && (
        <span className="text-[10px] text-gray-500">{subtitle}</span>
      )}
    </>
  );
};

export default MobileGridContent;