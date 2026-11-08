import { AboutAct } from "@/features/about/AboutAct";
import { ContactAct } from "@/features/contact/ContactAct";
import { SiteFooter } from "@/features/contact/SiteFooter";
import { HeroAct } from "@/features/hero/HeroAct";
import { ProjectsAct } from "@/features/projects/ProjectsAct";
import { StackAct } from "@/features/stack/StackAct";
import { PageReady } from "@/lib/motion/PageReady";
import { ScrollKeeper } from "@/lib/motion/ScrollKeeper";

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
      <ScrollKeeper />
      <PageReady />
    </>
  );
}
