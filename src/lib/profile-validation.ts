import { z } from "zod";

import type { UpdateProfile } from "@/types/database";

const DD_MM_YYYY_REGEX = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

const nullableTrimmedString = z.union([z.string(), z.null()]).transform((value) => {
  if (value === null) return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
});

const optionalNullableTrimmedString = nullableTrimmedString.optional();

export type ProfileValidationErrors = Partial<
  Record<"full_name" | "dob" | "email" | "medicare_valid_to", string>
>;

const profilePayloadSchema = z.object({
  full_name: nullableTrimmedString.refine((value) => value !== null, {
    message: "Full Name is required.",
  }),
  dob: optionalNullableTrimmedString.refine(
    (value) => value === undefined || value === null || DD_MM_YYYY_REGEX.test(value),
    {
      message: "Date of Birth must use dd-mm-yyyy.",
    }
  ),
  address_line_1: optionalNullableTrimmedString,
  address_line_2: optionalNullableTrimmedString,
  email: optionalNullableTrimmedString.refine(
    (value) => value === undefined || value === null || z.email().safeParse(value).success,
    {
      message: "Please enter a valid email address.",
    }
  ),
  mobile_phone: optionalNullableTrimmedString,
  home_phone: optionalNullableTrimmedString,
  medicare_irn: optionalNullableTrimmedString,
  medicare_valid_to: optionalNullableTrimmedString.refine(
    (value) => value === undefined || value === null || DD_MM_YYYY_REGEX.test(value),
    {
      message: "Medicare Valid To must use dd-mm-yyyy.",
    }
  ),
  phi_name: optionalNullableTrimmedString,
  phi_number: optionalNullableTrimmedString,
  is_organ_donor: z.boolean().optional(),
  emergency_contact_name: optionalNullableTrimmedString,
  emergency_contact_relationship: optionalNullableTrimmedString,
  emergency_contact_mobile: optionalNullableTrimmedString,
  languages_spoken: optionalNullableTrimmedString,
  is_aboriginal: z.boolean().optional(),
  is_torres_strait_islander: z.boolean().optional(),
  allergies: optionalNullableTrimmedString,
});

export function resolveProfileRecordId(personaId: string) {
  return personaId.startsWith("guest_") ? "guest" : personaId;
}

export function validateProfilePayload(payload: UpdateProfile) {
  return profilePayloadSchema.safeParse(payload);
}

export function getProfileValidationErrors(payload: UpdateProfile): ProfileValidationErrors {
  const parsed = validateProfilePayload(payload);
  if (parsed.success) return {};

  const fieldErrors = parsed.error.flatten().fieldErrors;

  return {
    full_name: fieldErrors.full_name?.[0],
    dob: fieldErrors.dob?.[0],
    email: fieldErrors.email?.[0],
    medicare_valid_to: fieldErrors.medicare_valid_to?.[0],
  };
}
