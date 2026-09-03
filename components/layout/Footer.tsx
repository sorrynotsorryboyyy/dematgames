import { Logo } from "@/components/layout/Logo";
import { brandAssets } from "@/lib/brand";
import type { Content, Lang } from "@/content/types";
import { ANCHORS, CONTACT_EMAIL, path } from "@/lib/i18n";
import Link from "next/link";

export function Footer({ t, lang }: { t: Content; lang: Lang }) {
  const year = new Date().getFullYear();
  const brand = brandAssets();

  // Ancres absolues : un `#faq` nu ne mène nulle part depuis la boutique ou
  // le panier, où la section n'existe pas.
  const links = [
    { href: path("shop", lang), label: t.nav.shop },
    { href: path("blog", lang), label: t.nav.blog },
    { href: `/${lang}#${ANCHORS.faq}`, label: t.nav.faq },
    { href: path("submit", lang), label: t.nav.cta },
    { href: `mailto:${CONTACT_EMAIL}`, label: t.nav.contact },
  ];

  // Les CGV décrivent une vente qui n'existe pas encore : elles restent
  // accessibles par leur URL, mais ne sont pas mises en avant tant que la
  // boutique n'encaisse pas. Les mentions légales et la politique de
  // confidentialité, elles, sont obligatoires dès maintenant.
  const legalLinks = [
    { href: path("legal", lang), label: t.nav.legal },
    { href: path("privacy", lang), label: t.nav.privacy },
  ];

  return (
    <footer className="relative border-t border-slate bg-void">
      <div className="mx-auto w-full max-w-[1240px] px-5 py-16 sm:px-8 md:py-20 lg:px-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo href={`/${lang}`} assets={brand} />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-smoke">
              {t.footer.tagline}
            </p>
          </div>

          <nav aria-label={t.footer.navTitle}>
            <h2 className="eyebrow">{t.footer.navTitle}</h2>
            <ul className="mt-5 space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-smoke transition-colors hover:text-chalk"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow">{t.footer.socialTitle}</h2>
            <ul className="mt-5 space-y-3">
              {t.footer.social.map((social) => (
                <li key={social.label}>
                  {/* Placeholders : href="#" jusqu'à ce que les comptes existent. */}
                  <a
                    href={social.href}
                    className="text-sm text-smoke transition-colors hover:text-chalk"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label={t.footer.legalTitle}>
            <h2 className="eyebrow">{t.footer.legalTitle}</h2>
            <ul className="mt-5 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-smoke transition-colors hover:text-chalk"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-slate/70 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="display text-lg tracking-tight text-chalk sm:text-xl">
            {t.footer.signature}
          </p>
          <p className="font-mono text-[0.7rem] tracking-[0.14em] text-smoke/70 uppercase">
            © {year} dematgames.com · {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
