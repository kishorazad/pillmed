import React from 'react';
import { Link } from 'wouter';

interface Category {
  id: number;
  name: string;
  imageUrl: string;
  link: string;
}

interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  // Take only first 6 categories for mobile display
  const displayCategories = categories.slice(0, 6);
  
  return (
    <div className="my-6">
      <h2 className="text-lg font-bold mb-3">Shop By Category</h2>
      <div className="grid grid-cols-3 gap-3">
        {displayCategories.map((category) => (
          <Link key={category.id} href={category.link}>
            <a className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 p-1 mb-2 flex items-center justify-center">
                <img 
                  src={category.imageUrl} 
                  alt={category.name}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <span className="text-xs text-center leading-tight">{category.name}</span>
            </a>
          </Link>
        ))}
      </div>
      
      {categories.length > 6 && (
        <div className="text-center mt-3">
          <Link href="/products">
            <a className="text-sm font-medium text-[#10847e]">
              View All Categories
            </a>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;