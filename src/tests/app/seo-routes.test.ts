import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("lista a home de cada idioma, com a URL do site", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://site.dev");
    expect(sitemap().map((entry) => entry.url)).toEqual(["https://site.dev/pt", "https://site.dev/en"]);
  });

  it("liga cada entrada às versões nos outros idiomas", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://site.dev");
    expect(sitemap()[0].alternates?.languages).toEqual({
      "pt-BR": "https://site.dev/pt",
      en: "https://site.dev/en",
      "x-default": "https://site.dev/pt",
    });
  });
});

describe("robots", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("libera o site todo e aponta o sitemap", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://site.dev");
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://site.dev/sitemap.xml",
    });
  });
});
