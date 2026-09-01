import { redirect } from "next/navigation";

export default function HiddenAdminRedirect() {
  redirect("/ops-console-secure-access");
}
