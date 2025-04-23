import React from 'react';

interface HospitalLogoProps {
  name: string; 
  logoUrl?: string | null;
  className?: string;
}

const HospitalLogo = ({ name, logoUrl, className = "" }: HospitalLogoProps) => {
  // Generate initials from hospital name
  const getInitials = () => {
    if (!name) return "H";
    
    const words = name.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };
  
  // Generate a consistent color based on the hospital name
  const getColorClass = () => {
    const colors = [
      "bg-blue-600", "bg-green-600", "bg-purple-600", 
      "bg-red-600", "bg-amber-600", "bg-teal-600"
    ];
    
    // Simple hash function to get a consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  if (logoUrl) {
    return (
      <div className={`overflow-hidden rounded-lg ${className}`}>
        <img 
          src={logoUrl} 
          alt={`${name} logo`} 
          className="w-full h-full object-contain"
          onError={(e) => {
            // If logo image fails to load, show initials instead
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.classList.add(getColorClass(), 'flex', 'items-center', 'justify-center');
            const span = document.createElement('span');
            span.className = 'text-white text-2xl font-bold';
            span.textContent = getInitials();
            e.currentTarget.parentElement!.appendChild(span);
          }}
        />
      </div>
    );
  }
  
  // Fallback to initials if no logo URL provided
  return (
    <div className={`${getColorClass()} flex items-center justify-center rounded-lg ${className}`}>
      <span className="text-white text-2xl font-bold">{getInitials()}</span>
    </div>
  );
};

export default HospitalLogo;