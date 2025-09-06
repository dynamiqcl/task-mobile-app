import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { Task, Evidence } from '../types';
import { apiService } from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';

type TaskDetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

const TaskDetailScreen = () => {
  const route = useRoute<TaskDetailRouteProp>();
  const navigation = useNavigation();
  const { task: initialTask } = route.params;

  const [task, setTask] = useState<Task>(initialTask);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  useEffect(() => {
    loadEvidences();
  }, []);

  const loadEvidences = async () => {
    try {
      const taskEvidences = await apiService.getTaskEvidences(task.id);
      setEvidences(taskEvidences);
    } catch (error) {
      console.error('Error loading evidences:', error);
    }
  };

  const updateTaskStatus = async (newStatus: Task['status']) => {
    try {
      setIsLoading(true);
      const updatedTask = await apiService.updateTaskStatus(task.id, newStatus);
      setTask(updatedTask);
      Alert.alert('Éxito', 'Estado de la tarea actualizado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado de la tarea');
    } finally {
      setIsLoading(false);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Subir Evidencia',
      'Selecciona una opción',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cámara', onPress: openCamera },
        { text: 'Galería', onPress: openImageLibrary },
        { text: 'Archivo', onPress: openDocumentPicker },
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Se necesitan permisos de cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadEvidence(result.assets[0]);
    }
  };

  const openImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Se necesitan permisos de galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadEvidence(result.assets[0]);
    }
  };

  const openDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        uploadEvidence(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const uploadEvidence = async (file: any) => {
    try {
      setUploadingEvidence(true);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/octet-stream',
        name: file.name || file.fileName || 'evidence',
      } as any);

      const evidence = await apiService.uploadEvidence(task.id, formData);
      setEvidences(prev => [...prev, evidence]);
      
      Alert.alert('Éxito', 'Evidencia subida correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo subir la evidencia');
      console.error('Error uploading evidence:', error);
    } finally {
      setUploadingEvidence(false);
    }
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

  const canChangeStatus = (currentStatus: Task['status']) => {
    return currentStatus !== 'completed' && currentStatus !== 'escalated';
  };

  const getNextStatus = (currentStatus: Task['status']) => {
    switch (currentStatus) {
      case 'pending':
        return 'in_progress';
      case 'in_progress':
        return 'completed';
      default:
        return currentStatus;
    }
  };

  const getNextStatusText = (currentStatus: Task['status']) => {
    switch (currentStatus) {
      case 'pending':
        return 'Iniciar Tarea';
      case 'in_progress':
        return 'Completar Tarea';
      default:
        return 'No disponible';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header de la tarea */}
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
            <Text style={styles.statusText}>{getStatusText(task.status)}</Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>
        </View>

        {/* Información de la tarea */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            <Text style={styles.infoLabel}>Fecha límite:</Text>
            <Text style={styles.infoValue}>
              {new Date(task.dueDate).toLocaleDateString('es-ES')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="flag-outline" size={20} color="#6b7280" />
            <Text style={styles.infoLabel}>Prioridad:</Text>
            <Text style={styles.infoValue}>{task.priority}</Text>
          </View>

          {task.assigneeName && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#6b7280" />
              <Text style={styles.infoLabel}>Asignado a:</Text>
              <Text style={styles.infoValue}>{task.assigneeName}</Text>
            </View>
          )}
        </View>

        {/* Progreso y Métricas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progreso y Métricas</Text>
          
          {task.progress && (
            <View style={styles.infoRow}>
              <Ionicons name="bar-chart-outline" size={20} color="#059669" />
              <Text style={styles.infoLabel}>Progreso:</Text>
              <Text style={[styles.infoValue, styles.progressText]}>
                {Math.round(parseFloat(task.progress.toString()))}%
              </Text>
            </View>
          )}

          {task.estimatedHours && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#7c3aed" />
              <Text style={styles.infoLabel}>Horas estimadas:</Text>
              <Text style={styles.infoValue}>{task.estimatedHours}h</Text>
            </View>
          )}

          {task.actualHours && (
            <View style={styles.infoRow}>
              <Ionicons name="hourglass-outline" size={20} color="#ea580c" />
              <Text style={styles.infoLabel}>Horas reales:</Text>
              <Text style={styles.infoValue}>{task.actualHours}h</Text>
            </View>
          )}

          {task.difficultyRating && (
            <View style={styles.infoRow}>
              <Ionicons name="speedometer-outline" size={20} color="#dc2626" />
              <Text style={styles.infoLabel}>Dificultad:</Text>
              <Text style={styles.infoValue}>
                {task.difficultyRating}/10
              </Text>
            </View>
          )}

          {task.priority === 'critical' && (
            <View style={styles.infoRow}>
              <Ionicons name="warning-outline" size={20} color="#dc2626" />
              <Text style={styles.infoLabel}>Tipo:</Text>
              <Text style={[styles.infoValue, styles.criticalText]}>Crítica</Text>
            </View>
          )}
        </View>

        {/* Notas y Observaciones */}
        {(task.startNotes || task.completionNotes || (task as any).notes) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas y Observaciones</Text>
            
            {task.startNotes && (
              <View style={styles.noteContainer}>
                <Text style={styles.noteTitle}>Notas de inicio:</Text>
                <Text style={styles.noteText}>{task.startNotes}</Text>
              </View>
            )}

            {task.completionNotes && (
              <View style={styles.noteContainer}>
                <Text style={styles.noteTitle}>Notas de finalización:</Text>
                <Text style={styles.noteText}>{task.completionNotes}</Text>
              </View>
            )}

            {(task as any).notes && (
              <View style={styles.noteContainer}>
                <Text style={styles.noteTitle}>Notas adicionales:</Text>
                <Text style={styles.noteText}>{(task as any).notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Fechas importantes */}
        {((task as any).startedAt || (task as any).completedAt) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial de Fechas</Text>
            
            {(task as any).startedAt && (
              <View style={styles.infoRow}>
                <Ionicons name="play-circle-outline" size={20} color="#059669" />
                <Text style={styles.infoLabel}>Iniciado:</Text>
                <Text style={styles.infoValue}>
                  {new Date((task as any).startedAt).toLocaleDateString('es-ES')} - {new Date((task as any).startedAt).toLocaleTimeString('es-ES')}
                </Text>
              </View>
            )}

            {(task as any).completedAt && (
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
                <Text style={styles.infoLabel}>Completado:</Text>
                <Text style={styles.infoValue}>
                  {new Date((task as any).completedAt).toLocaleDateString('es-ES')} - {new Date((task as any).completedAt).toLocaleTimeString('es-ES')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Evidencias */}
        <View style={styles.section}>
          <View style={styles.evidenceHeader}>
            <Text style={styles.sectionTitle}>Evidencias ({evidences.length})</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={showImagePicker}
              disabled={uploadingEvidence}
            >
              {uploadingEvidence ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Ionicons name="add" size={24} color="#2563eb" />
              )}
            </TouchableOpacity>
          </View>

          {evidences.length > 0 ? (
            <View style={styles.evidenceGrid}>
              {evidences.map((evidence) => (
                <View key={evidence.id} style={styles.evidenceItem}>
                  {evidence.fileType.startsWith('image/') ? (
                    <Image source={{ uri: evidence.fileUrl }} style={styles.evidenceImage} />
                  ) : (
                    <View style={styles.fileIcon}>
                      <Ionicons name="document-outline" size={32} color="#6b7280" />
                    </View>
                  )}
                  <Text style={styles.evidenceFileName} numberOfLines={1}>
                    {evidence.fileName}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyEvidences}>
              <Ionicons name="camera-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No hay evidencias</Text>
            </View>
          )}
        </View>

        {/* Botón de acción */}
        {canChangeStatus(task.status) && (
          <TouchableOpacity
            style={[styles.actionButton, isLoading && styles.disabledButton]}
            onPress={() => updateTaskStatus(getNextStatus(task.status))}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.actionButtonText}>
                {getNextStatusText(task.status)}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  taskHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
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
    marginBottom: 16,
  },
  taskDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  progressText: {
    color: '#059669',
    fontWeight: '600',
  },
  criticalText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  noteContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  evidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  evidenceItem: {
    width: '30%',
    alignItems: 'center',
  },
  evidenceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileIcon: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  evidenceFileName: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyEvidences: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskDetailScreen;
