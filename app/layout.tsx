/**
 * Root layout minimal.
 *
 * La balise <html> et son attribut `lang` sont rendus par app/[lang]/layout.tsx,
 * seul endroit où la langue est connue. Ce layout ne fait donc que transmettre
 * ses enfants — Next impose son existence, mais pas qu'il rende <html>.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
