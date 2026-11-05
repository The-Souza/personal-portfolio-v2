import { useTranslations } from "next-intl";
import {
  BracketPanel,
  Button,
  HudFrame,
  HudFrameRow,
  HudMark,
  Masthead,
  ProgressBar,
  Rail,
  Reticle,
  StatGroup,
  Tag,
  TagGroup,
  Target,
  Terminal,
  WarningMark,
} from "@/components";

export function ComponentShowcase({ alert = false }: { alert?: boolean }) {
  const t = useTranslations("showcase");

  return (
    <div className="flex flex-col gap-10 pb-16">
      <Masthead
        name={t("masthead.name")}
        suffix={t("masthead.suffix")}
        homeHref="#"
        links={[{ label: t("masthead.link"), href: "#" }]}
        contact={{ label: t("masthead.contact"), href: "#" }}
      />

      <div className="flex flex-col gap-10 px-6 md:px-8">
        <header className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-eyebrow uppercase text-primary-accessible">
              {t(alert ? "eyebrowAlert" : "eyebrow")}
            </p>
            <p className="font-heading text-impact uppercase">{t("impact")}</p>
            <p className="flex items-center gap-3 font-heading text-display uppercase">
              <Reticle />
              {t("display")}
            </p>
            <p className="font-heading text-heading">{t("heading")}</p>
            <p className="max-w-[56ch] text-lead text-muted-foreground">{t("lead")}</p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-6 max-lg:hidden">
            <Target />
            <Rail>{t("rail")}</Rail>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-6">
          <Button href="#">{t("buttonOutline")}</Button>
          <Button href="#" variant="solid">
            {t("buttonSolid")}
          </Button>
          <Button disabled>{t("buttonDisabled")}</Button>
          <WarningMark>{t("warning")}</WarningMark>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <BracketPanel
            eyebrow={t("panelFocus.eyebrow")}
            title={t("panelFocus.title")}
            details={[t("panelFocus.detail")]}
            tone="focus"
          />
          <BracketPanel
            eyebrow={t("panelDefault.eyebrow")}
            title={t("panelDefault.title")}
            details={[t("panelDefault.detail")]}
            filled
          />
        </div>

        <StatGroup
          items={[
            { label: t("stats.tests"), value: 723 },
            { label: t("stats.photos"), value: 150 },
            { label: t("stats.release"), value: "v1.5.1" },
          ]}
        />

        <TagGroup>
          <Tag>{t("tags.default")}</Tag>
          <Tag variant="live">{t("tags.live")}</Tag>
          <Tag variant="accent">{t("tags.accent")}</Tag>
          <Tag variant="hot">{t("tags.hot")}</Tag>
          <Tag variant="plain">{t("tags.plain")}</Tag>
        </TagGroup>

        <div className="flex flex-col gap-4">
          <Terminal
            lines={[
              { prefix: ">", text: t("terminal.init"), status: t("terminal.ok"), tone: "ok" },
              { prefix: ">", label: t("terminal.errorLabel"), text: t("terminal.error"), tone: "err" },
              { prefix: "//", text: t("terminal.comment") },
              { prefix: "cursor", text: "" },
            ]}
            blink
          />
          <ProgressBar value={70} label={t("progress")} />
        </div>

        <HudFrame>
          <HudFrameRow>
            <p className="font-mono text-eyebrow uppercase">{t("hud.status")}</p>
            <HudMark>{t("hud.mark")}</HudMark>
          </HudFrameRow>
        </HudFrame>
      </div>
    </div>
  );
}
