import { beforeEach, describe, expect, it } from "vitest";
import { hasPlayed, markPlayed } from "@/lib/motion/played";

describe("played", () => {
  beforeEach(() => sessionStorage.clear());

  it("trata uma animação nova como não tocada", () => {
    expect(hasPlayed("hero-intro")).toBe(false);
  });

  it("lembra uma animação tocada nesta sessão", () => {
    markPlayed("hero-intro");
    expect(hasPlayed("hero-intro")).toBe(true);
  });

  it("guarda cada animação separada", () => {
    markPlayed("about-paragraph-0");
    expect(hasPlayed("about-paragraph-1")).toBe(false);
  });

  it("não duplica uma animação marcada duas vezes", () => {
    markPlayed("project-2");
    markPlayed("project-2");
    expect(JSON.parse(sessionStorage.getItem("played-animations") ?? "[]")).toEqual(["project-2"]);
  });

  it("ignora um valor inválido no storage", () => {
    sessionStorage.setItem("played-animations", "{oops");
    expect(hasPlayed("hero-intro")).toBe(false);
    markPlayed("hero-intro");
    expect(hasPlayed("hero-intro")).toBe(true);
  });
});
