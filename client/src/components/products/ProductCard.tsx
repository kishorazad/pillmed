// // import { Link } from 'wouter';
// // import { Button } from '@/components/ui/button';
// // import { useStore } from '@/lib/store';
// // import { useToast } from '@/hooks/use-toast';
// // import { getSafeImageUrl } from '@/utils/imageUtils';

// // interface ProductCardProps {
// //   product: {
// //     id: number;
// //     name: string;
// //     description?: string;
// //     price: number;
// //     discountedPrice?: number;
// //     imageUrl: string;
// //     brand?: string;
// //     quantity: string;
// //     rating?: number;
// //     ratingCount?: number;
// //   };
// // }

// // const ProductCard = ({ product }: ProductCardProps) => {
// //   const { addToCart, searchQuery } = useStore();
// //   const { toast } = useToast();
  
// //   const handleAddToCart = async () => {
// //     await addToCart(product.id, 1);
// //     toast({
// //       title: "Added to cart",
// //       description: "Product has been added to your cart",
// //     });
// //   };
  
// //   // Calculate discount percentage if discounted price is available
// //   const discountPercentage = product.discountedPrice
// //     ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
// //     : 0;
  
// //   // Show detailed card with ratings, etc. only when search is performed
// //   const isDetailedView = !!searchQuery;
  
// //   return (
// //     <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
// //       <div className="relative">
// //         <Link href={`/products/${product.id}`}>
// //           <div className="relative overflow-hidden w-full h-40">
// //             {/* Low-quality placeholder with background shimmer effect */}
// //             <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse"></div>
            
// //             {/* Actual image with advanced loading optimization */}
// //             <img 
// //               {/* src={getSafeImageUrl(product.imageUrl, 'MEDIUM')}  */}
// //              getSafeImageUrl(product.imageUrl || "", 'MEDIUM') 
// //             alt={product.name} 
// //               className="w-full h-40 object-contain relative z-10 transition-opacity duration-300"
// //               loading="lazy"
// //               decoding="async"
// //               onLoad={(e) => {
// //                 // Remove shimmer effect once image is loaded
// //                 (e.target as HTMLImageElement).style.opacity = '1';
// //                 // Attempt to preload the product detail page image
// //                 if (product.id) {
// //                   const link = document.createElement('link');
// //                   link.rel = 'prefetch';
// //                   link.href = getSafeImageUrl(product.imageUrl, 'LARGE');
// //                   link.as = 'image';
// //                   document.head.appendChild(link);
// //                 }
// //               }}
// //               style={{ opacity: '0' }} // Start transparent until loaded
// //               fetchPriority="low"
// //             />
// //           </div>
// //         </Link>
// //         {discountPercentage > 0 && (
// //           <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs py-1 px-2 rounded">
// //             {discountPercentage}% OFF
// //           </span>
// //         )}
// //       </div>
// //       <div className="p-3">
// //         {/* Show ratings only on detailed view (search results) */}
// //         {isDetailedView && product.rating && (
// //           <div className="flex items-center mb-1">
// //             <span className="bg-orange-100 text-orange-800 text-xs px-2 rounded">
// //               {product.rating} ★
// //             </span>
// //             {product.ratingCount && (
// //               <span className="text-xs text-gray-500 ml-2">
// //                 {product.ratingCount} ratings
// //               </span>
// //             )}
// //           </div>
// //         )}
// //         <Link href={`/products/${product.id}`}>
// //           <h3 className="font-medium mb-1 line-clamp-2 h-12">{product.name}</h3>
// //         </Link>
// //         <p className="text-xs text-gray-500 mb-2">{product.quantity}</p>
// //         <div className="flex items-center justify-between">
// //           <div>
// //             <span className="font-bold">
// //               {/* ₹{product.discountedPrice || product.price} */}
// //               ₹
// //               (Number(product.discountedPrice || product.price || 0).toFixed(2))
// //             </span>
// //             {product.discountedPrice && (
// //               <span className="text-xs text-gray-500 line-through ml-1">
// //                // /* {/* ₹{product.price} */} */
// //                 ₹Number(product.price || 0).toFixed(2)
// //               </span>
// //             )}
// //           </div>
// //           <Button
// //             variant="outline"
// //             className="text-orange-500 border border-orange-500 rounded px-3 py-1 text-sm hover:bg-orange-500 hover:text-white transition"
// //             onClick={handleAddToCart}
// //           >
// //             ADD
// //           </Button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ProductCard;
// // import { Link } from 'wouter';
// // import { Button } from '@/components/ui/button';
// // import { useStore } from '@/lib/store';
// // import { useToast } from '@/hooks/use-toast';
// // import { getSafeImageUrl } from '@/utils/imageUtils';

// // interface ProductCardProps {
// //   product: {
// //     id: number;
// //     name: string;
// //     description?: string;
// //     price: any;
// //     discountedPrice?: any;
// //     imageUrl?: string;
// //     brand?: string;
// //     quantity?: string;
// //     rating?: number;
// //     ratingCount?: number;
// //   };
// // }

// // const ProductCard = ({ product }: ProductCardProps) => {
// //   const { addToCart, searchQuery } = useStore();
// //   const { toast } = useToast();

// //   const handleAddToCart = async () => {
// //     await addToCart(product.id, 1);
// //     toast({
// //       title: "Added to cart",
// //       description: "Product has been added to your cart",
// //     });
// //   };

// //   const price = Number(product.price || 0);
// //   const discounted = Number(product.discountedPrice || 0);

// //   const discountPercentage =
// //     discounted > 0
// //       ? Math.round(((price - discounted) / price) * 100)
// //       : 0;

// //   const isDetailedView = !!searchQuery;

// //   return (
// //     <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
// //       <div className="relative">
// //         <Link href={`/products/${product.id}`}>
// //           <div className="relative overflow-hidden w-full h-40">
// //             <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse"></div>

// //             <img
// //               src={getSafeImageUrl(product.imageUrl || "", "MEDIUM")}
// //               alt={product.name}
// //               className="w-full h-40 object-contain relative z-10 transition-opacity duration-300"
// //               loading="lazy"
// //               decoding="async"
// //               style={{ opacity: "1" }}
// //             />
// //           </div>
// //         </Link>

// //         {discountPercentage > 0 && (
// //           <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs py-1 px-2 rounded">
// //             {discountPercentage}% OFF
// //           </span>
// //         )}
// //       </div>

// //       <div className="p-3">
// //         {isDetailedView && product.rating && (
// //           <div className="flex items-center mb-1">
// //             <span className="bg-orange-100 text-orange-800 text-xs px-2 rounded">
// //               {product.rating} ★
// //             </span>
// //           </div>
// //         )}

// //         <Link href={`/products/${product.id}`}>
// //           <h3 className="font-medium mb-1 line-clamp-2 h-12">
// //             {product.name}
// //           </h3>
// //         </Link>

// //         <p className="text-xs text-gray-500 mb-2">
// //           {product.quantity || ""}
// //         </p>

// //         <div className="flex items-center justify-between">
// //           <div>
// //             <span className="font-bold">
// //               ₹{(discounted || price).toFixed(2)}
// //             </span>

// //             {discounted > 0 && (
// //               <span className="text-xs text-gray-500 line-through ml-1">
// //                 ₹{price.toFixed(2)}
// //               </span>
// //             )}
// //           </div>

// //           <Button
// //             variant="outline"
// //             className="text-orange-500 border border-orange-500 rounded px-3 py-1 text-sm hover:bg-orange-500 hover:text-white transition"
// //             onClick={handleAddToCart}
// //           >
// //             ADD
// //           </Button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ProductCard;
// import { Link } from 'wouter';
// import { Button } from '@/components/ui/button';
// import { useStore } from '@/lib/store';
// import { useToast } from '@/hooks/use-toast';
// import { getSafeImageUrl } from '@/utils/imageUtils';

// interface ProductCardProps {
//   product: {
//     id: number;
//     name: string;
//     description?: string;
//     price: number | string;            // allow string from API
//     discountedPrice?: number | string; // allow string from API
//     imageUrl?: string | null;
//     brand?: string;
//     quantity?: string;
//     rating?: number;
//     ratingCount?: number;
//   };
// }

// const ProductCard = ({ product }: ProductCardProps) => {
//   const { addToCart, searchQuery } = useStore();
//   const { toast } = useToast();

//   const handleAddToCart = async () => {
//     await addToCart(product.id, 1);
//     toast({
//       title: "Added to cart",
//       description: "Product has been added to your cart",
//     });
//   };

//   // ✅ Always coerce to numbers safely
//   const price = Number(product.price || 0);
//   const discounted = product.discountedPrice != null
//     ? Number(product.discountedPrice)
//     : null;

//   const discountPercentage =
//     discounted && price > 0
//       ? Math.round(((price - discounted) / price) * 100)
//       : 0;

//   const isDetailedView = !!searchQuery;

//   // ✅ Safe image (never undefined)
//   const imgSrc = getSafeImageUrl(product.imageUrl || '', 'MEDIUM');

//   return (
//     <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
//       <div className="relative">
//         <Link href={`/products/${product.id}`}>
//           <div className="relative overflow-hidden w-full h-40">
//             {/* shimmer */}
//             <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse"></div>

//             {/* ✅ FIXED: valid src attribute */}
//             <img
//               src={imgSrc}
//               alt={product.name}
//               className="w-full h-40 object-contain relative z-10 transition-opacity duration-300"
//               loading="lazy"
//               decoding="async"
//               onLoad={(e) => {
//                 (e.target as HTMLImageElement).style.opacity = '1';
//               }}
//               style={{ opacity: 0 }}
//             />
//           </div>
//         </Link>

//         {discountPercentage > 0 && (
//           <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs py-1 px-2 rounded">
//             {discountPercentage}% OFF
//           </span>
//         )}
//       </div>

//       <div className="p-3">
//         {isDetailedView && product.rating && (
//           <div className="flex items-center mb-1">
//             <span className="bg-orange-100 text-orange-800 text-xs px-2 rounded">
//               {product.rating} ★
//             </span>
//             {product.ratingCount && (
//               <span className="text-xs text-gray-500 ml-2">
//                 {product.ratingCount} ratings
//               </span>
//             )}
//           </div>
//         )}

//         <Link href={`/products/${product.id}`}>
//           <h3 className="font-medium mb-1 line-clamp-2 h-12">
//             {product.name}
//           </h3>
//         </Link>

//         <p className="text-xs text-gray-500 mb-2">
//           {product.quantity || ''}
//         </p>

//         <div className="flex items-center justify-between">
//           <div>
//             {/* ✅ FIXED: correct JSX + number conversion */}
//             <span className="font-bold">
//               ₹{(discounted ?? price).toFixed(2)}
//             </span>

//             {discounted && (
//               <span className="text-xs text-gray-500 line-through ml-1">
//                 ₹{price.toFixed(2)}
//               </span>
//             )}
//           </div>

//           <Button
//             variant="outline"
//             className="text-orange-500 border border-orange-500 rounded px-3 py-1 text-sm hover:bg-orange-500 hover:text-white transition"
//             onClick={handleAddToCart}
//           >
//             ADD
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { getSafeImageUrl } from '@/utils/imageUtils';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description?: string;
    price: number | string;
    discountedPrice?: number | string;
    imageUrl?: string | null;
    brand?: string;
    quantity?: string;
    rating?: number;
    ratingCount?: number;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, searchQuery } = useStore();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      });
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  // ✅ SAFE NUMBER CONVERSION
  const price = Number(product.price) || 0;
  const discounted =
    product.discountedPrice !== undefined &&
    product.discountedPrice !== null
      ? Number(product.discountedPrice)
      : null;

  // ✅ SAFE DISCOUNT CALCULATION
  const discountPercentage =
    discounted && price > 0
      ? Math.round(((price - discounted) / price) * 100)
      : 0;

  const isDetailedView = !!searchQuery;

  // ✅ SAFE IMAGE URL
  const imgSrc = getSafeImageUrl(product.imageUrl || '', 'MEDIUM');

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <div className="relative overflow-hidden w-full h-40">

            {/* shimmer loader */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse"></div>

            {/* ✅ SAFE IMAGE */}
            <img
              src={imgSrc}
              alt={product.name || "product"}
              className="w-full h-40 object-contain relative z-10 transition-opacity duration-300"
              loading="lazy"
              decoding="async"
              style={{ opacity: 0 }}
              onLoad={(e) => {
                (e.target as HTMLImageElement).style.opacity = '1';
              }}
              onError={(e) => {
                // ✅ fallback image
                (e.target as HTMLImageElement).src = '/pillnow.png';
              }}
            />
          </div>
        </Link>

        {/* Discount badge */}
        {discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs py-1 px-2 rounded">
            {discountPercentage}% OFF
          </span>
        )}
      </div>

      <div className="p-3">

        {/* Ratings */}
        {isDetailedView && product.rating && (
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

        {/* Product name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium mb-1 line-clamp-2 h-12">
            {product.name || "No Name"}
          </h3>
        </Link>

        {/* Quantity */}
        <p className="text-xs text-gray-500 mb-2">
          {product.quantity || ''}
        </p>

        {/* Price section */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold">
              ₹{(discounted ?? price).toFixed(2)}
            </span>

            {discounted && (
              <span className="text-xs text-gray-500 line-through ml-1">
                ₹{price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add button */}
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
