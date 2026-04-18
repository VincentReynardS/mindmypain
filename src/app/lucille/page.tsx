import { HiddenPersonaLogin } from "@/components/shared/hidden-persona-login";
import { HIDDEN_PERSONAS } from "@/lib/persona-config";

const config = HIDDEN_PERSONAS["lucille"];

export default function LucilleLoginPage() {
  return (
    <HiddenPersonaLogin
      personaId={config.personaId}
      displayName={config.displayName}
      accentColor={config.accentColor}
    />
  );
}
