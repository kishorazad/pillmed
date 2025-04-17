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
        <img 
          src="/pillnow.png" 
          alt="PillNow Logo" 
          className={`${getSizeClass()}`}
          width="500"
          height="89"
          style={{ objectFit: 'contain' }}
        />
      </div>
    </Link>
  );
};

export default Logo;