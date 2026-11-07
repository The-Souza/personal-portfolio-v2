import { Boot } from "@/features/boot/Boot";
import { SiteHeader } from "@/features/header/SiteHeader";
import { SideHud } from "@/features/hud/SideHud";

/**
 * The site's chrome: the boot, the header and the side HUD. The special pages (not-found, error)
 * sit outside this group, with their own minimal top, so they never get acts' navigation.
 */
export default function SiteLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <>
      <Boot />
      <SiteHeader />
      <SideHud />
      {children}
    </>
  );
}
