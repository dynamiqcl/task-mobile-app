export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  organizationId: string;
}

// Tipo para la respuesta del backend que puede tener diferentes campos
export interface BackendUser {
  id: string;
  username: string;
  email: string;
  name?: string;
  fullName?: string;
  role: string;
  organizationId?: string;
  createdAt?: string;
  department?: string;
  isActive?: boolean;
  level?: number;
  roleId?: string;
  supervisorId?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'; // Agregado 'critical'
  assigneeId: string;
  assigneeName?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  evidences?: Evidence[];
  
  // Nuevos campos del backend
  progress?: string | number; // Progreso de la tarea (0-100)
  originalAssigneeId?: string | null; // Assignee original
  problemId?: string | null; // ID del problema asociado
  estimatedHours?: number; // Horas estimadas
  requiredSkills?: string | string[]; // Habilidades requeridas (puede ser JSON string o array)
  dependencies?: string | string[]; // Dependencias (puede ser JSON string o array)
  completedAt?: string | null; // Fecha de completado
  escalated?: boolean; // Si está escalada
  escalatedAt?: string | null; // Fecha de escalación
  escalationLevel?: number; // Nivel de escalación
  escalationReason?: string | null; // Razón de escalación
  startTime?: string | null; // Hora de inicio
  startNotes?: string | null; // Notas de inicio
  completionNotes?: string | null; // Notas de completado
  difficultyRating?: number | null; // Calificación de dificultad (1-5)
  stressLevel?: number | null; // Nivel de estrés (1-5)
  actualHours?: number | null; // Horas reales trabajadas
}

export interface Evidence {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task_assigned' | 'task_overdue' | 'task_escalated' | 'system';
  isRead: boolean;
  createdAt: string;
  userId: string;
  taskId?: string;
}

export interface AuthResponse {
  user: BackendUser;
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
