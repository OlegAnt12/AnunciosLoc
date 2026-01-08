import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Sistema de cores dinâmico
export const Colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8E53',
  primaryDark: '#E55A2B',
  secondary: '#6366F1',
  accent: '#FF4757',
  
  // Light theme
  light: {
    background: '#FFFFFF',
    card: '#F8F9FA',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E5E5E5',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    tabBar: '#FFFFFF',
  },
  
  // Dark theme
  dark: {
    background: '#0A0A0A',
    card: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#333333',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    tabBar: '#1A1A1A',
  }
};

// Sistema de tipografia
export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
  }
};

// Sistema de espaçamento
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Sistema de sombras
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Função para criar estilos dinâmicos
export const createStyles = (isDarkMode = false) => {
  const colors = isDarkMode ? Colors.dark : Colors.light;
  
  return StyleSheet.create({
    // Layout
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    screen: {
      flex: 1,
      padding: Spacing.md,
    },
    
    // Cards
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...Shadows.medium,
    },
    cardElevated: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      ...Shadows.large,
    },
    
    // Headers
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      ...Typography.h1,
      color: colors.text,
    },
    subtitle: {
      ...Typography.caption,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
    },
    
    // Botões
    button: {
      backgroundColor: Colors.primary,
      padding: Spacing.md,
      borderRadius: 12,
      alignItems: 'center',
      marginVertical: Spacing.sm,
      ...Shadows.small,
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      padding: Spacing.md,
      borderRadius: 12,
      alignItems: 'center',
      marginVertical: Spacing.sm,
      borderWidth: 2,
      borderColor: Colors.primary,
    },
    buttonText: {
      color: '#FFFFFF',
      ...Typography.body,
      fontWeight: '600',
    },
    buttonTextSecondary: {
      color: Colors.primary,
      ...Typography.body,
      fontWeight: '600',
    },
    
    // Inputs
    input: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      ...Typography.body,
      backgroundColor: colors.card,
      color: colors.text,
    },
    inputFocused: {
      borderColor: Colors.primary,
      backgroundColor: colors.background,
    },
    
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: Spacing.lg,
      margin: Spacing.lg,
      width: width - Spacing.xl,
      maxHeight: height * 0.8,
      ...Shadows.large,
    },
    
    // List Items
    listItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listItemCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.md,
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: Spacing.sm,
      ...Shadows.small,
    },
    
    // Badges
    badge: {
      backgroundColor: Colors.primary,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: 16,
    },
    badgeSecondary: {
      backgroundColor: colors.border,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: 16,
    },
    badgeText: {
      color: '#FFFFFF',
      ...Typography.small,
      fontWeight: '600',
    },
    badgeTextSecondary: {
      color: colors.text,
      ...Typography.small,
      fontWeight: '600',
    },
    
    // Tab Bar
    tabBar: {
      backgroundColor: colors.tabBar,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      height: Platform.OS === 'ios' ? 85 : 70,
      paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
      ...Shadows.medium,
    },
    
    // Floating Action Button
    createAdButton: {
      backgroundColor: Colors.primary,
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Platform.OS === 'ios' ? 30 : 20,
      ...Shadows.large,
    },
    
    // Loading States
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      ...Typography.body,
      color: colors.textSecondary,
      marginTop: Spacing.md,
    },
    
    // Empty States
    emptyState: {
      alignItems: 'center',
      padding: Spacing.xxl,
    },
    emptyStateText: {
      ...Typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.md,
    },
    emptyStateSubtext: {
      ...Typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.xs,
    },
    
    // Grid System
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    spaceBetween: {
      justifyContent: 'space-between',
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    // Utility Classes
    textCenter: {
      textAlign: 'center',
    },
    textBold: {
      fontWeight: 'bold',
    },
    textMuted: {
      color: colors.textSecondary,
    },
    
    // Animation Helpers
    fadeIn: {
      opacity: 0,
    },
    slideUp: {
      transform: [{ translateY: 50 }],
    },
  });
};

// Exportar estilos padrão (light mode)
export const styles = createStyles(false);