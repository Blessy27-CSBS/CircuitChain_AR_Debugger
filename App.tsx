
import React, { useState, useEffect } from 'react';
import { analyzeCircuit } from './services/geminiService';
import { AppState, CircuitAnalysisResult, DetectedComponent } from './types';
import { CircuitCanvas } from './components/CircuitCanvas';
import { 
  Zap, Camera, FileText, AlertTriangle, CheckCircle, RefreshCw, Cpu, 
  Star, ExternalLink, Info, List, Lightbulb, User, Lock, 
  ArrowRight, ShieldCheck, Settings, LogOut, Terminal, Activity
} from 'lucide-react';

const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
      {/* Visual Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-pink-100/30 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-blue-100/20 blur-[100px]"></div>
      </div>

      <div className="anime-card w-full max-w-xl p-10 md:p-14 bg-white/95 relative z-10 animate-slide-up">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-6">
            <div className="w-28 h-28 bg-pink-500 rounded-[3rem] flex items-center justify-center shadow-2xl border-4 border-white transform -rotate-6 animate-float">
              <Cpu size={56} className="text-white" />
            </div>
            <div className="absolute -bottom-2 -right-4 bg-yellow-400 p-3 rounded-2xl border-4 border-white shadow-lg animate-pulse">
                <Activity size={20} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-2">
            Circuit-Chan <span className="text-pink-500 italic">Vision</span>
          </h1>
          <div className="h-1.5 w-24 bg-pink-200 rounded-full mb-4"></div>
          <p className="text-slate-500 font-medium max-w-sm">
            "Welcome back, Chief Engineer! Ready to verify some traces today?"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                <User size={14} className="text-pink-400" /> ID Token
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ENGINEER_AUTH_01"
                  className="w-full pl-14 pr-6 py-5 rounded-3xl border-4 border-slate-50 bg-slate-50 focus:border-pink-200 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                />
                <Settings className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300" size={24} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                <Lock size={14} className="text-pink-400" /> Secure Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 rounded-3xl border-4 border-slate-50 bg-slate-50 focus:border-pink-200 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                />
                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300" size={24} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full anime-btn bg-pink-500 hover:bg-pink-400 text-white font-black py-5 rounded-3xl shadow-[0_8px_0_#d14d72] active:shadow-none active:translate-y-[8px] flex items-center justify-center gap-4 mt-6 text-xl group"
          >
            {isLoading ? (
              <RefreshCw className="animate-spin" />
            ) : (
              <>
                Initialize Core
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 flex items-center justify-center gap-3">
           <div className="h-[1px] flex-1 bg-slate-100"></div>
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-4">Biometric Link: Secure</span>
           <div className="h-[1px] flex-1 bg-slate-100"></div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isLoggedIn: false,
    image: null,
    schematic: "A simple 555 timer circuit that blinks an LED. 5V VCC on pin 8, GND on pin 1. LED and resistor connected to pin 3.",
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const [selectedFaultId, setSelectedFaultId] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<DetectedComponent | null>(null);

  const handleLogin = () => setState(prev => ({ ...prev, isLoggedIn: true }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState(prev => ({ ...prev, image: event.target?.result as string, result: null, error: null }));
        setSelectedFaultId(null);
        setSelectedComponent(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!state.image) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    setSelectedFaultId(null);
    setSelectedComponent(null);
    try {
      const result = await analyzeCircuit(state.image, state.schematic);
      setState(prev => ({ ...prev, result, isAnalyzing: false }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, error: err.message, isAnalyzing: false }));
    }
  };

  const handleSelectComponent = (comp: DetectedComponent) => {
    setSelectedComponent(comp);
    setSelectedFaultId(null);
  };

  const handleSelectFault = (id: string) => {
    setSelectedFaultId(id);
    setSelectedComponent(null);
  };

  if (!state.isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto animate-in fade-in duration-1000">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 glass-morphism p-6 rounded-[2.5rem] border-4 border-white shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-pink-500 rounded-[2rem] flex items-center justify-center shadow-2xl border-4 border-white transform rotate-3 hover:rotate-0 transition-transform cursor-pointer">
             <Cpu size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-none">
              Circuit-Chan <span className="text-pink-500 italic">Vision</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-0.5 bg-blue-500 text-white text-[10px] font-black rounded-full tracking-widest uppercase">System Online</span>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">AR Debug Node v3.0.4</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden lg:flex flex-col items-end mr-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator Status</p>
             <p className="text-slate-700 font-bold">Senior Engineer Kun</p>
           </div>
           <div className="bg-yellow-50 border-4 border-yellow-200 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3 animate-pulse-glow">
             <Star className="text-yellow-400 fill-yellow-400" size={24} />
             <span className="font-black text-yellow-700 uppercase text-xs tracking-wider">Premium Mode</span>
           </div>
           <button 
             onClick={() => setState(prev => ({...prev, isLoggedIn: false}))}
             className="w-14 h-14 bg-white border-4 border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 hover:text-pink-500 hover:border-pink-200 transition-all shadow-sm"
             title="Logout Session"
           >
             <LogOut size={24} />
           </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-4 space-y-8">
          <section className="anime-card p-8 bg-white/95 h-fit">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <Camera className="text-pink-500" size={28} /> Visual Feed
            </h2>
            <div className="relative border-4 border-dashed border-pink-100 rounded-[2rem] min-h-[250px] flex flex-col items-center justify-center gap-4 transition-all hover:border-pink-300 hover:bg-pink-50/30 group cursor-pointer overflow-hidden shadow-inner">
               {state.image ? (
                 <>
                   <img src={state.image} className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity group-hover:opacity-50" />
                   <div className="relative flex flex-col items-center bg-white p-6 rounded-3xl shadow-2xl border-4 border-white animate-in zoom-in duration-300">
                      <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-3">
                        <CheckCircle className="text-green-500" size={28} />
                      </div>
                      <span className="text-sm font-black text-slate-700 uppercase tracking-wider">Signal Captured</span>
                      <button 
                        onClick={() => setState(p => ({...p, image: null, result: null}))}
                        className="text-[10px] font-black text-pink-500 underline uppercase mt-3 tracking-widest hover:text-pink-600"
                      >Clear Buffer</button>
                   </div>
                 </>
               ) : (
                 <>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 group-hover:scale-110 group-hover:text-pink-300 transition-all duration-300">
                    <Zap size={40} fill="currentColor" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-800 font-black uppercase text-xs tracking-widest mb-1">Upload Target</p>
                    <p className="text-slate-400 text-[10px] font-medium px-4">JPEG or PNG Circuit Map</p>
                  </div>
                 </>
               )}
            </div>
          </section>

          <section className="anime-card p-8 bg-white/95 h-fit">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <FileText className="text-blue-500" size={28} /> Target Netlist
            </h2>
            <div className="relative">
                <textarea
                className="w-full h-44 p-6 rounded-3xl border-4 border-slate-50 bg-slate-50 focus:border-blue-200 focus:bg-white outline-none transition-all mono text-xs leading-relaxed shadow-inner"
                placeholder="// Describe your connections here...
Pin 1 -> GND
Pin 2 -> VCC (5V)"
                value={state.schematic}
                onChange={(e) => setState(prev => ({ ...prev, schematic: e.target.value }))}
                />
                <div className="absolute top-4 right-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Reference.TXT</div>
            </div>
            
            <button
                disabled={!state.image || state.isAnalyzing}
                onClick={startAnalysis}
                className={`w-full anime-btn py-5 rounded-3xl font-black flex items-center justify-center gap-4 text-white text-xl shadow-[0_8px_0_#d14d72] active:shadow-none active:translate-y-[8px] mt-8 ${
                    !state.image || state.isAnalyzing ? 'bg-slate-300 shadow-[0_8px_0_#94a3b8]' : 'bg-pink-500'
                }`}
            >
                {state.isAnalyzing ? (
                  <RefreshCw className="animate-spin" size={28} />
                ) : (
                  <Zap size={28} fill="white" />
                )}
                {state.isAnalyzing ? 'Processing Neurons...' : 'Analyze Circuit'}
            </button>
          </section>

          {state.error && (
            <div className="bg-red-50 border-4 border-red-200 p-6 rounded-[2rem] flex items-center gap-4 text-red-600 animate-in slide-in-from-left duration-500 shadow-md">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border-2 border-red-100 shadow-sm shrink-0">
                <AlertTriangle size={24} />
              </div>
              <p className="font-bold text-sm leading-tight">{state.error}</p>
            </div>
          )}
        </div>

        {/* Right Column: Visual Analysis Output */}
        <div className="lg:col-span-8 space-y-10">
          <section className="anime-card p-10 bg-white/95 flex flex-col min-h-[600px] shadow-2xl">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">AR Visualization</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Live Spatial Analysis Buffer</p>
                </div>
                {state.result && (
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-3xl border-2 border-slate-100">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Circuit Health</span>
                    <div className={`px-5 py-2 rounded-2xl border-4 flex items-center gap-3 transition-all ${
                        state.result.health_score > 80 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-yellow-50 border-yellow-100 text-yellow-700'
                    }`}>
                      <Activity size={20} className={state.result.health_score > 80 ? 'text-green-500' : 'text-yellow-500'} />
                      <span className="text-2xl font-black">{state.result.health_score}%</span>
                    </div>
                  </div>
                )}
             </div>

             <div className="flex-1 min-h-[450px]">
                <CircuitCanvas 
                image={state.image || ''} 
                result={state.result} 
                selectedFaultId={selectedFaultId}
                onSelectFault={handleSelectFault}
                selectedComponentLabel={selectedComponent?.label || null}
                onSelectComponent={handleSelectComponent}
                />
             </div>

             {state.isAnalyzing && (
               <div className="mt-10 flex items-center gap-6 bg-blue-50/50 p-8 rounded-[2.5rem] border-4 border-blue-100/50 animate-pulse shadow-inner">
                 <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center border-4 border-blue-200 shadow-lg shrink-0">
                    <div className="text-5xl animate-float">🤖</div>
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-blue-800">Vision Brain Active</h3>
                   <p className="text-sm text-blue-500 font-medium leading-relaxed mt-1">Scanning trace continuity, checking component polarity, and validating resistor bands against schematic logic...</p>
                 </div>
               </div>
             )}

             {state.result && (
               <div className="mt-10 space-y-10 animate-in fade-in slide-up duration-700">
                  {/* Summary Box */}
                  <div className="terminal-window p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-700/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <Terminal size={18} className="text-blue-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Analysis Summary Log</span>
                    </div>
                    <p className="text-lg text-slate-100 font-medium leading-relaxed opacity-90 italic">
                        "{state.result.analysis_summary}"
                    </p>
                  </div>
                  
                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Faults List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-3">
                                <AlertTriangle size={18} className="text-pink-500" /> 
                                Critical Discrepancies
                            </h3>
                            <span className="bg-pink-100 text-pink-500 text-[10px] font-black px-3 py-1 rounded-full">{state.result.faults.length} Issues</span>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {state.result.faults.length === 0 ? (
                            <div className="bg-green-50 p-8 rounded-[2rem] text-green-700 font-bold flex flex-col items-center gap-4 border-4 border-green-100 text-center shadow-inner">
                                <CheckCircle size={48} className="text-green-400" />
                                <p>Optimal Logic Path Detected!<br/><span className="text-xs opacity-70">Physical circuit perfectly matches the schematic intent.</span></p>
                            </div>
                            ) : (
                            state.result.faults.map(fault => (
                                <div 
                                key={fault.id}
                                onClick={() => handleSelectFault(fault.id)}
                                className={`group cursor-pointer p-6 rounded-[1.5rem] border-4 transition-all duration-300 ${
                                    selectedFaultId === fault.id 
                                    ? 'bg-pink-50 border-pink-400 shadow-xl -translate-y-1' 
                                    : 'bg-white border-slate-100 hover:border-pink-200 hover:shadow-lg'
                                }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                                            fault.severity === 'critical' ? 'bg-red-500 border-red-400 text-white' : 'bg-yellow-400 border-yellow-300 text-black'
                                        }`}>
                                            <AlertTriangle size={20} />
                                        </div>
                                        <h4 className="font-black text-slate-800 text-sm leading-snug">{fault.message}</h4>
                                    </div>
                                    {selectedFaultId === fault.id && (
                                        <div className="mt-4 bg-white p-5 rounded-2xl border-2 border-pink-100 animate-in fade-in slide-in-from-top-2 duration-300 shadow-inner">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Settings size={12} className="text-pink-400" />
                                                <p className="text-[9px] text-pink-400 font-black uppercase tracking-widest">Recommended Corrective Action</p>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{fault.fix}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                            )}
                        </div>
                    </div>

                    {/* Component Intelligence Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-3">
                                <Info size={18} className="text-blue-500" /> 
                                Part Intelligence
                            </h3>
                            <span className="bg-blue-100 text-blue-500 text-[10px] font-black px-3 py-1 rounded-full">Database Active</span>
                        </div>
                        <div className="bg-slate-50 rounded-[2rem] border-4 border-slate-100 p-8 min-h-[400px] flex flex-col relative overflow-hidden shadow-inner">
                            {selectedComponent ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="px-3 py-1 bg-blue-500 text-white text-[9px] font-black rounded-full w-fit mb-2 uppercase tracking-tighter">Verified Part</div>
                                            <h4 className="text-3xl font-black text-slate-800 leading-none">{selectedComponent.label}</h4>
                                            <p className="text-sm font-black text-blue-500 mt-2 uppercase tracking-widest">{selectedComponent.part_number}</p>
                                        </div>
                                        {selectedComponent.datasheet_url && (
                                            <a 
                                                href={selectedComponent.datasheet_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-14 h-14 bg-white text-blue-500 rounded-2xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-md border-2 border-blue-50"
                                                title="View Technical Datasheet"
                                            >
                                                <ExternalLink size={24} />
                                            </a>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-slate-100">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Lightbulb size={14} className="text-yellow-500" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engineering Insight</p>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                                {selectedComponent.description || 'Connecting to central component library...'}
                                            </p>
                                        </div>
                                        
                                        {selectedComponent.pinout && (
                                            <div className="bg-slate-800 p-5 rounded-2xl border-4 border-slate-900 shadow-2xl">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <List size={14} className="text-blue-300" />
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pinmap Reference</p>
                                                </div>
                                                <div className="bg-slate-900/50 p-4 rounded-xl">
                                                    <p className="text-[11px] mono text-blue-200/90 whitespace-pre-wrap leading-relaxed">
                                                        {selectedComponent.pinout}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-60">
                                    <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl border-4 border-slate-100">
                                        <Cpu className="text-slate-300" size={48} />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-2">No Active Target</h4>
                                    <p className="text-xs font-bold text-slate-300 max-w-[200px] leading-relaxed">Select a component identifier on the spatial map to pull local data packets.</p>
                                </div>
                            )}
                            {/* Decorative Background Icon */}
                            <div className="absolute -bottom-10 -right-10 opacity-[0.05] rotate-45 pointer-events-none">
                                <Cpu size={250} />
                            </div>
                        </div>
                    </div>
                  </div>
               </div>
             )}
          </section>
        </div>
      </main>

      {/* Persistent Status Footer */}
      <footer className="fixed bottom-8 left-0 right-0 p-4 flex justify-center pointer-events-none z-50">
         <div className="glass-morphism px-8 py-3 rounded-full border-4 border-white shadow-2xl pointer-events-auto flex items-center gap-8 animate-in slide-in-from-bottom-4 duration-1000">
           <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse ring-4 ring-green-100"></div>
             <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">System State: Ready</span>
           </div>
           <div className="h-6 w-[2px] bg-slate-200"></div>
           <div className="flex items-center gap-2 text-pink-500">
             <Cpu size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
             <p className="text-[11px] font-black tracking-widest uppercase italic">Neo-AR Neuro-Core v3.0</p>
           </div>
           <div className="h-6 w-[2px] bg-slate-200"></div>
           <p className="text-[9px] font-black text-slate-300 tracking-widest uppercase">© 2025 Neo-AR Systems Inc.</p>
         </div>
      </footer>
    </div>
  );
};

export default App;
