export interface Task {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface TaskUpdate {
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
}
