import React from 'react';
import { Link } from 'wouter';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'medium' }) => {
  // Fixed logo size now as per requirement (120*30)
  const getSizeClass = () => {
    return 'h-[30px] w-[120px]';
  };

  return (
    <Link href="/">
      <div className={`flex items-center ${className} cursor-pointer`}>
        <span className="text-orange-500 font-bold text-xl">PILL<span className="text-amber-400">NOW</span></span>
      </div>
    </Link>
  );
};

export default Logo;