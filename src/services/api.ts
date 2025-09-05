import { Task, User, Notification, AuthResponse, Evidence } from '../types';

const API_BASE_URL = 'http://192.168.7.177:3000/api'; // IP local para dispositivos móviles
const USE_MOCK_API = false; // Cambiar a false cuando tengas un servidor real

// Mock data para pruebas
const mockUser: User = {
  id: '2', // ID de Ana Martínez
  username: 'ana.martinez',
  email: 'ana.martinez@example.com',
  fullName: 'Ana Martínez',
  role: 'user',
  organizationId: 'org1',
};

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Revisar documentos del proyecto Alpha',
    description: 'Revisar y validar todos los documentos técnicos del proyecto Alpha antes de la presentación del viernes.',
    status: 'pending',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Mañana
    assigneeId: '2', // Ana Martínez
    assigneeName: 'Ana Martínez',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: 'org1',
  },
  {
    id: '2',
    title: 'Completar informe mensual',
    description: 'Generar el informe mensual de ventas y enviarlo al equipo directivo.',
    status: 'in_progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 172800000).toISOString(), // En 2 días
    assigneeId: '2', // Ana Martínez
    assigneeName: 'Ana Martínez',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: 'org1',
  },
  {
    id: '3',
    title: 'Coordinar reunión con cliente',
    description: 'Organizar y coordinar la reunión trimestral con el cliente principal para revisar el progreso del proyecto.',
    status: 'pending',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 259200000).toISOString(), // En 3 días
    assigneeId: '2', // Ana Martínez
    assigneeName: 'Ana Martínez',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: 'org1',
  },
  {
    id: '4',
    title: 'Actualizar base de datos de clientes',
    description: 'Revisar y actualizar la información de contacto de todos los clientes activos.',
    status: 'completed',
    priority: 'low',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // Ayer (completada)
    assigneeId: '2', // Ana Martínez
    assigneeName: 'Ana Martínez',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: 'org1',
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nueva tarea asignada',
    message: 'Se te ha asignado una nueva tarea: Revisar documentos del proyecto Alpha',
    type: 'task_assigned',
    userId: '2',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Tarea urgente',
    message: 'La tarea "Coordinar reunión con cliente" requiere atención urgente',
    type: 'task_escalated',
    userId: '2',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // Hace 1 hora
  },
];

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async mockDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Autenticación
  async login(username: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      await this.mockDelay();
      
      // Validación simple para demo
      if ((username === 'demo' && password === 'demo') || 
          (username === 'ana.martinez' && password === 'ana123')) {
        return {
          token: 'mock_token_12345',
          user: mockUser,
        };
      } else {
        throw new Error('Credenciales inválidas');
      }
    }
    
    console.log('=== API LOGIN ===');
    console.log('Attempting login for username:', username);
    
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    console.log('Login API response:', response);
    return response;
  }

  // Tareas
  async getTasks(userId?: string): Promise<Task[]> {
    if (USE_MOCK_API) {
      await this.mockDelay();
      return mockTasks;
    }
    
    // Si se proporciona un userId, agregarlo como parámetro de consulta
    const endpoint = userId ? `/tasks?assigneeId=${userId}` : '/tasks';
    return this.request<Task[]>(endpoint);
  }

  // Obtener solo las tareas asignadas al usuario autenticado
  async getMyTasks(): Promise<Task[]> {
    if (USE_MOCK_API) {
      await this.mockDelay();
      // En mock, devolver todas las tareas ya que son del usuario demo
      return mockTasks;
    }
    
    // Intentar el endpoint específico primero
    try {
      return this.request<Task[]>('/tasks/my-tasks');
    } catch (error) {
      // Si no existe el endpoint, lanzar el error para que el componente use el fallback
      console.log('Endpoint /tasks/my-tasks no disponible, usando fallback');
      throw error;
    }
  }

  async getTaskById(id: string): Promise<Task> {
    if (USE_MOCK_API) {
      await this.mockDelay();
      const task = mockTasks.find(t => t.id === id);
      if (!task) {
        throw new Error('Tarea no encontrada');
      }
      return task;
    }
    
    return this.request<Task>(`/tasks/${id}`);
  }

  async updateTaskStatus(id: string, status: Task['status']): Promise<Task> {
    if (USE_MOCK_API) {
      await this.mockDelay();
      const taskIndex = mockTasks.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        throw new Error('Tarea no encontrada');
      }
      
      mockTasks[taskIndex] = {
        ...mockTasks[taskIndex],
        status,
        updatedAt: new Date().toISOString(),
      };
      
      return mockTasks[taskIndex];
    }
    
    return this.request<Task>(`/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Evidencias
  async uploadEvidence(taskId: string, formData: FormData): Promise<Evidence> {
    if (USE_MOCK_API) {
      await this.mockDelay(1000); // Simular upload más lento
      const mockEvidence: Evidence = {
        id: Date.now().toString(),
        taskId,
        fileName: 'evidencia.jpg',
        fileUrl: 'mock://evidence.jpg',
        fileType: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
        uploadedBy: '1',
      };
      return mockEvidence;
    }
    
    const url = `${API_BASE_URL}/tasks/${taskId}/evidence`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getTaskEvidences(taskId: string): Promise<Evidence[]> {
    if (USE_MOCK_API) {
      await this.mockDelay();
      return []; // No hay evidencias por defecto
    }
    
    return this.request<Evidence[]>(`/tasks/${taskId}/evidence`);
  }

  // Notificaciones
  async getNotifications(): Promise<Notification[]> {
    if (USE_MOCK_API) {
      await this.mockDelay();
      return mockNotifications;
    }
    
    return this.request<Notification[]>('/notifications');
  }

  async markNotificationAsRead(id: string): Promise<void> {
    if (USE_MOCK_API) {
      await this.mockDelay();
      const notification = mockNotifications.find(n => n.id === id);
      if (notification) {
        notification.isRead = true;
      }
      return;
    }
    
    return this.request<void>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Usuario
  async getCurrentUser(): Promise<User> {
    if (USE_MOCK_API) {
      await this.mockDelay();
      return mockUser;
    }
    
    return this.request<User>('/auth/me');
  }

  // Notificaciones Push
  async savePushToken(pushToken: string): Promise<void> {
    if (USE_MOCK_API) {
      await this.mockDelay();
      console.log('Mock: Token guardado:', pushToken);
      return;
    }
    
    return this.request<void>('/users/push-token', {
      method: 'POST',
      body: JSON.stringify({ pushToken }),
    });
  }
}

export const apiService = new ApiService();
