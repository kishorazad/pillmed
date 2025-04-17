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
        return 'h-6';
      case 'large':
        return 'h-12';
      case 'medium':
      default:
        return 'h-9';
    }
  };

  return (
    <Link href="/">
      <a className={`flex items-center ${className}`}>
        <svg
          className={`${getSizeClass()} w-auto text-orange-500`}
          viewBox="0 0 250 100" 
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M35.714,0 L35.714,14.285 L21.428,14.285 L21.428,85.714 L35.714,85.714 L35.714,100 L0,100 L0,0 L35.714,0 Z" />
          <path d="M78.571,0 L78.571,14.285 L64.285,14.285 L64.285,85.714 L78.571,85.714 L78.571,100 L42.857,100 L42.857,0 L78.571,0 Z" />
          <circle cx="150" cy="50" r="35" />
          <path d="M214.285,0 L214.285,100 L214.285,100 L178.571,100 L178.571,85.714 L192.857,85.714 L192.857,14.285 L178.571,14.285 L178.571,0 L214.285,0 Z" />
          <path d="M235.714,57.142 L221.428,57.142 L221.428,42.857 L235.714,42.857 L235.714,42.857 L235.714,28.571 L250,28.571 L250,71.428 L235.714,71.428 L235.714,57.142 Z" />
        </svg>
        <span className="ml-2 font-bold text-xl tracking-tight text-gray-900">PillNow</span>
      </a>
    </Link>
  );
};

export default Logo;