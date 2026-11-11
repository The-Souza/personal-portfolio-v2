import { describe, expect, it } from "vitest";
import { mailtoUrl, whatsappUrl } from "@/features/contact/contact-links";

describe("whatsappUrl", () => {
  it("monta o link do wa.me com o número só em dígitos", () => {
    expect(whatsappUrl("55 (11) 99452-0881", "")).toBe("https://wa.me/5511994520881");
  });

  it("anexa a mensagem pronta codificada", () => {
    expect(whatsappUrl("5511994520881", "Olá! Vim pelo portfólio.")).toBe(
      "https://wa.me/5511994520881?text=Ol%C3%A1!%20Vim%20pelo%20portf%C3%B3lio.",
    );
  });

  it("codifica caracteres que quebrariam a query", () => {
    expect(whatsappUrl("5511994520881", "a&b=c?#")).toBe("https://wa.me/5511994520881?text=a%26b%3Dc%3F%23");
  });
});

describe("mailtoUrl", () => {
  it("monta o mailto só com o endereço quando não há assunto", () => {
    expect(mailtoUrl("contato@thesouzatech.com.br", "")).toBe("mailto:contato@thesouzatech.com.br");
  });

  it("anexa o assunto codificado, com espaço como %20", () => {
    expect(mailtoUrl("contato@thesouzatech.com.br", "Projeto via portfólio")).toBe(
      "mailto:contato@thesouzatech.com.br?subject=Projeto%20via%20portf%C3%B3lio",
    );
  });

  it("codifica & e ? no assunto", () => {
    expect(mailtoUrl("a@b.co", "Site & sistema?")).toBe("mailto:a@b.co?subject=Site%20%26%20sistema%3F");
  });
});
