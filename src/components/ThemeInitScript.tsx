import Script from "next/script";

const THEME_INIT_SCRIPT = `
  (function () {
    try {
      var stored = localStorage.getItem('theme');
      var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', dark);
    } catch (e) {}
  })();
`;

// This rule predates the App Router; Next's own docs place beforeInteractive scripts in app/layout.tsx.
export function ThemeInitScript() {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script id="theme-init" strategy="beforeInteractive">
      {THEME_INIT_SCRIPT}
    </Script>
  );
}
