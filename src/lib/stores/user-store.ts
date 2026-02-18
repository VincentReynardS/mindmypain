/**
 * User Store - Manages simulated persona selection (Sarah/Michael/Guest)
 *
 * Architecture: Zustand store following the pattern:
 * - Export raw store creator for testing
 * - Export default hook for usage
 * - ALWAYS use atomic selectors to prevent re-renders
 *
 * @see architecture.md - State Management (Decision 4)
 */

import { create } from "zustand";

export type PersonaId = "sarah" | "michael" | "guest";

export interface UserState {
  personaId: PersonaId | null;
  personaName: string | null;
  isSelected: boolean;
  selectPersona: (id: PersonaId) => void;
  clearPersona: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  personaId: null,
  personaName: null,
  isSelected: false,
  selectPersona: (id: PersonaId) =>
    set({
      personaId: id,
      personaName: id.charAt(0).toUpperCase() + id.slice(1),
      isSelected: true,
    }),
  clearPersona: () =>
    set({
      personaId: null,
      personaName: null,
      isSelected: false,
    }),
}));
