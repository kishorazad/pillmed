import React from 'react';
import { Link } from 'wouter';

interface Category {
  id: number;
  name: string;
  imageUrl?: string | null;
  description?: string;
}

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link href={`/products/category/${category.id}`}>
      <div className="flex flex-col items-center p-3 rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer">
        <div className="w-24 h-24 rounded-full bg-[#f8f8f8] flex items-center justify-center overflow-hidden mb-2">
          {category.imageUrl ? (
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-20 h-20 object-contain"
            />
          ) : (
            <div className="w-16 h-16 bg-[#10847e] rounded-full flex items-center justify-center text-white text-xl">
              {category.name.charAt(0)}
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium text-center">{category.name}</h3>
      </div>
    </Link>
  );
};

export default CategoryCard;