/**
 * Retries per error, kept outside the component: when `retry()` fails, the boundary renders the
 * error page again, and a fresh component would forget it was a second failure (brief: then it
 * shows the digest to copy).
 */
const attempts = new Map<string, number>();

export function errorKey(error: unknown) {
  if (error instanceof Error) return (error as Error & { digest?: string }).digest ?? error.message;
  return String(error);
}

export function attemptsFor(key: string) {
  return attempts.get(key) ?? 0;
}

export function recordAttempt(key: string) {
  attempts.set(key, attemptsFor(key) + 1);
}
