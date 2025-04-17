import React from 'react';
import { Link } from 'wouter';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'medium' }) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'h-7';
      case 'large':
        return 'h-14';
      case 'medium':
      default:
        return 'h-10';
    }
  };

  return (
    <Link href="/">
      <div className={`flex items-center ${className} cursor-pointer`}>
        <img 
          src="/pillnow.png" 
          alt="PillNow Logo" 
          className={`${getSizeClass()} w-auto`} 
        />
      </div>
    </Link>
  );
};

export default Logo;