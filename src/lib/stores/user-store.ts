/**
 * User Store - Manages simulated persona selection (Sarah/Michael/Guest/Kim/Hilary/Mary-Lynne)
 *
 * Architecture: Zustand store following the pattern:
 * - Export raw store creator for testing
 * - Export default hook for usage
 * - ALWAYS use atomic selectors to prevent re-renders
 * - Persisted via localStorage so personas survive page refreshes,
 *   tab backgrounding, and screen locks (critical for mobile workshops)
 *
 * @see architecture.md - State Management (Decision 4)
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PersonaId =
  | "sarah"
  | "michael"
  | "guest"
  | "kim"
  | "hilary"
  | "mary-lynne"
  | "simone"
  | "peter"
  | "lucille"
  | "kimberley"
  | "samuel"
  | string;

export interface UserState {
  personaId: PersonaId | null;
  personaName: string | null;
  personaIconBg: string; // Taildwind class for avatar bg
  personaIconText: string; // Tailwind class for avatar text
  isSelected: boolean;
  selectPersona: (id: PersonaId) => void;
  clearPersona: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      personaId: null,
      personaName: null,
      personaIconBg: "bg-surface-raised",
      personaIconText: "text-calm-text-muted",
      isSelected: false,
      selectPersona: (id: PersonaId) => {
        // If guest, create a transient unique ID to prevent database collisions
        // across multiple users testing the prototype simultaneously.
        const actualId = id === "guest" ? `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` : id;

        let iconBg = "bg-calm-surface-raised";
        let iconText = "text-calm-text-muted";

        if (id === "sarah") {
           iconBg = "bg-calm-blue-soft";
           iconText = "text-calm-blue";
        } else if (id === "michael") {
           iconBg = "bg-calm-green-soft";
           iconText = "text-calm-green";
        } else if (id === "kim") {
           iconBg = "bg-calm-teal-soft";
           iconText = "text-calm-teal";
        } else if (id === "hilary") {
           iconBg = "bg-calm-purple-soft";
           iconText = "text-calm-purple";
        } else if (id === "mary-lynne") {
           iconBg = "bg-calm-rose-soft";
           iconText = "text-calm-rose";
        } else if (id === "simone") {
           iconBg = "bg-calm-teal-soft";
           iconText = "text-calm-teal";
        } else if (id === "peter") {
           iconBg = "bg-calm-purple-soft";
           iconText = "text-calm-purple";
        } else if (id === "lucille") {
           iconBg = "bg-calm-rose-soft";
           iconText = "text-calm-rose";
        } else if (id === "kimberley") {
           iconBg = "bg-calm-blue-soft";
           iconText = "text-calm-blue";
        } else if (id === "samuel") {
           iconBg = "bg-calm-green-soft";
           iconText = "text-calm-green";
        }

        const personaName =
          id === "guest"
            ? "Guest"
            : id === "kim"
            ? "Kim"
            : id === "hilary"
            ? "Hilary"
            : id === "mary-lynne"
            ? "Mary-Lynne"
            : id === "simone"
            ? "Simone"
            : id === "peter"
            ? "Peter"
            : id === "lucille"
            ? "Lucille"
            : id === "kimberley"
            ? "Kimberley"
            : id === "samuel"
            ? "Samuel"
            : actualId.charAt(0).toUpperCase() + actualId.slice(1);

        set({
          personaId: actualId,
          personaName,
          personaIconBg: iconBg,
          personaIconText: iconText,
          isSelected: true,
        });
      },
      clearPersona: () =>
        set({
          personaId: null,
          personaName: null,
          personaIconBg: "bg-calm-surface-raised",
          personaIconText: "text-calm-text-muted",
          isSelected: false,
        }),
    }),
    {
      name: "mindmypain-persona",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state) => ({
        personaId: state.personaId,
        personaName: state.personaName,
        personaIconBg: state.personaIconBg,
        personaIconText: state.personaIconText,
        isSelected: state.isSelected,
      }),
    }
  )
);
