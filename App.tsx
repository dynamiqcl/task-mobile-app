import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthContext, useAuthProvider } from './src/hooks/useAuth';
import { notificationService } from './src/services/notifications';

export default function App() {
  const authValue = useAuthProvider();

  useEffect(() => {
    // Inicializar el servicio de notificaciones
    notificationService.initialize();

    // Configurar listeners para notificaciones
    const cleanup = notificationService.setupNotificationListeners(
      (notification) => {
        console.log('Notificación recibida:', notification);
      },
      (response) => {
        console.log('Usuario tocó la notificación:', response);
        // Aquí puedes navegar a una pantalla específica basada en la notificación
      }
    );

    return cleanup;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthContext.Provider value={authValue}>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthContext.Provider>
    </GestureHandlerRootView>
  );
}
