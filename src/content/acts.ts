export const ACT_IDS = ["hero", "about", "projects", "stack", "contact"] as const;

export type ActId = (typeof ACT_IDS)[number];

export const NAV_IDS = ["about", "projects", "stack"] as const satisfies readonly ActId[];
