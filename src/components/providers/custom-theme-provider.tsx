'use client'

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { hexToHslString, getBrightness } from '@/lib/utils';

type CustomTheme = {
  background: string;
  primary: string;
  accent: string;
};

const defaultTheme: CustomTheme = {
  background: '#111613', // Charcoal
  primary: '#bdea57',    // Light Green
  accent: '#eae7e6',     // Beige
};

type CustomThemeContextType = {
  theme: CustomTheme;
  setTheme: (newTheme: Partial<CustomTheme>) => void;
  resetToDefaults: () => void;
};

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

export function CustomThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<CustomTheme>(defaultTheme);

  // Load theme from localStorage on initial mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('custom-theme');
    if (savedTheme) {
      setThemeState(JSON.parse(savedTheme));
    }
  }, []);

  // Apply theme to CSS variables and save to localStorage whenever it changes
  useEffect(() => {
    // Background
    document.documentElement.style.setProperty('--background', hexToHslString(theme.background));
    
    // Primary and its foreground
    const primaryHsl = hexToHslString(theme.primary);
    document.documentElement.style.setProperty('--primary', primaryHsl);
    const primaryBrightness = getBrightness(theme.primary);
    const primaryForegroundHsl = primaryBrightness < 128 ? '0 0% 98%' : '0 0% 3.9%';
    document.documentElement.style.setProperty('--primary-foreground', primaryForegroundHsl);

    // Ring (often uses primary color)
    document.documentElement.style.setProperty('--ring', primaryHsl);
    
    // Accent
    document.documentElement.style.setProperty('--accent', hexToHslString(theme.accent));

    localStorage.setItem('custom-theme', JSON.stringify(theme));
  }, [theme]);

  const setTheme = (newTheme: Partial<CustomTheme>) => {
    setThemeState(prevTheme => ({ ...prevTheme, ...newTheme }));
  };
  
  const resetToDefaults = () => {
    setThemeState(defaultTheme);
  }

  return (
    <CustomThemeContext.Provider value={{ theme, setTheme, resetToDefaults }}>
      {children}
    </CustomThemeContext.Provider>
  );
}

export const useCustomTheme = () => {
  const context = useContext(CustomThemeContext);
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
};
