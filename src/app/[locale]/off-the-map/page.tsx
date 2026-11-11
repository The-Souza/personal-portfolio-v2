import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotFoundView } from "@/features/special/not-found/NotFoundView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound");
  return { title: t("metaTitle"), robots: { index: false } };
}

/**
 * The 404 for URLs no page matches: the proxy rewrites them here with a 404 status (see
 * `unknown-route.ts`). A normal page, so it's prerendered and comes from the server whole.
 */
export default function OffTheMap() {
  return <NotFoundView />;
}
