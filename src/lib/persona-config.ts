export type AccentColor = "blue" | "green" | "teal" | "purple" | "rose";

export interface PersonaConfig {
  personaId: string;
  displayName: string;
  accentColor: AccentColor;
}

export interface HiddenPersonaConfig extends PersonaConfig {
  envVarName: string;
}

export const ACCENT_ICON_CLASSES: Record<
  AccentColor,
  { iconBg: string; iconText: string }
> = {
  blue: { iconBg: "bg-calm-blue-soft", iconText: "text-calm-blue" },
  green: { iconBg: "bg-calm-green-soft", iconText: "text-calm-green" },
  teal: { iconBg: "bg-calm-teal-soft", iconText: "text-calm-teal" },
  purple: { iconBg: "bg-calm-purple-soft", iconText: "text-calm-purple" },
  rose: { iconBg: "bg-calm-rose-soft", iconText: "text-calm-rose" },
};

export const HIDDEN_PERSONAS = {
  kim: { personaId: "kim", displayName: "Kim", accentColor: "teal", envVarName: "KIMS_PASSWORD" },
  hilary: { personaId: "hilary", displayName: "Hilary", accentColor: "purple", envVarName: "HILARYS_PASSWORD" },
  "mary-lynne": { personaId: "mary-lynne", displayName: "Mary-Lynne", accentColor: "rose", envVarName: "MARY_LYNNES_PASSWORD" },
  simone: { personaId: "simone", displayName: "Simone", accentColor: "teal", envVarName: "SIMONE_PASSWORD" },
  peter: { personaId: "peter", displayName: "Peter", accentColor: "purple", envVarName: "PETER_PASSWORD" },
  lucille: { personaId: "lucille", displayName: "Lucille", accentColor: "rose", envVarName: "LUCILLE_PASSWORD" },
  kimberley: { personaId: "kimberley", displayName: "Kimberley", accentColor: "blue", envVarName: "KIMBERLEY_PASSWORD" },
  samuel: { personaId: "samuel", displayName: "Samuel", accentColor: "green", envVarName: "SAMUEL_PASSWORD" },
  ross: { personaId: "ross", displayName: "Ross", accentColor: "teal", envVarName: "ROSS_PASSWORD" },
  joanna: { personaId: "joanna", displayName: "Joanna", accentColor: "purple", envVarName: "JOANNA_PASSWORD" },
  joanne: { personaId: "joanne", displayName: "Joanne", accentColor: "rose", envVarName: "JOANNE_PASSWORD" },
} as const satisfies Record<string, HiddenPersonaConfig>;

export type HiddenPersonaId = keyof typeof HIDDEN_PERSONAS;

export const PUBLIC_PERSONAS = {
  sarah: { personaId: "sarah", displayName: "Sarah", accentColor: "blue" },
  michael: { personaId: "michael", displayName: "Michael", accentColor: "green" },
} as const satisfies Record<string, PersonaConfig>;

export type PublicPersonaId = keyof typeof PUBLIC_PERSONAS;

export const KNOWN_PERSONAS = {
  ...PUBLIC_PERSONAS,
  ...HIDDEN_PERSONAS,
} as const;

export type KnownPersonaId = keyof typeof KNOWN_PERSONAS;
