"use client";

/**
 * useAudioRecorder - Custom hook wrapping MediaRecorder + Web Audio API
 *
 * Handles:
 * - Microphone permission via navigator.mediaDevices.getUserMedia
 * - MediaRecorder for audio capture (webm/opus format)
 * - Web Audio API AnalyserNode for real-time volume levels
 * - Duration tracking via interval
 * - Cleanup on unmount
 *
 * Integrates with useAudioStore for global state.
 *
 * @see architecture.md - Audio Pipeline
 * @see ux-design-specification.md - "Living Draft" visual metaphor
 */

import { useRef, useCallback, useEffect } from "react";
import { useAudioStore } from "@/lib/stores/audio-store";

export function useAudioRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const chunksRef = useRef<Blob[]>([]);

  /**
   * Continuously read volume from AnalyserNode and push to store.
   */
  const updateVolume = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(dataArray);

    // Calculate RMS volume (0-1 range)
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const sample = (dataArray[i] - 128) / 128;
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const normalized = Math.min(1, rms * 3); // Amplify for visual impact

    useAudioStore.getState().setVolume(normalized);
    animFrameRef.current = requestAnimationFrame(updateVolume);
  }, []);

  /**
   * Start recording audio from the microphone.
   */
  const startRecording = useCallback(async () => {
    try {
      // Reset previous state
      useAudioStore.getState().reset();
      chunksRef.current = [];

      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up Web Audio API for volume analysis
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        useAudioStore.getState().setAudioBlob(blob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250); // collect data every 250ms

      // Start volume updates
      updateVolume();

      // Start duration tracking
      const startTime = Date.now();
      durationIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        useAudioStore.getState().setDuration(elapsed);
      }, 100);

      // Update store
      useAudioStore.getState().startRecording();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Microphone access denied";
      useAudioStore.getState().setError(message);
    }
  }, [updateVolume]);

  /**
   * Stop recording and finalize the audio blob.
   */
  const stopRecording = useCallback(() => {
    // Stop MediaRecorder
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    // Stop volume animation
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // Stop duration tracking
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Update store
    useAudioStore.getState().stopRecording();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { startRecording, stopRecording };
}
