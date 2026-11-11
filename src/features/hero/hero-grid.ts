import { gsap } from "@/lib/motion/gsap";

const STEP = 16;
const ARM_REACH = 180;
const MAX_DPR = 2;

interface Dot {
  column: number;
  row: number;
  x: number;
  y: number;
}

export function formatReadout(x: number, y: number) {
  const pad = (value: number) => String(Math.round(value)).padStart(4, "0");
  return `X ${pad(x)} · Y ${pad(y)}`;
}

/** The reticle follows a real mouse only: not touch or pen, nor a screen without a fine pointer. */
export function tracksPointer(pointerType: string, hasFinePointer: boolean) {
  return pointerType === "mouse" && hasFinePointer;
}

/** Dots on the cursor's row or column, up to 180px away, become the reticle arms. */
export function isArmDot(dot: Dot, cursor: Dot) {
  return (
    (dot.column === cursor.column && Math.abs(dot.y - cursor.y) < ARM_REACH) ||
    (dot.row === cursor.row && Math.abs(dot.x - cursor.x) < ARM_REACH)
  );
}

/** The grid lights up from the center out; at 1 it reaches the corners. */
export function revealRadius(width: number, height: number, progress: number) {
  return Math.hypot(width / 2, height / 2) * progress;
}

/**
 * Maps a pointer position to grid coordinates. `rect` is the on-screen box, which shrinks
 * with the crack's scale, while `width`/`height` are the canvas's unscaled layout size.
 */
export function toGridPoint(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  width: number,
  height: number,
) {
  return {
    x: rect.width > 0 ? ((clientX - rect.left) * width) / rect.width : 0,
    y: rect.height > 0 ? ((clientY - rect.top) * height) / rect.height : 0,
  };
}

/**
 * 16px dot grid behind the hero, with a reticle that follows a mouse (not touch).
 * Draws only on demand, stops while off screen, and redraws when the theme changes.
 */
export function createHeroGrid(canvas: HTMLCanvasElement, host: HTMLElement) {
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let dpr = 1;
  let reveal = 0;
  let frame = 0;
  let visible = true;
  // Kept in screen coordinates and mapped to the grid on every draw: when the page scrolls
  // under a still mouse, no pointermove fires, and a stored grid point would go stale.
  let pointer: { clientX: number; clientY: number } | null = null;

  const color = (name: string) => getComputedStyle(canvas).getPropertyValue(name).trim();

  const cursorOnGrid = () => {
    if (!pointer) return null;
    const point = toGridPoint(pointer.clientX, pointer.clientY, canvas.getBoundingClientRect(), width, height);
    const inside = point.x >= 0 && point.y >= 0 && point.x <= width && point.y <= height;
    return inside ? point : null;
  };

  const draw = () => {
    frame = 0;
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    const cursor = cursorOnGrid();
    const radius = revealRadius(width, height, reveal);
    const dotColor = color("--border");
    const accent = color("--primary");
    const cursorDot = cursor && {
      column: Math.floor(cursor.x / STEP),
      row: Math.floor(cursor.y / STEP),
      ...cursor,
    };

    for (let row = 0, y = STEP / 2; y < height; row++, y += STEP) {
      for (let column = 0, x = STEP / 2; x < width; column++, x += STEP) {
        if (Math.hypot(x - width / 2, y - height / 2) > radius) continue;
        if (cursorDot && isArmDot({ column, row, x, y }, cursorDot)) {
          context.fillStyle = accent;
          context.fillRect(x - 2.5, y - 2.5, 5, 5);
        } else {
          context.fillStyle = dotColor;
          context.fillRect(x - 1, y - 1, 2, 2);
        }
      }
    }

    if (cursorDot && reveal > 0.5) {
      const guideX = cursorDot.column * STEP + STEP / 2;
      const guideY = cursorDot.row * STEP + STEP / 2;
      context.strokeStyle = accent;
      context.globalAlpha = 0.35;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, guideY + 0.5);
      context.lineTo(width, guideY + 0.5);
      context.moveTo(guideX + 0.5, 0);
      context.lineTo(guideX + 0.5, height);
      context.stroke();
      context.globalAlpha = 1;
      context.fillStyle = color("--primary-accessible");
      context.font = `500 10px ${color("--font-jetbrains-mono") || "monospace"}`;
      context.fillText(formatReadout(cursorDot.x, cursorDot.y), guideX + 14, guideY + 22);
    }
  };

  const request = () => {
    if (!frame && visible) frame = requestAnimationFrame(draw);
  };

  // Layout size, not getBoundingClientRect(): the crack scales the hero, and a measure taken
  // mid-scale would keep a shrunken grid until the next reload.
  const resize = () => {
    // A resize (a rotated phone, DevTools switching to a device) fires no pointerleave: the last
    // mouse position would freeze the reticle and its readout on the new screen.
    pointer = null;
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    request();
  };

  const finePointer = window.matchMedia("(pointer: fine)");
  const onMove = (event: PointerEvent) => {
    pointer = tracksPointer(event.pointerType, finePointer.matches) ? { clientX: event.clientX, clientY: event.clientY } : null;
    request();
  };
  const onLeave = () => {
    pointer = null;
    request();
  };
  const onScroll = () => {
    if (pointer) request();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    request();
  });
  visibilityObserver.observe(canvas);
  const themeObserver = new MutationObserver(request);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerdown", onMove);
  host.addEventListener("pointerleave", onLeave);
  window.addEventListener("scroll", onScroll, { passive: true });

  return {
    /** Lights the grid up from the center (1.3s, power2.out). */
    reveal: () => {
      const state = { value: reveal };
      return gsap.to(state, {
        value: 1,
        duration: 1.3,
        ease: "power2.out",
        onUpdate: () => {
          reveal = state.value;
          request();
        },
      });
    },
    show: () => {
      reveal = 1;
      request();
    },
    destroy: () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    },
  };
}
