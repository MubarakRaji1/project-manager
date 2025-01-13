import React, { useState } from 'react';
import { Plus, Folder } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Project } from '../types/database';
import toast from 'react-hot-toast';

interface ProjectListProps {
  projects: Project[];
  selectedProject: string | null;
  onSelectProject: (id: string) => void;
  onProjectsChange: () => void;
}

export default function ProjectList({
  projects,
  selectedProject,
  onSelectProject,
  onProjectsChange,
}: ProjectListProps) {
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.from('projects').insert([
        {
          name: newProjectName,
          description: newProjectDescription,
          user_id: user.id
        },
      ]).select();

      if (error) throw error;

      toast.success('Project created successfully!');
      setShowNewProject(false);
      setNewProjectName('');
      setNewProjectDescription('');
      onProjectsChange();
      
      if (data?.[0]) {
        onSelectProject(data[0].id);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Projects</h2>
          <button
            onClick={() => setShowNewProject(true)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <Plus className="w-5 h-5 text-blue-500" />
          </button>
        </div>
      </div>

      {showNewProject && (
        <form onSubmit={handleCreateProject} className="p-4 border-b">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowNewProject(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="divide-y">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 ${
              selectedProject === project.id ? 'bg-blue-50' : ''
            }`}
          >
            <Folder
              className={`w-5 h-5 ${
                selectedProject === project.id ? 'text-blue-500' : 'text-gray-400'
              }`}
            />
            <div className="flex-1 text-left">
              <h3 className="text-sm font-medium text-gray-900">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-xs text-gray-500 truncate">
                  {project.description}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}