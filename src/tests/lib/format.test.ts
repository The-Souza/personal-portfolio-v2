import { describe, expect, it } from "vitest";
import { pad2 } from "@/lib/format";

describe("pad2", () => {
  it("completa números de um dígito com zero", () => {
    expect(pad2(3)).toBe("03");
  });

  it("mantém números de dois dígitos", () => {
    expect(pad2(12)).toBe("12");
  });
});
