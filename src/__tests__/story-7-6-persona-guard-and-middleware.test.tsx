/**
 * @vitest-environment jsdom
 */

import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { NextRequest } from "next/server";
import { PersonaGuard } from "@/components/shared/persona-guard";
import { middleware } from "@/middleware";

const {
  mockReplace,
  mockUpdateSession,
  mockHasHydrated,
  mockOnFinishHydration,
  mockStoreState,
  mockUseUserStore,
} = vi.hoisted(() => {
  const mockReplace = vi.fn();
  const mockUpdateSession = vi.fn();
  const mockHasHydrated = vi.fn();
  const mockOnFinishHydration = vi.fn();
  const mockStoreState = {
    isSelected: true,
  };
  const mockUseUserStore = Object.assign(
    (selector: (state: typeof mockStoreState) => unknown) =>
      selector(mockStoreState),
    {
      persist: {
        hasHydrated: mockHasHydrated,
        onFinishHydration: mockOnFinishHydration,
      },
    }
  );

  return {
    mockReplace,
    mockUpdateSession,
    mockHasHydrated,
    mockOnFinishHydration,
    mockStoreState,
    mockUseUserStore,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock("@/lib/stores/user-store", () => ({
  useUserStore: mockUseUserStore,
}));

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: (request: NextRequest) => mockUpdateSession(request),
}));

describe("Story 7.6: PersonaGuard hydration and middleware", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockUpdateSession.mockReset();
    mockHasHydrated.mockReset();
    mockOnFinishHydration.mockReset();
    mockStoreState.isSelected = true;
  });

  it("renders children immediately when hydration already completed", () => {
    mockHasHydrated.mockReturnValue(true);
    mockOnFinishHydration.mockReturnValue(() => {});

    render(
      <PersonaGuard>
        <div>Protected content</div>
      </PersonaGuard>
    );

    expect(screen.getByText("Protected content")).toBeTruthy();
    expect(screen.queryByText("Protected content")).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("waits for hydration callback before rendering protected content", async () => {
    mockHasHydrated.mockReturnValue(false);

    let finishHydration: (() => void) | undefined;
    mockOnFinishHydration.mockImplementation((callback: () => void) => {
      finishHydration = callback;
      return () => {};
    });

    const { container } = render(
      <PersonaGuard>
        <div>Protected content</div>
      </PersonaGuard>
    );

    expect(screen.queryByText("Protected content")).toBeNull();
    expect(container.querySelector(".animate-spin")).toBeTruthy();

    act(() => {
      finishHydration?.();
    });

    await waitFor(() => {
      expect(screen.getByText("Protected content")).toBeTruthy();
    });
  });

  it("redirects to the landing page after hydration when no persona is selected", async () => {
    mockStoreState.isSelected = false;
    mockHasHydrated.mockReturnValue(true);
    mockOnFinishHydration.mockReturnValue(() => {});

    render(
      <PersonaGuard>
        <div>Protected content</div>
      </PersonaGuard>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("middleware delegates to updateSession without adding persona redirects", async () => {
    const expectedResponse = { ok: true };
    mockUpdateSession.mockResolvedValue(expectedResponse);
    const request = {} as NextRequest;

    const response = await middleware(request);

    expect(mockUpdateSession).toHaveBeenCalledWith(request);
    expect(response).toBe(expectedResponse);
  });
});
