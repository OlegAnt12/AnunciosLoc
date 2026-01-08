import { Colors, Typography, Spacing, Shadows } from './common';

// Sistema de temas avançado
export const lightTheme = {
  ...Colors.light,
  primary: Colors.primary,
  secondary: Colors.secondary,
  accent: Colors.accent,
  
  // Componentes específicos
  button: {
    primary: Colors.primary,
    secondary: 'transparent',
    text: '#FFFFFF',
    textSecondary: Colors.primary,
  },
  
  // Estados
  states: {
    hover: '#F8F9FA',
    pressed: '#E9ECEF',
    disabled: '#F8F9FA',
  },
  
  // Gradientes
  gradients: {
    primary: ['#FF6B35', '#FF8E53'],
    secondary: ['#6366F1', '#8B5CF6'],
    background: ['#FFFFFF', '#F8F9FA'],
  },
  
  // Sistema de design
  typography: Typography,
  spacing: Spacing,
  shadows: Shadows,
};

export const darkTheme = {
  ...Colors.dark,
  primary: Colors.primary,
  secondary: Colors.secondary,
  accent: Colors.accent,
  
  // Componentes específicos
  button: {
    primary: Colors.primary,
    secondary: 'transparent',
    text: '#FFFFFF',
    textSecondary: Colors.primary,
  },
  
  // Estados
  states: {
    hover: '#2A2A2A',
    pressed: '#333333',
    disabled: '#1A1A1A',
  },
  
  // Gradientes
  gradients: {
    primary: ['#FF6B35', '#FF8E53'],
    secondary: ['#6366F1', '#8B5CF6'],
    background: ['#0A0A0A', '#1A1A1A'],
  },
  
  // Sistema de design
  typography: Typography,
  spacing: Spacing,
  shadows: Shadows,
};

// Hook para gerenciamento de tema (para usar em componentes)
export const useTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};

// Função para criar estilos dinâmicos baseados no tema
export const createThemeStyles = (isDarkMode) => {
  const theme = useTheme(isDarkMode);
  
  return {
    theme,
    styles: {
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      text: {
        color: theme.text,
      },
      textSecondary: {
        color: theme.textSecondary,
      },
      card: {
        backgroundColor: theme.card,
        borderRadius: 16,
        padding: theme.spacing.lg,
        ...theme.shadows.medium,
      },
    },
  };
};

// Cores semânticas para diferentes tipos de conteúdo
export const semanticColors = {
  success: {
    light: '#10B981',
    dark: '#10B981',
  },
  warning: {
    light: '#F59E0B',
    dark: '#F59E0B',
  },
  error: {
    light: '#EF4444',
    dark: '#EF4444',
  },
  info: {
    light: '#3B82F6',
    dark: '#3B82F6',
  },
};

// Utilitários para cores
export const ColorUtils = {
  // Escurecer cor
  darken: (color, percent) => {
    // Implementação simplificada - em produção use uma lib como polished
    return color + 'DD'; // Adiciona alpha para simular escurecimento
  },
  
  // Clarear cor
  lighten: (color, percent) => {
    return color + '33'; // Adiciona alpha para simular clareamento
  },
  
  // Verificar contraste
  getContrastColor: (backgroundColor) => {
    // Lógica simplificada para determinar cor do texto baseada no fundo
    return backgroundColor === Colors.dark.background ? '#FFFFFF' : '#000000';
  },
};