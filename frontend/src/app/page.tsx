import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Home() {
  // quick client-less redirect: if cookie exists, go dashboard, else login
  const c = cookies();
  const hasSid = !!c.get("sid");
  redirect(hasSid ? "/dashboard" : "/login");
}
