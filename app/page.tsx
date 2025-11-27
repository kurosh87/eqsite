import { stackServerApp } from "@/app/stack";
import { HomePageContent } from "@/components/home-page-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const user = await stackServerApp.getUser();
  const userData = user
    ? {
        displayName: user.displayName,
        primaryEmail: user.primaryEmail,
      }
    : null;

  return <HomePageContent user={userData} />;
}
