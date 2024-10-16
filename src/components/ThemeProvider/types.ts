export interface ThemeContextType {
  theme: ThemeData;
  setTheme: (theme: ThemeData) => void;
}

export interface ThemeData {
  bgColor: string;
  primaryColor: string;

  components: {
    primaryColor: string;
  };

  algorithm: 'dark' | 'light';
}

export interface ThemeModalProps {
  open: boolean;
  onClose: () => void;
}
