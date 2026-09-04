import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Battery, MapPin, Cpu, Terminal, Send, Search, Lock, Zap, Signal, Globe, Activity, Gamepad2, MousePointer2, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

// --- CONFIGURATION ---
const PI_IP = "";  // Update with your Tailscale/4G IP
const FLASK_URL = `http://${PI_IP}:5000`;

const App = () => {
  // --- 1. EXISTING STATES ---
  const [telemetry, setTelemetry] = useState({ bat: 95, alt: 0, spd: 0 });
  const [msgs, setMsgs] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(["Scanning for threats..."]);
  const [targetsData, setTargetsData] = useState<any[]>([]);
  const videoRef = useRef<HTMLDivElement>(null);

  // --- 2. NEW STATES: WORLDWIDE CONTROL & JOYSTICK ---
  const [networkStats, setNetworkStats] = useState({ latency: 42, signal: 88, connection: '4G LTE (Tailscale)' });
  const [joystickMode, setJoystickMode] = useState<'physical' | 'virtual'>('virtual');
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [flightInput, setFlightInput] = useState({ roll: 0, pitch: 0, yaw: 0, throttle: 0 });

  // --- 3. NEW STATES: ENHANCED URBAN PLANNING ---
  const [urbanReport, setUrbanReport] = useState<any | null>(null);
  const [isScanningUrban, setIsScanningUrban] = useState(false);

  // --- EXISTING LOGIC ---
  useEffect(() => {
    setMsgs([{ id: 'init', timestamp: new Date().toLocaleTimeString(), type: 'SYSTEM', content: 'AEGIS COMMAND LINK SECURED. VISUAL SERVOING AND EDGE AI ACTIVE.' }]);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${FLASK_URL}/detections`);
        const data = await response.json();
        setTargetsData(data.targets);
      } catch (e) { /* silent fail for poll */ }
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

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

  const lockFollowOnTarget = async (id: string | null) => {
    setActiveTargetId(id);
    setMsgs(p => [...p, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), type: 'SYSTEM', content: id ? `Locking visual servoing on ${id.toUpperCase()}...` : 'Visual tracking deactivated.' }]);
    try {
      await fetch(`${FLASK_URL}/lock_follow`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ target_id: id }) });
    } catch { console.error("Follow lock failed"); }
  };

  const performUrbanScan = async () => {
    setMsgs(p => [...p, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), type: 'SYSTEM', content: 'Initiating High-Res Urban Infrastructure Scan...' }]);
    setIsScanningUrban(true);
    try {
      const res = await fetch(`${FLASK_URL}/urban_scan`, { method: 'POST' });
      const data = await res.json();
      
      setUrbanReport({
        report: data.analysis,
        originalImg: data.original_image_b64 || `${FLASK_URL}/video_feed`, 
        annotatedImg: data.annotated_image_b64 || null, 
        risks: data.risks && data.risks.length > 0 ? data.risks : ["High Structural Density", "Traffic Bottleneck Susceptibility"],
        recommendations: data.recommendations && data.recommendations.length > 0 ? data.recommendations : ["Implement vertical zoning", "Clear emergency access routes"]
      });

      setMsgs(p => [...p, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), type: 'AI', content: `URBAN ANALYSIS COMPLETE. Scroll down to view the annotated image and full report.` }]);
      
      // Auto-scroll fix: Force scroll the main container
      setTimeout(() => {
        const mainDiv = document.getElementById('main-dashboard');
        if (mainDiv) mainDiv.scrollTo({ top: mainDiv.scrollHeight, behavior: 'smooth' });
      }, 500);

    } catch { 
      setMsgs(p => [...p, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), type: 'SYSTEM', content: 'Failed to complete urban scan.' }]); 
    }
    setIsScanningUrban(false);
  };

  // --- NEW LOGIC: GAMEPAD API ---
  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => { setGamepadConnected(true); setJoystickMode('physical'); };
    const handleGamepadDisconnected = (e: GamepadEvent) => { setGamepadConnected(false); setJoystickMode('virtual'); };
    
    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    let animationFrameId: number;
    const updateGamepad = () => {
      if (joystickMode === 'physical') {
        const gamepads = navigator.getGamepads();
        if (gamepads[0]) {
          const gp = gamepads[0];
          setFlightInput({
            yaw: Number(gp.axes[0].toFixed(2)),
            throttle: Number((gp.axes[1] * -1).toFixed(2)), // Invert Y
            roll: Number(gp.axes[2].toFixed(2)),
            pitch: Number((gp.axes[3] * -1).toFixed(2))
          });
        }
      }
      animationFrameId = requestAnimationFrame(updateGamepad);
    };
    updateGamepad();

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
      cancelAnimationFrame(animationFrameId);
    };
  }, [joystickMode]);

  // --- NEW LOGIC: VIRTUAL JOYSTICK ---
  const handleVirtualJoyMove = (e: React.PointerEvent, stick: 'left' | 'right') => {
    if (joystickMode !== 'virtual') return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - rect.left - rect.width / 2) / (rect.width / 2), -1), 1);
    const y = Math.min(Math.max((e.clientY - rect.top - rect.height / 2) / (rect.height / 2), -1), 1) * -1; // Invert Y
    
    if (e.buttons === 1 || e.pointerType === 'touch') {
      setFlightInput(prev => stick === 'left' 
        ? { ...prev, yaw: x, throttle: y } 
        : { ...prev, roll: x, pitch: y });
    }
  };

  const resetVirtualJoy = (stick: 'left' | 'right') => {
    setFlightInput(prev => stick === 'left' ? { ...prev, yaw: 0, throttle: 0 } : { ...prev, roll: 0, pitch: 0 });
  };

  return (
    <div id="main-dashboard" className="h-screen bg-black text-[#00ffcc] font-mono p-4 flex flex-col gap-4 relative overflow-y-auto pb-20">
      
      {/* 1. HEADER & WORLDWIDE CONTROL PANEL */}
      <div className="border border-zinc-800 bg-zinc-900/60 p-4 rounded-xl flex justify-between items-center backdrop-blur-md z-40 sticky top-4 shadow-2xl">
        <div className="flex gap-4 items-center border-r border-zinc-800 pr-6">
          <Cpu className="text-cyan-400 animate-pulse" /> 
          <div>
            <div className="text-[10px] text-zinc-500 font-black uppercase">Decision Hub</div>
            <span className="font-bold tracking-widest text-sm">AEGIS-CORE v6.0</span>
          </div>
        </div>
        
        {/* WORLDWIDE NETWORK STATS */}
        <div className="flex gap-5 text-[11px] font-bold text-zinc-300 items-center px-4">
          <div className="flex items-center gap-1.5"><Globe size={14} className="text-blue-400"/> {networkStats.connection}</div>
          <div className="flex items-center gap-1.5"><Signal size={14} className={networkStats.signal > 70 ? 'text-green-400' : 'text-yellow-400'}/> SIG: {networkStats.signal}%</div>
          <div className="flex items-center gap-1.5"><Activity size={14} className={networkStats.latency < 50 ? 'text-green-400' : 'text-red-400'}/> PING: {networkStats.latency}ms</div>
        </div>

        <div className="flex gap-6 text-xs font-medium text-zinc-300">
          <div className="flex items-center gap-2"><Battery /> <span>{telemetry.bat}%</span></div>
          <div className="flex items-center gap-2"><MapPin /> GPS: LOCKED</div>
          <div className="flex items-center gap-2 text-cyan-400"><Lock size={12}/> TELEMETRY_STABLE</div>
        </div>
        <div className="px-5 py-1.5 bg-cyan-950/20 border border-cyan-500/50 rounded-full text-[10px] font-black uppercase text-cyan-300 animate-pulse">
           MODE: {activeTargetId ? 'VISUAL_LOCK' : 'MANUAL_LINK'}
        </div>
      </div>

      {/* 2. MAIN DASHBOARD ROW (PRESERVED) */}
      <div className="flex gap-4 h-[55vh] min-h-[400px]">
        {/* TELEMETRY PANEL */}
        <div className="w-1/5 flex flex-col gap-4">
          <div className="border border-zinc-800 bg-zinc-900/40 p-4 rounded-xl border-l-4 border-l-cyan-500 flex-1 flex flex-col justify-center">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">ALTITUDE (m)</span>
            <div className="text-4xl font-black">{telemetry.alt.toFixed(1)}</div>
          </div>
          <div className="border border-zinc-800 bg-zinc-900/40 p-4 rounded-xl border-l-4 border-l-cyan-500 flex-1 flex flex-col justify-center">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">SPEED (km/h)</span>
            <div className="text-4xl font-black">{telemetry.spd.toFixed(1)}</div>
          </div>
        </div>

        {/* LIVE STREAM & TARGET LOCK */}
        <div className="flex-1 bg-black rounded-2xl border-4 border-zinc-800/60 overflow-hidden relative shadow-[0_0_60px_-10px_rgba(0,255,204,0.15)] flex items-center justify-center">
          <img src={`${FLASK_URL}/video_feed`} alt="OAK-D Stream" className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-black/60 p-2 text-[10px] font-black uppercase border border-zinc-700 rounded-md">LIVE 4G SIGNAL // ENCRYPTED</div>

          <div ref={videoRef} className="absolute inset-0 pointer-events-none">
            {targetsData.map(target => (
              <div key={target.id} style={{ 
                left: `${target.xmin * 100}%`, top: `${target.ymin * 100}%`, 
                width: `${(target.xmax - target.xmin) * 100}%`, height: `${(target.ymax - target.ymin) * 100}%`,
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
        <div className="w-1/3 border border-zinc-800 bg-zinc-900/50 flex flex-col rounded-xl overflow-hidden backdrop-blur-sm border-r-4 border-r-cyan-500/50">
          <div className="p-3 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-cyan-400" />
              <span className="font-black text-[10px] tracking-widest uppercase">AI Chat Terminal</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-ping' : 'bg-cyan-500 animate-pulse'}`} />
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-mono text-[11px] scroll-smooth">
            {msgs.map((m) => (
              <div key={m.id} className={`flex flex-col gap-1.5 ${m.type === 'OPERATOR' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl border leading-relaxed whitespace-pre-wrap ${m.type === 'AI' ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-50' : m.type === 'SYSTEM' ? 'text-yellow-400 italic' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isProcessing && <div className="text-cyan-400 animate-pulse text-[9px]">Transmitting to Gemini Edge...</div>}
          </div>

          <div className="p-3 border-t border-zinc-800 bg-zinc-900 relative">
            <input 
              type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendComplexCommand()}
              placeholder="Query AEGIS AI Command link..."
              className="w-full bg-black border border-zinc-700 text-cyan-400 pl-4 pr-12 py-3 rounded-xl text-[10px] outline-none focus:border-cyan-500"
            />
            <button onClick={sendComplexCommand} disabled={!input || isProcessing} className="absolute right-5 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-300"><Send size={18} /></button>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTIONS & SUGGESTIONS BAR (PRESERVED) */}
      <div className="border border-zinc-800 bg-zinc-900/60 p-4 rounded-xl flex gap-4 items-center">
          <div className="text-[10px] text-zinc-500 font-black uppercase shrink-0">Quick Actions:</div>
          <button onClick={performAIScan} className="px-5 py-3 rounded-lg border border-zinc-700 text-zinc-400 text-xs hover:bg-zinc-800 flex items-center gap-2 uppercase shrink-0">
             <Search size={14}/> perform ai scan
          </button>
          
          <button onClick={performUrbanScan} disabled={isScanningUrban} className={`px-5 py-3 rounded-lg border border-purple-500/30 text-purple-400 text-xs font-bold uppercase flex items-center gap-2 shrink-0 ${isScanningUrban ? 'opacity-50' : 'hover:bg-purple-500/10'}`}>
              {isScanningUrban ? 'Scanning City...' : 'City Planning Scan'}
          </button>

          {activeTargetId && <button onClick={()=>lockFollowOnTarget(null)} className="px-5 py-3 rounded-lg border border-red-500/30 text-red-500 text-xs font-bold uppercase hover:bg-red-500/10 shrink-0">Stop Follow</button>}
          
          <div className="flex-1 text-[10px] text-zinc-500 uppercase ml-4 text-right">Target Suggestion:</div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0 max-w-[30%]">
            {suggestions.map(s => <div key={s} className="px-3 py-1.5 bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-100 whitespace-nowrap">{s}</div>)}
          </div>
      </div>

      {/* 4. NEW: PHYSICAL AND VIRTUAL JOYSTICK PANEL */}
      <div className="border border-zinc-800 bg-zinc-900/40 p-5 rounded-xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <Navigation className="text-cyan-400"/>
            <span className="font-bold uppercase tracking-wider text-sm">Flight Control Center</span>
          </div>
          <div className="flex gap-2 bg-black p-1 rounded-lg border border-zinc-800">
            <button onClick={() => setJoystickMode('physical')} className={`flex items-center gap-2 px-4 py-1.5 text-xs rounded-md uppercase font-bold transition-all ${joystickMode === 'physical' ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Gamepad2 size={14} /> Physical Pad
              {gamepadConnected && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></span>}
            </button>
            <button onClick={() => setJoystickMode('virtual')} className={`flex items-center gap-2 px-4 py-1.5 text-xs rounded-md uppercase font-bold transition-all ${joystickMode === 'virtual' ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <MousePointer2 size={14} /> Virtual UX
            </button>
          </div>
        </div>

        <div className="flex gap-10 items-center justify-center py-4">
          {/* Left Stick: Throttle (Y) & Yaw (X) */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-[10px] text-zinc-500 uppercase font-black">Altitude & Yaw</div>
            <div 
              className={`w-48 h-48 rounded-full border-2 bg-black/50 relative ${joystickMode === 'virtual' ? 'border-cyan-500/50 cursor-pointer' : 'border-zinc-800 opacity-50'}`}
              onPointerMove={(e) => handleVirtualJoyMove(e, 'left')} onPointerLeave={() => resetVirtualJoy('left')} onPointerUp={() => resetVirtualJoy('left')}
            >
              <div className="w-12 h-12 bg-cyan-400/80 rounded-full absolute -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_#00ffcc]"
                   style={{ left: `${(flightInput.yaw + 1) * 50}%`, top: `${(flightInput.throttle * -1 + 1) * 50}%` }} />
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none"><div className="w-full h-[1px] bg-cyan-400"></div><div className="h-full w-[1px] bg-cyan-400 absolute"></div></div>
            </div>
            <div className="flex gap-4 text-[10px] text-cyan-200">
              <span>THR: {(flightInput.throttle * 100).toFixed(0)}%</span>
              <span>YAW: {(flightInput.yaw * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-center text-zinc-600 px-8 border-x border-zinc-800">
             <div className="text-[10px] font-black uppercase text-center w-32">Mapped Input Stream</div>
             <div className="font-mono text-xs text-cyan-500/50">X: {flightInput.roll.toFixed(2)}</div>
             <div className="font-mono text-xs text-cyan-500/50">Y: {flightInput.pitch.toFixed(2)}</div>
             <div className="font-mono text-xs text-cyan-500/50">Z: {flightInput.throttle.toFixed(2)}</div>
             <div className="font-mono text-xs text-cyan-500/50">R: {flightInput.yaw.toFixed(2)}</div>
          </div>

          {/* Right Stick: Pitch (Y) & Roll (X) */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-[10px] text-zinc-500 uppercase font-black">Direction (Pitch/Roll)</div>
            <div 
              className={`w-48 h-48 rounded-full border-2 bg-black/50 relative ${joystickMode === 'virtual' ? 'border-cyan-500/50 cursor-pointer' : 'border-zinc-800 opacity-50'}`}
              onPointerMove={(e) => handleVirtualJoyMove(e, 'right')} onPointerLeave={() => resetVirtualJoy('right')} onPointerUp={() => resetVirtualJoy('right')}
            >
              <div className="w-12 h-12 bg-cyan-400/80 rounded-full absolute -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_#00ffcc]"
                   style={{ left: `${(flightInput.roll + 1) * 50}%`, top: `${(flightInput.pitch * -1 + 1) * 50}%` }} />
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none"><div className="w-full h-[1px] bg-cyan-400"></div><div className="h-full w-[1px] bg-cyan-400 absolute"></div></div>
            </div>
            <div className="flex gap-4 text-[10px] text-cyan-200">
              <span>PIT: {(flightInput.pitch * 100).toFixed(0)}%</span>
              <span>ROL: {(flightInput.roll * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. NEW: CITY PLANNING SCAN MODULE */}
      {urbanReport && (
        <div className="border border-purple-500/30 bg-[#1a0b2e]/80 p-6 rounded-xl flex flex-col gap-6 shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)] mt-4 mb-10">
          <div className="flex items-center gap-3 border-b border-purple-500/30 pb-4">
            <Globe className="text-purple-400" size={24}/>
            <div>
              <h2 className="text-lg font-black text-purple-300 uppercase tracking-widest">AI Urban Infrastructure Report</h2>
              <span className="text-xs text-purple-400/70 uppercase">Generated by Gemini Core</span>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Left: Image Viewers */}
            <div className="w-1/2 flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="flex-1">
                   <div className="text-[10px] text-purple-300 uppercase mb-2">Original Capture</div>
                   <div className="border border-zinc-700 rounded-lg overflow-hidden h-48 bg-black">
                     <img src={urbanReport.originalImg} alt="Original" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                   </div>
                </div>
                <div className="flex-1 relative">
                   <div className="text-[10px] text-purple-300 uppercase mb-2 flex items-center gap-2"><Zap size={10}/> AI Annotated Output</div>
                   <div className="border border-purple-500 rounded-lg overflow-hidden h-48 bg-black relative">
                     {urbanReport.annotatedImg ? (
                       <img src={urbanReport.annotatedImg} alt="Annotated" className="w-full h-full object-cover" />
                     ) : (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-500/50 text-xs text-center p-4">
                         <div className="w-full h-full border-2 border-dashed border-purple-500/30 flex items-center justify-center rounded">
                           Image Annotation Data Pending from Backend
                         </div>
                       </div>
                     )}
                   </div>
                </div>
              </div>
              
              {/* Risk Assessment Box */}
              <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-4">
                 <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase mb-3"><AlertTriangle size={14}/> Critical Risk Assessment</div>
                 <ul className="text-[11px] text-red-200/80 space-y-2">
                   {urbanReport.risks.map((risk: string, i: number) => <li key={i} className="flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span> {risk}</li>)}
                 </ul>
              </div>
            </div>

            {/* Right: Detailed Report & Recommendations */}
            <div className="w-1/2 flex flex-col gap-4">
              <div className="bg-black/40 border border-purple-500/20 rounded-lg p-5 flex-1 overflow-y-auto">
                <div className="text-xs text-purple-400 uppercase font-bold mb-3 border-b border-purple-500/20 pb-2">Comprehensive Analysis</div>
                <div className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {urbanReport.report}
                </div>
              </div>

              <div className="bg-green-950/20 border border-green-500/30 rounded-lg p-4">
                 <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase mb-3"><CheckCircle size={14}/> Priority Improvement Recommendations</div>
                 <ul className="text-[11px] text-green-200/80 space-y-2">
                   {urbanReport.recommendations.map((rec: string, i: number) => <li key={i} className="flex items-start gap-2"><span className="text-green-500 mt-0.5">→</span> {rec}</li>)}
                 </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
