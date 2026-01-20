import React, { useState } from 'react';
import { useStore } from './store/useStore';
import PDFViewer from './components/PDFViewer';
import ControlPanel from './components/ControlPanel';
import { BrutalCard, DopamineOverlay, BroModal } from './components/BrutalistUI';

const App: React.FC = () => {
  const { file, setFile, isSprintComplete, dismissSprintAlert, aiResponse, setAiResponse } = useStore();
  const [selectedText, setSelectedText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-4 font-mono text-black relative overflow-x-hidden scanlines">
      
      {/* Global Overlays */}
      {isSprintComplete && <DopamineOverlay onDismiss={dismissSprintAlert} />}
      {aiResponse && <BroModal content={aiResponse} onClose={() => setAiResponse(null)} />}

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-[#CCFF00] pb-4 z-10 relative">
        <div>
           <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
             FOCUS<span className="text-[#CCFF00]">CRUSHER</span>
           </h1>
           <p className="text-white font-mono mt-2 text-sm uppercase">
             // Brutalist PDF Reader for Neurodivergent Brains
           </p>
        </div>
        
        {!file && (
           <div className="bg-[#CCFF00] px-4 py-2 font-bold border-4 border-white shadow-[4px_4px_0px_0px_white]">
              v0.9.5 [BETA]
           </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto z-10 relative">
        {!file ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <BrutalCard className="max-w-xl w-full text-center py-12 border-dashed">
              <h2 className="text-3xl font-black mb-6">UPLOAD TARGET</h2>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-4 border-black p-8 bg-gray-100 group-hover:bg-[#CCFF00] transition-colors cursor-pointer">
                  <span className="font-bold text-xl block mb-2">DROP PDF HERE</span>
                  <span className="text-sm">(OR CLICK TO SELECT)</span>
                </div>
              </div>
              <p className="mt-8 text-sm font-bold bg-black text-white inline-block px-2">
                SUPPORTED: ACADEMIC PAPERS, BORING MANUALS
              </p>
            </BrutalCard>
          </div>
        ) : (
          <div className="flex gap-4 relative">
            <div className="flex-1 min-w-0">
              <PDFViewer onSelection={setSelectedText} />
            </div>
            
            {/* Control Panel (Floating) */}
            <ControlPanel selectedText={selectedText} />
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="mt-12 text-center text-gray-600 font-mono text-xs pb-4 z-10 relative">
         SYSTEM READY. API KEY STATUS: {process.env.API_KEY ? 'ACTIVE' : 'MISSING'}
      </footer>
    </div>
  );
};

export default App;