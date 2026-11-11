"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { ErrorView } from "@/features/special/error/ErrorView";

/** Errors below the locale layout: the special error page, with the layout's providers. */
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations("error");
  const locale = useLocale();
  const path = usePathname();

  return (
    <>
      <title>{t("metaTitle")}</title>
      <ErrorView error={error} retry={retry} locale={locale} path={path} />
    </>
  );
}
