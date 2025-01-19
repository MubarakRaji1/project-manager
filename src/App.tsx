import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { Project } from './types/database';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import AuthForm from './components/AuthForm';
import { Layout, Loader2 } from 'lucide-react';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }

    setProjects(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <div className="max-w-md mx-auto pt-16 px-4">
          <div className="glass-morphism rounded-lg p-8">
            <div className="flex items-center justify-center mb-8">
              <Layout className="w-10 h-10 text-blue-600" />
              <h1 className="text-2xl font-bold ml-2 text-gray-800">Project Manager</h1>
            </div>
            <AuthForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <Toaster position="top-right" />
      <nav className="glass-morphism mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Layout className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold ml-2 text-gray-800">Project Manager</h1>
              <p className="text-xl font-semibold ml-2 text-gray-800">MADE WITH ❤️ BY MUBARAK RAJI
</p>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="glass-morphism rounded-lg">
              <ProjectList
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
                onProjectsChange={fetchProjects}
              />
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="glass-morphism rounded-lg">
              {selectedProject ? (
                <ProjectDetails
                  projectId={selectedProject}
                  onProjectUpdate={fetchProjects}
                />
              ) : (
                <div className="p-6">
                  <p className="text-gray-500 text-center">
                    Select a project or create a new one to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
