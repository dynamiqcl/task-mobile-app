import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notifications';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    // Inicializar notificaciones
    await notificationService.initialize();
    
    // Obtener el token
    const token = notificationService.getExpoPushToken();
    setPushToken(token);

    // Obtener número de notificaciones pendientes
    const count = await notificationService.getPendingNotificationCount();
    setNotificationCount(count);

    // Configurar listeners
    const cleanup = notificationService.setupNotificationListeners(
      (notification) => {
        console.log('Notificación recibida:', notification);
      },
      (response) => {
        console.log('Usuario tocó notificación:', response);
      }
    );

    return cleanup;
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const testNotification = async () => {
    await notificationService.scheduleLocalNotification(
      'Notificación de Prueba',
      'Esta es una notificación de prueba para verificar que funciona correctamente.',
      2
    );
    Alert.alert('Notificación Programada', 'Recibirás una notificación en 2 segundos');
  };

  const clearNotifications = async () => {
    await notificationService.cancelAllNotifications();
    setNotificationCount(0);
    Alert.alert('Notificaciones Limpiadas', 'Se cancelaron todas las notificaciones pendientes');
  };

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ProfileItem = ({ 
    icon, 
    label, 
    value, 
    onPress 
  }: { 
    icon: string; 
    label: string; 
    value?: string; 
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon as any} size={20} color="#6b7280" />
        <Text style={styles.profileItemLabel}>{label}</Text>
      </View>
      {value && (
        <Text style={styles.profileItemValue}>{value}</Text>
      )}
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header del perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#2563eb" />
          </View>
          <Text style={styles.userName}>{user.fullName}</Text>
          <Text style={styles.userRole}>{user.role}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Información del usuario */}
        <ProfileSection title="Información Personal">
          <ProfileItem
            icon="person-outline"
            label="Nombre de usuario"
            value={user.username}
          />
          <ProfileItem
            icon="mail-outline"
            label="Correo electrónico"
            value={user.email}
          />
          <ProfileItem
            icon="business-outline"
            label="Rol"
            value={user.role}
          />
        </ProfileSection>

        {/* Configuración de notificaciones */}
        <ProfileSection title="Notificaciones">
          <ProfileItem
            icon="notifications-outline"
            label="Notificaciones pendientes"
            value={notificationCount.toString()}
          />
          <ProfileItem
            icon="flask-outline"
            label="Probar notificación"
            onPress={testNotification}
          />
          <ProfileItem
            icon="trash-outline"
            label="Limpiar notificaciones"
            onPress={clearNotifications}
          />
        </ProfileSection>

        {/* Información técnica */}
        <ProfileSection title="Información Técnica">
          <ProfileItem
            icon="key-outline"
            label="Token de notificaciones"
            value={pushToken ? 'Configurado' : 'No disponible'}
          />
          <ProfileItem
            icon="finger-print-outline"
            label="ID de usuario"
            value={user.id.substring(0, 8) + '...'}
          />
        </ProfileSection>

        {/* Acciones */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Información de la app */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Task Manager Mobile</Text>
          <Text style={styles.appInfoText}>Versión 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    padding: 20,
    paddingBottom: 12,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  profileItemValue: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
});

export default ProfileScreen;
