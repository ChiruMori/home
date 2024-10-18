import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ThemeContextType, ThemeData } from './types';
import storage from '@/helper/localHolder';

export const lightTheme: ThemeData = {
  bgBase: '#ffffff',
  textBase: '#000000',
  link: '#1677ff',
  error: '#ff4d4f',
  warning: '#faad14',
  success: '#52c41a',
  info: '#1890ff',
  primary: '#1677ff',
  algorithm: 'light',
};

export const darkTheme: ThemeData = {
  bgBase: '#000000',
  textBase: '#ffffff',
  link: '#1677ff',
  error: '#ff4d4f',
  warning: '#faad14',
  success: '#52c41a',
  info: '#1890ff',
  primary: '#1677ff',
  algorithm: 'dark',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeData>(darkTheme);

  useEffect(() => {
    async function getTheme() {
      const storagedTheme = (await storage.getAsync('theme')) as ThemeData;
      if (storagedTheme) {
        setTheme(storagedTheme);
      }
    }
    getTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
