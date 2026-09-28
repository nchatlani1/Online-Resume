/* Resolve the palette before paint; keep theme handling independent of the scene. */
(() => {
  const root = document.documentElement;
  const key = 'nc-color-theme';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let preference;
  try { preference = localStorage.getItem(key); } catch (_) { /* Storage is optional. */ }
  if (!['light', 'dark'].includes(preference)) preference = null;
  let button, pulseTimer, transition;

  function apply(theme) {
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1018' : '#f2efe7');
    if (!button) return;
    const dark = theme === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.title = dark ? 'Power down to light mode' : 'Power up dark mode';
    button.querySelector('.theme-chip-action').textContent = dark ? 'POWER DOWN' : 'POWER UP';
    button.querySelector('.theme-chip-mode').textContent = dark ? 'LIGHT MODE' : 'DARK MODE';
  }

  apply(preference || (system.matches ? 'dark' : 'light'));
  system.addEventListener('change', () => {
    if (!preference) apply(system.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== key && event.key !== null) return;
    preference = ['light', 'dark'].includes(event.newValue) ? event.newValue : null;
    apply(preference || (system.matches ? 'dark' : 'light'));
  });

  document.addEventListener('DOMContentLoaded', () => {
    button = document.querySelector('.theme-chip');
    if (!button) return;
    button.hidden = false;
    apply(root.dataset.theme);
    button.addEventListener('click', () => {
      // Let a transition settle before beginning another snapshot.
      if (transition) return;
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch (_) { /* Works without persistence. */ }
      const rect = button.getBoundingClientRect();
      root.style.setProperty('--power-x', `${rect.left + rect.width / 2}px`);
      root.style.setProperty('--power-y', `${rect.top + rect.height / 2}px`);
      root.classList.remove('power-pulse');
      clearTimeout(pulseTimer);
      const pulse = () => {
        if (reduced.matches) return;
        root.classList.add('power-pulse');
        pulseTimer = setTimeout(() => root.classList.remove('power-pulse'), 850);
      };
      const commit = () => apply(preference);
      if (document.startViewTransition && !reduced.matches) {
        root.classList.add('theme-reveal');
        transition = document.startViewTransition(commit);
        transition.finished.catch(() => {}).finally(() => {
          root.classList.remove('theme-reveal');
          transition = null;
          pulse();
        });
      } else {
        commit();
        requestAnimationFrame(pulse);
      }
    });
  });
})();
