import { HiddenPersonaLogin } from "@/components/shared/hidden-persona-login";
import { HIDDEN_PERSONAS } from "@/lib/persona-config";

const config = HIDDEN_PERSONAS["peter"];

export default function PeterLoginPage() {
  return (
    <HiddenPersonaLogin
      personaId={config.personaId}
      displayName={config.displayName}
      accentColor={config.accentColor}
    />
  );
}
