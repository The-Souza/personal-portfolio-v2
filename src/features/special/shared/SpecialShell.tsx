import type { ReactNode } from "react";
import { HudFrame, HudFrameRow, HudMark } from "@/components/HudFrame";
import { LogoLink } from "@/features/header/LogoLink";
import { cn } from "@/lib/utils";

export interface SpecialShellTexts {
  logoName: string;
  logoSuffix: string;
  logoLabel: string;
  place: string;
  mark: string;
}

const WIDTH = "mx-auto w-full max-w-360 px-4 tablet:pr-4 rail:px-10";

/**
 * The frame of the special pages (brief, section 11), all in the Alert theme: a band on top, a
 * minimal top bar with the logo back home, two columns and the HudFrame at the foot. No site
 * header, HUD or boot. Plain markup, so the client error pages can use it too.
 */
export function SpecialShell({
  band,
  homeHref,
  texts,
  foot,
  left,
  right,
  className,
}: {
  band: "checker" | "tape";
  homeHref: string;
  texts: SpecialShellTexts;
  foot: string;
  left: ReactNode;
  right: ReactNode;
  className?: string;
}) {
  return (
    // Clipped: the entrance moves items in from below, and those transforms would briefly make a
    // page that fits the screen scrollable (the scrollbar flashing in and out). It still grows
    // with its content, so a taller page scrolls as usual.
    <div data-special className={cn("alert flex min-h-dvh flex-col overflow-clip bg-background text-foreground", className)}>
      <div
        data-special-band
        aria-hidden="true"
        className={cn("h-6 flex-none origin-left", band === "checker" ? "band-checker" : "band-tape")}
      />
      {/* Header and footer landmarks, so nothing on the page sits outside one. */}
      <header className={cn(WIDTH, "flex min-h-16 items-center")}>
        <LogoLink name={texts.logoName} suffix={texts.logoSuffix} label={texts.logoLabel} href={homeHref} />
      </header>
      <main className={cn(WIDTH, "flex flex-1 flex-wrap items-center gap-x-12 gap-y-10 pt-6 pb-10")}>
        <div className="flex min-w-0 flex-[999_1_32.5rem] flex-col gap-5">{left}</div>
        <div className="flex min-w-0 flex-[1_1_21.25rem] flex-col gap-6">{right}</div>
      </main>
      <footer data-special-item className={cn(WIDTH, "pb-8")}>
        <HudFrame>
          <HudFrameRow>
            <p className="font-mono text-xs leading-relaxed tracking-wider uppercase">
              {foot}
              <br />
              {texts.place}
            </p>
            <HudMark>{texts.mark}</HudMark>
          </HudFrameRow>
        </HudFrame>
      </footer>
    </div>
  );
}
