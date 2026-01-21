
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Camera, 
  Edit3, 
  Cpu, 
  MousePointer2, 
  Hand, 
  Undo2, 
  Redo2, 
  LayoutGrid, 
  Maximize2, 
  Sun,
  Moon,
  Loader2,
  Trash2,
  Upload,
  ArrowRight,
  Zap,
  ChevronLeft,
  Settings2,
  Download,
  Share2
} from 'lucide-react';
import { NodeType, NodeData, Point } from './types';
import { generateImage, generateVideo } from './services/geminiService';
import { Theme } from './App';

interface NodeInstance {
  id: string;
  type: NodeType;
  position: Point;
  data: NodeData;
}

interface EdgeInstance {
  id: string;
  from: string;
  to: string;
}

interface CanvasPageProps {
  onBack: () => void;
  projectId: string;
  theme: Theme;
  onToggleTheme: () => void;
}

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; subLabel: string; onClick: () => void; accent: string; theme: Theme }> = ({ icon, label, subLabel, onClick, accent, theme }) => (
  <button 
    onClick={onClick}
    className={`flex items-center w-full p-3.5 gap-4 transition-all rounded-2xl group text-left border border-transparent 
      ${theme === 'dark' ? 'hover:bg-white/5 hover:border-white/5' : 'hover:bg-black/5 hover:border-black/5'}`}
  >
    <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 shadow-inner
      ${theme === 'dark' ? 'bg-neutral-900' : 'bg-white border border-black/5'} ${accent}`}>
      {icon}
    </div>
    <div>
      <div className={`text-sm font-bold ${theme === 'dark' ? 'text-neutral-200 group-hover:text-white' : 'text-neutral-700 group-hover:text-black'}`}>{label}</div>
      <div className="text-[9px] text-neutral-500 font-black tracking-widest uppercase">{subLabel}</div>
    </div>
  </button>
);

const CanvasPage: React.FC<CanvasPageProps> = ({ onBack, projectId, theme, onToggleTheme }) => {
  const [nodes, setNodes] = useState<NodeInstance[]>([]);
  const [edges, setEdges] = useState<EdgeInstance[]>([]);
  const [viewOffset, setViewOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState<'select' | 'pan'>('select');
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 用于高性能操作的引用
  const nodesRef = useRef<NodeInstance[]>([]);
  const dragRef = useRef({
    type: 'none' as 'node' | 'pan' | 'none',
    targetId: null as string | null,
    startX: 0,
    startY: 0,
    startPos: { x: 0, y: 0 }
  });
  const rafId = useRef<number | null>(null);

  const NODE_WIDTH = 320;
  const NODE_HEIGHT = 440; 
  const PORT_Y = NODE_HEIGHT / 2; // 句柄垂直居中

  useEffect(() => {
    const initialNodes = [
      {
        id: 'node-1',
        type: NodeType.IMAGE_GEN,
        position: { x: 100, y: 150 },
        data: { label: '图像生成', type: NodeType.IMAGE_GEN, params: { prompt: '赛博朋克风格的雨夜街头' }, loading: false }
      },
      {
        id: 'node-2',
        type: NodeType.VIDEO_GEN,
        position: { x: 600, y: 150 },
        data: { label: '视频合成', type: NodeType.VIDEO_GEN, params: { prompt: '镜头缓慢推近' }, loading: false }
      }
    ];
    setNodes(initialNodes);
    nodesRef.current = initialNodes;
  }, []);

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);

  const addNode = (type: NodeType) => {
    const id = `node-${Date.now()}`;
    const labels: Record<NodeType, string> = {
      [NodeType.MEDIA]: '媒体资源',
      [NodeType.IMAGE_GEN]: '图像生成',
      [NodeType.CAMERA]: '虚拟相机',
      [NodeType.VIDEO_GEN]: '视频合成',
      [NodeType.IMAGE_EDIT]: '画面微调',
      [NodeType.ANALYZE]: '智能分析',
    };

    const newNode: NodeInstance = {
      id,
      type,
      position: { 
        x: (200 - viewOffset.x) / zoom, 
        y: (200 - viewOffset.y) / zoom 
      },
      data: {
        label: labels[type],
        type,
        params: { prompt: '' },
        loading: false
      }
    };
    setNodes(prev => [...prev, newNode]);
  };

  const handleGenerate = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    if (node.type === NodeType.MEDIA) { fileInputRef.current?.click(); return; }
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, loading: true } } : n));
    try {
      if (node.type === NodeType.IMAGE_GEN) {
        const url = await generateImage(node.data.params?.prompt || "Masterpiece");
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, output: url, loading: false } } : n));
      } else if (node.type === NodeType.VIDEO_GEN) {
        const edge = edges.find(e => e.to === nodeId);
        const sourceNode = nodes.find(n => n.id === edge?.from);
        const videoUrl = await generateVideo(node.data.params?.prompt || "Dynamic", sourceNode?.data.output);
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, output: videoUrl, loading: false } } : n));
      } else {
        await new Promise(r => setTimeout(r, 1000));
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, loading: false } } : n));
      }
    } catch (err) {
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, loading: false } } : n));
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (connectingFromId) {
        setMousePos({ x: currentX, y: currentY });
      }

      if (dragRef.current.type === 'none') return;

      if (rafId.current) cancelAnimationFrame(rafId.current);
      
      rafId.current = requestAnimationFrame(() => {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        if (dragRef.current.type === 'pan') {
          setViewOffset({
            x: dragRef.current.startPos.x + dx,
            y: dragRef.current.startPos.y + dy
          });
        } else if (dragRef.current.type === 'node' && dragRef.current.targetId) {
          const scaledDx = dx / zoom;
          const scaledDy = dy / zoom;
          const targetId = dragRef.current.targetId;
          
          setNodes(prev => prev.map(n => 
            n.id === targetId 
              ? { ...n, position: { x: dragRef.current.startPos.x + scaledDx, y: dragRef.current.startPos.y + scaledDy } }
              : n
          ));
        }
      });
    };

    const onMouseUp = () => {
      dragRef.current.type = 'none';
      dragRef.current.targetId = null;
      setConnectingFromId(null); 
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [connectingFromId, zoom]);

  const onNodeDown = (e: React.MouseEvent, node: NodeInstance) => {
    // 关键：阻止默认行为以防文字选择
    e.preventDefault();
    e.stopPropagation();
    
    if (activeTool === 'pan' || e.button === 1) return;
    
    dragRef.current = {
      type: 'node',
      targetId: node.id,
      startX: e.clientX,
      startY: e.clientY,
      startPos: { ...node.position }
    };
  };

  const onCanvasDown = (e: React.MouseEvent) => {
    if (activeTool === 'pan' || e.button === 1) {
      // 阻止默认行为以防背景文字选择
      e.preventDefault();
      dragRef.current = {
        type: 'pan',
        targetId: null,
        startX: e.clientX,
        startY: e.clientY,
        startPos: { ...viewOffset }
      };
    }
  };

  const getBezierCurve = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1) * 0.45;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  const getPortPos = (nodeId: string, isOutput: boolean) => {
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return {
      x: (isOutput ? node.position.x + NODE_WIDTH : node.position.x) * zoom + viewOffset.x,
      y: (node.position.y + PORT_Y) * zoom + viewOffset.y
    };
  };

  const handleConnect = (e: React.MouseEvent, toId: string) => {
    e.stopPropagation();
    if (connectingFromId && connectingFromId !== toId) {
      setEdges(prev => {
        if (prev.some(edge => edge.from === connectingFromId && edge.to === toId)) return prev;
        return [...prev.filter(edge => edge.to !== toId), { id: `e-${Date.now()}`, from: connectingFromId, to: toId }];
      });
    }
    setConnectingFromId(null);
  };

  const getIconForType = (type: NodeType) => {
    switch(type) {
      case NodeType.MEDIA: return <Upload size={18} />;
      case NodeType.IMAGE_GEN: return <ImageIcon size={18} />;
      case NodeType.CAMERA: return <Camera size={18} />;
      case NodeType.VIDEO_GEN: return <Video size={18} />;
      case NodeType.IMAGE_EDIT: return <Edit3 size={18} />;
      case NodeType.ANALYZE: return <Cpu size={18} />;
    }
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden transition-colors duration-500 select-none
      ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-[#f0f1f5] text-[#1c1c1e]'}`}>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />

      {/* 顶部栏 */}
      <header className={`h-16 px-8 border-b flex items-center justify-between z-50 backdrop-blur-3xl transition-all
        ${theme === 'dark' ? 'bg-[#050505]/90 border-white/5' : 'bg-white/90 border-black/5 shadow-sm'}`}>
        <div className="flex items-center gap-8">
          <button onClick={onBack} className={`p-2.5 rounded-2xl transition-all hover:scale-110 
            ${theme === 'dark' ? 'hover:bg-white/10 text-neutral-400 hover:text-white' : 'hover:bg-black/5 text-neutral-500 hover:text-black'}`}>
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20`}>
              <Zap size={22} className="text-white fill-white" />
            </div>
            <div>
              <span className={`font-black tracking-tighter text-2xl uppercase italic block leading-none 
                ${theme === 'dark' ? 'text-white' : 'text-black'}`}>笨蛋泽泽</span>
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{projectId}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button className={`px-8 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 shadow-xl
            ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>
            发布导出
          </button>
          <button className={`p-2.5 rounded-xl transition-colors
            ${theme === 'dark' ? 'hover:bg-white/10 text-neutral-400' : 'hover:bg-black/5 text-neutral-500'}`}><Share2 size={18}/></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 */}
        <aside className={`w-72 border-r flex flex-col z-40 transition-all 
          ${theme === 'dark' ? 'bg-[#080808] border-white/5 shadow-2xl' : 'bg-white border-black/5 shadow-md'}`}>
          <div className="p-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-[10px] font-black tracking-[0.4em] text-neutral-500 uppercase">构架组件</h2>
              <Settings2 size={16} className="text-neutral-600" />
            </div>
            
            <div className="space-y-3.5">
              <SidebarItem theme={theme} icon={<Upload />} label="媒体资源" subLabel="上传载入" accent="text-blue-500" onClick={() => addNode(NodeType.MEDIA)} />
              <SidebarItem theme={theme} icon={<ImageIcon />} label="图像生成" subLabel="Gemini 3" accent="text-purple-500" onClick={() => addNode(NodeType.IMAGE_GEN)} />
              <SidebarItem theme={theme} icon={<Camera />} label="虚拟相机" subLabel="3D 参数" accent="text-cyan-500" onClick={() => addNode(NodeType.CAMERA)} />
              <SidebarItem theme={theme} icon={<Video />} label="视频合成" subLabel="Veo 3.1" accent="text-rose-500" onClick={() => addNode(NodeType.VIDEO_GEN)} />
              <SidebarItem theme={theme} icon={<Edit3 />} label="画面微调" subLabel="蒙版编辑" accent="text-emerald-500" onClick={() => addNode(NodeType.IMAGE_EDIT)} />
              <SidebarItem theme={theme} icon={<Cpu />} label="智能分析" subLabel="理解模型" accent="text-amber-500" onClick={() => addNode(NodeType.ANALYZE)} />
            </div>
          </div>
          <div className={`mt-auto p-8 border-t ${theme === 'dark' ? 'border-white/5 bg-neutral-900/10' : 'border-black/5 bg-black/[0.02]'}`}>
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest leading-relaxed">
              拖拽节点句柄构建逻辑链条。系统已连接 GPU 算力集群。
            </p>
          </div>
        </aside>

        {/* 画布区域 */}
        <main 
          ref={containerRef}
          className={`flex-1 relative overflow-hidden cursor-default transition-all duration-500 select-none
            ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#ecedf1]'}`}
          onMouseDown={onCanvasDown}
          onWheel={(e) => setZoom(prev => Math.min(Math.max(prev + (e.deltaY * -0.001), 0.15), 2.5))}
        >
          {/* 背景网格 */}
          <div className={`absolute inset-0 pointer-events-none transition-opacity
            ${theme === 'dark' ? 'opacity-[0.08]' : 'opacity-[0.05]'}`} 
            style={{ 
              backgroundImage: theme === 'dark' ? `radial-gradient(#fff 1.5px, transparent 1.5px)` : `radial-gradient(#000 1.5px, transparent 1.5px)`, 
              backgroundSize: `${48 * zoom}px ${48 * zoom}px`,
              backgroundPosition: `${viewOffset.x}px ${viewOffset.y}px`
            }} 
          />

          {/* SVG 连线层 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {edges.map(edge => {
              const s = getPortPos(edge.from, true);
              const e = getPortPos(edge.to, false);
              return (
                <g key={edge.id} className="drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                  <path d={getBezierCurve(s.x, s.y, e.x, e.y)} stroke="#3b82f6" strokeWidth={3 * zoom} fill="none" />
                  <circle cx={s.x} cy={s.y} r={4 * zoom} fill="#3b82f6" />
                  <circle cx={e.x} cy={e.y} r={4 * zoom} fill="#3b82f6" />
                </g>
              );
            })}
            {connectingFromId && (() => {
              const s = getPortPos(connectingFromId, true);
              return <path d={getBezierCurve(s.x, s.y, mousePos.x, mousePos.y)} stroke="#3b82f6" strokeWidth={2} strokeDasharray="6,6" fill="none" />;
            })()}
          </svg>

          {/* 节点层 */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none" 
            style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
            {nodes.map(node => (
              <div 
                key={node.id}
                onMouseDown={(e) => onNodeDown(e, node)}
                className={`absolute pointer-events-auto w-[${NODE_WIDTH}px] min-h-[${NODE_HEIGHT}px] rounded-[2.5rem] shadow-2xl overflow-hidden group border transition-shadow
                  ${theme === 'dark' ? 'bg-[#101010]/95 backdrop-blur-3xl border-white/10 shadow-black' : 'bg-white border-black/5 shadow-black/10'}
                  ${dragRef.current.targetId === node.id ? 'z-30 shadow-blue-600/30 ring-2 ring-blue-500/50' : 'z-20'}`}
                style={{ left: node.position.x, top: node.position.y }}
              >
                {/* 句柄 */}
                <div 
                  className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full cursor-crosshair transition-all z-10 flex items-center justify-center border-2
                    ${theme === 'dark' ? 'bg-neutral-800 border-[#101010]' : 'bg-white border-neutral-100'}
                    ${connectingFromId && connectingFromId !== node.id ? 'animate-pulse bg-blue-500 scale-125' : 'hover:scale-110'}`}
                  onMouseUp={(e) => handleConnect(e, node.id)}
                >
                  <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-black/20'}`}></div>
                </div>
                <div 
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 border-2 border-[#101010] rounded-full cursor-crosshair hover:scale-125 transition-all z-10 shadow-lg flex items-center justify-center"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setConnectingFromId(node.id); }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>

                {/* 头部 */}
                <div className={`px-7 py-5 border-b flex items-center justify-between transition-colors ${theme === 'dark' ? 'border-white/5 bg-white/2' : 'border-black/5 bg-black/[0.02]'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-all shadow-inner
                      ${theme === 'dark' ? 'bg-neutral-900 text-neutral-400 group-hover:bg-blue-600 group-hover:text-white' : 'bg-white border border-black/5 text-neutral-500 group-hover:bg-blue-600 group-hover:text-white'}`}>
                      {getIconForType(node.type)}
                    </div>
                    <span className="text-[10px] font-black tracking-[0.3em] text-neutral-500 uppercase">{node.data.label}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setNodes(nodes.filter(n => n.id !== node.id)); }} className="text-neutral-500 hover:text-red-500 transition-all p-2 rounded-xl hover:bg-red-500/10">
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                </div>

                {/* 主体 */}
                <div className="p-7 space-y-6">
                  <div className={`aspect-video rounded-[2rem] flex items-center justify-center relative overflow-hidden shadow-inner border
                    ${theme === 'dark' ? 'bg-neutral-900 border-white/5' : 'bg-neutral-100 border-black/5'}`}>
                    {node.data.loading ? <Loader2 className="animate-spin text-blue-500" size={32} strokeWidth={3} /> : node.data.output ? (
                      node.type === NodeType.VIDEO_GEN ? <video src={node.data.output} className="w-full h-full object-cover" controls loop autoPlay muted /> : <img src={node.data.output} alt="output" className="w-full h-full object-cover" />
                    ) : <span className="text-neutral-500 text-[10px] uppercase tracking-widest opacity-40 italic">等待生成...</span>}
                  </div>
                  <div className="space-y-4">
                    <textarea 
                      className={`w-full border rounded-2xl p-5 text-sm transition-all resize-none shadow-inner leading-relaxed focus:outline-none select-text
                        ${theme === 'dark' ? 'bg-neutral-950 border-white/5 text-white placeholder-neutral-700' : 'bg-white border-black/5 text-black placeholder-neutral-400'}`}
                      placeholder="创意 Prompt..." rows={2} value={node.data.params?.prompt || ''}
                      onMouseDown={(e) => e.stopPropagation()}
                      onChange={(e) => setNodes(nodes.map(n => n.id === node.id ? { ...n, data: { ...n.data, params: { ...n.data.params, prompt: e.target.value } } } : n))}
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleGenerate(node.id); }}
                      disabled={node.data.loading}
                      className={`w-full py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl
                        ${theme === 'dark' ? 'bg-neutral-800/60 hover:bg-blue-600 text-white' : 'bg-black text-white hover:bg-blue-600'}`}
                    >
                      {node.data.loading ? "处理中" : "运行节点"} <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 工具条 */}
          <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] z-50 transition-all
            ${theme === 'dark' ? 'bg-[#121212]/95 border border-white/5' : 'bg-white/95 border border-black/10'}`}>
            <div className={`flex items-center gap-2 border-r pr-6 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
              <button onClick={() => setActiveTool('pan')} className={`p-3.5 rounded-2xl transition-all ${activeTool === 'pan' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-neutral-500 hover:bg-black/5'}`}><Hand size={20} /></button>
              <button onClick={() => setActiveTool('select')} className={`p-3.5 rounded-2xl transition-all ${activeTool === 'select' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-neutral-500 hover:bg-black/5'}`}><MousePointer2 size={20} /></button>
            </div>
            
            <div className="flex items-center gap-6 px-4">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-neutral-500 tabular-nums leading-none mb-1">{Math.round(zoom * 100)}%</span>
                <div className={`w-12 h-[2.5px] rounded-full overflow-hidden ${theme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${(zoom / 2.5) * 100}%` }}></div>
                </div>
              </div>
              <button onClick={() => setZoom(1)} className="p-2.5 rounded-xl text-neutral-500 hover:bg-black/5"><Maximize2 size={16} /></button>
            </div>

            <div className={`flex items-center gap-4 border-l pl-6 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
              <button onClick={onToggleTheme} className={`p-4 rounded-full transition-all hover:scale-110 active:rotate-180 duration-500
                ${theme === 'dark' ? 'text-neutral-400 hover:text-yellow-400 hover:bg-yellow-400/10' : 'text-neutral-600 hover:text-blue-600 hover:bg-blue-600/10'}`}>
                {theme === 'dark' ? <Sun size={24} strokeWidth={2.5} /> : <Moon size={24} strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CanvasPage;
