import { Link } from 'wouter';

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    imageUrl: string;
  };
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link href={`/products/category/${category.id}`} className="text-center hover:shadow-md transition p-3 rounded-lg">
      <div className="h-24 w-24 mx-auto mb-2 flex items-center justify-center bg-[#f8f8f8] rounded-full overflow-hidden">
        <img 
          src={category.imageUrl} 
          alt={category.name} 
          className="object-cover h-full w-full"
        />
      </div>
      <h3 className="font-medium text-sm">{category.name}</h3>
    </Link>
  );
};

export default CategoryCard;
