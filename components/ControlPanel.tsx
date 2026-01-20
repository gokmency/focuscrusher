import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { BrutalButton, BrutalCard, BrutalToggle } from './BrutalistUI';
import { explainLikeABro } from '../services/geminiService';

interface ControlPanelProps {
  selectedText: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ selectedText }) => {
  const { 
    isTunnelMode, toggleTunnelMode, 
    isSprintActive, toggleSprint, sprintTimeRemaining, decrementSprintTimer,
    isBionic, toggleBionic,
    soundEnabled, toggleSound,
    setAiResponse, setAiLoading, isAiLoading
  } = useStore();

  const [isExpanded, setIsExpanded] = useState(true);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (isSprintActive && sprintTimeRemaining > 0) {
      interval = setInterval(() => {
        decrementSprintTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSprintActive, sprintTimeRemaining, decrementSprintTimer]);

  const handleExplain = async () => {
    if (!selectedText) return;
    setAiLoading(true);
    const result = await explainLikeABro(selectedText);
    setAiResponse(result);
    setAiLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 w-full md:w-96 flex flex-col gap-4 max-h-[100vh] z-50 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-4 items-end">
        
        {/* Toggle Panel Visibility */}
        <BrutalButton 
           variant="black" 
           onClick={() => setIsExpanded(!isExpanded)}
           className="min-w-[60px]"
        >
           {isExpanded ? '_' : '^'}
        </BrutalButton>

        {isExpanded && (
          <div className="w-full flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-200">
            {/* Sprint Timer */}
            <BrutalCard className="bg-[#CCFF00]">
              <h3 className="font-black text-2xl mb-2">SPRINT TIMER</h3>
              <div className="text-6xl font-mono font-bold mb-4 bg-black text-[#CCFF00] p-2 text-center border-4 border-white">
                {formatTime(sprintTimeRemaining)}
              </div>
              <BrutalButton 
                onClick={toggleSprint} 
                className="w-full" 
                variant={isSprintActive ? 'danger' : 'black'}
              >
                {isSprintActive ? 'ABORT SPRINT' : 'START SPRINT'}
              </BrutalButton>
            </BrutalCard>

            {/* Tools */}
            <BrutalCard>
              <h3 className="font-black text-xl mb-4 uppercase">Tool Belt</h3>
              
              <div className="flex flex-col gap-4">
                <BrutalToggle label="Tunnel Vision" active={isTunnelMode} onToggle={toggleTunnelMode} />
                <BrutalToggle label="Bionic Text" active={isBionic} onToggle={toggleBionic} />
                <BrutalToggle label="SFX" active={soundEnabled} onToggle={toggleSound} />

                {/* AI Explainer */}
                <div className="mt-2 border-t-4 border-black pt-4">
                  <p className="font-mono text-xs mb-2 text-gray-600 truncate">
                    {selectedText ? `SELECTED: "${selectedText.substring(0, 20)}..."` : "SELECT TEXT TO UNLOCK"}
                  </p>
                  <BrutalButton 
                    onClick={handleExplain} 
                    className="w-full py-4 text-lg leading-none" 
                    variant="accent"
                    disabled={!selectedText || isAiLoading}
                  >
                    {isAiLoading ? "PROCESSING..." : "WTF DOES THIS MEAN?"}
                  </BrutalButton>
                </div>
              </div>
            </BrutalCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;