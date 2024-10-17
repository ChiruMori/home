export interface ThemeContextType {
  theme: ThemeData;
  setTheme: (theme: ThemeData) => void;
}

export interface ThemeData {
  bgBase: string;
  textBase: string;
  link: string;
  error: string;
  warning: string;
  success: string;
  primary: string;
  info: string;

  algorithm: 'dark' | 'light';
}

export interface ThemeModalProps {
  open: boolean;
  onClose: () => void;
}
