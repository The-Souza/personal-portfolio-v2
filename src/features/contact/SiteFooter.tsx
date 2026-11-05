import { useTranslations } from "next-intl";
import { HudFrame, HudFrameRow, HudMark } from "@/components/HudFrame";
import { NAV_IDS } from "@/content/acts";
import { Container } from "@/features/shared/Container";

export function SiteFooter() {
  const t = useTranslations("footer");
  const links = [...NAV_IDS.map((id) => ({ href: `#${id}`, label: t(`nav.${id}`) })), { href: "#hero", label: t("nav.top") }];

  return (
    <footer className="alert relative z-5 bg-background text-foreground">
      <Container className="flex flex-col gap-7 pb-14">
        <HudFrame>
          <HudFrameRow>
            <p className="font-mono text-xs leading-relaxed tracking-wider uppercase">
              {t("status")}
              <br />
              {t("company")}
            </p>
            <HudMark>{t("mark")}</HudMark>
          </HudFrameRow>
        </HudFrame>
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-4">
          <nav aria-label={t("navAria")} className="flex flex-wrap gap-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm tracking-wider uppercase transition-colors duration-150 ease-entrance hover:text-muted-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-sm text-muted-foreground">{t("opportunity")}</p>
          <small className="font-mono text-xs tracking-wider text-muted-foreground uppercase">{t("copyright")}</small>
        </div>
      </Container>
    </footer>
  );
}
