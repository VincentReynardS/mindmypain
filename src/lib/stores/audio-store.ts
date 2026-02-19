/**
 * Audio Store - Manages global audio recording state
 *
 * Architecture: Zustand store for AudioRecorder singleton state.
 * ALWAYS use atomic selectors to prevent re-renders:
 *   const isRecording = useAudioStore((state) => state.isRecording);
 *
 * @see architecture.md - State Management (Decision 4)
 */

import { create } from "zustand";

export interface AudioState {
  isRecording: boolean;
  isPaused: boolean;
  isProcessing: boolean;
  duration: number;
  volume: number;
  audioBlob: Blob | null;
  transcribedText: string;
  error: string | null;
  startRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  setProcessing: (processing: boolean) => void;
  setVolume: (volume: number) => void;
  setDuration: (duration: number) => void;
  setAudioBlob: (blob: Blob | null) => void;
  setTranscribedText: (text: string) => void;
  setError: (error: string | null) => void;
  resetTranscribedText: () => void;
  reset: () => void;
}

const initialState = {
  isRecording: false,
  isPaused: false,
  isProcessing: false,
  duration: 0,
  volume: 0,
  audioBlob: null as Blob | null,
  transcribedText: "",
  error: null as string | null,
};

export const useAudioStore = create<AudioState>((set) => ({
  ...initialState,
  startRecording: () =>
    set({ isRecording: true, isPaused: false, error: null }),
  pauseRecording: () => set({ isPaused: true }),
  resumeRecording: () => set({ isPaused: false }),
  stopRecording: () => set({ isRecording: false, isPaused: false }),
  setProcessing: (isProcessing: boolean) => set({ isProcessing }),
  setVolume: (volume: number) => set({ volume }),
  setDuration: (duration: number) => set({ duration }),
  setAudioBlob: (audioBlob: Blob | null) => set({ audioBlob }),
  setTranscribedText: (transcribedText: string) => set({ transcribedText }),
  setError: (error: string | null) => set({ error }),
  resetTranscribedText: () => set({ transcribedText: "" }),
  reset: () => set(initialState),
}));
