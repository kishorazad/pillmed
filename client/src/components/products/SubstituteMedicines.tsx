import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Pill, Loader2 } from 'lucide-react';

interface Medicine {
  id: number;
  name: string;
  price: number;
  discountedPrice?: number | null;
  imageUrl?: string | null;
  manufacturer?: string | null;
  composition?: string | null;
}

interface SubstituteMedicinesProps {
  medicineId: number;
  medicineName: string;
  composition?: string | null;
}

const SubstituteMedicines: React.FC<SubstituteMedicinesProps> = ({ 
  medicineId, 
  medicineName, 
  composition 
}) => {
  const [substitutes, setSubstitutes] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchSubstitutes = async () => {
      try {
        // First check if we have the composition, as it's the most reliable way to find substitutes
        let endpoint = composition 
          ? `/api/products/substitutes?composition=${encodeURIComponent(composition)}&excludeId=${medicineId}`
          : `/api/products/substitutes?name=${encodeURIComponent(medicineName)}&excludeId=${medicineId}`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Failed to fetch substitute medicines');
        }
        
        const data = await response.json();
        setSubstitutes(data);
      } catch (err) {
        console.error('Error fetching substitutes:', err);
        setError('Could not load substitute medicines at this time.');
      } finally {
        setLoading(false);
      }
    };

    if (medicineId && (medicineName || composition)) {
      fetchSubstitutes();
    }
  }, [medicineId, medicineName, composition]);

  // If we have at least 1 substitute, show the component
  if (!loading && substitutes.length === 0) {
    return null;
  }

  // Default to showing only 3 items unless "showAll" is true
  const displayedSubstitutes = showAll ? substitutes : substitutes.slice(0, 3);

  return (
    <div className="mt-8 border rounded-lg p-4">
      <div className="flex items-center mb-4">
        <Pill className="h-5 w-5 text-teal-600 mr-2" />
        <h2 className="text-lg font-semibold">Similar Alternatives</h2>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-4">
            Medicines with similar composition to {medicineName}
          </div>
          
          <div className="space-y-3">
            {displayedSubstitutes.map((substitute) => (
              <Link key={substitute.id} href={`/products/${substitute.id}`}>
                <a className="flex items-center p-3 border rounded-md hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={substitute.imageUrl || 'https://via.placeholder.com/48'} 
                      alt={substitute.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="ml-3 flex-grow">
                    <h3 className="text-sm font-medium">{substitute.name}</h3>
                    {substitute.manufacturer && (
                      <p className="text-xs text-gray-500">{substitute.manufacturer}</p>
                    )}
                    <div className="flex items-center mt-1">
                      <span className="text-sm font-bold">₹{substitute.discountedPrice || substitute.price}</span>
                      {substitute.discountedPrice && (
                        <span className="text-xs text-gray-500 line-through ml-1">₹{substitute.price}</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </a>
              </Link>
            ))}
          </div>
          
          {substitutes.length > 3 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="mt-4 text-sm text-teal-600 font-medium hover:underline"
            >
              {showAll ? 'Show Less' : `View All Alternatives (${substitutes.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default SubstituteMedicines;