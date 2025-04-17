import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description?: string;
    price: number;
    discountedPrice?: number;
    imageUrl: string;
    brand?: string;
    quantity: string;
    rating?: number;
    ratingCount?: number;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useStore();
  const { toast } = useToast();
  
  const handleAddToCart = async () => {
    await addToCart(product.id, 1);
    toast({
      title: "Added to cart",
      description: "Product has been added to your cart",
    });
  };
  
  // Calculate discount percentage if discounted price is available
  const discountPercentage = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-40 object-cover"
          />
        </Link>
        {discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs py-1 px-2 rounded">
            {discountPercentage}% OFF
          </span>
        )}
      </div>
      <div className="p-3">
        {product.rating && (
          <div className="flex items-center mb-1">
            <span className="bg-orange-100 text-orange-800 text-xs px-2 rounded">
              {product.rating} ★
            </span>
            {product.ratingCount && (
              <span className="text-xs text-gray-500 ml-2">
                {product.ratingCount} ratings
              </span>
            )}
          </div>
        )}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium mb-1 line-clamp-2 h-12">{product.name}</h3>
        </Link>
        <p className="text-xs text-gray-500 mb-2">{product.quantity}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold">
              ₹{product.discountedPrice || product.price}
            </span>
            {product.discountedPrice && (
              <span className="text-xs text-gray-500 line-through ml-1">
                ₹{product.price}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            className="text-orange-500 border border-orange-500 rounded px-3 py-1 text-sm hover:bg-orange-500 hover:text-white transition"
            onClick={handleAddToCart}
          >
            ADD
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
