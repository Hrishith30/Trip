import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { API_URL } from '../constants/Config';
import { useRouter, useSegments } from 'expo-router';

interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  themePreference?: 'light' | 'dark' | 'auto';
}



interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, photoURL?: string) => Promise<void>;

  updateProfile: (data: Partial<User>) => Promise<void>;
  uploadProfilePhoto: (uri: string) => Promise<string>;
  deleteAccount: () => Promise<void>;

  logout: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadStorageData();
  }, []);

  useEffect(() => {
    // Redirect logic based on auth state
    const inAuthGroup = segments[0] === '(auth)';
    const isRoot = !segments[0];

    
    if (!isLoading) {
      if (!token) {
        // If not logged in and not already on the welcome screen or login/signup pages
        if (!inAuthGroup && !isRoot) {
          router.replace('/');
        }
      } else {
        // If logged in and on the welcome screen or login/signup pages
        if (inAuthGroup || isRoot) {
          router.replace('/(tabs)');
        }
      }
    }

  }, [token, segments, isLoading]);


  async function loadStorageData() {
    try {
      const storedToken = await SecureStore.getItemAsync('userToken');
      const storedUser = await SecureStore.getItemAsync('userData');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to load auth data", e);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      const { idToken, localId } = data;
      
      // Fetch user profile
      const profileResponse = await fetch(`${API_URL}/profile/${localId}`);
      const profileData = await profileResponse.json();
      
      const userData: User = { 
        uid: localId, 
        email,
        displayName: profileData.display_name || profileData.displayName,
        photoURL: profileData.photo_url || profileData.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
        themePreference: profileData.theme_preference || 'auto'
      };
      
      await SecureStore.setItemAsync('userToken', idToken);
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      
      setToken(idToken);
      setUser(userData);
    } else {
      throw new Error(data.detail || 'Login failed');
    }

  };

  const signup = async (email: string, password: string, displayName: string, photoURL?: string) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        password, 
        display_name: displayName,
        photo_url: photoURL 
      }),
    });


    const data = await response.json();

    if (response.ok) {
      // After signup, we auto-login
      await login(email, password);
    } else {
      throw new Error(data.detail || 'Signup failed');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    // Construct backend data dynamically (only include fields that were provided)
    const backendData: any = {};
    if (data.displayName !== undefined) backendData.display_name = data.displayName;
    if (data.photoURL !== undefined) backendData.photo_url = data.photoURL;
    if (data.themePreference !== undefined) backendData.theme_preference = data.themePreference;
    if (data.email !== undefined) backendData.email = data.email;

    const response = await fetch(`${API_URL}/profile/${user.uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendData),
    });

    if (response.ok) {
      const updatedUser = { ...user, ...data };
      await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Update failed');
    }
  };

  const uploadProfilePhoto = async (uri: string): Promise<string> => {
    if (!user) throw new Error("User not authenticated");

    const formData = new FormData();
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('file', {
      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    const response = await fetch(`${API_URL}/profile/upload-photo/${user.uid}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const photoURL = data.photo_url;
      
      // Update local state immediately
      const updatedUser = { ...user, photoURL };
      await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return photoURL;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Upload failed');
    }
  };



  const deleteAccount = async () => {
    if (!user) return;

    const response = await fetch(`${API_URL}/profile/${user.uid}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      await logout();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Delete failed');
    }
  };

  const logout = async () => {

    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, updateProfile, uploadProfilePhoto, deleteAccount, logout }}>


      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
