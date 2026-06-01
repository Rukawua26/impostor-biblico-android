import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { darkColors, lightColors } from '../theme/colors';

interface ThemeContextType {
  colors: typeof lightColors | typeof darkColors;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    });

    // Set initial state based on system
    setIsDarkMode(Appearance.getColorScheme() === 'dark');

    return () => subscription.remove();
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
