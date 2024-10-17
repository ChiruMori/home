import React, { ReactNode, createContext, useContext, useState } from 'react';
import { ThemeContextType, ThemeData } from './types';

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
  // TODO: 从 storage 中读取主题配置

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
