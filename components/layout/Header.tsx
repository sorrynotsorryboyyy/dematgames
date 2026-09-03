"use client";

import { Logo } from "@/components/layout/Logo";
import type { BrandAssets } from "@/lib/brand";
import { CartBadge } from "@/components/shop/CartBadge";
import { ButtonLink } from "@/components/ui/Button";
import type { Content, Lang } from "@/content/types";
import { ANCHORS, otherLang, path, translatePath } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Header sticky : transparent au repos, fond translucide dès le premier scroll.
 * Le switch de langue est un simple <Link> vers la même page dans l'autre
 * langue — aucun JS de traduction, les deux pages sont statiques.
 */
/**
 * En-tête du site.
 *
 * Reçoit `nav` et `navLabel`, PAS le contenu complet : c'est un composant
 * client, et tout objet qu'on lui passe est sérialisé dans la charge utile
 * envoyée au navigateur. Lui donner `t` entier y exposait l'intégralité du
 * contenu du site — y compris le parcours destiné aux studios, avec le
 * financement et la rémunération, que l'accueil ne doit plus montrer.
 */
export function Header({
  lang,
  nav,
  navLabel,
  brand,
}: {
  lang: Lang;
  nav: Content["nav"];
  /** Libellé accessible des deux <nav> (vient de `footer.navTitle`). */
  navLabel: string;
  brand: BrandAssets;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, ready } = useSession();
  const pathname = usePathname();
  const other = otherLang(lang);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Le menu mobile ouvert ne doit pas laisser la page défiler derrière.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Les ancres ne fonctionnent que depuis la page d'accueil : ailleurs, on
  // préfixe par la racine de la langue pour y revenir.
  const home = `/${lang}`;
  const onHome = pathname === home;
  const anchor = (id: string) => (onHome ? `#${id}` : `${home}#${id}`);

  const links = [
    { href: path("shop", lang), label: nav.shop },
    { href: path("blog", lang), label: nav.blog },
    { href: anchor(ANCHORS.faq), label: nav.faq },
    // « Proposer mon jeu » : page dédiée, plus une ancre de l'accueil. Le
    // lien reste dans la nav pour rester trouvable par les studios, tandis
    // que le reste de la page s'adresse aux joueurs.
    { href: path("submit", lang), label: nav.cta },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate bg-void/85 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <Logo href={home} assets={brand} />

        <nav aria-label={navLabel} className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-smoke transition-colors hover:text-chalk"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <CartBadge lang={lang} nav={nav} />

          <Link
            href={ready && user ? path("account", lang) : path("login", lang)}
            className="hidden h-10 items-center gap-2 rounded-lg px-3 text-sm text-smoke transition-colors hover:bg-carbon hover:text-chalk sm:inline-flex"
          >
            <UserIcon />
            <span className="hidden md:inline">
              {ready && user ? user.name : nav.login}
            </span>
          </Link>

          <Link
            href={translatePath(pathname, other)}
            hrefLang={other}
            // scroll={false} : sans cela, Next remonte en haut de page au
            // changement de route, et `scroll-behavior: smooth` transforme ce
            // saut en défilement visible. Changer de langue doit laisser le
            // lecteur exactement où il est.
            scroll={false}
            aria-label={nav.switchTo}
            className="inline-flex h-10 items-center rounded-lg px-2.5 text-[0.78rem] font-semibold text-smoke uppercase transition-colors hover:bg-carbon hover:text-chalk"
          >
            {other}
          </Link>

          <ButtonLink
            href={path("submit", lang)}
            variant="primary"
            size="md"
            className="ml-1 hidden lg:inline-flex"
          >
            {nav.cta}
          </ButtonLink>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? nav.menuClose : nav.menuOpen}
            className="ml-1 flex size-10 items-center justify-center rounded-lg border border-slate bg-ash text-chalk lg:hidden"
          >
            <span aria-hidden="true" className="relative block h-3 w-4">
              <span
                className="absolute inset-x-0 block h-px bg-current transition-all duration-300"
                style={
                  menuOpen ? { top: "50%", transform: "rotate(45deg)" } : { top: 0 }
                }
              />
              <span
                className="absolute inset-x-0 bottom-0 block h-px bg-current transition-all duration-300"
                style={
                  menuOpen ? { bottom: "50%", transform: "rotate(-45deg)" } : undefined
                }
              />
            </span>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="border-t border-slate bg-void lg:hidden"
      >
        <nav
          aria-label={navLabel}
          className="mx-auto flex w-full max-w-[1240px] flex-col px-5 py-6 sm:px-8"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-slate py-4 text-lg text-chalk"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={ready && user ? path("account", lang) : path("login", lang)}
            onClick={() => setMenuOpen(false)}
            className="border-b border-slate py-4 text-lg text-chalk"
          >
            {ready && user ? nav.account : nav.login}
          </Link>
          <ButtonLink
            href={path("submit", lang)}
            variant="primary"
            size="lg"
            className="mt-6"
            onClick={() => setMenuOpen(false)}
          >
            {nav.cta}
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[1.15rem]"
    >
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}
