import { describe, expect, it } from "vitest";
import { isNotFoundPage, NOT_FOUND_PATH, unknownRouteTarget, wantsHtml } from "@/i18n/unknown-route";

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

  it("deixa passar a própria rota do 404, que o proxy busca para devolver com status 404", () => {
    expect(unknownRouteTarget(`/pt/${NOT_FOUND_PATH}`, locales)).toBeNull();
  });

  it("deixa com o next-intl um caminho sem idioma, que ele redireciona", () => {
    expect(unknownRouteTarget("/", locales)).toBeNull();
    expect(unknownRouteTarget("/sobre", locales)).toBeNull();
  });
});

describe("wantsHtml", () => {
  it("uma visita do navegador pede HTML", () => {
    expect(wantsHtml(new Headers({ accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" }))).toBe(true);
  });

  it("uma navegação do cliente (RSC) não pede, mesmo sem os headers que o Next tira antes do proxy", () => {
    expect(wantsHtml(new Headers({ accept: "*/*" }))).toBe(false);
    expect(wantsHtml(new Headers())).toBe(false);
  });

  it("um header rsc que ainda chegue vence o accept", () => {
    expect(wantsHtml(new Headers({ accept: "text/html", rsc: "1" }))).toBe(false);
  });
});

describe("isNotFoundPage", () => {
  const page = (status: number, type = "text/html; charset=utf-8") => new Response("<html></html>", { status, headers: { "content-type": type } });

  it("aceita o HTML da rota do 404 com status 200", () => {
    expect(isNotFoundPage(page(200))).toBe(true);
  });

  it("recusa outro status: a tela de login de uma preview protegida, um erro, um redirecionamento", () => {
    expect(isNotFoundPage(page(401))).toBe(false);
    expect(isNotFoundPage(page(500))).toBe(false);
    expect(isNotFoundPage(page(307))).toBe(false);
  });

  it("recusa uma resposta que não é HTML", () => {
    expect(isNotFoundPage(page(200, "application/json"))).toBe(false);
  });
});
