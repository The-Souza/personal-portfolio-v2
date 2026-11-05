import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("junta as classes e descarta valores falsos", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("mantém a classe da escala de tipo junto da cor do texto", () => {
    expect(cn("text-label", "text-foreground")).toBe("text-label text-foreground");
  });

  it("faz a última classe da escala de tipo prevalecer", () => {
    expect(cn("text-impact", "text-display")).toBe("text-display");
  });

  it("faz o último utilitário em conflito prevalecer", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
