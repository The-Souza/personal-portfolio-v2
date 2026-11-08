import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const scrollTrigger = vi.hoisted(() => ({ refresh: vi.fn(), isTouch: 0 }));
vi.mock("@/lib/motion/gsap", () => ({ ScrollTrigger: scrollTrigger }));

const setHeight = (height: number) => {
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
  window.dispatchEvent(new Event("resize"));
};

const setWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  window.dispatchEvent(new Event("resize"));
};

async function load() {
  vi.resetModules();
  const relayout = await import("@/lib/scroll/relayout");
  const { ScrollTrigger } = await import("@/lib/motion/gsap");
  return { ...relayout, refresh: vi.mocked(ScrollTrigger.refresh) };
}

describe("relayout", () => {
  let first: HTMLElement;
  let second: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    scrollTrigger.isTouch = 0;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
    first = document.createElement("section");
    second = document.createElement("section");
    document.body.replaceChildren(first, second);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("remonta os atos na hora, no primeiro resize", async () => {
    const { registerRelayout } = await load();
    const rebuild = vi.fn();
    registerRelayout(first, rebuild);
    setWidth(1000);
    expect(rebuild).toHaveBeenCalledOnce();
  });

  it("remonta de novo no fim quando o tamanho continuou mudando", async () => {
    const { registerRelayout } = await load();
    const rebuild = vi.fn();
    registerRelayout(first, rebuild);
    setWidth(1000);
    setWidth(900);
    vi.advanceTimersByTime(100);
    setWidth(800);
    expect(rebuild).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(149);
    expect(rebuild).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(1);
    expect(rebuild).toHaveBeenCalledTimes(2);
  });

  it("não remonta de novo quando o tamanho parou no primeiro resize", async () => {
    const { registerRelayout } = await load();
    const rebuild = vi.fn();
    registerRelayout(first, rebuild);
    setWidth(1000);
    vi.advanceTimersByTime(500);
    expect(rebuild).toHaveBeenCalledOnce();
  });

  it("remonta na ordem da página, não na ordem de registro", async () => {
    const { registerRelayout } = await load();
    const calls: string[] = [];
    registerRelayout(second, () => calls.push("second"));
    registerRelayout(first, () => calls.push("first"));
    setWidth(1000);
    expect(calls).toEqual(["first", "second"]);
  });

  it("atualiza o ScrollTrigger e avisa quem espera depois de remontar tudo", async () => {
    const { onRelayout, refresh, registerRelayout } = await load();
    const calls: string[] = [];
    registerRelayout(first, () => calls.push("rebuild"));
    refresh.mockImplementation(() => calls.push("refresh"));
    onRelayout(() => calls.push("after"));
    setWidth(1000);
    expect(calls).toEqual(["rebuild", "refresh", "after"]);
  });

  it("avisa o início antes de remontar, uma vez por rodada", async () => {
    const { onRelayoutStart, registerRelayout } = await load();
    const calls: string[] = [];
    onRelayoutStart(() => calls.push("start"));
    registerRelayout(first, () => calls.push("rebuild"));
    setWidth(1000);
    setWidth(900);
    vi.advanceTimersByTime(150);
    expect(calls).toEqual(["start", "rebuild", "rebuild"]);
    setWidth(800);
    expect(calls).toEqual(["start", "rebuild", "rebuild", "start", "rebuild"]);
  });

  it("ignora um resize que não muda nada", async () => {
    const { registerRelayout } = await load();
    const rebuild = vi.fn();
    registerRelayout(first, rebuild);
    window.dispatchEvent(new Event("resize"));
    vi.advanceTimersByTime(300);
    expect(rebuild).not.toHaveBeenCalled();
  });

  it("remonta quando só a altura muda numa tela sem toque", async () => {
    const { registerRelayout } = await load();
    const rebuild = vi.fn();
    registerRelayout(first, rebuild);
    setHeight(700);
    expect(rebuild).toHaveBeenCalledOnce();
  });

  it("ignora a mudança só de altura numa tela de toque, que é a barra do navegador", async () => {
    scrollTrigger.isTouch = 1;
    const { registerRelayout } = await load();
    const rebuild = vi.fn();
    registerRelayout(first, rebuild);
    setHeight(700);
    vi.advanceTimersByTime(300);
    expect(rebuild).not.toHaveBeenCalled();
  });

  it("não remonta um ato que saiu", async () => {
    const { registerRelayout } = await load();
    const rebuild = vi.fn();
    const unregister = registerRelayout(first, rebuild);
    unregister();
    setWidth(1000);
    vi.advanceTimersByTime(300);
    expect(rebuild).not.toHaveBeenCalled();
  });
});
