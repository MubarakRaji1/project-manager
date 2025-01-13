export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  user_id: string;
  status: 'active' | 'completed' | 'archived';
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  project_id: string;
  assigned_to: string | null;
  created_at: string;
  completed_at: string | null;
}