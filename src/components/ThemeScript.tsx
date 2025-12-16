/**
 * Theme initialization script to prevent flash of unstyled content
 * This must be inline in the head to run before React hydration
 */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            function getInitialTheme() {
              const stored = localStorage.getItem('theme');
              if (stored === 'light' || stored === 'dark') {
                return stored;
              }
              if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
              }
              return 'light';
            }
            const theme = getInitialTheme();
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          })();
        `,
      }}
    />
  )
}

