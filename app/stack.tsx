import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

export interface AuthenticatedUser {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  emails: Array<{ email: string; primary: boolean }>;
  imageUrl: string | null;
  isAdmin: boolean;
  metadata: Record<string, any>;
}

const SESSION_COOKIE_NAMES = [
  "__Secure-better-auth.session_token",
  "better-auth.session_token",
];

async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const sessionCookie = SESSION_COOKIE_NAMES.map((name) =>
    cookieStore.get(name)
  ).find(Boolean);

  if (!sessionCookie) {
    return null;
  }

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  try {
    const headers = new Headers();
    headers.set("cookie", cookieHeader);
    const session = await auth.api.getSession({ headers });
    return session;
  } catch (error) {
    console.error("Failed to fetch Better Auth session:", error);
    return null;
  }
}

export const stackServerApp = {
  async getUser(): Promise<AuthenticatedUser | null> {
    try {
        const session = await getSessionFromCookies();

        if (!session?.user) {
          return null;
        }

        const { user } = session;
        const primaryEmail = user.email ?? null;

        return {
          id: user.id,
          displayName: user.name ?? null,
          primaryEmail,
          emails: primaryEmail
            ? [
                {
                  email: primaryEmail,
                  primary: true,
                },
              ]
            : [],
          imageUrl: user.image ?? null,
          isAdmin: Boolean((user as any).isAdmin),
          metadata: (user as any).metadata ?? {},
        };
    } catch (error) {
      console.error("Failed to retrieve authenticated user:", error);
      return null;
    }
  },
};

export type { AuthenticatedUser as StackAuthenticatedUser };
