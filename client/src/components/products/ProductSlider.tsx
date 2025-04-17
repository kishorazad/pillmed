import React from 'react';
import { Link } from 'wouter';
import { ChevronUp, ChevronDown, PhoneCall, MessagesSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number | null;
  imageUrl?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
}

interface ProductSliderProps {
  title: string;
  viewMoreLink?: string;
  products: Product[];
}

const ProductSlider: React.FC<ProductSliderProps> = ({ 
  title, 
  viewMoreLink = '/products',
  products 
}) => {
  // Only show the first 5 products
  const displayProducts = products.slice(0, 5);

  const renderDiscountPercentage = (price: number, discountedPrice: number) => {
    if (!discountedPrice || discountedPrice >= price) return null;
    const discount = Math.round(((price - discountedPrice) / price) * 100);
    return discount > 0 ? `${discount}%` : null;
  };

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">{title}</h2>
        {viewMoreLink && (
          <Link href={viewMoreLink}>
            <span className="text-sm font-medium text-[#10847e]">View All</span>
          </Link>
        )}
      </div>
      
      <div className="relative">
        {/* Products list - vertical layout */}
        <div className="flex flex-col space-y-3">
          {displayProducts.map((product) => (
            <div key={product.id} className="flex items-start p-2 border border-gray-100 rounded-lg hover:shadow-md">
              <Link href={`/products/${product.id}`}>
                <div className="w-20 h-20 relative flex-shrink-0">
                  <img 
                    src={product.imageUrl || 'https://via.placeholder.com/120'}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                  
                  {/* Discount tag */}
                  {product.discountedPrice && product.price && (
                    <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold py-1 px-1.5 rounded">
                      {renderDiscountPercentage(product.price, product.discountedPrice) || 'SALE'}
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="flex-1 pl-3">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
                </Link>
                
                {/* Price */}
                <div className="flex items-center mt-1">
                  <span className="font-bold text-sm">
                    ₹{product.discountedPrice || product.price}
                  </span>
                  
                  {product.discountedPrice && (
                    <span className="text-gray-500 text-xs line-through ml-1">
                      ₹{product.price}
                    </span>
                  )}

                  {/* Deal tag for special items */}
                  {product.discountedPrice && product.price && 
                   renderDiscountPercentage(product.price, product.discountedPrice) && 
                   parseInt(renderDiscountPercentage(product.price, product.discountedPrice) || '0') > 20 && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-sm">
                      Deal of the Week
                    </span>
                  )}
                </div>
                
                {/* Add to cart button */}
                <div className="mt-2 flex justify-between items-center">
                  <Button 
                    className="bg-[#10847e] hover:bg-[#0d6e69] text-white text-xs py-1 h-8 px-2 rounded-md"
                  >
                    ADD TO CART
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact options */}
      <div className="mt-5 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center text-sm">
          <span className="font-medium">Need help with medicines?</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex gap-1 text-xs items-center text-green-700 border-green-700">
            <PhoneCall size={16} />
            <span>Call 8770762307</span>
          </Button>
          <Button size="sm" variant="outline" className="flex gap-1 text-xs items-center text-green-700 border-green-700">
            <MessagesSquare size={16} />
            <span>WhatsApp</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;