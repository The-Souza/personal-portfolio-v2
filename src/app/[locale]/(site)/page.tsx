import { AboutAct } from "@/features/about/AboutAct";
import { ContactAct } from "@/features/contact/ContactAct";
import { SiteFooter } from "@/features/footer/SiteFooter";
import { HeroAct } from "@/features/hero/HeroAct";
import { ProjectsAct } from "@/features/projects/ProjectsAct";
import { PersonJsonLd } from "@/features/seo/PersonJsonLd";
import { StackAct } from "@/features/stack/StackAct";
import { PageReady } from "@/lib/scroll/PageReady";
import { ScrollKeeper } from "@/lib/scroll/ScrollKeeper";

export default function Page() {
  return (
    <>
      {/* The skip link's target: takes the focus from the header, without a ring of its own. */}
      <main id="main" tabIndex={-1} className="outline-none">
        <HeroAct />
        <AboutAct />
        <ProjectsAct />
        <StackAct />
        <ContactAct />
      </main>
      <SiteFooter />
      <PersonJsonLd />
      <ScrollKeeper />
      <PageReady />
    </>
  );
}
