import { redirect } from "next/navigation";

// The standalone How-it-works page was dropped; everything lives on the
// landing page now. Kept as a redirect since the file can't be deleted here.
export default function HowItWorks() {
  redirect("/");
}
