/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { MyDetailForm } from "@/components/patient/my-detail-form";
import { useUserStore } from "@/lib/stores/user-store";
import { getTodayDDMMYYYY, toYYYYMMDD } from "@/lib/utils/date-helpers";

const mockGetProfile = vi.fn();
const mockUpsertProfile = vi.fn();

vi.mock("@/app/actions/profile-actions", () => ({
  getProfile: (userId: string) => mockGetProfile(userId),
  upsertProfile: (userId: string, payload: unknown) => mockUpsertProfile(userId, payload),
}));

function buildProfile(overrides: Record<string, unknown> = {}) {
  return {
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
    ...overrides,
  };
}

describe("MyDetailForm date of birth picker", () => {
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

  it("renders the date of birth field as a native date picker", async () => {
    render(<MyDetailForm />);

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledWith("sarah");
    });

    const dobInput = screen.getByLabelText(/date of birth/i) as HTMLInputElement;
    expect(dobInput.type).toBe("date");
  });

  it("formats the picked date to dd-mm-yyyy for the backend schema on save", async () => {
    mockUpsertProfile.mockResolvedValue(buildProfile());

    render(<MyDetailForm />);

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledWith("sarah");
    });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Sarah Thompson" },
    });
    // Native date inputs emit yyyy-mm-dd; the form must convert to dd-mm-yyyy.
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: "2026-03-12" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(mockUpsertProfile).toHaveBeenCalledWith(
        "sarah",
        expect.objectContaining({
          full_name: "Sarah Thompson",
          dob: "12-03-2026",
        })
      );
    });

    expect(await screen.findByText("Profile saved.")).toBeTruthy();
  });

  it("pre-fills the picker from a stored dd-mm-yyyy profile in native yyyy-mm-dd format", async () => {
    mockGetProfile.mockResolvedValue(buildProfile({ dob: "12-03-2026" }));

    render(<MyDetailForm />);

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledWith("sarah");
    });

    const dobInput = screen.getByLabelText(/date of birth/i) as HTMLInputElement;
    await waitFor(() => {
      expect(dobInput.value).toBe("2026-03-12");
    });
  });

  it("leaves the date of birth empty for a fresh (guest) profile", async () => {
    mockGetProfile.mockResolvedValue(null);

    render(<MyDetailForm />);

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledWith("sarah");
    });

    const dobInput = screen.getByLabelText(/date of birth/i) as HTMLInputElement;
    expect(dobInput.value).toBe("");
  });

  it("does not persist a date of birth that was never entered", async () => {
    mockGetProfile.mockResolvedValue(buildProfile({ dob: null }));
    mockUpsertProfile.mockResolvedValue(buildProfile({ dob: null }));

    render(<MyDetailForm />);

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledWith("sarah");
    });

    const dobInput = screen.getByLabelText(/date of birth/i) as HTMLInputElement;
    expect(dobInput.value).toBe("");

    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(mockUpsertProfile).toHaveBeenCalledWith(
        "sarah",
        expect.objectContaining({ dob: null })
      );
    });
  });

  it("caps the date of birth picker at today (no future dates)", async () => {
    mockGetProfile.mockResolvedValue(null);

    render(<MyDetailForm />);

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledWith("sarah");
    });

    const dobInput = screen.getByLabelText(/date of birth/i) as HTMLInputElement;
    expect(dobInput.max).toBe(toYYYYMMDD(getTodayDDMMYYYY()));
  });

  it("renders Medicare Valid To as a native date picker and formats it to dd-mm-yyyy on save", async () => {
    mockGetProfile.mockResolvedValue(buildProfile({ medicare_valid_to: null }));
    mockUpsertProfile.mockResolvedValue(buildProfile());

    render(<MyDetailForm />);

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledWith("sarah");
    });

    const medicareInput = screen.getByLabelText(/medicare valid to/i) as HTMLInputElement;
    expect(medicareInput.type).toBe("date");

    fireEvent.change(medicareInput, { target: { value: "2030-09-15" } });
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(mockUpsertProfile).toHaveBeenCalledWith(
        "sarah",
        expect.objectContaining({ medicare_valid_to: "15-09-2030" })
      );
    });
  });

  it("pre-fills Medicare Valid To from a stored dd-mm-yyyy profile", async () => {
    mockGetProfile.mockResolvedValue(buildProfile({ medicare_valid_to: "15-09-2030" }));

    render(<MyDetailForm />);

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledWith("sarah");
    });

    const medicareInput = screen.getByLabelText(/medicare valid to/i) as HTMLInputElement;
    await waitFor(() => {
      expect(medicareInput.value).toBe("2030-09-15");
    });
  });

  it("clears the stored date when the picker is emptied", async () => {
    mockGetProfile.mockResolvedValue(buildProfile({ dob: "12-03-2026" }));
    mockUpsertProfile.mockResolvedValue(buildProfile({ dob: null }));

    render(<MyDetailForm />);

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledWith("sarah");
    });

    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(mockUpsertProfile).toHaveBeenCalledWith(
        "sarah",
        expect.objectContaining({ dob: null })
      );
    });
  });
});
