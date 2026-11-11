import { afterEach, describe, expect, it } from "vitest";
import { inertOutside } from "@/features/header/inert-outside";

function page() {
  document.body.innerHTML = `
    <a id="skip" href="#main">skip</a>
    <header id="header"><button id="menu">menu</button></header>
    <div id="shell">
      <main id="main"></main>
      <div id="drawer"><div id="panel"><button id="close">close</button></div></div>
      <aside id="already" inert></aside>
    </div>
    <footer id="footer"></footer>
  `;
  return (id: string) => document.getElementById(id)!;
}

describe("inertOutside", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("deixa inert tudo o que está fora do elemento, em cada nível até o body", () => {
    const $ = page();
    inertOutside($("panel"));
    for (const id of ["skip", "header", "main", "footer"]) expect($(id).hasAttribute("inert")).toBe(true);
  });

  it("não toca no próprio elemento nem nos seus ancestrais", () => {
    const $ = page();
    inertOutside($("panel"));
    for (const id of ["panel", "drawer", "shell"]) expect($(id).hasAttribute("inert")).toBe(false);
  });

  it("ao restaurar, tira o inert só do que ele mesmo marcou", () => {
    const $ = page();
    const restore = inertOutside($("panel"));
    restore();
    for (const id of ["skip", "header", "main", "footer"]) expect($(id).hasAttribute("inert")).toBe(false);
    expect($("already").hasAttribute("inert")).toBe(true);
  });

  it("deixa o foco voltar ao botão do header logo depois de restaurar", () => {
    const $ = page();
    const restore = inertOutside($("panel"));
    restore();
    $("menu").focus();
    expect(document.activeElement).toBe($("menu"));
  });
});
