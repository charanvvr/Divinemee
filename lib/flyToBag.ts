'use client';

/** Champagne particles glide from a buy button into the cart icon. */
export function flyToBag(fromEl: HTMLElement | null, accent: string) {
  const bag = document.getElementById('dm-bag');
  if (!bag || !fromEl) return;
  const from = fromEl.getBoundingClientRect();
  const to = bag.getBoundingClientRect();
  const sx = from.left + from.width / 2;
  const sy = from.top + from.height / 2;
  const tx = to.left + to.width / 2;
  const ty = to.top + to.height / 2;

  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:300;';
  document.body.appendChild(host);

  for (let i = 0; i < 10; i++) {
    const p = document.createElement('span');
    const size = 3 + Math.random() * 4;
    p.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;left:0;top:0;background:${i % 3 === 0 ? accent : '#d9b06a'};`;
    host.appendChild(p);
    const midX = sx + (tx - sx) * 0.5 + (Math.random() - 0.5) * 160;
    const midY = sy + (ty - sy) * 0.45 - 60 - Math.random() * 90;
    p.animate(
      [
        { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 0.9 },
        { transform: `translate(${midX}px, ${midY}px) scale(1.1)`, opacity: 0.85, offset: 0.55 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.2)`, opacity: 0 },
      ],
      {
        duration: 650 + Math.random() * 300,
        easing: 'cubic-bezier(0.3, 0, 0.2, 1)',
        delay: Math.random() * 100,
        fill: 'forwards',
      }
    );
  }
  bag.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.18)' },
      { transform: 'scale(1)' },
    ],
    { duration: 420, delay: 620, easing: 'cubic-bezier(0.34,1.56,0.64,1)' }
  );
  setTimeout(() => host.remove(), 1400);
}
