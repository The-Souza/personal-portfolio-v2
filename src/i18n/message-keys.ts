function flatten(messages: object, prefix = ""): [string, unknown][] {
  return Object.entries(messages).flatMap(([key, value]): [string, unknown][] => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value !== null && typeof value === "object" ? flatten(value, path) : [[path, value]];
  });
}

export function collectKeys(messages: object) {
  return flatten(messages)
    .map(([path]) => path)
    .sort();
}

export function collectEmptyKeys(messages: object) {
  return flatten(messages)
    .filter(([, value]) => typeof value === "string" && value.trim() === "")
    .map(([path]) => path)
    .sort();
}
