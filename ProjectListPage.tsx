
import React from 'react';
import { Plus, Grid, List, Clock, Folder, ChevronRight, Search } from 'lucide-react';

interface ProjectListPageProps {
  onOpenProject: (id: string) => void;
  onBack: () => void;
}

const ProjectListPage: React.FC<ProjectListPageProps> = ({ onOpenProject, onBack }) => {
  const projects = [
    { id: '1', name: '赛博朋克城市景观', modified: '2 小时前', type: '视频序列' },
    { id: '2', name: '浮空岛概念设计', modified: '昨天', type: '图像生成' },
    { id: '3', name: '超现实人像流', modified: '3 天前', type: '高级编辑' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#080808] p-8 md:p-12 overflow-y-auto">
      <div className="max-w-7xl mx-auto w-full">
        {/* 页头 */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">项目中心</h1>
            <p className="text-neutral-500 text-sm font-medium">管理您的 AI 智能创作工作流</p>
          </div>
          <button 
            onClick={() => onOpenProject(`new-${Date.now()}`)}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            新建工作流
          </button>
        </div>

        {/* 搜索与过滤 */}
        <div className="flex items-center gap-4 mb-10">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="搜索项目名称或类型..."
              className="w-full bg-neutral-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all backdrop-blur-md"
            />
          </div>
          <div className="flex items-center bg-neutral-900/50 border border-white/5 rounded-2xl p-1.5 backdrop-blur-md">
            <button className="p-2.5 bg-neutral-800 rounded-xl shadow-lg"><Grid size={18} /></button>
            <button className="p-2.5 text-neutral-600 hover:text-neutral-400 transition-colors"><List size={18} /></button>
          </div>
        </div>

        {/* 项目网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* 新建项目卡片 */}
          <button 
            onClick={() => onOpenProject(`new-${Date.now()}`)}
            className="group flex flex-col items-center justify-center aspect-square border-2 border-dashed border-white/5 rounded-[2.5rem] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all gap-5"
          >
            <div className="p-5 bg-neutral-900 rounded-3xl text-neutral-500 group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:scale-110 group-hover:rotate-90">
              <Plus size={32} strokeWidth={3} />
            </div>
            <span className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">新建项目</span>
          </button>

          {/* 现有项目 */}
          {projects.map(p => (
            <div 
              key={p.id}
              onClick={() => onOpenProject(p.id)}
              className="group relative flex flex-col bg-neutral-900/40 border border-white/5 rounded-[2.5rem] p-8 hover:border-white/10 hover:bg-neutral-900 transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="mb-10 w-14 h-14 bg-neutral-800/80 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                <Folder size={26} />
              </div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-white transition-colors">{p.name}</h3>
              <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-6">{p.type}</p>
              
              <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex items-center gap-2 text-neutral-600 font-bold">
                  <Clock size={14} />
                  <span className="text-[10px] uppercase">{p.modified}</span>
                </div>
                <div className="p-2 bg-neutral-800/50 rounded-xl text-neutral-500 group-hover:text-white group-hover:bg-blue-500 transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={onBack}
        className="fixed bottom-12 left-12 text-neutral-500 hover:text-white transition-colors text-xs font-black tracking-widest uppercase flex items-center gap-3 group"
      >
        <div className="p-2 rounded-full border border-neutral-800 group-hover:border-white transition-colors">
          <ChevronRight className="rotate-180" size={14} />
        </div>
        返回主页
      </button>
    </div>
  );
};

export default ProjectListPage;
