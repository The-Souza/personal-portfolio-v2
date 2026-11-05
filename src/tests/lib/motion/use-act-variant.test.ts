import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useActVariant } from "@/lib/motion/use-act-variant";
import { mockMediaQueries } from "@/tests/media-query";

const screen = ({ narrow = false, short = false, reduced = false }) => (query: string) =>
  (query.includes("reduce") && reduced) || (query.includes("max-height") && short) || (query.includes("max-width") && narrow);

describe("useActVariant", () => {
  it("devolve full numa tela grande", () => {
    mockMediaQueries(screen({}));
    expect(renderHook(() => useActVariant()).result.current).toBe("full");
  });

  it("devolve narrow no celular em pé", () => {
    mockMediaQueries(screen({ narrow: true }));
    expect(renderHook(() => useActVariant()).result.current).toBe("narrow");
  });

  it("devolve short numa tela baixa", () => {
    mockMediaQueries(screen({ short: true }));
    expect(renderHook(() => useActVariant()).result.current).toBe("short");
  });

  it("devolve static com movimento reduzido", () => {
    mockMediaQueries(screen({ reduced: true, narrow: true }));
    expect(renderHook(() => useActVariant()).result.current).toBe("static");
  });

  it("atualiza quando a faixa muda", () => {
    const media = mockMediaQueries(screen({}));
    const { result } = renderHook(() => useActVariant());
    act(() => media.change(screen({ short: true })));
    expect(result.current).toBe("short");
  });
});
