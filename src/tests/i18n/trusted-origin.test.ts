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

  it("aceita o servidor local em qualquer porta", () => {
    expect(trustedOrigin("http://localhost:3100/pt/x", {})).toBe("http://localhost:3100");
    expect(trustedOrigin("http://127.0.0.1:3000/pt/x", {})).toBe("http://127.0.0.1:3000");
  });

  it("recusa qualquer outro host, que veio do cabeçalho Host da requisição", () => {
    expect(trustedOrigin("http://169.254.169.254/pt/x", { NEXT_PUBLIC_SITE_URL: "https://portfolio.dev" })).toBeNull();
    expect(trustedOrigin("https://evil.example/pt/x", { VERCEL_URL: "app-abc.vercel.app" })).toBeNull();
  });

  it("não aceita um host parecido com o do site", () => {
    expect(trustedOrigin("https://portfolio.dev.evil.example/pt/x", { NEXT_PUBLIC_SITE_URL: "https://portfolio.dev" })).toBeNull();
  });
});
