import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { apiService } from './api';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize() {
    if (!Device.isDevice) {
      console.log('Las notificaciones push solo funcionan en dispositivos físicos');
      return;
    }

    // Verificar si estamos en Expo Go (que no soporta notificaciones push completamente)
    if (Constants.appOwnership === 'expo') {
      console.log('Notificaciones push no disponibles en Expo Go');
      return;
    }

    // Solicitar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('No se obtuvieron permisos para notificaciones');
      return;
    }

    // Obtener el token de Expo Push
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      
      this.expoPushToken = token.data;
      console.log('Expo Push Token:', this.expoPushToken);
      
      // Enviar el token al backend para guardarlo
      await this.savePushTokenToBackend(this.expoPushToken);
      
    } catch (error) {
      console.error('Error obteniendo el token de notificaciones:', error);
    }
  }

  private async savePushTokenToBackend(token: string) {
    try {
      await apiService.savePushToken(token);
      console.log('Token de notificaciones enviado al backend');
    } catch (error) {
      console.error('Error enviando token al backend:', error);
    }

    // Configurar el canal de notificaciones para Android
    if (Device.osName === 'Android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  getExpoPushToken() {
    return this.expoPushToken;
  }

  // Programar una notificación local
  async scheduleLocalNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null, // Mostrar inmediatamente
    });
  }

  // Configurar listeners para notificaciones
  setupNotificationListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationResponse: (response: Notifications.NotificationResponse) => void
  ) {
    // Listener para cuando se recibe una notificación
    const notificationListener = Notifications.addNotificationReceivedListener(
      onNotificationReceived
    );

    // Listener para cuando el usuario toca una notificación
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      onNotificationResponse
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }

  // Cancelar todas las notificaciones programadas
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Obtener el número de notificaciones pendientes
  async getPendingNotificationCount(): Promise<number> {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications.length;
  }
}

export const notificationService = new NotificationService();
