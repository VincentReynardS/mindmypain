/**
 * User Store - Manages simulated persona selection.
 *
 * Architecture: Zustand store following the pattern:
 * - Export raw store creator for testing
 * - Export default hook for usage
 * - ALWAYS use atomic selectors to prevent re-renders
 * - Persisted via localStorage so personas survive page refreshes,
 *   tab backgrounding, and screen locks (critical for mobile workshops)
 *
 * Persona styling and display names are derived from the central
 * registry in `@/lib/persona-config` — do NOT hardcode per-id mappings here.
 *
 * @see architecture.md - State Management (Decision 4)
 * @see persona-config.ts - Single source of truth for persona metadata
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ACCENT_ICON_CLASSES,
  KNOWN_PERSONAS,
  type KnownPersonaId,
} from "@/lib/persona-config";

export type PersonaId = KnownPersonaId | "guest" | (string & {});

const DEFAULT_ICON_BG = "bg-calm-surface-raised";
const DEFAULT_ICON_TEXT = "text-calm-text-muted";

export interface UserState {
  personaId: PersonaId | null;
  personaName: string | null;
  personaIconBg: string;
  personaIconText: string;
  isSelected: boolean;
  selectPersona: (id: PersonaId) => void;
  clearPersona: () => void;
}

function resolvePersona(id: PersonaId): {
  actualId: string;
  personaName: string;
  iconBg: string;
  iconText: string;
} {
  if (id === "guest") {
    const actualId = `guest_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    return {
      actualId,
      personaName: "Guest",
      iconBg: DEFAULT_ICON_BG,
      iconText: DEFAULT_ICON_TEXT,
    };
  }

  const known = (KNOWN_PERSONAS as Record<string, (typeof KNOWN_PERSONAS)[KnownPersonaId]>)[id];
  if (known) {
    const accent = ACCENT_ICON_CLASSES[known.accentColor];
    return {
      actualId: known.personaId,
      personaName: known.displayName,
      iconBg: accent.iconBg,
      iconText: accent.iconText,
    };
  }

  return {
    actualId: id,
    personaName: id.charAt(0).toUpperCase() + id.slice(1),
    iconBg: DEFAULT_ICON_BG,
    iconText: DEFAULT_ICON_TEXT,
  };
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      personaId: null,
      personaName: null,
      personaIconBg: DEFAULT_ICON_BG,
      personaIconText: DEFAULT_ICON_TEXT,
      isSelected: false,
      selectPersona: (id: PersonaId) => {
        const { actualId, personaName, iconBg, iconText } = resolvePersona(id);
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
          personaIconBg: DEFAULT_ICON_BG,
          personaIconText: DEFAULT_ICON_TEXT,
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
