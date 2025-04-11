import { create } from 'zustand';
import { apiRequest } from './queryClient';

interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product?: any;
}

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  pincode?: string;
  role?: string;
  profileImageUrl?: string;
}

interface AppState {
  cart: CartItem[];
  cartOpen: boolean;
  user: User | null;
  userLoading: boolean;
  tempUserId: number;
  searchQuery: string;
  
  // Actions
  openCart: () => void;
  closeCart: () => void;
  setCart: (cart: CartItem[]) => void;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (id: number, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSearchQuery: (query: string) => void;
}

// Create a store with Zustand
export const useStore = create<AppState>((set, get) => ({
  cart: [],
  cartOpen: false,
  user: null,
  userLoading: false,
  tempUserId: 1, // Temp user ID for demo purposes
  searchQuery: '',
  
  // Cart actions
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  setCart: (cart) => set({ cart }),
  
  addToCart: async (productId, quantity) => {
    const { tempUserId, user } = get();
    const userId = user?.id || tempUserId;
    
    try {
      await apiRequest('POST', '/api/cart', {
        userId,
        productId,
        quantity
      });
      
      // Refetch the cart
      const response = await fetch(`/api/cart/${userId}`);
      const cartItems = await response.json();
      set({ cart: cartItems });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  },
  
  updateCartItem: async (id, quantity) => {
    const { tempUserId, user } = get();
    const userId = user?.id || tempUserId;
    
    try {
      await apiRequest('PUT', `/api/cart/${id}`, { quantity });
      
      // Refetch the cart
      const response = await fetch(`/api/cart/${userId}`);
      const cartItems = await response.json();
      set({ cart: cartItems });
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  },
  
  removeFromCart: async (id) => {
    const { tempUserId, user } = get();
    const userId = user?.id || tempUserId;
    
    try {
      await apiRequest('DELETE', `/api/cart/${id}`);
      
      // Refetch the cart
      const response = await fetch(`/api/cart/${userId}`);
      const cartItems = await response.json();
      set({ cart: cartItems });
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  },
  
  clearCart: async () => {
    const { tempUserId, user } = get();
    const userId = user?.id || tempUserId;
    
    try {
      await apiRequest('DELETE', `/api/cart/user/${userId}`);
      set({ cart: [] });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  },
  
  // User actions
  setUser: async (user) => {
    set({ user });
    
    // If a user just logged in, refresh their cart
    if (user) {
      try {
        const response = await fetch(`/api/cart/${user.id}`);
        const cartItems = await response.json();
        set({ cart: cartItems });
      } catch (error) {
        console.error('Failed to fetch cart items after login:', error);
      }
    }
  },
  
  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
