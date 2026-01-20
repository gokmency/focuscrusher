import { create } from 'zustand';

interface AppState {
  file: File | null;
  numPages: number;
  currentPage: number;
  scale: number;
  isTunnelMode: boolean;
  isSprintActive: boolean;
  isSprintComplete: boolean;
  sprintTimeRemaining: number; // in seconds
  isBionic: boolean;
  soundEnabled: boolean;
  
  // AI State
  aiResponse: string | null;
  isAiLoading: boolean;
  
  setFile: (file: File) => void;
  setNumPages: (num: number) => void;
  setCurrentPage: (page: number) => void;
  setScale: (scale: number) => void;
  toggleTunnelMode: () => void;
  toggleSprint: () => void;
  decrementSprintTimer: () => void;
  resetSprintTimer: () => void;
  completeSprint: () => void;
  dismissSprintAlert: () => void;
  toggleBionic: () => void;
  toggleSound: () => void;
  
  // AI Actions
  setAiResponse: (response: string | null) => void;
  setAiLoading: (loading: boolean) => void;
}

const SPRINT_DURATION = 180; // 3 minutes

export const useStore = create<AppState>((set) => ({
  file: null,
  numPages: 0,
  currentPage: 1,
  scale: 1.2,
  isTunnelMode: false,
  isSprintActive: false,
  isSprintComplete: false,
  sprintTimeRemaining: SPRINT_DURATION,
  isBionic: true,
  soundEnabled: true,
  
  aiResponse: null,
  isAiLoading: false,

  setFile: (file) => set({ file, currentPage: 1, numPages: 0 }),
  setNumPages: (numPages) => set({ numPages }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setScale: (scale) => set({ scale }),
  toggleTunnelMode: () => set((state) => ({ isTunnelMode: !state.isTunnelMode })),
  
  toggleSprint: () => set((state) => ({ 
    isSprintActive: !state.isSprintActive,
    sprintTimeRemaining: state.isSprintActive ? SPRINT_DURATION : state.sprintTimeRemaining,
    isSprintComplete: false
  })),
  
  decrementSprintTimer: () => set((state) => {
    const newTime = state.sprintTimeRemaining - 1;
    if (newTime <= 0) {
        return { sprintTimeRemaining: 0, isSprintActive: false, isSprintComplete: true };
    }
    return { sprintTimeRemaining: newTime };
  }),
  
  resetSprintTimer: () => set({ sprintTimeRemaining: SPRINT_DURATION, isSprintActive: false, isSprintComplete: false }),
  completeSprint: () => set({ isSprintActive: false, isSprintComplete: true }),
  dismissSprintAlert: () => set({ isSprintComplete: false, sprintTimeRemaining: SPRINT_DURATION }),
  
  toggleBionic: () => set((state) => ({ isBionic: !state.isBionic })),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  
  setAiResponse: (response) => set({ aiResponse: response }),
  setAiLoading: (loading) => set({ isAiLoading: loading }),
}));