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
      <main>
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
