import { pad2 } from "@/lib/format";

export interface CardBox {
  /** offsetLeft inside the track. */
  left: number;
  width: number;
}

/** Track `x` that centers each card on screen, kept between the track's start and its end. */
export function trackStops(
  cards: CardBox[],
  viewportWidth: number,
  maxShift: number,
) {
  return cards.map((card) => {
    const centered = -(card.left + card.width / 2 - viewportWidth / 2);
    return Math.max(-maxShift, Math.min(0, centered));
  });
}

/** The active card is the one whose center is closest to the center of the screen. */
export function closestToCenter(
  cards: CardBox[],
  trackX: number,
  viewportWidth: number,
) {
  let index = -1;
  let distance = Infinity;
  cards.forEach((card, i) => {
    const gap = Math.abs(
      card.left + trackX + card.width / 2 - viewportWidth / 2,
    );
    if (gap < distance) {
      distance = gap;
      index = i;
    }
  });
  return { index, distance };
}

export function counterLabel(index: number, total: number) {
  return `${pad2(index + 1)} / ${pad2(total)}`;
}

/**
 * Where BillWise's v1 ghost settles: diagonal on the track, or straight up in the list (phones),
 * where the cards span the width and a diagonal would push it off the left edge.
 */
export function ghostOffset(list: boolean) {
  return list ? { x: 0, y: -48 } : { x: -44, y: -36 };
}
