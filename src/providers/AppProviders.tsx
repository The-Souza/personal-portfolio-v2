import { type AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { LenisProvider } from "@/providers/LenisProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

/**
 * Everything the whole app runs inside: the client texts, the theme and smooth scroll. The root
 * layout passes only the namespaces client components read (see CLIENT_NAMESPACES there).
 */
export function AppProviders({ messages, children }: { messages: AbstractIntlMessages; children: ReactNode }) {
  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <LenisProvider>{children}</LenisProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
