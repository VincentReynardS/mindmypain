"use client";

/**
 * PersonaSelector - Landing page component for selecting a workshop persona.
 *
 * Renders public persona cards that set Zustand context and navigate to /journal.
 * Protected researcher/test accounts are intentionally not listed here.
 *
 * @see architecture.md - Authentication & Security (Decision 2)
 * @see user-store.ts - PersonaId, selectPersona()
 */

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Brain, User } from "lucide-react";
import { useUserStore, type PersonaId } from "@/lib/stores/user-store";

interface PersonaConfig {
  id: PersonaId;
  name: string;
  age: number;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  accentClass: string;
  accentBorderClass: string;
}

const personas: PersonaConfig[] = [
  {
    id: "guest",
    name: "Guest",
    age: 0,
    subtitle: "The Clean Slate",
    description:
      "Start with a blank canvas. No prior medical history or seeded data will be loaded.",
    icon: <User className="h-8 w-8" />,
    accentClass: "bg-calm-surface-raised",
    accentBorderClass: "border-calm-text-muted",
  },
  {
    id: "sarah",
    name: "Sarah",
    age: 45,
    subtitle: "The Veteran",
    description:
      "Living with CRPS. Wants efficiency and validation when explaining her condition to doctors.",
    icon: <Heart className="h-8 w-8" />,
    accentClass: "bg-calm-blue-soft",
    accentBorderClass: "border-calm-blue",
  },
  {
    id: "michael",
    name: "Michael",
    age: 28,
    subtitle: "The Overwhelmed",
    description:
      "Newly diagnosed with chronic pain. Needs clarity and calm to organize the chaos of new information.",
    icon: <Brain className="h-8 w-8" />,
    accentClass: "bg-calm-green-soft",
    accentBorderClass: "border-calm-green",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function PersonaSelector() {
  const router = useRouter();
  const selectPersona = useUserStore((s) => s.selectPersona);

  const handleSelect = (id: PersonaId) => {
    selectPersona(id);
    router.push("/home");
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-calm-surface px-4 py-12">
      {/* Branding */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-12 text-center"
      >
        <h1 className="text-3xl font-bold tracking-tight text-calm-text sm:text-4xl">
          MINDmyPAIN
        </h1>
        <p className="mt-2 text-base text-calm-text-muted">
          Your Smart Health Journal
        </p>
      </motion.div>

      {/* Persona Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-md flex-col gap-4 sm:max-w-2xl sm:flex-row sm:gap-6"
      >
        {personas.map((persona) => (
          <motion.button
            key={persona.id}
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(persona.id)}
            className={`group flex flex-1 cursor-pointer flex-col items-center rounded-2xl border-2 ${persona.accentBorderClass} ${persona.accentClass} p-6 text-center transition-shadow duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-8`}
            aria-label={`Start as ${persona.name}`}
          >
            {/* Icon */}
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background/60 text-calm-text">
              {persona.icon}
            </div>

            {/* Name & Subtitle */}
            <h2 className="text-xl font-semibold text-calm-text">
              {persona.name}
              {persona.age > 0 ? `, ${persona.age}` : ""}
            </h2>
            <p className="mt-1 text-sm font-medium text-calm-text-muted">
              {persona.subtitle}
            </p>

            {/* Description */}
            <p className="mt-3 text-sm leading-relaxed text-calm-text-muted">
              {persona.description}
            </p>

            {/* CTA */}
            <span className="mt-6 inline-flex min-h-[2.75rem] items-center rounded-xl bg-background/80 px-6 py-2.5 text-sm font-semibold text-calm-text transition-colors duration-300 group-hover:bg-background">
              Start as {persona.name}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 text-xs text-calm-text-muted"
      >
        No account needed. Select a persona to begin.
      </motion.p>
    </div>
  );
}
