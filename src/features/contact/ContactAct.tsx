import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { WarningMark } from "@/components/HudMarkers";
import { SITE } from "@/content/site";
import { ContactStage } from "@/features/contact/ContactStage";
import { CopyEmail } from "@/features/contact/CopyEmail";
import { ActionLink } from "@/features/shared/ActionLink";
import { Container } from "@/features/shared/Container";

/**
 * Contact (brief, act 05 · B): the Alert poster over a dark stage. On the client it enters as a
 * diagonal blade (see ContactStage); without JS, or with reduced motion, it is simply there.
 */
export function ContactAct() {
  const t = useTranslations("contact");

  return (
    <section id="contact" aria-label={t("aria")} className="relative z-5 bg-background">
      <ContactStage>
        <div data-contact-stage className="relative">
          <div data-contact-edge aria-hidden="true" className="alert absolute inset-0 hidden bg-foreground" />
          <div data-contact-poster className="alert relative flex min-h-screen items-center bg-background text-foreground">
            <Container className="flex flex-col gap-6 pt-24 pb-12">
              <div data-contact-item className="flex items-start justify-between gap-6">
                <p className="font-mono text-eyebrow text-primary-accessible uppercase">{t("eyebrow")}</p>
                <WarningMark>{t("warning")}</WarningMark>
              </div>
              <h2
                data-contact-title
                className="relative max-w-[15ch] font-heading text-[clamp(2.875rem,7.4vw,7rem)] leading-impact font-bold text-balance uppercase"
              >
                {/* The layer the glitch copies, laid over the title (see playGlitch). */}
                <span data-contact-title-text className="block">
                  {t("title")}
                </span>
              </h2>
              <p data-contact-item className="max-w-[56ch] text-lead text-muted-foreground">
                {t("lead")}
              </p>
              <div data-contact-item>
                <Button href={SITE.companyUrl} variant="solid" target="_blank" rel="noopener noreferrer">
                  {t("cta")}
                </Button>
              </div>
              <div data-contact-item className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-sm tracking-wider">
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
        </div>
      </ContactStage>
    </section>
  );
}
