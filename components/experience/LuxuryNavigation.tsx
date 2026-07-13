'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart, VISIBLE_PRODUCTS } from '@/lib/cart';

const LINKS = [
  { label: 'Shop', href: '/#shop' },
  { label: 'Products', href: '/#products' },
  { label: 'Ingredients', href: '/#ingredients' },
  { label: 'Ritual', href: '/#ritual' },
  { label: 'About', href: '/#about' },
];

export default function LuxuryNavigation() {
  const { count, open } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    const panel = searchPanelRef.current;
    const trigger = searchButtonRef.current;
    const focusable = () => Array.from(
      panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || []
    );
    focusable()[0]?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchOpen(false);
      if (event.key !== 'Tab') return;
      const elements = focusable();
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const solid = scrolled || pathname !== '/' || menuOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ease-silk ${
          solid ? 'glass-nav' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[68px] md:px-8">
          {/* left: logo */}
          <Link href="/" data-cursor="magnetic" className="flex items-center gap-2.5" title="Home">
            <Image
              src="/images/cutouts/logo.png"
              alt=""
              width={40}
              height={37}
              className="h-9 w-auto"
              priority
            />
            <span className="leading-none">
              <span className="font-display text-[17px] italic text-ink">divine mee</span>
              <span className="mt-0.5 block text-[7px] font-semibold tracking-[0.32em] text-ink-faint">
                SELF CARE RITUAL
              </span>
            </span>
          </Link>

          {/* center: links */}
          <nav className="hidden items-center gap-7 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                data-cursor="magnetic"
                className="text-[12.5px] font-medium text-ink-soft transition-colors duration-300 hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* right: search / account / cart */}
          <div className="flex items-center gap-1.5">
            <button
              ref={searchButtonRef}
              data-cursor="magnetic"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors duration-300 hover:bg-ink/5 hover:text-ink"
              aria-label="Search"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.8-3.8" strokeLinecap="round" />
              </svg>
            </button>
            <div>
              <Link
                href="/account"
                data-cursor="magnetic"
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors duration-300 hover:bg-ink/5 hover:text-ink"
                aria-label="Account"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c1.5-3.6 4.5-5.5 8-5.5s6.5 1.9 8 5.5" strokeLinecap="round" />
                </svg>
              </Link>
            </div>
            <button
              id="dm-bag"
              data-cursor="magnetic"
              onClick={open}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors duration-300 hover:bg-ink/5 hover:text-ink"
              aria-label={`Open cart, ${count} items`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M6 7h12l1 14H5L6 7z" strokeLinejoin="round" />
                <path d="M9 10V6a3 3 0 0 1 6 0v4" strokeLinecap="round" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
            {/* mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft lg:hidden"
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
              </svg>
            </button>
          </div>
        </div>

        {/* mobile dropdown */}
        <div
          id="mobile-navigation"
          className={`glass-nav overflow-hidden transition-all duration-500 ease-silk lg:hidden ${
            menuOpen ? 'max-h-96 border-t border-ink/5' : 'max-h-0'
          }`}
        >
          <nav className="flex flex-col px-6 py-4">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-ink/5 py-3.5 text-[15px] font-medium text-ink-soft last:border-0"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* search overlay */}
      <div
        className={`fixed inset-0 z-[140] transition-all duration-400 ${
          searchOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Product search"
        aria-hidden={!searchOpen}
      >
        <div
          className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        />
        <div
          ref={searchPanelRef}
          className={`glass-panel absolute left-1/2 top-24 w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 rounded-3xl p-6 shadow-lift transition-all duration-500 ease-silk ${
            searchOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          <p className="text-[10px] font-semibold tracking-[0.3em] text-ink-faint">
            THE COLLECTION
          </p>
          <div className="mt-4 space-y-2">
            {VISIBLE_PRODUCTS.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                onClick={() => setSearchOpen(false)}
                className="flex items-center gap-4 rounded-2xl p-3 transition-colors duration-300 hover:bg-ink/[0.04]"
              >
                <span
                  className="flex h-14 w-11 items-center justify-center rounded-xl"
                  style={{ background: p.accentSoft }}
                >
                  <Image src={p.cutout} alt="" width={32} height={66} className="h-11 w-auto" />
                </span>
                <span>
                  <span className="block font-display text-lg italic text-ink">{p.name}</span>
                  <span className="text-xs text-ink-faint">
                    Epsom salt bath soak · {p.weight} · ₹{p.price}
                  </span>
                </span>
                <span className="ml-auto text-ink-faint">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
