import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

type ThemeMode = 'light' | 'dark' | 'auto';

type ThemeContextType = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
  colors: typeof Colors.light;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');

  const isAutoDark = () => {
    const hour = new Date().getHours();
    // 9 AM to 5 PM (17:00) is Light, otherwise Dark
    return hour < 9 || hour >= 17;
  };

  const isDarkMode = themeMode === 'auto' ? isAutoDark() : themeMode === 'dark';
  const colors = isDarkMode ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
