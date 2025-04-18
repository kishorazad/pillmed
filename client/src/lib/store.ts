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
  fetchCart: (userId?: number) => Promise<void>;
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
  
  // Fetch cart items for current user
  fetchCart: async (userId?: number) => {
    const state = get();
    const currentUserId = userId || state.user?.id || state.tempUserId;
    
    try {
      console.log('Fetching cart for user ID:', currentUserId);
      const response = await fetch(`/api/cart/${currentUserId}`);
      const cartItems = await response.json();
      console.log('Cart data fetched:', cartItems);
      set({ cart: cartItems });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  },
  
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
    const { tempUserId } = get();
    const prevUser = get().user;
    
    // Update user state
    set({ user });
    
    // If a user just logged in
    if (user && !prevUser) {
      try {
        console.log("User logged in with ID:", user.id, "- Transferring cart from tempUserId:", tempUserId);
        
        // First transfer any items from the temp cart to the user's cart
        await apiRequest('POST', '/api/cart/transfer', {
          fromUserId: tempUserId,
          toUserId: user.id
        });
        
        // Then fetch the updated cart
        console.log("Fetching cart after transfer for user ID:", user.id);
        const response = await fetch(`/api/cart/${user.id}`);
        const cartItems = await response.json();
        console.log("Cart items after login and transfer:", cartItems);
        set({ cart: cartItems });
      } catch (error) {
        console.error('Failed to transfer or fetch cart items after login:', error);
        
        // As a fallback, just fetch the cart without transfer
        try {
          const response = await fetch(`/api/cart/${user.id}`);
          const cartItems = await response.json();
          set({ cart: cartItems });
        } catch (innerError) {
          console.error('Failed to fetch cart as fallback:', innerError);
        }
      }
    } else if (!user && prevUser) {
      // User logged out, generate a new tempUserId by setting it to current timestamp
      // This ensures a clean slate for anonymous users after logout
      const newTempId = Date.now();
      console.log("User logged out, setting new tempUserId:", newTempId);
      
      // Update the tempUserId
      set({ tempUserId: newTempId });
      
      // Clear the cart
      set({ cart: [] });
      
      try {
        // Initialize an empty cart for the new temp user
        console.log("Fetching temp cart items for new ID:", newTempId);
        const response = await fetch(`/api/cart/${newTempId}`);
        const cartItems = await response.json();
        set({ cart: cartItems });
      } catch (error) {
        console.error('Failed to fetch temp cart items after logout:', error);
      }
    }
  },
  
  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
