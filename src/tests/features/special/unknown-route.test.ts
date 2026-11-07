import { describe, expect, it } from "vitest";
import { NOT_FOUND_PATH, unknownRouteTarget } from "@/features/special/unknown-route";

const locales = ["pt", "en"];

describe("unknownRouteTarget", () => {
  it("deixa passar a home de cada idioma", () => {
    expect(unknownRouteTarget("/pt", locales)).toBeNull();
    expect(unknownRouteTarget("/en/", locales)).toBeNull();
  });

  it("manda um caminho que não existe para o 404 do mesmo idioma", () => {
    expect(unknownRouteTarget("/pt/rota-que-nao-existe", locales)).toBe(`/pt/${NOT_FOUND_PATH}`);
    expect(unknownRouteTarget("/en/a/b/c", locales)).toBe(`/en/${NOT_FOUND_PATH}`);
  });

  it("manda o próprio caminho do 404 para ele mesmo", () => {
    expect(unknownRouteTarget(`/pt/${NOT_FOUND_PATH}`, locales)).toBe(`/pt/${NOT_FOUND_PATH}`);
  });

  it("deixa com o next-intl um caminho sem idioma, que ele redireciona", () => {
    expect(unknownRouteTarget("/", locales)).toBeNull();
    expect(unknownRouteTarget("/sobre", locales)).toBeNull();
  });
});
