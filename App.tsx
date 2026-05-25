import React, { useState, useEffect, useRef } from 'react';
import { Battery, MapPin, Navigation, Cpu, ShieldAlert, PlayCircle, Terminal, Send, Search, Lock, Zap } from 'lucide-react';

// --- CONFIGURATION ---
const PI_IP = "";  // <--- আপনার ড্রোনের বর্তমান আইপি অ্যাড্রেস এখানে দিন
const FLASK_URL = `http://${PI_IP}:5000`;

const App = () => {
  const [telemetry, setTelemetry] = useState({ bat: 95, alt: 0, spd: 0 });
  const [msgs, setMsgs] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(["Scanning for threats..."]);
  const [targetsData, setTargetsData] = useState<any[]>([]);
  
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs([{ id: 'init', timestamp: new Date().toLocaleTimeString(), type: 'SYSTEM', content: 'AEGIS COMMAND LINK SECURED. VISUAL SERVOING AND EDGE AI ACTIVE.' }]);
  }, []);

  // --- DATA LINK POLL ---
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${FLASK_URL}/detections`);
        const data = await response.json();
        setTargetsData(data.targets);
      } catch (e) { console.error("Data poll failed"); }
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---
  const sendComplexCommand = async () => {
    if (!input) return;
    setMsgs(p => [...p, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), type: 'OPERATOR', content: input }]);
    const query = input;
    setInput("");
    setIsProcessing(true);
    try {
      const res = await fetch(`${FLASK_URL}/command`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ command: query }) });
      const data = await res.json();
      setMsgs(p => [...p, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), type: 'AI', content: `${data.ai_response.action}: ${data.ai_response.reason}` }]);
    } catch { setMsgs(p => [...p, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), type: 'SYSTEM', content: 'LINK LOST: Is Pi running?' }]); }
    setIsProcessing(false);
  };

  const performAIScan = async () => {
    setMsgs(p => [...p, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), type: 'SYSTEM', content: 'Gemini Vision performing tactical area scan...' }]);
    try {
      const res = await fetch(`${FLASK_URL}/scan`, { method: 'POST' });
      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch { setSuggestions(["Failed to scan."]); }
  };

  // --- 🏙️ NEW FEATURE: URBAN SCAN ---
  const performUrbanScan = async () => {
    setMsgs(p => [...p, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), type: 'SYSTEM', content: 'Initiating Urban Infrastructure Scan...' }]);
    setIsProcessing(true);
    try {
      const res = await fetch(`${FLASK_URL}/urban_scan`, { method: 'POST' });
      const data = await res.json();
      setMsgs(p => [...p, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), type: 'AI', content: `URBAN ANALYSIS REPORT:\n${data.analysis}` }]);
    } catch { 
      setMsgs(p => [...p, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), type: 'SYSTEM', content: 'Failed to complete urban scan.' }]); 
    }
    setIsProcessing(false);
  };

  const lockFollowOnTarget = async (id: string | null) => {
    setActiveTargetId(id);
    setMsgs(p => [...p, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), type: 'SYSTEM', content: id ? `Locking visual servoing on ${id.toUpperCase()}...` : 'Visual tracking deactivated.' }]);
    try {
      await fetch(`${FLASK_URL}/lock_follow`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ target_id: id }) });
    } catch { console.error("Follow lock failed"); }
  };

  return (
    <div className="h-screen bg-black text-[#00ffcc] font-mono p-4 flex flex-col gap-4 overflow-hidden select-none relative">
      
      {/* HEADER */}
      <div className="border border-zinc-800 bg-zinc-900/60 p-4 rounded-xl flex justify-between items-center backdrop-blur-md z-50">
        <div className="flex gap-4 items-center border-r border-zinc-800 pr-6">
          <Cpu className="text-cyan-400 animate-pulse" /> 
          <div>
            <div className="text-[10px] text-zinc-500 font-black uppercase">Decision Hub</div>
            <span className="font-bold tracking-widest text-sm">AEGIS-CORE v5.1</span>
          </div>
        </div>
        <div className="flex gap-6 text-xs font-medium text-zinc-300">
          <div className="flex items-center gap-2"><Battery /> <span>{telemetry.bat}%</span></div>
          <div className="flex items-center gap-2"><MapPin /> GPS: LOCKED</div>
          <div className="flex items-center gap-2"><Lock size={12}/> LINK_STABLE</div>
        </div>
        <div className="px-5 py-1.5 bg-cyan-950/20 border border-cyan-500/50 rounded-full text-[10px] font-black uppercase text-cyan-300 animate-pulse">
           FLIGHT_MODE: {activeTargetId ? 'VISUAL_LOCK' : 'ASSISTED'}
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* TELEMETRY PANEL */}
        <div className="w-1/5 flex flex-col gap-4">
          <div className="border border-zinc-800 bg-zinc-900/40 p-4 rounded-xl border-l-4 border-l-cyan-500">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">ALT (m)</span>
            <div className="text-3xl font-black">{telemetry.alt.toFixed(1)}</div>
          </div>
          <div className="border border-zinc-800 bg-zinc-900/40 p-4 rounded-xl border-l-4 border-l-cyan-500">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">SPD (km/h)</span>
            <div className="text-3xl font-black">{telemetry.spd.toFixed(1)}</div>
          </div>
        </div>

        {/* LIVE STREAM & TARGET LOCK */}
        <div className="flex-1 bg-black rounded-2xl border-4 border-zinc-800/60 overflow-hidden relative shadow-[0_0_60px_-10px_rgba(0,255,204,0.15)] flex items-center justify-center">
          <img src={`${FLASK_URL}/video_feed`} alt="OAK-D Stream" className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-black/60 p-2 text-[10px] font-black uppercase border border-zinc-700 rounded-md">LIVE SIGNAL // ENCRYPTED</div>

          <div ref={videoRef} className="absolute inset-0 pointer-events-none">
            {targetsData.map(target => (
              <div key={target.id} style={{ 
                left: `${target.xmin * 100}%`, 
                top: `${target.ymin * 100}%`, 
                width: `${(target.xmax - target.xmin) * 100}%`, 
                height: `${(target.ymax - target.ymin) * 100}%`,
              }} className={`absolute border-2 rounded ${target.id === activeTargetId ? 'border-red-500' : 'border-cyan-500'}`}>
                
                <button 
                  onClick={() => lockFollowOnTarget(target.id)}
                  className={`absolute left-1/2 -top-10 -translate-x-1/2 pointer-events-auto px-3 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1.5 ${target.id === activeTargetId ? 'bg-red-950/40 border border-red-500 text-red-100' : 'bg-cyan-950/40 border border-cyan-500 text-cyan-100 hover:bg-cyan-500 hover:text-black transition-colors'}`}
                >
                  <Zap size={10} /> {target.id === activeTargetId ? 'TRACKING' : `LOCK ${target.id}`}
                </button>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div className="w-12 h-12 border border-cyan-500/30 rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-cyan-400 rounded-full"></div></div>
          </div>
        </div>

        {/* TACTICAL TERMINAL */}
        <div className="w-1/3 border border-zinc-800 bg-zinc-900/50 flex flex-col rounded-xl overflow-hidden backdrop-blur-sm border-r-4 border-r-cyan-500/50 shadow-2xl">
          <div className="p-3 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-cyan-400" />
              <span className="font-black text-[10px] tracking-widest uppercase">Tactical Terminal</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-ping' : 'bg-cyan-500 animate-pulse'}`} />
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-mono text-[11px] scroll-smooth">
            {msgs.map((m) => (
              <div key={m.id} className={`flex flex-col gap-1.5 ${m.type === 'OPERATOR' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl border leading-relaxed whitespace-pre-wrap ${
                  m.type === 'AI' ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-50' : m.type === 'SYSTEM' ? 'text-yellow-400 italic' : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isProcessing && <div className="text-cyan-400 animate-pulse text-[9px]">Transmitting data to drone...</div>}
          </div>

          <div className="p-3 border-t border-zinc-800 bg-zinc-900 relative">
            <input 
              type="text" value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter' && sendComplexCommand()}
              placeholder="Query AEGIS AI Command link..."
              className="w-full bg-black border border-zinc-700 text-cyan-400 pl-4 pr-12 py-3 rounded-xl text-[10px] outline-none focus:border-cyan-500"
            />
            <button onClick={sendComplexCommand} disabled={!input || isProcessing} className="absolute right-5 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-300">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="border border-zinc-800 bg-zinc-900/60 p-4 rounded-xl flex gap-4 items-center shadow-xl">
          <div className="text-[10px] text-zinc-500 font-black uppercase w-1/6">Quick Actions:</div>
          
          <button onClick={performAIScan} className="px-5 py-3 rounded-lg border border-zinc-700 text-zinc-400 text-xs hover:bg-zinc-800 flex items-center gap-2 uppercase">
             <Search size={14}/> perform ai scan
          </button>

          {/* 🏙️ THE NEW URBAN SCAN BUTTON 🏙️ */}
          <button onClick={performUrbanScan} className="px-5 py-3 rounded-lg border border-purple-500/30 text-purple-400 text-xs font-bold uppercase hover:bg-purple-500/10 flex items-center gap-2">
              City Planning Scan
          </button>

          {activeTargetId && <button onClick={()=>lockFollowOnTarget(null)} className="px-5 py-3 rounded-lg border border-red-500/30 text-red-500 text-xs font-bold uppercase hover:bg-red-500/10">Stop targeted follow</button>}
          
          <div className="flex-1 text-[10px] text-zinc-500 uppercase">Target Suggestion:</div>
          <div className="flex gap-2">
            {suggestions.map(s => <div key={s} className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-100">{s}</div>)}
          </div>
      </div>
    </div>
  );
};

export default App;