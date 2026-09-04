/**
 * Données structurées (JSON-LD).
 *
 * Un seul composant plutôt qu'un bloc `<script>` recopié à chaque page : la
 * sérialisation et la protection contre l'injection sont écrites une fois.
 *
 * SÉCURITÉ — `dangerouslySetInnerHTML` est ici la seule façon d'injecter du
 * JSON-LD, mais la valeur est produite par `JSON.stringify` à partir de nos
 * propres objets. La séquence `</script>` est neutralisée : un titre
 * d'article contenant ce texte fermerait la balise et laisserait passer du
 * HTML arbitraire. Les titres viennent de l'administration, donc d'une
 * source de confiance — raison de plus pour que ce ne soit pas la dernière
 * ligne de défense.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/<\/(script)/gi, "<\\/$1");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
