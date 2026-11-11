import { describe, expect, it } from "vitest";
import en from "../../../../../messages/en.json";
import pt from "../../../../../messages/pt.json";
import { loadErrorMessages } from "@/features/special/error/error-messages";

describe("loadErrorMessages", () => {
  it("carrega só os namespaces que a página de erro global usa", async () => {
    const messages = await loadErrorMessages("pt");
    expect(Object.keys(messages).sort()).toEqual(["error", "header", "special"]);
  });

  it("traz os textos do idioma pedido", async () => {
    expect((await loadErrorMessages("pt")).error).toEqual(pt.error);
    expect((await loadErrorMessages("en")).special).toEqual(en.special);
  });

  it("devolve a mesma promessa para o mesmo idioma, como o use() do React exige", () => {
    expect(loadErrorMessages("en")).toBe(loadErrorMessages("en"));
    expect(loadErrorMessages("pt")).not.toBe(loadErrorMessages("en"));
  });
});
