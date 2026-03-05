/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTranscription } from "@/hooks/use-transcription";
import { useAudioStore } from "@/lib/stores/audio-store";

beforeEach(() => {
  useAudioStore.getState().reset();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useTranscription", () => {
  it("should call /api/scribe/process when audioBlob is set and not recording", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: "hello world" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const blob = new Blob(["audio"], { type: "audio/webm" });

    renderHook(() => useTranscription());

    await act(async () => {
      useAudioStore.setState({ audioBlob: blob, isRecording: false });
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/scribe/process", {
      method: "POST",
      body: expect.any(FormData),
    });
    expect(useAudioStore.getState().transcribedText).toBe("hello world");
    expect(useAudioStore.getState().isProcessing).toBe(false);

    vi.unstubAllGlobals();
  });

  it("should not transcribe the same blob twice", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: "hello" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const blob = new Blob(["audio"], { type: "audio/webm" });

    const { rerender } = renderHook(() => useTranscription());

    await act(async () => {
      useAudioStore.setState({ audioBlob: blob, isRecording: false });
    });

    // Re-render with the same blob — should NOT trigger another fetch
    rerender();

    expect(mockFetch).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it("should set error when transcription fails", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve(JSON.stringify({ error: "Server error" })),
    });
    vi.stubGlobal("fetch", mockFetch);

    const blob = new Blob(["audio"], { type: "audio/webm" });

    renderHook(() => useTranscription());

    await act(async () => {
      useAudioStore.setState({ audioBlob: blob, isRecording: false });
    });

    expect(useAudioStore.getState().error).toBe("Server error");
    expect(useAudioStore.getState().isProcessing).toBe(false);

    vi.unstubAllGlobals();
  });

  it("should fall back to plain-text error body when JSON parsing fails", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error("invalid json")),
      text: () => Promise.resolve("Bad gateway"),
    });
    vi.stubGlobal("fetch", mockFetch);

    const blob = new Blob(["audio"], { type: "audio/webm" });

    renderHook(() => useTranscription());

    await act(async () => {
      useAudioStore.setState({ audioBlob: blob, isRecording: false });
    });

    expect(useAudioStore.getState().error).toBe("Bad gateway");
    expect(useAudioStore.getState().isProcessing).toBe(false);

    vi.unstubAllGlobals();
  });

  it("should not transcribe while still recording", () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const blob = new Blob(["audio"], { type: "audio/webm" });

    renderHook(() => useTranscription());

    act(() => {
      useAudioStore.setState({ audioBlob: blob, isRecording: true });
    });

    expect(mockFetch).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
