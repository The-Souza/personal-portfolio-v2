import "./globals.css";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`h-full antialiased`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
