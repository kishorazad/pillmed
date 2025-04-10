import React from 'react';
import { motion } from 'framer-motion';

interface PharmacyLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  loadingState?: 'loading' | 'success' | 'error';
}

const PharmacyLoader: React.FC<PharmacyLoaderProps> = ({
  size = 'md',
  color = '#10847e',
  text = 'Loading...',
  loadingState = 'loading'
}) => {
  // Size configuration
  const sizes = {
    sm: {
      containerSize: 'w-48 h-28',
      pillSize: 'w-4 h-10',
      bottleSize: 'w-12 h-16',
      textSize: 'text-sm',
      pillsCount: 3
    },
    md: {
      containerSize: 'w-64 h-40',
      pillSize: 'w-5 h-12',
      bottleSize: 'w-16 h-20',
      textSize: 'text-base',
      pillsCount: 4
    },
    lg: {
      containerSize: 'w-80 h-48',
      pillSize: 'w-6 h-14',
      bottleSize: 'w-20 h-24',
      textSize: 'text-lg',
      pillsCount: 5
    }
  };

  const currentSize = sizes[size];

  // Animation variants
  const containerVariants = {
    loading: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    },
    success: {
      opacity: 1
    },
    error: {
      opacity: 1
    }
  };

  const pillVariants = {
    loading: (i: number) => ({
      y: [0, -40, 0],
      rotate: [0, i % 2 === 0 ? 15 : -15, 0],
      transition: {
        y: {
          repeat: Infinity,
          duration: 1,
          ease: "easeInOut",
          delay: i * 0.15
        },
        rotate: {
          repeat: Infinity,
          duration: 1,
          ease: "easeInOut",
          delay: i * 0.15
        }
      }
    }),
    success: {
      y: 0,
      scale: 1,
      opacity: 1
    },
    error: {
      y: [0, -10, 0],
      rotate: [0, 10, -10, 5, -5, 0],
      transition: {
        duration: 0.5
      }
    }
  };

  const bottleVariants = {
    loading: {
      rotate: [-2, 2, -2],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }
      }
    },
    success: {
      rotate: 0,
      scale: 1.1,
      transition: {
        duration: 0.3
      }
    },
    error: {
      rotate: [0, -5, 5, -3, 3, 0],
      transition: {
        duration: 0.5
      }
    }
  };

  const textVariants = {
    loading: {
      opacity: [0.5, 1, 0.5],
      transition: {
        opacity: {
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }
      }
    },
    success: {
      opacity: 1,
      scale: 1.05,
      color: "#22c55e",
      transition: {
        duration: 0.3
      }
    },
    error: {
      opacity: 1,
      scale: 1.05,
      color: "#ef4444",
      transition: {
        duration: 0.3
      }
    }
  };

  const generatePills = () => {
    return Array.from({ length: currentSize.pillsCount }).map((_, i) => {
      // Different colors for pills
      const pillColors = ['#ff6f61', '#f9d775', '#4caf50', '#42a5f5', '#ab47bc'];
      const pillColor = pillColors[i % pillColors.length];
      
      return (
        <motion.div
          key={i}
          className={`${currentSize.pillSize} rounded-full absolute bottom-12`}
          style={{
            backgroundColor: pillColor,
            left: `${((i + 1) * (100 / (currentSize.pillsCount + 1)))}%`,
            transformOrigin: "center bottom",
            zIndex: 20 - i
          }}
          custom={i}
          variants={pillVariants}
        />
      );
    });
  };

  const getSuccessText = () => {
    switch (loadingState) {
      case 'success':
        return 'Loaded successfully!';
      case 'error':
        return 'Error loading data';
      default:
        return text;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={`${currentSize.containerSize} relative flex flex-col items-center justify-end`}
        initial="loading"
        animate={loadingState}
        variants={containerVariants}
      >
        {/* Pills */}
        {generatePills()}

        {/* Medicine Bottle */}
        <motion.div
          className={`${currentSize.bottleSize} bg-white rounded-lg absolute bottom-0 flex flex-col items-center justify-end overflow-hidden border-2`}
          style={{ 
            borderColor: color,
            zIndex: 10
          }}
          variants={bottleVariants}
        >
          {/* Bottle Cap */}
          <div 
            className="w-3/4 h-1/5 rounded-t-lg absolute top-0"
            style={{ backgroundColor: color }}
          />
          
          {/* Bottle Label */}
          <div 
            className="w-5/6 h-2/5 rounded-md absolute bottom-1"
            style={{ 
              backgroundColor: `${color}30`,
              border: `1px solid ${color}`
            }}
          >
            {/* Label Lines */}
            <div className="w-3/4 h-1 bg-white mx-auto mt-2 rounded-full opacity-80" />
            <div className="w-2/3 h-1 bg-white mx-auto mt-1 rounded-full opacity-60" />
            <div className="w-1/2 h-1 bg-white mx-auto mt-1 rounded-full opacity-40" />
          </div>
        </motion.div>
      </motion.div>

      {/* Loading Text */}
      <motion.p
        className={`mt-4 font-medium ${currentSize.textSize}`}
        variants={textVariants}
        style={{ color }}
      >
        {getSuccessText()}
      </motion.p>
    </div>
  );
};

export default PharmacyLoader;