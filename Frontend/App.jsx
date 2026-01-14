import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity, Text, Alert, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { NotificationsProvider, useNotifications } from './src/contexts/NotificationsContext';
import NotificationsScreen from './src/components/Main/NotificationsScreen';

import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens (SEM api.js por agora)
import LoginScreen from './src/components/Auth/LoginScreen';
import RegisterScreen from './src/components/Auth/RegisterScreen';
import HomeScreen from './src/components/Main/HomeScreen';
import LocationsScreen from './src/components/Main/LocationsScreen';
import ProfileScreen from './src/components/Main/ProfileScreen';
import MessagesScreen from './src/components/Main/MessagesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom theme simples
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B35',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#2D3436',
    border: '#DFE6E9',
    notification: '#FF6B35',
  },
};

function MainTabs({ setShowCreateAd, isDarkMode }) {
  const { user, logout } = useAuth();
  const { count } = useNotifications();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem a certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: logout
        },
      ]
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#636E72',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopColor: '#DFE6E9',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#FFF',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: '#2D3436',
          fontWeight: 'bold',
        },
        headerTintColor: '#2D3436',
      }}
    >
      <Tab.Screen 
        name="Início" 
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      >
        {(props) => <HomeScreen {...props} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Locais" 
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "map-marker" : "map-marker-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      >
        {(props) => <LocationsScreen {...props} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Mensagens" 
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "message" : "message-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      >
        {(props) => <MessagesScreen {...props} />}
      </Tab.Screen>

      <Tab.Screen
        name="Notificações"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'bell' : 'bell-outline'} size={size} color={color} />
          ),
          tabBarBadge: count > 0 ? count : undefined,
        }}
      >
        {(props) => <NotificationsScreen {...props} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Perfil" 
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "account" : "account-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      >
        {(props) => <ProfileScreen {...props} onLogout={handleLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AppNavigator({ isDarkMode, toggleTheme }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: CustomLightTheme.colors.background,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <StatusBar style="auto" />
        <Text style={{ color: CustomLightTheme.colors.text }}>A carregar...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={CustomLightTheme}>
      {isAuthenticated ? (
        <MainTabs isDarkMode={isDarkMode} />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} toggleTheme={toggleTheme} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {(props) => <RegisterScreen {...props} toggleTheme={toggleTheme} />}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const themePreference = await AsyncStorage.getItem('anunciosloc-theme');
      if (themePreference) {
        setIsDarkMode(themePreference === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem('anunciosloc-theme', newTheme ? 'dark' : 'light');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NotificationsProvider>
          <View style={{ flex: 1, backgroundColor: CustomLightTheme.colors.background }}>
            <StatusBar style="auto" />
            <AppNavigator 
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          </View>
        </NotificationsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}