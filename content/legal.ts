/**
 * Textes légaux, FR et EN.
 *
 * Séparés de `fr.ts` / `en.ts` : ce sont des documents structurés (titre +
 * paragraphes) et non des libellés d'interface, et ils obéissent à des
 * obligations précises plutôt qu'à des choix éditoriaux.
 *
 * ⚠️ MARQUEURS À COMPLÉTER
 *
 * Les valeurs entre crochets (`[À COMPLÉTER : …]`) sont VOLONTAIREMENT
 * visibles en ligne. Une mention légale portant un SIRET inventé serait plus
 * risquée qu'une mention manifestement incomplète : la première est une
 * fausse déclaration, la seconde un chantier assumé. Elles doivent être
 * remplies avant toute communication publique du site.
 *
 * Ce qui est renseigné ici a été vérifié : l'hébergeur (Vercel), les
 * sous-traitants réellement utilisés (Firebase, Cloudinary) et les données
 * réellement collectées (voir `app/api/apply/route.ts` et `lib/schema.ts`).
 */

import type { Lang } from "@/content/types";

/** Bloc d'un document légal : un titre, des paragraphes, parfois une liste. */
export interface LegalBlock {
  heading: string;
  paragraphs: string[];
  /** Puces rendues sous les paragraphes. */
  bullets?: string[];
}

export interface LegalDoc {
  title: string;
  /** Phrase d'introduction, avant le premier bloc. */
  intro: string;
  /** Date de dernière mise à jour, au format ISO (AAAA-MM-JJ). */
  updated: string;
  updatedLabel: string;
  blocks: LegalBlock[];
}

export interface LegalContent {
  legal: LegalDoc;
  privacy: LegalDoc;
  terms: LegalDoc;
}

/** Marqueur unique : facilite un `grep` avant mise en ligne. */
const TODO = (what: string) => `[À COMPLÉTER : ${what}]`;
const TODO_EN = (what: string) => `[TO COMPLETE: ${what}]`;

const UPDATED = "2026-09-03";

const frLegal: LegalContent = {
  legal: {
    title: "Mentions légales",
    intro:
      "Informations légales relatives au site dematgames.com, conformément à l'article 6-III de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique.",
    updated: UPDATED,
    updatedLabel: "Dernière mise à jour",
    blocks: [
      {
        heading: "Éditeur du site",
        paragraphs: ["Le site dematgames.com est édité par :"],
        bullets: [
          `Dénomination sociale : ${TODO("raison sociale")}`,
          `Forme juridique : ${TODO("SAS, SARL, micro-entreprise…")}`,
          `Capital social : ${TODO("montant, si société")}`,
          `Siège social : ${TODO("adresse complète")}`,
          `SIREN / SIRET : ${TODO("numéro d'immatriculation")}`,
          `Numéro de TVA intracommunautaire : ${TODO("le cas échéant")}`,
          `Directeur de la publication : ${TODO("nom du responsable")}`,
          "Contact : hello@dematgames.com",
        ],
      },
      {
        heading: "Hébergement",
        paragraphs: [
          "Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.",
          "Les données sont traitées sur l'infrastructure de Vercel et de Google Firebase. Le détail des transferts figure dans la politique de confidentialité.",
        ],
      },
      {
        heading: "Propriété intellectuelle",
        paragraphs: [
          "La structure du site, son identité visuelle et ses textes sont protégés par le droit d'auteur. Toute reproduction sans autorisation est interdite.",
          "Les jeux présentés, leurs visuels, marques et contenus demeurent la propriété exclusive de leurs studios respectifs. Ils sont affichés avec leur accord, dans le cadre de leur édition physique, et aucun transfert de droits n'en découle.",
        ],
      },
      {
        heading: "Responsabilité",
        paragraphs: [
          "Les informations publiées sont fournies à titre indicatif et peuvent évoluer. Les prix affichés dans la boutique sont indicatifs tant que celle-ci n'est pas ouverte à la vente.",
          "Les liens vers des sites tiers n'engagent que leurs éditeurs.",
        ],
      },
      {
        heading: "Signalement d'un contenu",
        paragraphs: [
          "Tout contenu manifestement illicite peut être signalé à hello@dematgames.com. Le signalement doit préciser l'URL concernée et le motif.",
        ],
      },
    ],
  },

  privacy: {
    title: "Politique de confidentialité",
    intro:
      "Cette politique décrit les données personnelles que nous collectons, pourquoi nous les collectons et quels sont vos droits, conformément au Règlement (UE) 2016/679 (RGPD).",
    updated: UPDATED,
    updatedLabel: "Dernière mise à jour",
    blocks: [
      {
        heading: "Responsable du traitement",
        paragraphs: [
          `Le responsable du traitement est ${TODO("raison sociale")}, dont les coordonnées figurent dans les mentions légales.`,
          "Pour toute question relative à vos données : hello@dematgames.com.",
        ],
      },
      {
        heading: "Données collectées et finalités",
        paragraphs: [
          "Nous ne collectons que les données nécessaires aux services que vous utilisez. Aucune donnée n'est vendue ni louée.",
        ],
        bullets: [
          "Formulaire « proposer mon jeu » : nom, adresse e-mail, nom du jeu, lien vers le jeu, plateforme, message. Finalité : étudier votre proposition et vous répondre. Base légale : intérêt légitime (traiter une demande que vous nous adressez). Conservation : trois ans à compter du dernier contact.",
          "Qualification facultative (avancement du projet, volume envisagé, format d'édition, taille d'équipe). Finalité : préparer notre réponse. Base légale : intérêt légitime. Conservation : identique.",
          "Alerte d'ouverture : adresse e-mail seule. Finalité : vous prévenir de l'ouverture de la boutique. Base légale : consentement. Conservation : jusqu'à l'ouverture ou jusqu'à votre demande de retrait.",
          "Compte utilisateur (connexion Google) : adresse e-mail, nom, photo de profil Google, numéro de membre. Finalité : identification et accès au compte. Base légale : exécution du contrat. Conservation : durée de vie du compte.",
          "Adresse IP : conservée en mémoire une heure au maximum, uniquement pour limiter le nombre d'envois de formulaire. Finalité : sécurité. Base légale : intérêt légitime. Elle n'est ni enregistrée en base ni recoupée.",
        ],
      },
      {
        heading: "Stockage dans votre navigateur",
        paragraphs: [
          "Le site utilise le stockage local de votre navigateur pour mémoriser le contenu de votre panier, votre langue et votre session. Ces informations restent sur votre appareil et ne nous sont jamais transmises.",
          "Ce stockage est strictement nécessaire au fonctionnement du service que vous demandez : il ne requiert donc pas votre consentement préalable (article 82 de la loi Informatique et Libertés, délibération CNIL n° 2020-091).",
          "Le site n'utilise aucun traceur publicitaire, aucun outil de mesure d'audience et aucun cookie tiers. C'est pourquoi aucun bandeau de consentement ne vous est présenté.",
        ],
      },
      {
        heading: "Destinataires et sous-traitants",
        paragraphs: [
          "Vos données sont accessibles à notre équipe et aux prestataires techniques suivants, agissant comme sous-traitants :",
        ],
        bullets: [
          "Google Ireland Limited (Firebase) — authentification et base de données. Données hébergées dans l'Union européenne.",
          "Vercel Inc. — hébergement du site. Transfert hors UE encadré par les clauses contractuelles types de la Commission européenne.",
          "Cloudinary Ltd. — hébergement des images. Aucune donnée personnelle n'y est déposée.",
        ],
      },
      {
        heading: "Vos droits",
        paragraphs: [
          "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données. Vous pouvez également retirer votre consentement à tout moment lorsque le traitement repose sur celui-ci.",
          "Pour exercer ces droits, écrivez à hello@dematgames.com. Nous répondons sous un mois.",
          "Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la CNIL — 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 — ou déposer une plainte sur cnil.fr.",
        ],
      },
      {
        heading: "Sécurité",
        paragraphs: [
          "Les échanges avec le site sont chiffrés (HTTPS). L'accès à l'administration est restreint et vérifié côté serveur à chaque requête.",
        ],
      },
    ],
  },

  terms: {
    title: "Conditions générales de vente",
    intro:
      "La boutique n'est pas encore ouverte à la vente : aucune commande ne peut être passée et aucun paiement n'est encaissé. Ces conditions sont publiées par anticipation et s'appliqueront dès l'ouverture.",
    updated: UPDATED,
    updatedLabel: "Dernière mise à jour",
    blocks: [
      {
        heading: "Objet et champ d'application",
        paragraphs: [
          "Les présentes conditions régissent la vente d'éditions physiques de jeux vidéo indépendants et d'accessoires proposés sur dematgames.com aux consommateurs.",
          "Toute commande implique l'acceptation préalable des présentes conditions.",
        ],
      },
      {
        heading: "Produits",
        paragraphs: [
          "Les produits sont fabriqués à la demande. Les visuels sont donnés à titre indicatif ; des différences mineures de teinte ou de finition ne constituent pas un défaut de conformité.",
          "Tant que la boutique n'est pas ouverte, les prix affichés sont indicatifs et n'engagent pas le vendeur.",
        ],
      },
      {
        heading: "Prix et paiement",
        paragraphs: [
          "Les prix sont indiqués en euros, toutes taxes comprises, hors frais de livraison. Ces derniers sont calculés à la commande selon la destination.",
          `Moyens de paiement acceptés : ${TODO("à préciser à l'ouverture")}.`,
        ],
      },
      {
        heading: "Livraison",
        paragraphs: [
          "Les commandes sont expédiées depuis la France, avec suivi. Les délais annoncés courent à compter de la fabrication et varient selon la destination.",
          "En cas de retard, vous pouvez annuler la commande dans les conditions prévues aux articles L216-2 et suivants du code de la consommation.",
        ],
      },
      {
        heading: "Droit de rétractation",
        paragraphs: [
          "Conformément à l'article L221-18 du code de la consommation, vous disposez de quatorze jours à compter de la réception pour exercer votre droit de rétractation, sans motif ni pénalité.",
          "Le remboursement intervient dans les quatorze jours suivant la reprise ou la preuve d'expédition du produit. Les frais de retour restent à votre charge.",
          "Attention : l'article L221-28 exclut ce droit pour les enregistrements audio ou vidéo et les logiciels descellés par le consommateur. Un jeu dont le boîtier a été ouvert et le disque descellé n'est donc pas repris, sauf défaut.",
        ],
      },
      {
        heading: "Garanties",
        paragraphs: [
          "Tous les produits bénéficient de la garantie légale de conformité (articles L217-3 et suivants du code de la consommation) et de la garantie contre les vices cachés (articles 1641 et suivants du code civil).",
          "En cas de produit défectueux ou non conforme, écrivez à hello@dematgames.com : le retour et le remplacement sont à notre charge.",
        ],
      },
      {
        heading: "Réclamations et médiation",
        paragraphs: [
          "Toute réclamation peut être adressée à hello@dematgames.com.",
          `Conformément à l'article L612-1 du code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation : ${TODO("médiateur à désigner avant l'ouverture")}.`,
          "La plateforme européenne de règlement en ligne des litiges est accessible à l'adresse ec.europa.eu/consumers/odr.",
        ],
      },
      {
        heading: "Droit applicable",
        paragraphs: [
          "Les présentes conditions sont soumises au droit français. En cas de litige, les tribunaux français sont compétents, sous réserve des règles protectrices applicables aux consommateurs.",
        ],
      },
    ],
  },
};

const enLegal: LegalContent = {
  legal: {
    title: "Legal notice",
    intro:
      "Legal information about dematgames.com, published under article 6-III of French law no. 2004-575 of 21 June 2004 on confidence in the digital economy.",
    updated: UPDATED,
    updatedLabel: "Last updated",
    blocks: [
      {
        heading: "Publisher",
        paragraphs: ["dematgames.com is published by:"],
        bullets: [
          `Company name: ${TODO_EN("registered name")}`,
          `Legal form: ${TODO_EN("SAS, SARL, sole trader…")}`,
          `Share capital: ${TODO_EN("amount, if a company")}`,
          `Registered office: ${TODO_EN("full address")}`,
          `Company number (SIREN / SIRET): ${TODO_EN("registration number")}`,
          `EU VAT number: ${TODO_EN("if applicable")}`,
          `Publication director: ${TODO_EN("name of the person responsible")}`,
          "Contact: hello@dematgames.com",
        ],
      },
      {
        heading: "Hosting",
        paragraphs: [
          "The site is hosted by Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, United States.",
          "Data is processed on Vercel and Google Firebase infrastructure. Transfer details are set out in the privacy policy.",
        ],
      },
      {
        heading: "Intellectual property",
        paragraphs: [
          "The structure of this site, its visual identity and its texts are protected by copyright. Reproduction without permission is prohibited.",
          "The games shown, along with their artwork, trademarks and content, remain the exclusive property of their respective studios. They appear with those studios' agreement, as part of their physical edition, and no transfer of rights follows from it.",
        ],
      },
      {
        heading: "Liability",
        paragraphs: [
          "Published information is indicative and may change. Prices shown in the shop are indicative for as long as the shop is not open for sales.",
          "Links to third-party sites are the responsibility of their own publishers.",
        ],
      },
      {
        heading: "Reporting content",
        paragraphs: [
          "Any manifestly unlawful content can be reported to hello@dematgames.com. Please include the URL concerned and the reason for the report.",
        ],
      },
    ],
  },

  privacy: {
    title: "Privacy policy",
    intro:
      "This policy explains what personal data we collect, why we collect it and what your rights are, under Regulation (EU) 2016/679 (GDPR).",
    updated: UPDATED,
    updatedLabel: "Last updated",
    blocks: [
      {
        heading: "Data controller",
        paragraphs: [
          `The data controller is ${TODO_EN("registered name")}, whose details appear in the legal notice.`,
          "For any question about your data: hello@dematgames.com.",
        ],
      },
      {
        heading: "What we collect and why",
        paragraphs: [
          "We only collect what the services you use require. No data is sold or rented.",
        ],
        bullets: [
          "Submit-your-game form: name, email address, game name, link to the game, platform, message. Purpose: to review your proposal and reply. Legal basis: legitimate interest (handling a request you send us). Retention: three years from last contact.",
          "Optional qualification (project stage, expected volume, edition format, team size). Purpose: preparing our reply. Legal basis: legitimate interest. Retention: as above.",
          "Opening alert: email address only. Purpose: telling you when the shop opens. Legal basis: consent. Retention: until opening, or until you ask to be removed.",
          "User account (Google sign-in): email address, name, Google profile picture, member number. Purpose: identification and account access. Legal basis: performance of the contract. Retention: for the lifetime of the account.",
          "IP address: held in memory for at most one hour, solely to rate-limit form submissions. Purpose: security. Legal basis: legitimate interest. It is never written to a database or cross-referenced.",
        ],
      },
      {
        heading: "Storage in your browser",
        paragraphs: [
          "The site uses your browser's local storage to remember your basket, your language and your session. This stays on your device and is never sent to us.",
          "This storage is strictly necessary to deliver the service you asked for, and therefore does not require prior consent (article 82 of the French Data Protection Act; CNIL decision no. 2020-091).",
          "The site uses no advertising trackers, no analytics tools and no third-party cookies. That is why you are not shown a consent banner.",
        ],
      },
      {
        heading: "Recipients and processors",
        paragraphs: [
          "Your data is accessible to our team and to the following technical providers, acting as processors:",
        ],
        bullets: [
          "Google Ireland Limited (Firebase) — authentication and database. Data hosted in the European Union.",
          "Vercel Inc. — site hosting. Transfers outside the EU are covered by the European Commission's standard contractual clauses.",
          "Cloudinary Ltd. — image hosting. No personal data is stored there.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You have the right to access, rectify, erase, restrict, object to and port your data. Where processing relies on consent, you can withdraw it at any time.",
          "To exercise these rights, write to hello@dematgames.com. We reply within one month.",
          "If you believe your rights are not being respected, you can lodge a complaint with the CNIL — 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, France — or with your local supervisory authority.",
        ],
      },
      {
        heading: "Security",
        paragraphs: [
          "Traffic to and from the site is encrypted (HTTPS). Access to the administration area is restricted and verified server-side on every request.",
        ],
      },
    ],
  },

  terms: {
    title: "Terms of sale",
    intro:
      "The shop is not yet open for sales: no order can be placed and no payment is taken. These terms are published in advance and will apply from opening.",
    updated: UPDATED,
    updatedLabel: "Last updated",
    blocks: [
      {
        heading: "Scope",
        paragraphs: [
          "These terms govern the sale of physical editions of independent video games and related accessories offered on dematgames.com to consumers.",
          "Placing an order implies prior acceptance of these terms.",
        ],
      },
      {
        heading: "Products",
        paragraphs: [
          "Products are manufactured on demand. Images are indicative; minor differences in tone or finish do not constitute a defect.",
          "While the shop is closed, displayed prices are indicative and do not bind the seller.",
        ],
      },
      {
        heading: "Prices and payment",
        paragraphs: [
          "Prices are shown in euros, inclusive of tax, excluding delivery. Delivery costs are calculated at checkout according to destination.",
          `Accepted payment methods: ${TODO_EN("to be specified at opening")}.`,
        ],
      },
      {
        heading: "Delivery",
        paragraphs: [
          "Orders ship from France with tracking. Stated lead times run from manufacture and vary by destination.",
          "In the event of delay, you may cancel the order under articles L216-2 et seq. of the French Consumer Code.",
        ],
      },
      {
        heading: "Right of withdrawal",
        paragraphs: [
          "Under article L221-18 of the French Consumer Code, you have fourteen days from delivery to withdraw, without giving a reason and without penalty.",
          "Refunds are issued within fourteen days of the product being returned or of proof of its dispatch. Return shipping is at your expense.",
          "Please note: article L221-28 excludes this right for audio or video recordings and software unsealed by the consumer. A game whose case has been opened and disc unsealed cannot be returned, except where faulty.",
        ],
      },
      {
        heading: "Warranties",
        paragraphs: [
          "All products carry the statutory guarantee of conformity (articles L217-3 et seq. of the French Consumer Code) and the guarantee against hidden defects (articles 1641 et seq. of the French Civil Code).",
          "For a faulty or non-conforming product, write to hello@dematgames.com: return and replacement are at our expense.",
        ],
      },
      {
        heading: "Complaints and mediation",
        paragraphs: [
          "Complaints can be sent to hello@dematgames.com.",
          `Under article L612-1 of the French Consumer Code, you may use a consumer mediator free of charge: ${TODO_EN("mediator to be appointed before opening")}.`,
          "The European online dispute resolution platform is available at ec.europa.eu/consumers/odr.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: [
          "These terms are governed by French law. In the event of a dispute, the French courts have jurisdiction, subject to the protective rules applicable to consumers.",
        ],
      },
    ],
  },
};

const LEGAL: Record<Lang, LegalContent> = { fr: frLegal, en: enLegal };

export function getLegal(lang: Lang): LegalContent {
  return LEGAL[lang] ?? LEGAL.fr;
}

/** Clés de documents légaux — alignées sur les routes du même nom. */
export type LegalKey = keyof LegalContent;
