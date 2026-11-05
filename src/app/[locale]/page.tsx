import { ComponentShowcase } from "@/features/showcase/ComponentShowcase";
import { ShowcaseControls } from "@/features/showcase/ShowcaseControls";

// Phase 0 test page: Phase 1 replaces it with the six acts.
export default function Page() {
  return (
    <main>
      <ShowcaseControls />
      <ComponentShowcase />
      <section className="alert bg-background text-foreground">
        <ComponentShowcase alert />
      </section>
    </main>
  );
}
