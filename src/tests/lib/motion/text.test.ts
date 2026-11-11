import { beforeEach, describe, expect, it } from "vitest";
import { gsap } from "@/lib/motion/gsap";
import { SCRAMBLE_GLYPHS, scramble, scrambleFrame, splitChars, splitWordChars, splitWords } from "@/lib/motion/text";

let el: HTMLParagraphElement;

beforeEach(() => {
  el = document.createElement("p");
  el.textContent = "Automatizo o  que trava";
  document.body.replaceChildren(el);
});

describe("splitWords", () => {
  it("divide o texto em palavras", () => {
    const { parts } = splitWords(el);
    expect(parts.map((part) => part.textContent)).toEqual(["Automatizo", "o", "que", "trava"]);
  });

  it("mantém o texto original para leitores de tela", () => {
    splitWords(el);
    const copy = el.querySelector(".sr-only");
    expect(copy?.textContent).toBe("Automatizo o  que trava");
  });

  it("esconde as palavras animadas de leitores de tela", () => {
    const { parts } = splitWords(el);
    expect(parts[0].closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("guarda os próprios nós originais na cópia acessível", () => {
    const original = el.firstChild;
    splitWords(el);
    expect(el.querySelector(".sr-only")?.firstChild).toBe(original);
  });

  it("restaura o conteúdo original ao reverter", () => {
    const original = el.firstChild;
    splitWords(el).revert();
    expect(el.childNodes).toHaveLength(1);
    expect(el.firstChild).toBe(original);
  });
});

describe("splitChars", () => {
  it("divide em letras, mantendo os espaços", () => {
    el.textContent = "ab c";
    const { parts } = splitChars(el);
    expect(parts.map((part) => part.textContent)).toEqual(["a", "b", " ", "c"]);
  });

  it("mantém o texto original para leitores de tela", () => {
    el.textContent = "2025";
    splitChars(el);
    expect(el.querySelector(".sr-only")?.textContent).toBe("2025");
  });
});

describe("splitWordChars", () => {
  it("divide em letras, sem os espaços", () => {
    const { parts } = splitWordChars(el);
    expect(parts.map((part) => part.textContent).join("")).toBe("Automatizooquetrava");
  });

  it("agrupa as letras de cada palavra num bloco que não quebra", () => {
    const { parts } = splitWordChars(el);
    const word = parts[0].parentElement;
    expect(word?.textContent).toBe("Automatizo");
    expect(word?.className).toContain("whitespace-nowrap");
  });

  it("separa as palavras com espaço comum, que some na quebra de linha", () => {
    splitWordChars(el);
    const visual = el.querySelector("[aria-hidden='true']");
    expect(visual?.textContent).toBe("Automatizo o que trava");
  });

  it("mantém o texto original para leitores de tela", () => {
    splitWordChars(el);
    expect(el.querySelector(".sr-only")?.textContent).toBe("Automatizo o  que trava");
  });

  it("restaura o conteúdo original ao reverter", () => {
    const original = el.firstChild;
    splitWordChars(el).revert();
    expect(el.childNodes).toHaveLength(1);
    expect(el.firstChild).toBe(original);
  });
});

describe("scrambleFrame", () => {
  it("começa com tudo pendente", () => {
    const frame = scrambleFrame("abc", 0);
    expect(frame.settled).toBe("");
    expect(frame.pending).toHaveLength(3);
  });

  it("revela da esquerda para a direita", () => {
    expect(scrambleFrame("abcd", 0.5).settled).toBe("ab");
  });

  it("termina no texto final", () => {
    expect(scrambleFrame("abc", 1)).toEqual({ settled: "abc", pending: "" });
  });

  it("mantém os espaços pendentes como espaços", () => {
    expect(scrambleFrame("a b", 0, () => 0).pending).toBe(`${SCRAMBLE_GLYPHS[0]} ${SCRAMBLE_GLYPHS[0]}`);
  });

  it("troca os pendentes só por glifos do conjunto ou pelo próprio caractere", () => {
    const { pending } = scrambleFrame("xyz", 0);
    for (const [i, char] of [...pending].entries()) expect(SCRAMBLE_GLYPHS.includes(char) || char === "xyz"[i]).toBe(true);
  });
});

describe("scramble", () => {
  it("termina no texto final", () => {
    const tween = scramble(el, "GUILHERME", { duration: 0.9 });
    tween.progress(1);
    expect(el.textContent).toBe("GUILHERME");
  });

  it("marca os caracteres pendentes no meio da animação", () => {
    const tween = scramble(el, "GUILHERME");
    tween.progress(0.5);
    expect(el.querySelector(".text-primary-accessible")).not.toBeNull();
  });

  it("volta ao texto final quando a animação é interrompida no meio", () => {
    const tween = scramble(el, "GUILHERME");
    tween.progress(0.5);
    tween.kill();
    expect(el.textContent).toBe("GUILHERME");
  });

  it("volta ao texto final quando o contexto que a criou é revertido", () => {
    let tween: gsap.core.Tween | undefined;
    const context = gsap.context(() => {
      tween = scramble(el, "GUILHERME");
    });
    tween?.progress(0.5);
    context.revert();
    expect(el.textContent).toBe("GUILHERME");
  });
});
