import React from 'react';
import { Check, Clock, Pill, AlertTriangle, PauseCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MedicationStatus = 'upcoming' | 'due' | 'completed' | 'missed' | 'paused';

interface MedicationStatusIndicatorProps {
  status: MedicationStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const MedicationStatusIndicator = ({
  status,
  size = 'md',
  showLabel = true,
  className
}: MedicationStatusIndicatorProps) => {
  
  // Size mappings
  const sizes = {
    sm: {
      container: 'h-6 text-xs',
      icon: 14,
      pill: 'h-2 w-2',
    },
    md: {
      container: 'h-8 text-sm',
      icon: 16,
      pill: 'h-2.5 w-2.5',
    },
    lg: {
      container: 'h-10 text-base',
      icon: 20,
      pill: 'h-3 w-3',
    }
  };
  
  // Status style mappings
  const statusStyles = {
    upcoming: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: <Clock size={sizes[size].icon} />,
      label: 'Upcoming',
      pillColor: 'bg-blue-400'
    },
    due: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <Pill size={sizes[size].icon} />,
      label: 'Due Now',
      pillColor: 'bg-amber-400'
    },
    completed: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      icon: <Check size={sizes[size].icon} />,
      label: 'Completed',
      pillColor: 'bg-green-400'
    },
    missed: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      icon: <AlertTriangle size={sizes[size].icon} />,
      label: 'Missed',
      pillColor: 'bg-red-400'
    },
    paused: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      icon: <PauseCircle size={sizes[size].icon} />,
      label: 'Paused',
      pillColor: 'bg-gray-400'
    }
  };
  
  // Animation effects for different statuses
  const getAnimation = () => {
    switch (status) {
      case 'due':
        return 'animate-pulse';
      case 'missed':
        return 'animate-bounce';
      default:
        return '';
    }
  };
  
  const statusStyle = statusStyles[status];
  
  return (
    <div 
      className={cn(
        'flex items-center gap-2 rounded-full px-3 border',
        statusStyle.bg,
        statusStyle.text,
        statusStyle.border,
        sizes[size].container,
        className
      )}
    >
      <div className={cn('flex items-center gap-2', getAnimation())}>
        {/* Status icon */}
        {statusStyle.icon}
        
        {/* Animated pill for 'due' status */}
        {status === 'due' && (
          <div className="relative flex items-center justify-center">
            <span className={cn(
              'absolute rounded-full opacity-60 animate-ping',
              statusStyle.pillColor,
              sizes[size].pill
            )}></span>
            <span className={cn(
              'relative rounded-full',
              statusStyle.pillColor,
              sizes[size].pill
            )}></span>
          </div>
        )}
        
        {/* Status label */}
        {showLabel && (
          <span className="font-medium">{statusStyle.label}</span>
        )}
      </div>
    </div>
  );
};

export default MedicationStatusIndicator;