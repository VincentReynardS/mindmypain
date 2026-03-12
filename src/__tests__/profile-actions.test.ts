import { beforeEach, describe, expect, it, vi } from "vitest";

import { getProfile, upsertProfile } from "@/app/actions/profile-actions";

const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockSelect = vi.fn();
const mockUpsert = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
    })
  ),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from "next/cache";

describe("Profile server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockEq.mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });

    mockSelect.mockReturnValue({
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
    });

    mockUpsert.mockReturnValue({
      select: mockSelect,
    });

    mockFrom.mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
    });
  });

  it("normalizes guest profile IDs during reads", async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

    await getProfile("guest_12345_demo");

    expect(mockEq).toHaveBeenCalledWith("id", "guest");
  });

  it("normalizes guest profile IDs during upserts and returns saved data", async () => {
    const savedProfile = {
      id: "guest",
      full_name: "Guest User",
      dob: "12-03-2026",
      address_line_1: null,
      address_line_2: null,
      email: null,
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
    };

    mockMaybeSingle.mockResolvedValueOnce({ data: savedProfile, error: null });

    const result = await upsertProfile("guest_987", {
      full_name: " Guest User ",
      dob: "12-03-2026",
      is_organ_donor: false,
      is_aboriginal: false,
      is_torres_strait_islander: false,
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "guest",
        full_name: "Guest User",
      }),
      { onConflict: "id" }
    );
    expect(revalidatePath).toHaveBeenCalledWith("/profile/my-detail");
    expect(result).toEqual(savedProfile);
  });

  it("rejects invalid dd-mm-yyyy dates before writing", async () => {
    await expect(
      upsertProfile("sarah", {
        full_name: "Sarah",
        dob: "2026-03-12",
        is_organ_donor: false,
        is_aboriginal: false,
        is_torres_strait_islander: false,
      })
    ).rejects.toThrow("Date of Birth must use dd-mm-yyyy.");

    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
