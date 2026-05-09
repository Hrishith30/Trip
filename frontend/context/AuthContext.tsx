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
  visibilityPreference?: 'all' | 'friends' | 'none';
  friendCode?: string;
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
    const isWelcomePage = segments[0] === 'welcome';

    if (!isLoading) {
      if (!token) {
        if (!inAuthGroup && !isWelcomePage) {
          router.replace('/welcome');
        }
      } else {
        if (inAuthGroup || isWelcomePage) {
          router.replace('/(tabs)');
        }
      }
    }

  }, [token, segments, isLoading]);


  async function loadStorageData() {
    try {
      const storedToken = await SecureStore.getItemAsync('userToken');
      const storedUserString = await SecureStore.getItemAsync('userData');
      
      if (storedToken && storedUserString) {
        setToken(storedToken);
        const storedUser = JSON.parse(storedUserString);
        setUser(storedUser);
        
        // Background refresh to catch updates like friendCode
        fetch(`${API_URL}/profile/${storedUser.uid}`)
          .then(res => res.json())
          .then(async (profileData) => {
            if (profileData && !profileData.error) {
              const updatedUser = {
                ...storedUser,
                displayName: profileData.display_name || profileData.displayName || storedUser.displayName,
                photoURL: profileData.photo_url || profileData.photoURL || storedUser.photoURL,
                themePreference: profileData.theme_preference || storedUser.themePreference,
                visibilityPreference: profileData.visibility_preference || storedUser.visibilityPreference,
                friendCode: profileData.friend_code || storedUser.friendCode
              };
              setUser(updatedUser);
              await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
            }
          })
          .catch(err => console.log("Background sync failed", err));
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
        themePreference: profileData.theme_preference || 'auto',
        visibilityPreference: profileData.visibility_preference || 'none',
        friendCode: profileData.friend_code || 'WF-XXXX-XXXX'
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
    if (data.visibilityPreference !== undefined) backendData.visibility_preference = data.visibilityPreference;
    if (data.email !== undefined) backendData.email = data.email;

    const previousUser = user;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);

    try {
      const response = await fetch(`${API_URL}/profile/${user.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });

      if (response.ok) {
        await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
      } else {
        const errorData = await response.json();
        setUser(previousUser); // Revert on failure
        throw new Error(errorData.detail || 'Update failed');
      }
    } catch (e) {
      setUser(previousUser); // Revert on network error
      throw e;
    }
  };

  const uploadProfilePhoto = async (uri: string): Promise<string> => {
    if (!user) throw new Error("User not authenticated");

    const previousUser = user;
    // Optimistic update with local URI
    const optimisticUser = { ...user, photoURL: uri };
    setUser(optimisticUser);

    try {
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
        
        const finalUser = { ...user, photoURL };
        await SecureStore.setItemAsync('userData', JSON.stringify(finalUser));
        setUser(finalUser);
        
        return photoURL;
      } else {
        const errorData = await response.json();
        setUser(previousUser); // Revert
        throw new Error(errorData.detail || 'Upload failed');
      }
    } catch (e) {
      setUser(previousUser); // Revert
      throw e;
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
