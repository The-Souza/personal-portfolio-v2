import { describe, expect, it } from "vitest";
import { trustedOrigin } from "@/i18n/unknown-route";

describe("trustedOrigin", () => {
  it("aceita o domínio do site", () => {
    expect(trustedOrigin("https://portfolio.dev/pt/x", { NEXT_PUBLIC_SITE_URL: "https://portfolio.dev" })).toBe("https://portfolio.dev");
  });

  it("aceita os domínios que a Vercel informa", () => {
    const env = { VERCEL_URL: "app-abc.vercel.app", VERCEL_BRANCH_URL: "app-git-develop.vercel.app", VERCEL_PROJECT_PRODUCTION_URL: "app.vercel.app" };
    expect(trustedOrigin("https://app-abc.vercel.app/pt/x", env)).toBe("https://app-abc.vercel.app");
    expect(trustedOrigin("https://app-git-develop.vercel.app/pt/x", env)).toBe("https://app-git-develop.vercel.app");
    expect(trustedOrigin("https://app.vercel.app/pt/x", env)).toBe("https://app.vercel.app");
  });

  it("em desenvolvimento, aceita o servidor local em qualquer porta", () => {
    const env = { NODE_ENV: "development" };
    expect(trustedOrigin("http://localhost:3100/pt/x", env)).toBe("http://localhost:3100");
    expect(trustedOrigin("http://127.0.0.1:3000/pt/x", env)).toBe("http://127.0.0.1:3000");
  });

  it("em produção, recusa o localhost (o Host pode apontar para um serviço interno)", () => {
    const env = { NODE_ENV: "production" };
    expect(trustedOrigin("http://localhost:6379/pt/x", env)).toBeNull();
    expect(trustedOrigin("http://127.0.0.1:3000/pt/x", env)).toBeNull();
    expect(trustedOrigin("http://[::1]:3000/pt/x", env)).toBeNull();
  });

  it("em produção, aceita só a origem local declarada (o servidor do e2e)", () => {
    const env = { NODE_ENV: "production", TRUSTED_LOCAL_ORIGIN: "http://localhost:3100" };
    expect(trustedOrigin("http://localhost:3100/pt/x", env)).toBe("http://localhost:3100");
    expect(trustedOrigin("http://localhost:6379/pt/x", env)).toBeNull();
  });

  it("recusa qualquer outro host, que veio do cabeçalho Host da requisição", () => {
    expect(trustedOrigin("http://169.254.169.254/pt/x", { NEXT_PUBLIC_SITE_URL: "https://portfolio.dev" })).toBeNull();
    expect(trustedOrigin("https://evil.example/pt/x", { VERCEL_URL: "app-abc.vercel.app" })).toBeNull();
  });

  it("não aceita um host parecido com o do site", () => {
    expect(trustedOrigin("https://portfolio.dev.evil.example/pt/x", { NEXT_PUBLIC_SITE_URL: "https://portfolio.dev" })).toBeNull();
  });
});
