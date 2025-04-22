import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { 
  useQuery, 
  useMutation,
  UseMutationResult,
  useQueryClient
} from "@tanstack/react-query";
import { useStore } from './store';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "./queryClient";

// Authentication types
type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  pincode?: string;
  role?: string;
  profileImageUrl?: string;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  name: string;
  email: string;
  password: string;
};

// Context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

// Create context
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const setGlobalUser = useStore(state => state.setUser);
  
  // Fetch current user
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const response = await fetch('/api/user', {
        credentials: 'include', // Important for cookies
        cache: 'no-store' // Ensure fresh data on each request
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('User not authenticated (401)');
          return null;
        }
        throw new Error('Failed to fetch user');
      }
      
      const userData = await response.json();
      console.log('User data fetched:', userData ? `ID: ${userData.id}, Role: ${userData.role}` : 'No user data');
      return userData || null;
    },
    staleTime: 10000, // Lower stale time for more frequent refreshes
    refetchOnWindowFocus: true, // Refresh when window regains focus
    retry: 1 // Retry once if failed
  });
  
  // Update Zustand store when user data changes
  useEffect(() => {
    if (user) {
      setGlobalUser(user);
    }
  }, [user, setGlobalUser]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include' // Important for cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const userData = await response.json();
      return userData;
    },
    onSuccess: (userData: User) => {
      // Update user in query cache
      queryClient.setQueryData(['/api/user'], userData);
      
      // Update Zustand store
      setGlobalUser(userData);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name || userData.username}!`,
      });
      
      // Redirect based on user role
      if (userData.role) {
        const role = userData.role.toLowerCase();
        
        // Small delay to ensure session is properly saved
        setTimeout(() => {
          switch (role) {
            case 'admin':
              window.location.href = '/admin';
              break;
            case 'doctor':
              window.location.href = '/doctor';
              break;
            case 'chemist':
              window.location.href = '/chemist';
              break;
            case 'pharmacy':
              window.location.href = '/pharmacy';
              break;
            case 'hospital':
            case 'laboratory':
              window.location.href = '/laboratory';
              break;
            case 'delivery':
              window.location.href = '/delivery';
              break;
            default:
              window.location.href = '/profile';
          }
        }, 500);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      console.log('Registering user with data:', {
        ...userData,
        password: '***hidden***' // Don't log the actual password
      });
      
      // Get the temp user ID to transfer cart
      const { tempUserId } = useStore.getState();
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          tempUserId // Include tempUserId for cart transfer
        }),
        credentials: 'include' // Important for cookies
      });
      
      console.log('Register response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration error response:', errorData);
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const newUser = await response.json();
      console.log('Registration successful, user data:', {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      });
      
      return newUser;
    },
    onSuccess: (userData: User) => {
      // Update user in query cache
      queryClient.setQueryData(['/api/user'], userData);
      
      // Update Zustand store
      setGlobalUser(userData);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.name}!`,
      });
      
      // Redirect based on user role
      if (userData.role) {
        const role = userData.role.toLowerCase();
        
        // Small delay to ensure session is properly saved
        setTimeout(() => {
          switch (role) {
            case 'admin':
              window.location.href = '/admin';
              break;
            case 'doctor':
              window.location.href = '/doctor';
              break;
            case 'chemist':
              window.location.href = '/chemist';
              break;
            case 'pharmacy':
              window.location.href = '/pharmacy';
              break;
            case 'hospital':
            case 'laboratory':
              window.location.href = '/laboratory';
              break;
            case 'delivery':
              window.location.href = '/delivery';
              break;
            default:
              window.location.href = '/profile';
          }
        }, 500);
      }
    },
    onError: (error: Error) => {
      console.error('Register mutation error:', error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include' // Important for cookies
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      // Clear user from query cache
      queryClient.setQueryData(['/api/user'], null);
      
      // Clear user from Zustand store
      setGlobalUser(null);
      
      // Invalidate queries to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      // Redirect to home page
      window.location.href = '/';
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}