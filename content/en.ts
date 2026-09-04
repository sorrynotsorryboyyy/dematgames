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
    title: "dematgames.com — Indie games you can actually own",
    description:
      "Physical editions of independent games: case, cover art, booklet. Made on demand in Europe and shipped to your door. A game that is genuinely yours.",
    keywords: [
      "physical edition video game",
      "indie game physical release",
      "buy indie game boxed",
      "PC game box",
      "video game collection",
      "indie collector edition",
      "dematgames",
    ],
    ogAlt: "dematgames.com — Physical editions of independent games",
  },

  nav: {
    shop: "Shop",
    blog: "Blog",
    account: "Account",
    cart: "Cart",
    login: "Sign in",
    logout: "Sign out",
    howItWorks: "How it works",
    faq: "FAQ",
    contact: "Contact",
    cta: "Submit my game",
    legal: "Legal notice",
    privacy: "Privacy",
    terms: "Terms",
    skipToContent: "Skip to main content",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    switchTo: "Passer en français",
  },

  hero: {
    // Moved up from the old manifesto section: the promise now lands on the
    // first screen, above the badge.
    tagline: ["Kill the download.", "Keep the game."],
    badge: "Physical editions, made on demand",
    titleLines: ["Indie games", "you can", "actually own."],
    subtitle:
      "Physical editions of independent games: case, cover art, booklet. Made on demand in Europe, shipped to your door — and yours for good.",
    ctaPrimary: "Browse the catalogue",
    ctaSecondary: "Tell me when it opens",
    reassurance: [
      "Made in Europe",
      "On demand, no overstock",
      "Tracked shipping",
    ],
  },

  how: {
    title: "From first message to box.",
    intro:
      "Six steps between your first message and a box sitting on a player's shelf.",
    steps: [
      {
        n: "01",
        title: "Get in touch",
        body: "You write to us about your game and what you have in mind. We reply within a few days, no commitment.",
      },
      {
        n: "02",
        title: "Scope the work",
        body: "We work it out together: edition format, volume, timeline. This is where we tell you what's feasible and what it costs.",
      },
      {
        n: "03",
        title: "Preparation",
        body: "Game build, cover, booklet, disc print: we prepare the production files from your artwork.",
      },
      {
        n: "04",
        title: "Pressed on demand",
        body: "You front nothing. Not the pressing, not the printing, not the stock: we fund production, and every copy is made when it's ordered.",
        note: "You earn a share of every sale. The details are agreed together, based on format and volume.",
      },
      {
        n: "05",
        title: "Shipping",
        body: "The parcel leaves within 1 to 4 working days, packed and tracked.",
        note: "Depending on order volume and destination.",
      },
      {
        n: "06",
        title: "In the player's hands",
        body: "They unbox an object, not a download code. And they keep it.",
      },
    ],
    navPrev: "Previous step",
    navNext: "Next step",
    progress: "Step {i} of {n}",
  },

  whyNow: {
    eyebrow: "Why now?",
    lineDigital: "Your games aren't yours.",
    linePhysical: "A box is.",
    quote:
      "A storefront closes, an account gets suspended, a licence expires — and a whole library is gone. Nobody can delete an object sitting on a shelf.",
    body: "Buying a game online means buying access: revocable, non-transferable, dependent on a service staying open. A physical copy belongs to whoever bought it. It can be lent, gifted, resold — and it outlives the platform that sold it.",
    shelfCaption: "A shelf of indie games in physical editions.",
  },

  founding: {
    eyebrow: "Founding studios",
    title: "We're not looking for a number.",
    body: "We're looking for games people will want to hold. The size of your community matters less than whether the object means something to them. Tell us about yours — we reply to everyone.",
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
      qualification: {
        legend: "To scope your request",
        stage: {
          label: "Where is your game?",
          options: [
            "In development",
            "In early access",
            "Launching soon",
            "Already released",
          ],
        },
        volume: {
          label: "How many copies are you thinking of?",
          options: [
            "Around 50",
            "50 to 100",
            "100 to 500",
            "More than 500",
            "I don't know yet",
          ],
        },
        edition: {
          label: "Which edition interests you?",
          options: ["Standard", "Deluxe", "Collector", "Let's work it out"],
        },
        team: {
          label: "How big is your team?",
          options: ["Solo", "2 to 5", "6 to 15", "More than 15"],
        },
      },
      sectionGame: "Your game",
      sectionYou: "You",
      stepBack: "Back",
      stepSkip: "Skip",
      stepProgress: "{i} of {n}",
      lastStepTitle: "How do we reach you?",
      submit: "Submit my game",
      submitting: "Sending…",
      required: "required",
      optional: "optional",
      successTitle: "Got it.",
      successBody:
        "Thank you — we'll come back to you within a few days to talk about your game and the edition that would suit it.",
      errorTitle: "That didn't send.",
      errorBody:
        "The problem is on our side. Try again in a moment, or email us directly at hello@dematgames.com.",
      retry: "Try again",
      honeypotLabel: "Leave this field empty",
    },
  },

  opening: {
    eyebrow: "Coming soon",
    title: "The shop opens soon.",
    body: "We are preparing the first editions with our partner studios. Leave your address to hear about it on opening day — that is all we will use it for.",
    emailLabel: "Your email address",
    emailPlaceholder: "you@example.com",
    emailError: "That address does not look valid.",
    submit: "Notify me",
    submitting: "Sending…",
    successTitle: "You are on the list.",
    successBody: "We will write to you on opening day. No newsletter, no follow-ups.",
    errorTitle: "That did not go through.",
    errorBody: "Try again in a moment, or write to hello@dematgames.com.",
    privacyNote:
      "Your address is only used to tell you when the shop opens. You can ask us to remove it at any time.",
    honeypotLabel: "Leave this empty",
  },

  preview: {
    eyebrow: "The catalogue",
    title: "Our physical editions.",
    notice:
      "Every title is pressed, printed and shipped by us. The shop opens soon: the editions below cannot be ordered yet.",
    cta: "See the full catalogue",
  },

  submit: {
    title: "Submit your game",
    intro:
      "Building a game and want to see it in a box? Tell us about it. We read every message and reply to all of them.",
    metaDescription:
      "Submit your independent game for a physical edition: case, cover art, booklet, manufacturing and shipping handled.",
  },

  shop: {
    title: "The shop",
    intro:
      "Physical editions from our partner studios. Every copy is made to order and shipped from France.",
    pricingNotice:
      "The shop isn't open yet: no title can be ordered for now. The prices shown are final.",
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
    kindHardware: "Hardware",
    kindBundle: "Bundle",
    productsTitle: "Accessories and bundles",
    upcoming: "Coming soon",
    pickGame: "Choose your game",
    pickGamePlaceholder: "Pick a title from the catalogue",
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
      "This flow is a demonstration: no payment is possible and no order will be recorded. Leave us your address and we will tell you as soon as the shop opens.",
    closedCta: "Tell me when it opens",
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
    memberSince: "Member",
    avatarLabel: "Profile picture",
    avatarMember: "My badge",
    avatarGoogle: "Google photo",
    noOrders:
      "No orders yet. The shop will open with the first games we produce.",
    noGames:
      "You don't have a game with us yet. We're selecting new partner studios on an ongoing basis.",
    noGamesCta: "Submit my game",
    auth: {
      loginTitle: "Sign in",
      intro:
        "One button, no password to remember. Your first sign-in creates your account.",
      google: "Continue with Google",
      privacy:
        "We receive your name, email and Google profile picture. Nothing else, and never your password.",
      unavailable:
        "Sign-in is temporarily unavailable. Try again in a few minutes, or email us at hello@dematgames.com.",
      errorNetwork:
        "Could not reach the network. Check your connection and try again.",
      errorUnknown:
        "Sign-in failed. Try again, or email us at hello@dematgames.com.",
    },
  },

  blog: {
    title: "The blog",
    intro:
      "What we learn making physical editions: workshop notes, studio stories, and the state of a market we're discovering as we build it.",
    empty: "No articles yet. Come back soon.",
    sponsored: "Sponsored",
    sponsoredBy: "In partnership with",
    backToBlog: "Back to the blog",
    latestTitle: "Latest articles",
    latestIntro:
      "Workshop notes, studio stories, and what we learn making things you can hold.",
    seeAll: "All articles →",
    readMore: "Read the article",
    tocTitle: "Contents",
    sourcesTitle: "Sources and further reading",
    relatedTitle: "Read next",
  },

  faq: {
    title: "Frequently asked questions",
    items: [
      {
        title: "What exactly do I get?",
        body: "A real physical edition: the game on disc, in a case, with cover art and a booklet. Depending on the edition, printed extras or goodies come with it. Each product page lists what is included.",
      },
      {
        title: "Does the game work offline?",
        body: "That is the whole point. The disc holds the game, installable and playable with no account and no download. No platform can take it away from you.",
      },
      {
        title: "What if my computer has no disc drive?",
        body: "Most recent laptops do not. We sell an external USB CD/DVD drive in the shop: plug it in, no installation, and it works for your whole collection.",
      },
      {
        title: "When does the shop open?",
        body: "We are preparing the first editions with our partner studios. Leave your address in the opening block on the home page and you will hear from us that day — nothing else.",
      },
      {
        title: "Which countries do you ship to?",
        body: "We start from France, with the European Union as our first area. The rest of the world follows once the logistics are settled.",
      },
      {
        title: "Are the runs limited?",
        body: "Every edition is made on demand, so there is no overstock and nothing gets pulped. Some special editions are limited in time or quantity — the product page says so when that is the case.",
      },
      {
        title: "Can I resell or gift my copy?",
        body: "Yes. It is an object you own: lend it, give it, sell it on. Unlike a digital licence, it does not depend on any account.",
      },
      {
        title: "I make games — how do I submit mine?",
        body: "Through the submit-your-game page. We review every submission and reply to everyone within a few days.",
      },
    ],
  },

  footer: {
    tagline:
      "Physical editions for independent games. Made in Europe, on demand.",
    navTitle: "Navigation",
    socialTitle: "Follow us",
    legalTitle: "Information",
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
