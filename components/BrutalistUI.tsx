import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';

// --- AUDIO UTILS ---

// Helper to create oscillators easily
const createOsc = (ctx: AudioContext, type: OscillatorType, freq: number, start: number, dur: number, vol: number = 0.1) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur);
    return osc;
};

export const playRandomBroSound = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const now = ctx.currentTime;
  const vol = 0.15;

  const sounds = [
      // 1. The "Level Up" (Classic Arpeggio)
      () => {
          createOsc(ctx, 'square', 440, now, 0.1, vol);
          createOsc(ctx, 'square', 554, now + 0.1, 0.1, vol);
          createOsc(ctx, 'square', 659, now + 0.2, 0.3, vol);
      },
      // 2. The "Neural Link" (High Sci-Fi Sine)
      () => {
          createOsc(ctx, 'sine', 880, now, 0.1, vol);
          createOsc(ctx, 'sine', 1760, now + 0.05, 0.3, vol);
      },
      // 3. The "Heavy Drop" (Low Bass Slide)
      () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.4);
      },
      // 4. The "Data Burst" (Random Glitch)
      () => {
          createOsc(ctx, 'square', 200, now, 0.05, vol);
          createOsc(ctx, 'sawtooth', 800, now + 0.05, 0.05, vol);
          createOsc(ctx, 'square', 100, now + 0.1, 0.1, vol);
      },
      // 5. The "Victory" (Major Triad Chord)
      () => {
          createOsc(ctx, 'triangle', 523.25, now, 0.5, vol); // C5
          createOsc(ctx, 'triangle', 659.25, now, 0.5, vol); // E5
          createOsc(ctx, 'triangle', 783.99, now, 0.5, vol); // G5
      },
      // 6. The "Scanner" (Sweep Up)
      () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.linearRampToValueAtTime(880, now + 0.2);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.2);
      },
      // 7. The "Coin" (Fast High Blip)
      () => {
           createOsc(ctx, 'square', 987.77, now, 0.08, vol);
           createOsc(ctx, 'square', 1318.51, now + 0.08, 0.3, vol);
      },
      // 8. The "Secret" (Mystery Chime)
      () => {
          createOsc(ctx, 'sine', 784, now, 0.2, vol);
          createOsc(ctx, 'sine', 1568, now + 0.2, 0.4, vol);
      },
      // 9. The "Power On" (THX-style rise simplified)
      () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(50, now);
          osc.frequency.exponentialRampToValueAtTime(440, now + 0.5);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.5);
      },
      // 10. The "Double Tap" (UI Confirm)
      () => {
          createOsc(ctx, 'sine', 800, now, 0.05, vol);
          createOsc(ctx, 'sine', 800, now + 0.1, 0.05, vol);
      }
  ];

  const randomIndex = Math.floor(Math.random() * sounds.length);
  sounds[randomIndex]();
};

const playClickSound = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  createOsc(ctx, 'square', 150, ctx.currentTime, 0.1, 0.05);
};

// --- COMPONENTS ---

export const BrutalButton = ({ onClick, children, className = '', variant = 'default', disabled = false, style = {}, onMouseDown }: any) => {
  const { soundEnabled } = useStore();
  
  const handleClick = (e: any) => {
    if (soundEnabled && !disabled) playClickSound();
    if (onClick) onClick(e);
  };

  const baseStyles = "relative font-mono font-bold uppercase tracking-wider border-4 border-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 md:px-6 md:py-3 text-sm md:text-base select-none";
  
  const variants: Record<string, string> = {
    default: "bg-white text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
    accent: "bg-[#CCFF00] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
    danger: "bg-red-600 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
    black: "bg-black text-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] border-white hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(204,255,0,1)]"
  };

  return (
    <button 
      onClick={handleClick} 
      onMouseDown={onMouseDown}
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={disabled} 
      style={style}
    >
      {children}
    </button>
  );
};

export const BrutalCard = ({ children, className = '' }: any) => {
  return (
    <div className={`border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 ${className}`}>
      {children}
    </div>
  );
};

export const BrutalBadge = ({ children }: any) => (
  <span className="inline-block bg-black text-[#CCFF00] px-2 py-1 font-mono text-xs border-2 border-[#CCFF00] mr-2 mb-2">
    {children}
  </span>
);

export const BrutalToggle = ({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) => {
  const { soundEnabled } = useStore();
  return (
    <div 
      onClick={() => {
        if(soundEnabled) playClickSound();
        onToggle();
      }}
      className="flex items-center justify-between cursor-pointer group select-none"
    >
      <span className="font-bold uppercase text-sm">{label}</span>
      <div className={`w-12 h-6 border-4 border-black relative transition-colors ${active ? 'bg-[#CCFF00]' : 'bg-gray-300'}`}>
        <div className={`absolute top-[-4px] bottom-[-4px] w-4 bg-black border-2 border-white transition-all ${active ? 'left-[calc(100%-16px)]' : 'left-0'}`} />
      </div>
    </div>
  );
};

export const ProgressBar = ({ current, total }: { current: number, total: number }) => {
  const percent = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="w-full h-6 border-4 border-black bg-white relative">
      <div 
        className="h-full bg-[#CCFF00] transition-all duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold mix-blend-difference text-white">
        PROGRESS: {Math.round(percent)}%
      </div>
    </div>
  );
};

export const DopamineOverlay = ({ onDismiss }: { onDismiss: () => void }) => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="animate-pulse absolute inset-0 bg-[#CCFF00] opacity-10 mix-blend-overlay" />
    <BrutalCard className="max-w-lg w-full text-center border-[#CCFF00] shadow-[16px_16px_0px_0px_#CCFF00]">
      <h2 className="text-6xl font-black mb-4 tracking-tighter text-black italic">
        SPRINT<br/>CRUSHED
      </h2>
      <p className="text-xl font-mono mb-8 bg-black text-white inline-block px-2">
        DOPAMINE HIT ACQUIRED
      </p>
      <div className="grid gap-4">
        <BrutalButton variant="accent" onClick={onDismiss} className="text-xl py-4">
          CONTINUE THE GRIND
        </BrutalButton>
      </div>
    </BrutalCard>
  </div>
);

export const BroModal = ({ content, onClose }: { content: string, onClose: () => void }) => {
  const { soundEnabled } = useStore();
  
  // Play a random successful sound effect when the modal opens
  useEffect(() => {
    if (soundEnabled) {
      playRandomBroSound();
    }
  }, [soundEnabled]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl border-4 border-black bg-white shadow-[16px_16px_0px_0px_#CCFF00] flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
            <div className="bg-black text-white p-3 font-bold flex justify-between items-center text-lg select-none">
                <span className="text-[#CCFF00] font-mono tracking-wider flex items-center gap-2">
                    <span className="animate-pulse">_</span> BRO_BOT.exe
                </span>
                <button 
                    onClick={onClose} 
                    className="hover:text-[#CCFF00] hover:bg-white/10 px-3 py-1 transition-colors font-mono"
                >
                    [CLOSE]
                </button>
            </div>
            
            <div className="p-6 font-mono text-base md:text-lg leading-relaxed whitespace-pre-wrap bg-white text-black overflow-y-auto custom-scrollbar">
                {content}
            </div>
            
            <div className="bg-[#f0f0f0] p-2 text-center border-t-4 border-black font-bold text-xs font-mono uppercase tracking-widest text-gray-500 select-none">
                Gym Bro Intelligence v1.0 // Click outside to dismiss
            </div>
      </div>
    </div>
  );
};