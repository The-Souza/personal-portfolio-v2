import { describe, expect, it } from "vitest";
import { languageAlternates, personJsonLd, siteUrl } from "@/features/seo/seo";

describe("siteUrl", () => {
  it("usa a URL definida no ambiente, sem barra no fim", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://portfolio.example.com/" })).toBe("https://portfolio.example.com");
  });

  it("sem ela, usa o domínio de produção que a Vercel informa", () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "portfolio-v2.vercel.app" })).toBe("https://portfolio-v2.vercel.app");
  });

  it("prefere a URL definida ao domínio da Vercel", () => {
    expect(
      siteUrl({ NEXT_PUBLIC_SITE_URL: "https://portfolio.example.com", VERCEL_PROJECT_PRODUCTION_URL: "portfolio-v2.vercel.app" }),
    ).toBe("https://portfolio.example.com");
  });

  it("sem nenhuma das duas, usa o servidor local", () => {
    expect(siteUrl({})).toBe("http://localhost:3000");
  });
});

describe("languageAlternates", () => {
  it("liga cada idioma à sua página, com o português como padrão", () => {
    expect(languageAlternates("https://site.dev")).toEqual({
      "pt-BR": "https://site.dev/pt",
      en: "https://site.dev/en",
      "x-default": "https://site.dev/pt",
    });
  });
});

describe("personJsonLd", () => {
  const data = personJsonLd({ url: "https://site.dev/pt", description: "Dev web.", jobTitle: "Desenvolvedor", lang: "pt-BR" });
  const [person, organization] = data["@graph"];

  it("descreve a pessoa, com o idioma e a página", () => {
    expect(data["@context"]).toBe("https://schema.org");
    expect(person).toMatchObject({
      "@type": "Person",
      "@id": "https://site.dev/pt#person",
      name: "Guilherme Campos",
      url: "https://site.dev/pt",
      description: "Dev web.",
      jobTitle: "Desenvolvedor",
      inLanguage: "pt-BR",
    });
  });

  it("descreve a The Souza Tech", () => {
    expect(organization).toMatchObject({ "@type": "Organization", name: "The Souza Tech", url: "https://thesouzatech.com.br" });
  });

  it("liga as duas: a pessoa trabalha na empresa e é fundadora dela", () => {
    expect(person.worksFor).toEqual({ "@id": organization["@id"] });
    expect(organization.founder).toEqual({ "@id": person["@id"] });
  });

  it("aponta os perfis públicos", () => {
    expect(person.sameAs).toEqual(["https://www.linkedin.com/in/gcampos-dev/", "https://github.com/The-Souza"]);
  });
});
