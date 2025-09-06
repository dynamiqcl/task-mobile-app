import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Task } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation/AppNavigator';

type TaskListNavigationProp = StackNavigationProp<RootStackParamList>;

const TaskListScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<TaskListNavigationProp>();
  const { user, logout } = useAuth();

  const handleReLogin = async () => {
    Alert.alert(
      'Sesión Expirada',
      'Tu sesión ha expirado. ¿Deseas volver a iniciar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí', 
          onPress: async () => {
            await logout();
            // La navegación se manejará automáticamente por el estado de autenticación
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) {
      console.log('Usuario no disponible, no se pueden cargar tareas');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Cargando tareas para usuario:', user.id, user.username);
      
      // Usar directamente getMyTasks que ahora llama a /tasks
      const allTasks = await apiService.getMyTasks();
      console.log('Total de tareas obtenidas:', allTasks.length);
      
      // Filtrar las tareas para mostrar solo las asignadas al usuario actual
      const userTasks = allTasks.filter(task => {
        const isAssigned = task.assigneeId === user.id;
        console.log(`Tarea "${task.title}": assigneeId=${task.assigneeId}, userId=${user.id}, asignada=${isAssigned}`);
        return isAssigned;
      });
      
      console.log('Tareas filtradas para el usuario:', userTasks.length);
      setTasks(userTasks);
    } catch (error: any) {
      // Verificar si es un error de token expirado
      if (error.message && error.message.includes('Token has expired')) {
        console.log('🔴 Token expirado detectado en TaskListScreen');
        handleReLogin();
        return;
      }
      
      Alert.alert('Error', 'No se pudieron cargar las tareas');
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in_progress':
        return '#3b82f6';
      case 'overdue':
        return '#ef4444';
      case 'escalated':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in_progress':
        return 'En Progreso';
      case 'overdue':
        return 'Vencida';
      case 'escalated':
        return 'Escalada';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
      case 'critical':
        return 'alert-circle';
      case 'high':
        return 'arrow-up-circle';
      case 'medium':
        return 'remove-circle';
      case 'low':
        return 'arrow-down-circle';
      default:
        return 'help-circle';
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => navigation.navigate('TaskDetail', { task: item })}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Ionicons
            name={getPriorityIcon(item.priority)}
            size={20}
            color={getStatusColor(item.status)}
          />
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.taskDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.taskFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.dateText}>
            {new Date(item.dueDate).toLocaleDateString('es-ES')}
          </Text>
        </View>
        
        <View style={styles.priorityContainer}>
          <Ionicons name={getPriorityIcon(item.priority)} size={16} color="#6b7280" />
          <Text style={styles.priorityText}>
            {item.priority === 'urgent' ? 'Urgente' :
             item.priority === 'high' ? 'Alta' :
             item.priority === 'critical' ? 'Crítica' :
             item.priority === 'medium' ? 'Media' : 'Baja'}
          </Text>
        </View>
        
        {/* Mostrar progreso si está disponible */}
        {item.progress && parseFloat(item.progress.toString()) > 0 && (
          <View style={styles.progressContainer}>
            <Ionicons name="bar-chart-outline" size={16} color="#6b7280" />
            <Text style={styles.progressText}>
              {Math.round(parseFloat(item.progress.toString()))}%
            </Text>
          </View>
        )}

        {/* Mostrar horas estimadas */}
        {item.estimatedHours && (
          <View style={styles.hoursContainer}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.hoursText}>
              {item.estimatedHours}h
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Cargando tareas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mis Tareas</Text>
          {user && (
            <Text style={styles.headerSubtitle}>
              Bienvenido, {user.fullName || user.username} (ID: {user.id})
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => {
              console.log('=== DEBUG INFO ===');
              console.log('Usuario actual:', user);
              console.log('Tareas actuales:', tasks);
              console.log('Cantidad de tareas:', tasks.length);
              Alert.alert(
                'Info de Debug', 
                `Usuario: ${user?.username}\nID: ${user?.id}\nTareas: ${tasks.length}`
              );
            }}
            style={styles.debugButton}
          >
            <Ionicons name="bug" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No tienes tareas asignadas</Text>
          </View>
        }
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debugButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  taskHeader: {
    marginBottom: 8,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    color: '#6b7280',
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assigneeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hoursText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
});

export default TaskListScreen;
