// Wrapper to make Better Auth compatible with existing Stack Auth code
import { authClient } from "./auth-client";
import type { StackAuthenticatedUser } from "@/app/stack";

// Export with Stack Auth naming for compatibility
export const stackServerApp = {
  getUser: async (): Promise<StackAuthenticatedUser | null> => {
    try {
      const sessionData = await authClient.getSession();
      if (sessionData && "data" in sessionData && sessionData.data) {
        const sessionUser = (sessionData as any).data?.user;

        if (!sessionUser) {
          return null;
        }

        return {
          id: sessionUser.id,
          displayName: sessionUser.name ?? null,
          primaryEmail: sessionUser.email ?? null,
          emails: sessionUser.email
            ? [
                {
                  email: sessionUser.email,
                  primary: true,
                },
              ]
            : [],
          imageUrl: sessionUser.image ?? null,
          isAdmin: Boolean(sessionUser.isAdmin),
          metadata: sessionUser.metadata ?? {},
        };
      }
      return null;
    } catch {
      return null;
    }
  },
};

export const stackClientApp = authClient;
