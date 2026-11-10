import { describe, expect, it } from "vitest";
import { logLine, toClientReport } from "@/lib/errors/report";
import { clientErrorSchema } from "@/lib/errors/schema";

describe("toClientReport", () => {
  it("monta o relato de um Error com mensagem, pilha, origem e rota", () => {
    const error = new Error("quebrou");
    const report = toClientReport(error, "window", "/pt");
    expect(report).toMatchObject({ source: "window", message: "quebrou", path: "/pt" });
    expect(report.stack).toContain("quebrou");
  });

  it("leva o digest quando o erro tem um", () => {
    const error = Object.assign(new Error("x"), { digest: "123" });
    expect(toClientReport(error, "boundary", "/pt").digest).toBe("123");
  });

  it("aceita um valor que não é Error", () => {
    expect(toClientReport("texto lançado", "promise", "/en")).toMatchObject({ message: "texto lançado", stack: undefined });
  });

  it("usa um texto padrão para uma mensagem vazia", () => {
    expect(toClientReport(new Error(""), "window", "/pt").message).toBe("(sem mensagem)");
  });

  it("corta mensagem, pilha e rota longas", () => {
    const error = new Error("m".repeat(900));
    error.stack = "s".repeat(9000);
    const report = toClientReport(error, "window", `/${"p".repeat(900)}`);
    expect(report.message).toHaveLength(500);
    expect(report.stack).toHaveLength(4000);
    expect(report.path).toHaveLength(300);
  });

  it("sempre passa no próprio schema", () => {
    const report = toClientReport(new Error("x".repeat(900)), "window", "/pt");
    expect(clientErrorSchema.safeParse(report).success).toBe(true);
  });
});

describe("clientErrorSchema", () => {
  const valid = { source: "window", message: "quebrou", path: "/pt" };

  it("aceita um relato válido", () => {
    expect(clientErrorSchema.safeParse(valid).success).toBe(true);
  });

  it("recusa origem desconhecida", () => {
    expect(clientErrorSchema.safeParse({ ...valid, source: "outra" }).success).toBe(false);
  });

  it("recusa mensagem vazia ou longa demais", () => {
    expect(clientErrorSchema.safeParse({ ...valid, message: "" }).success).toBe(false);
    expect(clientErrorSchema.safeParse({ ...valid, message: "m".repeat(501) }).success).toBe(false);
  });

  it("recusa campos a mais", () => {
    expect(clientErrorSchema.safeParse({ ...valid, cookie: "x" }).success).toBe(false);
  });
});

describe("logLine", () => {
  it("gera uma linha de JSON marcada com o tipo", () => {
    expect(JSON.parse(logLine("client-error", { message: "x" }))).toEqual({ kind: "client-error", message: "x" });
  });

  it("fica numa linha só, para o log não quebrar o registro", () => {
    expect(logLine("server-error", { stack: "a\nb" })).not.toContain("\n");
  });
});
