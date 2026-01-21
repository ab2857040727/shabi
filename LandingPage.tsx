
import React, { useEffect, useState } from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-[#030303] overflow-hidden select-none">
      {/* 极光氛围背景层 */}
      <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-500/10 blur-[180px] rounded-full animate-aurora-slow"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-purple-500/10 blur-[180px] rounded-full animate-aurora-fast" style={{ animationDelay: '2s' }}></div>
      
      {/* 数字化网格背景 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

      <div className={`z-10 text-center px-4 max-w-5xl transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
        {/* 顶部胶囊标签 */}
        <div className="inline-flex items-center gap-3 px-6 py-2.5 mb-10 border border-white/5 rounded-full bg-white/5 backdrop-blur-3xl shadow-[0_0_30px_rgba(59,130,246,0.1)]">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
          <span className="text-[10px] tracking-[0.6em] font-black text-blue-400/80 uppercase italic">Next-Gen AI 工作流画布</span>
        </div>
        
        {/* 核心标题：缩小字号并强化底部流光 */}
        <div className="relative mb-10 flex flex-col items-center">
          <h1 className="text-6xl md:text-[6.5rem] font-black tracking-tighter leading-tight flex flex-col items-center">
            <span className="text-white opacity-95 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              傻逼谢锦文
            </span>
            <span className="relative mt-1 text-white glow-radiate-effect">
              用AI Studio做网页
            </span>
          </h1>
          {/* 文字装饰线 */}
          <div className="absolute -inset-x-10 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-sm"></div>
        </div>
        
        <p className="text-neutral-400/80 mb-16 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed tracking-wide">
          <span className="text-white/60">重塑视觉创作的无限可能。</span> 集成 Gemini 3 与 Veo 3.1 顶尖模型，
          <br className="hidden md:block"/>
          通过直观的节点连接，编排您的 <span className="text-blue-400/80 font-medium">电影级创意流</span>。
        </p>
        
        {/* 交互按钮组 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
          <button
            onClick={onEnter}
            className="group relative px-20 py-6 bg-white text-black font-black text-lg rounded-2xl transition-all hover:scale-[1.03] active:scale-95 shadow-[0_20px_60px_rgba(255,255,255,0.1)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            进入创作空间
          </button>
        </div>
      </div>
      
      {/* 底部装饰 */}
      <div className="absolute bottom-10 w-full px-16 flex flex-col gap-6 opacity-30">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-[9px] tracking-[0.5em] text-white font-black uppercase">DREAM TRACE v2.5 ENTERPRISE</span>
          </div>
          <div className="text-[9px] tracking-[0.4em] text-white font-black uppercase flex items-center gap-4">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
            系统实时同步中
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes aurora-slow {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
          33% { transform: translate(10%, 10%) scale(1.1); opacity: 0.2; }
          66% { transform: translate(-5%, 5%) scale(0.95); opacity: 0.15; }
        }
        @keyframes aurora-fast {
          0%, 100% { transform: translate(0, 0) scale(1.1); opacity: 0.15; }
          50% { transform: translate(-10%, -10%) scale(1.2); opacity: 0.25; }
        }
        @keyframes glow-radiate-pulse {
          0% { 
            filter: 
              drop-shadow(0 5px 10px rgba(59,130,246,0.6)) 
              drop-shadow(0 15px 25px rgba(59,130,246,0.3)); 
          }
          50% { 
            filter: 
              drop-shadow(0 15px 40px rgba(168,85,247,0.9)) 
              drop-shadow(0 30px 80px rgba(168,85,247,0.6))
              drop-shadow(0 40px 120px rgba(59,130,246,0.4)); 
          }
          100% { 
            filter: 
              drop-shadow(0 5px 10px rgba(99,102,241,0.6)) 
              drop-shadow(0 15px 25px rgba(99,102,241,0.3)); 
          }
        }
        .glow-radiate-effect {
          animation: glow-radiate-pulse 2.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
          will-change: filter;
        }
        .animate-aurora-slow { animation: aurora-slow 20s infinite ease-in-out; }
        .animate-aurora-fast { animation: aurora-fast 15s infinite ease-in-out; }
      `}} />
    </div>
  );
};

export default LandingPage;
