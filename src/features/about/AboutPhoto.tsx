import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/** Portrait under the About title, in natural color under the scanlines. */
export function AboutPhoto({ className }: { className?: string }) {
  const t = useTranslations("about.photo");

  return (
    // The width cap keeps the 4:5 portrait under ~50% of the viewport height inside the sticky column.
    <figure className={cn("flex w-full max-w-[40vh] flex-col gap-3 max-about:max-w-90", className)}>
      <div className="brackets p-2.5">
        <div className="chamfer relative aspect-4/5 overflow-hidden bg-secondary [--cut:1.25rem] max-about:aspect-4/3 short:aspect-4/5">
          <Image
            src="/images/about/profile.jpeg"
            alt={t("alt")}
            fill
            // At most ~40vh wide in the sticky column; up to 22.5rem on narrow screens.
            sizes="(min-width: 51.25rem) 40vh, 22.5rem"
            // The face sits in the upper third: on the 4:3 crop of narrow screens it stays in view.
            className="object-cover object-[50%_25%]"
          />
          <div aria-hidden="true" className="scanlines absolute inset-0" />
        </div>
      </div>
      <figcaption className="font-mono text-eyebrow text-primary-accessible uppercase">{t("caption")}</figcaption>
    </figure>
  );
}
