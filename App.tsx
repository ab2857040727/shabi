
import React, { useState } from 'react';
import LandingPage from './LandingPage';
import ProjectListPage from './ProjectListPage';
import CanvasPage from './CanvasPage';

export type Page = 'landing' | 'projects' | 'canvas';
export type Theme = 'dark' | 'light';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');

  const navigateToProjects = () => setCurrentPage('projects');
  const openProject = (id: string) => {
    setActiveProjectId(id);
    setCurrentPage('canvas');
  };
  const closeProject = () => setCurrentPage('projects');
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className={`h-screen w-screen overflow-hidden font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-black text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`}>
      {currentPage === 'landing' && (
        <LandingPage onEnter={navigateToProjects} />
      )}
      {currentPage === 'projects' && (
        <ProjectListPage onOpenProject={openProject} onBack={() => setCurrentPage('landing')} />
      )}
      {currentPage === 'canvas' && (
        <CanvasPage 
          onBack={closeProject} 
          projectId={activeProjectId!} 
          theme={theme} 
          onToggleTheme={toggleTheme} 
        />
      )}
    </div>
  );
};

export default App;
