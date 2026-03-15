/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useUserStore } from "@/lib/stores/user-store";
import { PersonaSelector } from "@/components/patient/persona-selector";
import HilaryLoginPage from "@/app/hilary/page";

const mockPush = vi.fn();
const mockVerifyHilaryPassword = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/app/hilary/actions", () => ({
  verifyHilaryPassword: (password: string) => mockVerifyHilaryPassword(password),
}));

describe("Story 6.6: Hilary login UI flow", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockVerifyHilaryPassword.mockReset();

    useUserStore.setState({
      personaId: null,
      personaName: null,
      personaIconBg: "bg-calm-surface-raised",
      personaIconText: "text-calm-text-muted",
      isSelected: false,
    });
  });

  it("does not expose Hilary on public persona selector", () => {
    render(<PersonaSelector />);

    expect(
      screen.queryByRole("button", { name: "Start as Hilary" })
    ).toBeNull();
    expect(useUserStore.getState().personaId).toBeNull();
  });

  it("shows an error and does not navigate on invalid password", async () => {
    mockVerifyHilaryPassword.mockResolvedValue(false);

    render(<HilaryLoginPage />);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockVerifyHilaryPassword).toHaveBeenCalledWith("wrong-password");
    });

    expect(screen.getByRole("alert").textContent).toContain("Incorrect password");
    expect(mockPush).not.toHaveBeenCalledWith("/home");
    expect(useUserStore.getState().personaId).toBeNull();
  });

  it("sets Hilary persona and redirects to /journal on valid password", async () => {
    mockVerifyHilaryPassword.mockResolvedValue(true);

    render(<HilaryLoginPage />);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "test-secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/home");
    });

    const state = useUserStore.getState();
    expect(state.personaId).toBe("hilary");
    expect(state.personaName).toBe("Hilary");
  });
});
