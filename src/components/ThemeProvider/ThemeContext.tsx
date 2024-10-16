import React, { ReactNode, createContext, useContext, useState } from 'react';
import { ThemeContextType, ThemeData } from './types';

export const lightTheme: ThemeData = {
  bgColor: '#ffffff',
  primaryColor: '#1890ff',
  components: {
    // 蓝紫渐变色
    primaryColor: 'linear-gradient(90deg, #1890ff, #7262fd)',
  },
  algorithm: 'light',
};

export const darkTheme: ThemeData = {
  bgColor: '#001529',
  primaryColor: '#1890ff',
  components: {
    primaryColor: 'linear-gradient(90deg, #1890ff, #7262fd)',
  },
  algorithm: 'dark',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeData>(lightTheme);
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
