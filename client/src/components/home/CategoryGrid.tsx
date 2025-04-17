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
  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-4">Shop by Category</h2>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {categories.map((category) => (
          <Link key={category.id} href={category.link}>
            <a className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#f8f8f8] flex items-center justify-center p-3 mb-2 transition-all group-hover:shadow-md">
                <img 
                  src={category.imageUrl} 
                  alt={category.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium line-clamp-2">{category.name}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;