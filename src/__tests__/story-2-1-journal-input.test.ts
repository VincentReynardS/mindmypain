/**
 * Story 2.1: Journal Entry Input (Voice/Text) - Tests
 *
 * Tests cover:
 * - Audio store: new fields (audioBlob, transcribedText, error) and actions
 * - ScribeControls: module export, Calm token usage, touch target compliance
 * - AudioVisualizer: module export, audio-store integration
 * - JournalInput: module export, textarea presence, Calm tokens
 * - API route: POST export verification
 * - Journal page: component integration verification
 */

import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { useAudioStore } from "@/lib/stores/audio-store";

// Pre-load source files for static analysis tests
const scribeControlsSource = fs.readFileSync(
  path.resolve(__dirname, "../components/patient/scribe-controls.tsx"),
  "utf-8"
);
const audioVisualizerSource = fs.readFileSync(
  path.resolve(__dirname, "../components/shared/audio-visualizer.tsx"),
  "utf-8"
);
const journalInputSource = fs.readFileSync(
  path.resolve(__dirname, "../components/patient/journal-input.tsx"),
  "utf-8"
);
const journalPageSource = fs.readFileSync(
  path.resolve(__dirname, "../app/(patient)/journal/page.tsx"),
  "utf-8"
);
const apiRouteSource = fs.readFileSync(
  path.resolve(__dirname, "../app/api/scribe/process/route.ts"),
  "utf-8"
);

describe("Story 2.1: Journal Entry Input (Voice/Text)", () => {
  // -- Audio Store enhancements --

  describe("Audio store", () => {
    beforeEach(() => {
      useAudioStore.getState().reset();
    });

    it("should have audioBlob field initialized to null", () => {
      expect(useAudioStore.getState().audioBlob).toBeNull();
    });

    it("should have transcribedText field initialized to empty string", () => {
      expect(useAudioStore.getState().transcribedText).toBe("");
    });

    it("should have error field initialized to null", () => {
      expect(useAudioStore.getState().error).toBeNull();
    });

    it("should set audioBlob via setAudioBlob", () => {
      const blob = new Blob(["test"], { type: "audio/webm" });
      useAudioStore.getState().setAudioBlob(blob);
      expect(useAudioStore.getState().audioBlob).toBe(blob);
    });

    it("should set transcribedText via setTranscribedText", () => {
      useAudioStore.getState().setTranscribedText("Hello world");
      expect(useAudioStore.getState().transcribedText).toBe("Hello world");
    });

    it("should set error via setError", () => {
      useAudioStore.getState().setError("Mic denied");
      expect(useAudioStore.getState().error).toBe("Mic denied");
    });

    it("should clear error when starting recording", () => {
      useAudioStore.getState().setError("Previous error");
      useAudioStore.getState().startRecording();
      expect(useAudioStore.getState().error).toBeNull();
    });

    it("should reset all new fields on reset()", () => {
      const blob = new Blob(["test"], { type: "audio/webm" });
      useAudioStore.getState().setAudioBlob(blob);
      useAudioStore.getState().setTranscribedText("Hello");
      useAudioStore.getState().setError("Error");

      useAudioStore.getState().reset();

      expect(useAudioStore.getState().audioBlob).toBeNull();
      expect(useAudioStore.getState().transcribedText).toBe("");
      expect(useAudioStore.getState().error).toBeNull();
    });

    // Existing store behavior preserved
    it("should toggle isRecording on start/stop", () => {
      useAudioStore.getState().startRecording();
      expect(useAudioStore.getState().isRecording).toBe(true);

      useAudioStore.getState().stopRecording();
      expect(useAudioStore.getState().isRecording).toBe(false);
    });

    it("should set processing state", () => {
      useAudioStore.getState().setProcessing(true);
      expect(useAudioStore.getState().isProcessing).toBe(true);

      useAudioStore.getState().setProcessing(false);
      expect(useAudioStore.getState().isProcessing).toBe(false);
    });
  });

  // -- ScribeControls component --

  describe("ScribeControls component", () => {
    it("should export ScribeControls as a named function", async () => {
      const mod = await import("@/components/patient/scribe-controls");
      expect(mod.ScribeControls).toBeDefined();
      expect(typeof mod.ScribeControls).toBe("function");
    });

    it("should use Calm design tokens", () => {
      expect(scribeControlsSource).toContain("bg-calm-blue");
      expect(scribeControlsSource).toContain("text-calm-text-muted");
    });

    it("should have touch-target compliant buttons (>=44px = h-14 w-14 = 56px)", () => {
      expect(scribeControlsSource).toContain("h-14");
      expect(scribeControlsSource).toContain("w-14");
    });

    it("should have aria-label on mic and stop buttons", () => {
      expect(scribeControlsSource).toContain('aria-label="Start recording"');
      expect(scribeControlsSource).toContain('aria-label="Stop recording"');
    });

    it("should have a processing state with aria-label", () => {
      expect(scribeControlsSource).toContain('aria-label="Processing audio"');
    });

    it("should import useAudioStore from audio-store", () => {
      expect(scribeControlsSource).toContain("useAudioStore");
      expect(scribeControlsSource).toContain("@/lib/stores/audio-store");
    });

    it("should import useAudioRecorder hook", () => {
      expect(scribeControlsSource).toContain("useAudioRecorder");
    });
  });

  // -- AudioVisualizer component --

  describe("AudioVisualizer component", () => {
    it("should export AudioVisualizer as a named function", async () => {
      const mod = await import("@/components/shared/audio-visualizer");
      expect(mod.AudioVisualizer).toBeDefined();
      expect(typeof mod.AudioVisualizer).toBe("function");
    });

    it("should import useAudioStore from audio-store", () => {
      expect(audioVisualizerSource).toContain("useAudioStore");
      expect(audioVisualizerSource).toContain("@/lib/stores/audio-store");
    });

    it("should use Calm design tokens for bars", () => {
      expect(audioVisualizerSource).toContain("bg-calm-blue");
    });

    it("should use framer-motion for animation", () => {
      expect(audioVisualizerSource).toContain("framer-motion");
      expect(audioVisualizerSource).toContain("motion.");
    });
  });

  // -- JournalInput component --

  describe("JournalInput component", () => {
    it("should export JournalInput as a named function", async () => {
      const mod = await import("@/components/patient/journal-input");
      expect(mod.JournalInput).toBeDefined();
      expect(typeof mod.JournalInput).toBe("function");
    });

    it("should contain a textarea element", () => {
      expect(journalInputSource).toContain("<textarea");
    });

    it("should use Calm design tokens", () => {
      expect(journalInputSource).toContain("bg-calm-surface-raised");
      expect(journalInputSource).toContain("text-calm-text");
    });

    it("should import useAudioStore for transcribed text", () => {
      expect(journalInputSource).toContain("useAudioStore");
      expect(journalInputSource).toContain("transcribedText");
    });

    it("should have an accessible label", () => {
      expect(journalInputSource).toContain("journal-input");
    });
  });

  // -- API Route --

  describe("Scribe API route", () => {
    it("should export POST function (verified via static analysis)", () => {
      // Cannot dynamically import because route.ts uses server-only OpenAI client.
      // Verify export via source analysis.
      expect(apiRouteSource).toContain("export async function POST");
    });

    it("should reference Whisper model in source", () => {
      expect(apiRouteSource).toContain("whisper-1");
    });

    it("should call getOpenAIClient", () => {
      expect(apiRouteSource).toContain("getOpenAIClient");
    });

    it("should handle missing audio file with 400 response", () => {
      expect(apiRouteSource).toContain("400");
      expect(apiRouteSource).toContain("No audio file provided");
    });

    it("should validate file size with 413 response", () => {
      expect(apiRouteSource).toContain("413");
      expect(apiRouteSource).toContain("25MB");
    });

    it("should validate MIME type with 415 response", () => {
      expect(apiRouteSource).toContain("415");
      expect(apiRouteSource).toContain("Unsupported file type");
    });
  });

  // -- useAudioRecorder hook --

  describe("useAudioRecorder hook", () => {
    const recorderSource = fs.readFileSync(
      path.resolve(__dirname, "../hooks/use-audio-recorder.ts"),
      "utf-8"
    );

    it("should use consistent store access via getState()", () => {
      // Should NOT destructure actions at top level
      const destructurePattern =
        /const\s*\{[^}]*\}\s*=\s*useAudioStore\.getState\(\)/;
      const topLevelDestructures = recorderSource
        .split("\n")
        .filter(
          (line) =>
            destructurePattern.test(line) && !line.trim().startsWith("//")
        );
      expect(topLevelDestructures.length).toBe(0);
    });
  });

  // -- ScribeControls duplicate guard --

  describe("ScribeControls duplicate transcription guard", () => {
    it("should have a ref guard to prevent duplicate transcription", () => {
      expect(scribeControlsSource).toContain("transcribedBlobRef");
    });
  });

  // -- AudioVisualizer accessibility --

  describe("AudioVisualizer accessibility", () => {
    it("should not have contradictory aria-hidden with role", () => {
      expect(audioVisualizerSource).not.toContain('aria-hidden="true"');
      expect(audioVisualizerSource).toContain('role="img"');
    });
  });

  // -- Journal Page Integration --

  describe("Journal page integration", () => {
    it("should export JournalPage as default function", async () => {
      const mod = await import("@/app/(patient)/journal/page");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });

    it("should import JournalInput component", () => {
      expect(journalPageSource).toContain("JournalInput");
      expect(journalPageSource).toContain(
        "@/components/patient/journal-input"
      );
    });

    it("should import ScribeControls component", () => {
      expect(journalPageSource).toContain("ScribeControls");
      expect(journalPageSource).toContain(
        "@/components/patient/scribe-controls"
      );
    });

    it("should import AudioVisualizer component", () => {
      expect(journalPageSource).toContain("AudioVisualizer");
      expect(journalPageSource).toContain(
        "@/components/shared/audio-visualizer"
      );
    });

    it("should be marked as a client component", () => {
      expect(journalPageSource).toContain('"use client"');
    });
  });
});
