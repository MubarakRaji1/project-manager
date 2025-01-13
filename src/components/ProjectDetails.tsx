import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Project, Task } from '../types/database';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProjectDetailsProps {
  projectId: string;
  onProjectUpdate: () => void;
}

export default function ProjectDetails({
  projectId,
  onProjectUpdate,
}: ProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  });

  useEffect(() => {
    fetchProjectDetails();
    fetchTasks();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    setProject(data);
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(error.message);
      return;
    }

    setTasks(data);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('tasks').insert([
        {
          ...newTask,
          project_id: projectId,
        },
      ]);

      if (error) throw error;

      toast.success('Task created successfully!');
      setShowNewTask(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
      });
      fetchTasks();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', taskId);

      if (error) throw error;

      fetchTasks();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);

      if (error) throw error;

      toast.success('Task deleted successfully!');
      fetchTasks();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!project) return null;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">{project.name}</h2>
        {project.description && (
          <p className="mt-2 text-gray-600">{project.description}</p>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Tasks</h3>
          <button
            onClick={() => setShowNewTask(true)}
            className="flex items-center space-x-2 text-sm text-blue-500 hover:text-blue-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {showNewTask && (
          <form onSubmit={handleCreateTask} className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, due_date: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowNewTask(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Create Task
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start space-x-4 p-4 border rounded-lg"
            >
              <button
                onClick={() =>
                  handleTaskStatusChange(
                    task.id,
                    task.status === 'completed' ? 'todo' : 'completed'
                  )
                }
                className="mt-1"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
              </button>
              <div className="flex-1">
                <h4
                  className={`text-sm font-medium ${
                    task.status === 'completed'
                      ? 'text-gray-500 line-through'
                      : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </h4>
                {task.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {task.description}
                  </p>
                )}
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  {task.due_date && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(task.due_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {task.completed_at && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        Completed{' '}
                        {format(new Date(task.completed_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {task.priority}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}