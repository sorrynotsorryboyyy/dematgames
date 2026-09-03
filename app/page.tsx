import { redirect } from "next/navigation";
import { DEFAULT_LANG } from "@/content/types";

/** `/` renvoie vers la langue par défaut. */
export default function RootPage() {
  redirect(`/${DEFAULT_LANG}`);
}
