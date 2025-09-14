import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const c = await cookies();
  const hasSid = Boolean(c.get("sid")?.value);
  redirect(hasSid ? "/dashboard" : "/login");
}
//
