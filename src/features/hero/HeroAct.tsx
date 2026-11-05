import { useTranslations } from "next-intl";
import { BracketPanel } from "@/components/BracketPanel";
import { Button } from "@/components/Button";
import { Rail, Target } from "@/components/HudMarkers";
import { ActionLink } from "@/features/shared/ActionLink";
import { Container } from "@/features/shared/Container";

export function HeroAct() {
  const t = useTranslations("hero");
  const panelClass = "max-lg:flex-[0_1_17.5rem] max-phone:flex-auto";

  return (
    <section id="hero" aria-label={t("aria")} className="relative z-1 overflow-x-clip bg-background">
      <div className="relative flex min-h-[max(100vh,40rem)] items-center">
        {/* The right padding keeps the panels clear of the fixed side HUD, shown from `tablet` up. */}
        <Container className="flex flex-wrap content-center items-center justify-between gap-x-12 gap-y-10 pt-24 pb-14 tablet:pr-20 rail:pr-20">
          <div className="flex min-w-0 flex-[999_1_32.5rem] flex-col gap-6">
            <p className="font-mono text-eyebrow text-primary-accessible uppercase">{t("eyebrow")}</p>
            <h1 className="font-heading text-impact uppercase">
              <span className="block whitespace-nowrap">{t("firstName")}</span>{" "}
              <span className="block whitespace-nowrap">{t("lastName")}</span>
            </h1>
            <p className="max-w-[56ch] text-lead text-muted-foreground">{t("bio")}</p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-5">
              <Button href="#projects">{t("viewProjects")}</Button>
              <ActionLink href="#contact">{t("contact")}</ActionLink>
            </div>
          </div>

          <div className="flex max-w-75 flex-[1_1_15rem] flex-col gap-6 max-lg:max-w-none max-lg:basis-full max-lg:flex-row max-lg:justify-end max-lg:gap-5 max-phone:flex-col">
            <BracketPanel
              tone="focus"
              eyebrow={t("now.eyebrow")}
              title={t("now.company")}
              details={[t("now.role"), t("now.since")]}
              className={panelClass}
            />
            <BracketPanel
              eyebrow={t("status.eyebrow")}
              title={`● ${t("status.online")}`}
              details={[t("status.line"), t("status.place")]}
              className={panelClass}
            />
          </div>
        </Container>

        <div className="absolute bottom-14 left-3.5 max-rail:hidden">
          <Rail>{t("rail")}</Rail>
        </div>
        <div className="absolute top-24 right-14 max-rail:hidden">
          <Target />
        </div>
      </div>
    </section>
  );
}
