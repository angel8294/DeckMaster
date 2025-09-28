import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
 
export async function getSession() {
  const session = await getServerSession();
  return session;
}
 
export async function getCurrentUser() {
  const session = await getSession();
 
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }
 
  return session.user;
}