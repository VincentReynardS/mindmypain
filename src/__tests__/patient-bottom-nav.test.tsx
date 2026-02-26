import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("PatientBottomNav Component", () => {
  it("should export PatientBottomNav as a named function", async () => {
    // This will format error if the file does not exist, which makes the test fail initially
    const mod = await import("@/components/patient/bottom-nav");
    expect(mod.PatientBottomNav).toBeDefined();
    expect(typeof mod.PatientBottomNav).toBe("function");
  });

  it('should use "use client" directive because of usePathname', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../components/patient/bottom-nav.tsx"),
      "utf-8"
    );
    expect(source).toContain('"use client"');
  });

  it("should use Calm design tokens", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../components/patient/bottom-nav.tsx"),
      "utf-8"
    );
    expect(source).toContain("bg-calm-surface-raised");
    expect(source).toContain("text-calm-text");
  });

  it("should implement >44px touch targets", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../components/patient/bottom-nav.tsx"),
      "utf-8"
    );
    // We check for padding/min-height or spacing utility classes that equate to 44px
    // We check for min-h-12 (48px) per NFR_ACC2 (MUST be >44px)
    expect(source).toMatch(/h-12|h-14|min-h-12|min-h-\[48px\]/);
  });

  it("should include necessary nav links", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../components/patient/bottom-nav.tsx"),
      "utf-8"
    );
    expect(source).toContain('href: "/journal"');
    expect(source).toContain('href: "/appointments"');
    expect(source).toContain('href: "/medications"');
    expect(source).toContain('href: "/scripts"');
  });

  it("should use appropriate icons", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../components/patient/bottom-nav.tsx"),
      "utf-8"
    );
    expect(source).toMatch(/lucide-react/);
  });

  it('should include Ask tab linking to /chat', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../components/patient/bottom-nav.tsx"),
      "utf-8"
    );
    expect(source).toContain('href: "/chat"');
    expect(source).toContain('"Ask"');
    expect(source).toContain("MessageCircle");
  });
});
