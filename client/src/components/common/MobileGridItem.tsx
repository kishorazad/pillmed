import React, { ReactNode } from 'react';

interface MobileGridItemProps {
  children: ReactNode;
  className?: string;
  isHighlighted?: boolean;
}

/**
 * A reusable component that enforces the 90×118px grid item layout with 88.4×72.33px content area
 * for mobile sliding components - this maintains consistent UI across all sliding sections
 */
const MobileGridItem: React.FC<MobileGridItemProps> = ({ 
  children, 
  className = "", 
  isHighlighted = false 
}) => {
  return (
    <div 
      className={`
        flex-none w-[90px] h-[118px] 
        flex flex-col items-center justify-center 
        bg-white rounded-lg shadow-sm p-2 
        transition-shadow hover:shadow-md
        ${isHighlighted ? 'border-l-4 border-[#FF8F00]' : ''}
        ${className}
      `}
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="w-[88.4px] h-[72.33px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default MobileGridItem;