import { describe, expect, it } from "vitest";
import { hashId } from "@/lib/scroll/hash";

describe("hashId", () => {
  it("devolve o id de um hash, sem o #", () => {
    expect(hashId("#contact")).toBe("contact");
  });

  it("aceita o id já sem #", () => {
    expect(hashId("projects")).toBe("projects");
  });

  it("decodifica um id com escapes", () => {
    expect(hashId("#se%C3%A7%C3%A3o")).toBe("seção");
  });

  it("devolve null para um escape malformado, em vez de lançar um URIError", () => {
    expect(hashId("#%E0")).toBeNull();
    expect(hashId("#%")).toBeNull();
  });

  it("devolve null para um hash vazio", () => {
    expect(hashId("")).toBeNull();
    expect(hashId("#")).toBeNull();
  });
});
