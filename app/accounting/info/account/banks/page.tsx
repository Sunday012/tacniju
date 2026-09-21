import { redirect } from "next/navigation";

export default async function AccountBankDetailsPage() {
  redirect("/dashboard/account/banks");
}
