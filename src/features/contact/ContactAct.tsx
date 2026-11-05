import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { WarningMark } from "@/components/HudMarkers";
import { SITE } from "@/content/site";
import { CopyEmail } from "@/features/contact/CopyEmail";
import { ActionLink } from "@/features/shared/ActionLink";
import { Container } from "@/features/shared/Container";

/** Alert theme poster; Phase 7 adds the diagonal blade and the pin. */
export function ContactAct() {
  const t = useTranslations("contact");

  return (
    <section id="contact" aria-label={t("aria")} className="alert relative z-5 bg-background text-foreground">
      <div className="flex min-h-screen items-center">
        <Container className="flex flex-col gap-6 pt-24 pb-12">
          <div className="flex items-start justify-between gap-6">
            <p className="font-mono text-eyebrow text-primary-accessible uppercase">{t("eyebrow")}</p>
            <WarningMark>{t("warning")}</WarningMark>
          </div>
          <h2 className="max-w-[13ch] font-heading text-[clamp(2.875rem,7.4vw,7rem)] leading-[0.92] font-bold text-balance uppercase">
            {t("title")}
          </h2>
          <p className="max-w-[56ch] text-lead text-muted-foreground">{t("lead")}</p>
          <div>
            <Button href={SITE.companyUrl} variant="solid" target="_blank" rel="noopener noreferrer">
              {t("cta")}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-sm tracking-wider">
            <CopyEmail email={SITE.email} />
            <ActionLink href={SITE.linkedinUrl} external bare>
              {t("linkedin")}
            </ActionLink>
            <ActionLink href={SITE.githubUrl} external bare>
              {t("github")}
            </ActionLink>
          </div>
        </Container>
      </div>
    </section>
  );
}
