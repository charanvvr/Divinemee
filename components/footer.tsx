import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"
import { Logo } from "./logo"

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-foreground text-ivory">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo textClassName="[&_span:first-child]:text-ivory [&_span:last-child]:text-ivory/50" />
            <p className="mt-5 max-w-xs font-serif text-xl leading-relaxed text-ivory/70">
              Not just bath salt. A daily self-care ritual, crafted in India.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="#"
                aria-label="Instagram"
                className="rounded-full border border-ivory/20 p-2.5 transition-colors hover:bg-ivory/10"
              >
                <Instagram className="h-5 w-5" strokeWidth={1.5} />
              </Link>
              <Link
                href="#"
                aria-label="Facebook"
                className="rounded-full border border-ivory/20 p-2.5 transition-colors hover:bg-ivory/10"
              >
                <Facebook className="h-5 w-5" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { label: "Rose Magic", href: "/product/rose-magic" },
              { label: "Lavender Bliss", href: "/product/lavender-bliss" },
              { label: "The Collection", href: "/#collection" },
            ]}
          />
          <FooterCol
            title="Ritual"
            links={[
              { label: "The Ritual", href: "/#ritual" },
              { label: "Ingredients", href: "/#ingredients" },
              { label: "Reviews", href: "/#reviews" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "Our Story", href: "/#story" },
              { label: "Contact", href: "#" },
              { label: "Shipping", href: "#" },
            ]}
          />
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-ivory/10 pt-8 text-sm text-ivory/50 md:flex-row">
          <p>© {new Date().getFullYear()} Divine Mee. Made in India.</p>
          <p className="font-serif italic text-ivory/60">Relax. Renew. Rejuvenate.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs uppercase tracking-[0.25em] text-ivory/40">
        {title}
      </h3>
      <ul className="flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-ivory/75 transition-colors hover:text-gold"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
