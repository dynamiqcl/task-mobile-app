export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  organizationId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId: string;
  assigneeName?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  evidences?: Evidence[];
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
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
