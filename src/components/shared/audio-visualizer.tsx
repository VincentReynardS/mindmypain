"use client";

/**
 * AudioVisualizer - Real-time waveform feedback during voice recording.
 *
 * Reads volume from useAudioStore via atomic selector and renders
 * animated bars that react to audio levels. Uses framer-motion
 * for smooth "calm" animations consistent with the UX spec.
 *
 * Only renders when isRecording === true.
 *
 * @see ux-design-specification.md - "Living Draft" visual metaphor
 * @see ux-design-specification.md - "Waveform" pattern from Voice Memos
 */

import { motion } from "framer-motion";
import { useAudioStore } from "@/lib/stores/audio-store";

const BAR_COUNT = 5;

export function AudioVisualizer() {
  const isRecording = useAudioStore((s) => s.isRecording);
  const volume = useAudioStore((s) => s.volume);

  if (!isRecording) return null;

  return (
    <div
      className="flex items-center justify-center gap-1 py-4"
      role="img"
      aria-label="Audio level visualizer"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        // Each bar gets a slightly different height based on volume + position
        const offset = Math.sin((i / BAR_COUNT) * Math.PI);
        const barHeight = 8 + volume * 32 * offset;

        return (
          <motion.div
            key={i}
            className="w-1.5 rounded-full bg-calm-blue"
            animate={{
              height: Math.max(8, barHeight),
            }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
            style={{ minHeight: 8 }}
          />
        );
      })}
    </div>
  );
}
