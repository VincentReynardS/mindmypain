/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { MyDetailForm } from "@/components/patient/my-detail-form";
import { useUserStore } from "@/lib/stores/user-store";

const mockGetProfile = vi.fn();
const mockUpsertProfile = vi.fn();

vi.mock("@/app/actions/profile-actions", () => ({
  getProfile: (userId: string) => mockGetProfile(userId),
  upsertProfile: (userId: string, payload: unknown) => mockUpsertProfile(userId, payload),
}));

describe("MyDetailForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useUserStore.setState({
      personaId: "sarah",
      personaName: "Sarah",
      personaIconBg: "bg-calm-blue-soft",
      personaIconText: "text-calm-blue",
      isSelected: true,
    });

    mockGetProfile.mockResolvedValue(null);
  });

  it("blocks invalid dd-mm-yyyy input before save", async () => {
    render(<MyDetailForm />);

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledWith("sarah");
    });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Sarah Thompson" },
    });
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: "2026-03-12" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    expect(screen.getAllByText("Date of Birth must use dd-mm-yyyy.").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/date of birth/i).getAttribute("aria-invalid")).toBe("true");
    expect(mockUpsertProfile).not.toHaveBeenCalled();
  });

  it("saves valid data and refreshes the form from the returned profile", async () => {
    mockUpsertProfile.mockResolvedValue({
      id: "sarah",
      full_name: "Sarah Thompson",
      dob: "12-03-2026",
      address_line_1: null,
      address_line_2: null,
      email: "sarah@example.com",
      mobile_phone: null,
      home_phone: null,
      medicare_irn: null,
      medicare_valid_to: null,
      phi_name: null,
      phi_number: null,
      is_organ_donor: false,
      emergency_contact_name: null,
      emergency_contact_relationship: null,
      emergency_contact_mobile: null,
      languages_spoken: null,
      is_aboriginal: false,
      is_torres_strait_islander: false,
      allergies: null,
      created_at: "2026-03-12T00:00:00.000Z",
      updated_at: "2026-03-12T00:00:00.000Z",
    });

    render(<MyDetailForm />);

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledWith("sarah");
    });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: " Sarah Thompson " },
    });
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: "12-03-2026" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "sarah@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(mockUpsertProfile).toHaveBeenCalledWith(
        "sarah",
        expect.objectContaining({
          full_name: " Sarah Thompson ",
          dob: "12-03-2026",
          email: "sarah@example.com",
        })
      );
    });

    expect(await screen.findByText("Profile saved.")).toBeTruthy();
    expect((screen.getByLabelText(/full name/i) as HTMLInputElement).value).toBe(
      "Sarah Thompson"
    );
  });
});
