"use client";

import { useTranslations } from "next-intl";
import { useCopyEmail } from "@/features/contact/use-copy-email";

export function CopyEmail({ email }: { email: string }) {
  const t = useTranslations("copyEmail");
  const { status, copy, textRef } = useCopyEmail(email);

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      <span ref={textRef} className="select-all">
        {email}
      </span>
      <button type="button" onClick={copy} className="tap-area border-b border-current font-mono text-xs leading-none tracking-wider uppercase">
        <span aria-hidden="true">[ </span>
        {t("copy")}
        <span aria-hidden="true"> ]</span>
      </button>
      <span aria-live="polite" className="font-mono text-xs leading-none tracking-wider uppercase">
        {status === "copied" && t("copied")}
        {status === "selected" && t("selected")}
      </span>
    </span>
  );
}
