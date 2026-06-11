import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="about" className="border-t border-ink/[0.07] bg-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-12 md:px-8">
        {/* brand */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <Image
              src="/images/cutouts/logo.png"
              alt="Divine Mee"
              width={48}
              height={45}
              className="h-11 w-auto"
            />
            <div>
              <p className="font-display text-xl italic text-ink">divine mee</p>
              <p className="text-[8px] tracking-[0.32em] text-ink-faint">
                SELF CARE RITUAL
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-[14px] font-light leading-relaxed text-ink-soft">
            Divine Mee crafts premium mineral bath salts in small batches —
            real botanicals, pure essential oils, no harsh chemicals. Because
            self-care shouldn&apos;t be a luxury you postpone.
          </p>
        </div>

        {/* links */}
        <div className="md:col-span-2">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-ink-faint">SHOP</p>
          <ul className="mt-4 space-y-2.5 text-[14px] font-light text-ink-soft">
            <li><Link href="/products/rose-magic" className="transition-colors hover:text-ink">Rose Magic</Link></li>
            <li><Link href="/products/lavender-bliss" className="transition-colors hover:text-ink">Lavender Bliss</Link></li>
            <li><Link href="/#shop" className="transition-colors hover:text-ink">All Products</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-ink-faint">LEARN</p>
          <ul className="mt-4 space-y-2.5 text-[14px] font-light text-ink-soft">
            <li><Link href="/#ingredients" className="transition-colors hover:text-ink">Ingredients</Link></li>
            <li><Link href="/#ritual" className="transition-colors hover:text-ink">The Ritual</Link></li>
            <li><Link href="/#reviews" className="transition-colors hover:text-ink">Reviews</Link></li>
          </ul>
        </div>

        {/* contact */}
        <div className="md:col-span-3">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-ink-faint">CARE</p>
          <ul className="mt-4 space-y-2.5 text-[14px] font-light text-ink-soft">
            <li>For external use only</li>
            <li>Patch-test if you have sensitive skin</li>
            <li>Store in a cool, dry place</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-[11.5px] text-ink-faint md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} Divine Mee. All rights reserved.</p>
          <p>Handcrafted with stillness in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
