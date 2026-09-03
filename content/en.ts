import type { Content } from "./types";

/**
 * English version — 100% English.
 *
 * Written as English, not translated from the French: the two files say the
 * same things, in each language's own register. Typed against the same
 * `Content` interface, so a missing key fails the typecheck rather than
 * shipping a half-translated page.
 */
export const en: Content = {
  meta: {
    title: "dematgames.gg — Your game deserves a box",
    description:
      "Turn your indie game into a physical edition: case, cover art, booklet, extras. Made on demand from 50 copies, with no stock to front and no logistics to run.",
    keywords: [
      "physical edition video game",
      "indie game physical release",
      "PC game box",
      "on-demand manufacturing",
      "independent developer",
      "indie collector edition",
      "dematgames",
    ],
    ogAlt: "dematgames.gg — Your game deserves a box",
  },

  nav: {
    shop: "Shop",
    account: "Account",
    cart: "Cart",
    login: "Sign in",
    logout: "Sign out",
    howItWorks: "How it works",
    faq: "FAQ",
    contact: "Contact",
    cta: "Submit my game",
    skipToContent: "Skip to main content",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    switchTo: "Passer en français",
  },

  hero: {
    // Moved up from the old manifesto section: the promise now lands on the
    // first screen, above the badge.
    tagline: ["Kill the download.", "Keep the game."],
    badge: "Physical editions for indie games",
    titleLines: ["Your game", "deserves", "a box."],
    subtitle:
      "Give your game a real physical edition: case, cover art, booklet. You keep control of the art direction — we handle manufacturing and shipping.",
    ctaPrimary: "Visit the shop",
    ctaSecondary: "Submit my game",
    reassurance: [
      "From 50 copies",
      "No stock to front",
      "Shipping handled",
    ],
    scrollHint: "Explore",
  },

  problem: {
    titleLines: ["Indie games are everywhere.", "Except on our shelves."],
    body: "A team of three can reach tens of thousands of players today. But the moment a physical edition comes up, they hit the same walls: minimum runs priced for major publishers, cash tied up months ahead of the first sale, and a logistics job nobody signed up for.",
    cards: [
      {
        title: "Minimums built for majors",
        body: "Traditional pressing plants start at several hundred copies. That's thousands of euros spent before anyone has bought a single one.",
      },
      {
        title: "A second job",
        body: "Storing boxes, printing labels, handling returns — every hour of it is an hour not spent on your game.",
      },
      {
        title: "The maths never works",
        body: "Your community is loyal without being huge. At that scale, a traditional physical run simply doesn't add up.",
      },
    ],
    transition: "dematgames.gg removes all three.",
  },

  how: {
    title: "From build to box.",
    intro:
      "Four steps between your executable and a box sitting on a player's shelf.",
    steps: [
      {
        n: "01",
        title: "Send your build",
        body: "You hand over the final build. We check that it runs and that it fits on the disc.",
      },
      {
        n: "02",
        title: "Design the edition",
        body: "Cover, booklet, disc, extras: you pick the format and supply the artwork.",
      },
      {
        n: "03",
        title: "We manufacture",
        body: "Every copy is made to order. No dormant stock, nothing paid up front by you.",
      },
      {
        n: "04",
        title: "The player unboxes",
        body: "We pack and ship. Your player opens an object, not a download code.",
      },
    ],
    pipeline: {
      labels: ["Your build", "Pressed disc", "Parcel shipped", "In their hands"],
      caption: "The file becomes an object.",
    },
  },

  whyNow: {
    eyebrow: "Why now?",
    lineDigital: "Digital is convenient.",
    linePhysical: "Physical gets passed on.",
    quote:
      "A download vanishes into a library of six hundred titles. A box stays on a shelf, at eye level.",
    body: "Vinyl and print didn't die when streaming arrived — they became things people choose to own. Indie games deserve the same standing: a digital experience, and an object you can gift, lend and keep.",
    shelfCaption: "A shelf of indie games in physical editions.",
  },

  founding: {
    eyebrow: "Founding studios",
    title: "We're looking for the first 20 games.",
    body: "dematgames.gg is just starting. We're opening twenty places to independent studios who want to build this service with us — formats, pricing, timelines. What you tell us shapes what the platform becomes.",
    ctaNote: "Free · No commitment · We reply within a few days",
    form: {
      name: {
        label: "Name / handle",
        placeholder: "What should we call you?",
        error: "Please enter your name or handle.",
      },
      email: {
        label: "Email",
        placeholder: "you@studio.com",
        error: "Please enter a valid email address.",
      },
      game: {
        label: "Game name",
        placeholder: "Your game's title",
        error: "Please enter your game's name.",
      },
      link: {
        label: "Link to the game",
        placeholder: "https://store.steampowered.com/app/…",
        error: "Please enter a valid link starting with https://",
      },
      platform: {
        label: "Platform",
        placeholder: "Select a platform",
        error: "Please select a platform.",
        options: [
          "PC (Windows)",
          "Steam",
          "itch.io",
          "Epic Games Store",
          "Other",
        ],
      },
      message: {
        label: "Message",
        placeholder:
          "Tell us about your game, your community, the edition you have in mind…",
        error: "Message is too long (2000 characters maximum).",
      },
      submit: "Submit my game",
      submitting: "Sending…",
      required: "required",
      optional: "optional",
      successTitle: "Got it.",
      successBody:
        "Thank you — we'll come back to you within a few days to talk about your game and the edition that would suit it.",
      errorTitle: "That didn't send.",
      errorBody:
        "The problem is on our side. Try again in a moment, or email us directly at hello@dematgames.gg.",
      retry: "Try again",
      honeypotLabel: "Leave this field empty",
    },
  },

  shop: {
    title: "The shop",
    intro:
      "Physical editions from our partner studios. Every copy is made to order and shipped from France.",
    pricingNotice:
      "Preview: the shop isn't open yet, and the prices shown are indicative.",
    priceFrom: "from",
    filterAll: "All games",
    filterLabel: "Filter by category",
    empty: "No games in this category yet.",
    resultsOne: "1 game",
    resultsMany: "{n} games",
    backToShop: "Back to the shop",
    chooseEdition: "Choose your edition",
    addToCart: "Add to cart",
    added: "Added to cart",
    limitedRun: "Limited run",
    includes: "In the box",
    byStudio: "By",
    releasedIn: "Released in",
  },

  cart: {
    title: "Your cart",
    empty: "Your cart is empty.",
    emptyCta: "Browse the shop",
    quantity: "Quantity",
    remove: "Remove",
    subtotal: "Subtotal",
    shippingNote: "Shipping calculated at checkout.",
    closedTitle: "The shop isn't open yet.",
    closedBody:
      "This flow is a demonstration: no payment is possible and no order will be recorded. We're looking for the first twenty games to produce — if you're building one, now is the time to write to us.",
    closedCta: "Submit my game",
    checkoutDisabled: "Checkout coming soon",
  },

  account: {
    title: "My account",
    signedInAs: "Signed in as",
    guestTitle: "You're not signed in.",
    guestBody: "Sign in to find your orders and follow your published games.",
    tabs: { profile: "Profile", orders: "Orders", games: "My games" },
    profileName: "Name",
    profileEmail: "Email",
    noOrders:
      "No orders yet. The shop will open with the first games we produce.",
    noGames:
      "You don't have a game with us yet. Twenty places are open to founding studios.",
    noGamesCta: "Submit my game",
    auth: {
      loginTitle: "Sign in",
      intro:
        "One button, no password to remember. Your first sign-in creates your account.",
      google: "Continue with Google",
      privacy:
        "We receive your name, email and Google profile picture. Nothing else, and never your password.",
      unavailable:
        "Sign-in is temporarily unavailable. Try again in a few minutes, or email us at hello@dematgames.gg.",
      errorNetwork:
        "Could not reach the network. Check your connection and try again.",
      errorUnknown:
        "Sign-in failed. Try again, or email us at hello@dematgames.gg.",
    },
  },

  faq: {
    title: "Frequently asked questions",
    items: [
      {
        title: "What's the minimum number of copies?",
        body: "Fifty. That's the point where pressing starts to make sense; traditional plants often ask for five hundred. Past that first run, copies are made to order — you hold no stock.",
      },
      {
        title: "Who handles manufacturing and shipping?",
        body: "We do, end to end. Pressing, printing, packing, delivery to the player and parcel tracking. No boxes to handle, no labels to print on your side.",
      },
      {
        title: "What does it cost?",
        body: "We're not setting that alone: pricing is being built with our first partner studios, based on real formats and volumes. It's one of the reasons we want twenty games on board before opening.",
      },
      {
        title: "Which countries do you ship to?",
        body: "We're starting from France, with the European Union as the first territory. The rest of the world follows once the logistics are proven.",
      },
      {
        title: "Does my game need to be released already?",
        body: "No. Released, in early access, or a few months from launch — all three work. Physical editions are often best prepared ahead of release.",
      },
      {
        title: "Do I keep control of the artwork?",
        body: "Entirely. Cover, booklet, disc print, extras: you provide the art direction and we manufacture. Nothing is added to your packaging without your approval.",
      },
      {
        title: "What about the rights to my game?",
        body: "They stay yours, with no exclusivity. You keep selling digitally wherever you like, including while physical copies are in production.",
      },
    ],
  },

  footer: {
    tagline:
      "Physical editions for independent games. Made in Europe, on demand.",
    navTitle: "Navigation",
    socialTitle: "Follow us",
    social: [
      { label: "Discord", href: "#" },
      { label: "Bluesky", href: "#" },
      { label: "itch.io", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
    signature: "Built for indie games. Made to be kept.",
    rights: "All rights reserved.",
  },
};
