import { describe, expect, it } from "vitest";
import { ACT_IDS } from "@/content/acts";
import { PROJECTS } from "@/content/projects";
import { STACK_CATEGORIES } from "@/content/stack";
import en from "../../../messages/en.json";
import pt from "../../../messages/pt.json";

describe.each([
  ["pt", pt],
  ["en", en],
])("conteúdo e mensagens em %s", (_locale, messages) => {
  it("tem textos para cada projeto", () => {
    for (const { key } of PROJECTS) expect(messages.projects.items).toHaveProperty(key);
  });

  it("tem o rótulo de cada link de projeto", () => {
    for (const { links } of PROJECTS) {
      for (const link of links) expect(messages.projects.links).toHaveProperty(link.label);
    }
  });

  it("tem o nome de cada categoria da stack", () => {
    for (const { key } of STACK_CATEGORIES) expect(messages.stack.categories).toHaveProperty(key);
  });

  it("tem o rótulo de cada ato no menu e no HUD", () => {
    for (const id of ACT_IDS) {
      expect(messages.header.menuItems).toHaveProperty(id);
      expect(messages.hud.acts).toHaveProperty(id);
    }
  });
});

describe("conteúdo", () => {
  it("tem os quatro projetos", () => {
    expect(PROJECTS).toHaveLength(4);
  });

  it("tem as seis categorias da stack", () => {
    expect(STACK_CATEGORIES).toHaveLength(6);
  });
});
