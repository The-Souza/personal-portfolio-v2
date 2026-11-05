import { beforeEach, describe, expect, it } from "vitest";
import { hasSeenBoot, markBootSeen } from "@/features/boot/boot-session";

describe("boot-session", () => {
  beforeEach(() => sessionStorage.clear());

  it("trata a primeira visita como nova", () => {
    expect(hasSeenBoot()).toBe(false);
  });

  it("lembra que o boot já rodou nesta sessão", () => {
    markBootSeen();
    expect(hasSeenBoot()).toBe(true);
  });
});
