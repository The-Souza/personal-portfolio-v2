import { afterEach, describe, expect, it } from "vitest";
import { landingFor, registerLanding } from "@/lib/scroll/landing";

const cleanups: (() => void)[] = [];
const register = (id: string, getY: () => number) => {
  const unregister = registerLanding(id, getY);
  cleanups.push(unregister);
  return unregister;
};

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
});

describe("landingFor", () => {
  it("devolve null quando a seção não registrou um ponto de chegada", () => {
    expect(landingFor("about")).toBeNull();
  });

  it("devolve o ponto registrado, medido na hora da consulta", () => {
    let end = 1000;
    register("contact", () => end);
    expect(landingFor("contact")).toBe(1000);
    end = 1500;
    expect(landingFor("contact")).toBe(1500);
  });

  it("volta a null depois de desregistrar", () => {
    const unregister = register("contact", () => 1000);
    unregister();
    expect(landingFor("contact")).toBeNull();
  });

  it("um desregistro antigo não apaga o registro de uma reconstrução mais nova", () => {
    const old = register("contact", () => 1000);
    register("contact", () => 2000);
    old();
    expect(landingFor("contact")).toBe(2000);
  });
});
