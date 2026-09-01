import { redirect } from "next/navigation";

export default function HiddenAdminLoginRedirect() {
  redirect("/ops-console-secure-access");
}
