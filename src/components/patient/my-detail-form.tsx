"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/lib/stores/user-store";
import { getProfile, upsertProfile } from "@/app/actions/profile-actions";
import { Profile } from "@/types/database";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import {
  getProfileValidationErrors,
  type ProfileValidationErrors,
} from "@/lib/profile-validation";

interface ProfileFormData {
  full_name: string;
  dob: string;
  address_line_1: string;
  address_line_2: string;
  email: string;
  mobile_phone: string;
  home_phone: string;
  medicare_irn: string;
  medicare_valid_to: string;
  phi_name: string;
  phi_number: string;
  is_organ_donor: boolean;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_mobile: string;
  languages_spoken: string;
  is_aboriginal: boolean;
  is_torres_strait_islander: boolean;
  allergies: string;
}

const emptyForm: ProfileFormData = {
  full_name: "",
  dob: "",
  address_line_1: "",
  address_line_2: "",
  email: "",
  mobile_phone: "",
  home_phone: "",
  medicare_irn: "",
  medicare_valid_to: "",
  phi_name: "",
  phi_number: "",
  is_organ_donor: false,
  emergency_contact_name: "",
  emergency_contact_relationship: "",
  emergency_contact_mobile: "",
  languages_spoken: "",
  is_aboriginal: false,
  is_torres_strait_islander: false,
  allergies: "",
};

function profileToForm(profile: Profile): ProfileFormData {
  return {
    full_name: profile.full_name ?? "",
    dob: profile.dob ?? "",
    address_line_1: profile.address_line_1 ?? "",
    address_line_2: profile.address_line_2 ?? "",
    email: profile.email ?? "",
    mobile_phone: profile.mobile_phone ?? "",
    home_phone: profile.home_phone ?? "",
    medicare_irn: profile.medicare_irn ?? "",
    medicare_valid_to: profile.medicare_valid_to ?? "",
    phi_name: profile.phi_name ?? "",
    phi_number: profile.phi_number ?? "",
    is_organ_donor: profile.is_organ_donor ?? false,
    emergency_contact_name: profile.emergency_contact_name ?? "",
    emergency_contact_relationship: profile.emergency_contact_relationship ?? "",
    emergency_contact_mobile: profile.emergency_contact_mobile ?? "",
    languages_spoken: profile.languages_spoken ?? "",
    is_aboriginal: profile.is_aboriginal ?? false,
    is_torres_strait_islander: profile.is_torres_strait_islander ?? false,
    allergies: profile.allergies ?? "",
  };
}

const inputClass =
  "w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text focus:border-calm-blue focus:ring-1 focus:ring-calm-blue";
const labelClass = "block text-xs font-medium text-calm-text-muted mb-1";
const sectionClass = "text-sm font-semibold text-calm-text mb-3 mt-6 first:mt-0";

export function MyDetailForm() {
  const personaId = useUserStore((s) => s.personaId);
  const [form, setForm] = useState<ProfileFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProfileValidationErrors>({});

  useEffect(() => {
    let cancelled = false;

    if (!personaId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    getProfile(personaId)
      .then((profile) => {
        if (cancelled) return;

        if (profile) {
          setForm(profileToForm(profile));
        } else {
          setForm(emptyForm);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFeedback({ type: "error", message: "Failed to load profile." });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [personaId]);

  const handleChange = (field: keyof ProfileFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors({});
    if (feedback) setFeedback(null);
  };

  const buildPayload = () => ({
    full_name: form.full_name,
    dob: form.dob || null,
    address_line_1: form.address_line_1 || null,
    address_line_2: form.address_line_2 || null,
    email: form.email || null,
    mobile_phone: form.mobile_phone || null,
    home_phone: form.home_phone || null,
    medicare_irn: form.medicare_irn || null,
    medicare_valid_to: form.medicare_valid_to || null,
    phi_name: form.phi_name || null,
    phi_number: form.phi_number || null,
    is_organ_donor: form.is_organ_donor,
    emergency_contact_name: form.emergency_contact_name || null,
    emergency_contact_relationship: form.emergency_contact_relationship || null,
    emergency_contact_mobile: form.emergency_contact_mobile || null,
    languages_spoken: form.languages_spoken || null,
    is_aboriginal: form.is_aboriginal,
    is_torres_strait_islander: form.is_torres_strait_islander,
    allergies: form.allergies || null,
  });

  const validate = () => {
    const nextErrors = getProfileValidationErrors(buildPayload());
    setFieldErrors(nextErrors);

    const firstError = Object.values(nextErrors).find(Boolean);
    if (firstError) {
      setFeedback({ type: "error", message: firstError });
      return null;
    }

    return buildPayload();
  };

  const handleSave = async () => {
    if (!personaId) return;

    const payload = validate();
    if (!payload) return;

    setSaving(true);
    setFeedback(null);
    try {
      const savedProfile = await upsertProfile(personaId, payload);
      setForm(profileToForm(savedProfile));
      setFeedback({ type: "success", message: "Profile saved." });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to save profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-calm-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/journal"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-calm-surface transition-colors duration-300"
          aria-label="Back to journal"
        >
          <ArrowLeft className="h-5 w-5 text-calm-text-muted" />
        </Link>
        <h1 className="text-lg font-bold text-calm-text">My Detail</h1>
      </div>

      {/* Personal Info */}
      <h2 className={sectionClass}>Personal Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="profile-full-name">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            id="profile-full-name"
            type="text"
            className={`${inputClass} ${fieldErrors.full_name ? "border-red-400" : ""}`}
            value={form.full_name}
            onChange={(e) => handleChange("full_name", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
            aria-invalid={Boolean(fieldErrors.full_name)}
          />
          {fieldErrors.full_name && (
            <p className="mt-1 text-xs text-red-400">{fieldErrors.full_name}</p>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="profile-dob">Date of Birth (dd-mm-yyyy)</label>
          <input
            id="profile-dob"
            type="text"
            className={`${inputClass} ${fieldErrors.dob ? "border-red-400" : ""}`}
            placeholder="dd-mm-yyyy"
            value={form.dob}
            onChange={(e) => handleChange("dob", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
            aria-invalid={Boolean(fieldErrors.dob)}
          />
          {fieldErrors.dob && <p className="mt-1 text-xs text-red-400">{fieldErrors.dob}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            type="email"
            className={`${inputClass} ${fieldErrors.email ? "border-red-400" : ""}`}
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="profile-mobile">Mobile Phone</label>
          <input
            id="profile-mobile"
            type="tel"
            className={inputClass}
            value={form.mobile_phone}
            onChange={(e) => handleChange("mobile_phone", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="profile-home-phone">Home Phone</label>
          <input
            id="profile-home-phone"
            type="tel"
            className={inputClass}
            value={form.home_phone}
            onChange={(e) => handleChange("home_phone", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
          />
        </div>
      </div>

      {/* Address */}
      <h2 className={sectionClass}>Address</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="profile-address1">Address Line 1</label>
          <input
            id="profile-address1"
            type="text"
            className={inputClass}
            value={form.address_line_1}
            onChange={(e) => handleChange("address_line_1", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="profile-address2">Address Line 2</label>
          <input
            id="profile-address2"
            type="text"
            className={inputClass}
            value={form.address_line_2}
            onChange={(e) => handleChange("address_line_2", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
          />
        </div>
      </div>

      {/* Medicare & Insurance */}
      <h2 className={sectionClass}>Medicare & Insurance</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="profile-medicare-irn">Medicare IRN</label>
          <input
            id="profile-medicare-irn"
            type="text"
            className={inputClass}
            value={form.medicare_irn}
            onChange={(e) => handleChange("medicare_irn", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="profile-medicare-valid">Medicare Valid To (dd-mm-yyyy)</label>
          <input
            id="profile-medicare-valid"
            type="text"
            className={`${inputClass} ${fieldErrors.medicare_valid_to ? "border-red-400" : ""}`}
            placeholder="dd-mm-yyyy"
            value={form.medicare_valid_to}
            onChange={(e) => handleChange("medicare_valid_to", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
            aria-invalid={Boolean(fieldErrors.medicare_valid_to)}
          />
          {fieldErrors.medicare_valid_to && (
            <p className="mt-1 text-xs text-red-400">{fieldErrors.medicare_valid_to}</p>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="profile-phi-name">PHI Name</label>
          <input
            id="profile-phi-name"
            type="text"
            className={inputClass}
            value={form.phi_name}
            onChange={(e) => handleChange("phi_name", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="profile-phi-number">PHI Number</label>
          <input
            id="profile-phi-number"
            type="text"
            className={inputClass}
            value={form.phi_number}
            onChange={(e) => handleChange("phi_number", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <h2 className={sectionClass}>Emergency Contact</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="profile-ec-name">Name</label>
          <input
            id="profile-ec-name"
            type="text"
            className={inputClass}
            value={form.emergency_contact_name}
            onChange={(e) => handleChange("emergency_contact_name", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="profile-ec-rel">Relationship</label>
          <input
            id="profile-ec-rel"
            type="text"
            className={inputClass}
            value={form.emergency_contact_relationship}
            onChange={(e) => handleChange("emergency_contact_relationship", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="profile-ec-mobile">Mobile</label>
          <input
            id="profile-ec-mobile"
            type="tel"
            className={inputClass}
            value={form.emergency_contact_mobile}
            onChange={(e) => handleChange("emergency_contact_mobile", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
          />
        </div>
      </div>

      {/* Health Info */}
      <h2 className={sectionClass}>Health Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="profile-languages">Languages Spoken</label>
          <input
            id="profile-languages"
            type="text"
            className={inputClass}
            value={form.languages_spoken}
            onChange={(e) => handleChange("languages_spoken", e.target.value)}
            disabled={saving}
            style={{ minHeight: "44px" }}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="profile-allergies">Allergies</label>
          <textarea
            id="profile-allergies"
            className={`${inputClass} min-h-[60px]`}
            value={form.allergies}
            onChange={(e) => handleChange("allergies", e.target.value)}
            disabled={saving}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <label className="flex items-center gap-3 cursor-pointer" style={{ minHeight: "44px" }}>
          <input
            type="checkbox"
            checked={form.is_organ_donor}
            onChange={(e) => handleChange("is_organ_donor", e.target.checked)}
            disabled={saving}
            className="h-5 w-5 rounded border-calm-border text-calm-blue focus:ring-calm-blue"
          />
          <span className="text-sm text-calm-text">Organ Donor</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer" style={{ minHeight: "44px" }}>
          <input
            type="checkbox"
            checked={form.is_aboriginal}
            onChange={(e) => handleChange("is_aboriginal", e.target.checked)}
            disabled={saving}
            className="h-5 w-5 rounded border-calm-border text-calm-blue focus:ring-calm-blue"
          />
          <span className="text-sm text-calm-text">Aboriginal</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer" style={{ minHeight: "44px" }}>
          <input
            type="checkbox"
            checked={form.is_torres_strait_islander}
            onChange={(e) => handleChange("is_torres_strait_islander", e.target.checked)}
            disabled={saving}
            className="h-5 w-5 rounded border-calm-border text-calm-blue focus:ring-calm-blue"
          />
          <span className="text-sm text-calm-text">Torres Strait Islander</span>
        </label>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-md p-3 text-sm ${
            feedback.type === "success"
              ? "bg-calm-green/10 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {feedback.type === "success" && <Check className="h-4 w-4" />}
          {feedback.message}
        </div>
      )}

      {/* Save */}
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-4 border-t border-calm-border/60 bg-calm-surface/95 px-4 pb-2 pt-3 backdrop-blur">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-md bg-calm-blue px-6 py-3 text-sm font-medium text-white hover:bg-calm-blue/90 transition-colors duration-300 disabled:opacity-50"
          style={{ minHeight: "44px" }}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
