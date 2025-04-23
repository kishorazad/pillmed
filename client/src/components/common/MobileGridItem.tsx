import React, { ReactNode } from 'react';

interface MobileGridItemProps {
  children: ReactNode;
  className?: string;
  isHighlighted?: boolean;
  accentColor?: string;
  shadowColor?: string;
  hoverEffect?: 'scale' | 'glow' | 'lift' | 'none';
}

/**
 * A reusable component that enforces the 90×118px grid item layout with 88.4×72.33px content area
 * for mobile sliding components with modern design aesthetics
 */
const MobileGridItem: React.FC<MobileGridItemProps> = ({ 
  children, 
  className = "", 
  isHighlighted = false,
  accentColor = "#FF8F00",
  shadowColor = "rgba(255, 143, 0, 0.1)",
  hoverEffect = 'scale'
}) => {
  // Prepare hover effects
  const hoverStyles = {
    scale: 'hover:scale-105',
    glow: `hover:shadow-lg hover:shadow-${shadowColor}`,
    lift: 'hover:-translate-y-1 hover:shadow-md',
    none: ''
  };

  return (
    <div 
      className={`
        flex-none w-[100px] h-[130px] 
        flex flex-col items-center justify-center 
        bg-white rounded-xl shadow p-3
        transition-all duration-300 ease-in-out
        ${hoverStyles[hoverEffect]}
        ${isHighlighted ? `border-l-4 border-[${accentColor}]` : ''}
        ${className}
      `}
      style={{ 
        scrollSnapAlign: 'start',
        boxShadow: `0 4px 8px ${shadowColor}`
      }}
    >
      <div className="w-[88.4px] h-[72.33px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default MobileGridItem;