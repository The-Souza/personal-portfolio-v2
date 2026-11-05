import { beforeEach, describe, expect, it, vi } from "vitest";
import { completeBoot, isBootDone, onBootHandover, resetBootForTests } from "@/features/boot/boot-state";

describe("boot-state", () => {
  beforeEach(() => resetBootForTests());

  it("começa pendente", () => {
    expect(isBootDone()).toBe(false);
  });

  it("avisa quem está esperando na entrega", () => {
    const listener = vi.fn();
    onBootHandover(listener);
    expect(listener).not.toHaveBeenCalled();
    completeBoot();
    expect(listener).toHaveBeenCalledOnce();
  });

  it("chama na hora quem chega depois da entrega", () => {
    completeBoot();
    const listener = vi.fn();
    onBootHandover(listener);
    expect(listener).toHaveBeenCalledOnce();
  });

  it("entrega uma vez só", () => {
    const listener = vi.fn();
    onBootHandover(listener);
    completeBoot();
    completeBoot();
    expect(listener).toHaveBeenCalledOnce();
    expect(isBootDone()).toBe(true);
  });

  it("para de avisar quem cancelou a inscrição", () => {
    const listener = vi.fn();
    const unsubscribe = onBootHandover(listener);
    unsubscribe();
    completeBoot();
    expect(listener).not.toHaveBeenCalled();
  });
});
