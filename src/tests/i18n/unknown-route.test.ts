import { describe, expect, it } from "vitest";
import { carryIntlHeaders, isNotFoundPage, NOT_FOUND_PATH, unknownRouteTarget, wantsHtml } from "@/i18n/unknown-route";

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
  it("uma visita do navegador (Sec-Fetch-Dest: document) recebe o 404 de verdade", () => {
    expect(wantsHtml(new Headers({ "sec-fetch-dest": "document", accept: "text/html,*/*;q=0.8" }))).toBe(true);
  });

  it("uma navegação do cliente (RSC) é um fetch, mesmo sem os headers que o Next tira antes do proxy", () => {
    expect(wantsHtml(new Headers({ "sec-fetch-dest": "empty", accept: "*/*" }))).toBe(false);
  });

  it("curl, monitores e verificadores de links, sem Sec-Fetch-Dest, também recebem o 404 de verdade", () => {
    expect(wantsHtml(new Headers({ accept: "*/*" }))).toBe(true);
    expect(wantsHtml(new Headers())).toBe(true);
  });

  it("um header rsc que ainda chegue manda para o rewrite", () => {
    expect(wantsHtml(new Headers({ "sec-fetch-dest": "document", rsc: "1" }))).toBe(false);
  });
});

describe("carryIntlHeaders", () => {
  const intl = () =>
    new Headers({
      "set-cookie": "NEXT_LOCALE=pt; Path=/",
      link: '</en>; rel="alternate"',
      "content-type": "text/plain",
      "x-middleware-next": "1",
      "x-middleware-rewrite": "https://site.dev/pt/x",
    });

  it("leva todos os cookies, não só o último", () => {
    const from = new Headers();
    from.append("set-cookie", "NEXT_LOCALE=pt; Path=/");
    from.append("set-cookie", "other=1; Path=/");
    const to = new Headers();
    carryIntlHeaders(from, to);
    expect(to.getSetCookie()).toEqual(["NEXT_LOCALE=pt; Path=/", "other=1; Path=/"]);
  });

  it("leva o cookie de idioma e os outros headers do next-intl", () => {
    const to = new Headers();
    carryIntlHeaders(intl(), to);
    expect(to.get("set-cookie")).toBe("NEXT_LOCALE=pt; Path=/");
    expect(to.get("link")).toContain("alternate");
  });

  it("não leva as instruções de roteamento nem o content-type", () => {
    const to = new Headers({ "x-middleware-rewrite": "https://site.dev/pt/off-the-map", "content-type": "text/html" });
    carryIntlHeaders(intl(), to);
    expect(to.get("x-middleware-next")).toBeNull();
    expect(to.get("x-middleware-rewrite")).toBe("https://site.dev/pt/off-the-map");
    expect(to.get("content-type")).toBe("text/html");
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
