// Runs before first paint: apply the saved droid. R2-D2 is dark, C-3PO is light.
// Without a saved choice, a light OS preference starts on C-3PO; otherwise R2-D2.
const droidKey = 'agent-starwars-droid';
const root = document.documentElement;
try {
  const saved = localStorage.getItem(droidKey);
  if (saved === 'c3po' || (saved !== 'r2d2' && matchMedia('(prefers-color-scheme: light)').matches)) root.dataset.droid = 'c3po';
} catch {}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('#droid-toggle');
  const isC3po = () => root.dataset.droid === 'c3po';
  const render = () => {
    toggle.setAttribute('aria-pressed', String(isC3po()));
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue('--bg').trim();
    document.dispatchEvent(new CustomEvent('droidchange'));
  };
  toggle.addEventListener('click', () => {
    if (isC3po()) delete root.dataset.droid;
    else root.dataset.droid = 'c3po';
    try { localStorage.setItem(droidKey, isC3po() ? 'c3po' : 'r2d2'); } catch {}
    render();
  });
  render();
});
