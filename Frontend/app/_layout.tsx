import React from 'react';
import { Slot } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <Slot />
      </NotificationsProvider>
    </AuthProvider>
  );
}
