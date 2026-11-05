import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Portrait under the About title. A placeholder until the photo arrives in public/images/;
 * then it becomes a next/image with `about.photo.alt`, in natural color under the scanlines.
 */
export function AboutPhoto({ className }: { className?: string }) {
  const t = useTranslations("about.photo");

  return (
    // The width cap keeps the 4:5 portrait under ~50% of the viewport height inside the sticky column.
    <figure className={cn("flex w-full max-w-[40vh] flex-col gap-3 max-about:max-w-90", className)}>
      <div className="brackets p-2.5">
        <div aria-hidden="true" className="chamfer relative aspect-4/5 bg-secondary [--cut:1.25rem] max-about:aspect-4/3 short:aspect-4/5">
          <div className="scanlines absolute inset-0" />
          <span className="absolute bottom-4 left-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {t("placeholder")}
          </span>
        </div>
      </div>
      <figcaption className="font-mono text-eyebrow text-primary-accessible uppercase">{t("caption")}</figcaption>
    </figure>
  );
}
