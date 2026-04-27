import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SubstituteMedicinesProps {
  medicineId: number;
  medicineName: string;
  composition?: string | null | any; // Handle any type to accommodate differences in API response
}

interface SubstituteMedicine {
  id: number;
  name: string;
  imageUrl?: string | null;
  price: number;
  discountedPrice?: number | null;
  manufacturer?: string | null;
  brand?: string | null;
  composition?: string | null; 
  packSize?: string | null;
  quantity?: string;
  uses?: string | null;
  dosage?: string | null;
  sideEffects?: string | null;
  contraindications?: string | null;
}

const SubstituteMedicines: React.FC<SubstituteMedicinesProps> = ({ 
  medicineId, 
  medicineName,
  composition 
}) => {
  // Clean composition value if it exists
  const actualComposition = typeof composition === 'string' ? composition : 
                            composition && typeof composition === 'object' ? JSON.stringify(composition) : null;
  
  // Create the API query string
  const queryString = actualComposition 
    ? `composition=${encodeURIComponent(actualComposition)}` 
    : `name=${encodeURIComponent(medicineName)}`;
  
  // Fetch substitutes
  const { data: substitutes = [], isLoading, error } = useQuery<SubstituteMedicine[]>({
    queryKey: [`/api/medicine/substitutes?${queryString}&excludeId=${medicineId}`],
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });

  const calculateDiscount = (price: number, discountedPrice?: number | null) => {
    if (!discountedPrice || discountedPrice >= price) return null;
    return Math.round(((price - discountedPrice) / price) * 100);
  };

  // If no substitutes found or error, don't render anything
  if (substitutes.length === 0 || error) {
    return null;
  }

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4">Similar Medicines</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="w-full h-28 bg-gray-200 rounded-md mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {substitutes?.map((medicine: SubstituteMedicine) => (
            <Link key={medicine.id} href={`/products/${medicine.id}`}>
              <div className="block cursor-pointer">
                <Card className="h-full transition-transform hover:scale-105 hover:shadow-md">
                  <CardContent className="p-3">
                    <div className="w-full h-28 flex items-center justify-center mb-2 bg-gray-50 rounded overflow-hidden">
                      <img 
                        src={medicine.imageUrl || 'https://via.placeholder.com/100'} 
                        alt={medicine.name} 
                        className="h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-sm font-medium line-clamp-2 h-10">{medicine.name}</h3>
                    
                    {/* Manufacturer/Brand */}
                    <p className="text-xs text-gray-500 mb-1 line-clamp-1">
                      {medicine.manufacturer || medicine.brand || ''}
                    </p>
                    
                    {/* Display composition if available */}
                    {medicine.composition && (
                      <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                        <span className="font-medium">Composition:</span> {medicine.composition}
                      </p>
                    )}
                    
                    {/* Pack size if available */}
                    {medicine.packSize && (
                      <p className="text-xs text-gray-600 mb-1">
                        {medicine.packSize}
                      </p>
                    )}
                    
                    {/* Price and discount */}
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-sm">
                        ₹{medicine.discountedPrice || medicine.price}
                      </span>
                      {medicine.discountedPrice && medicine.price && (
                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                          {calculateDiscount(medicine.price, medicine.discountedPrice)}% off
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubstituteMedicines;