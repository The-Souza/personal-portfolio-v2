const HTML_LANG: Record<string, string> = { pt: "pt-BR" };

export function htmlLang(locale: string) {
  return HTML_LANG[locale] ?? locale;
}
