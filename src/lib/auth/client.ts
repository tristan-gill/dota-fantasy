import { createAuthClient } from "better-auth/react";

// TODO maybe need to add baseURL: import.meta.env.VITE_SERVER_URL
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

export const useAuthentication = () => {
  const { data: userSession } = authClient.useSession();

  return { userSession, isAuthenticated: !!userSession };
};

export const useAuthenticatedUser = () => {
  const { userSession } = useAuthentication();

  if (!userSession) {
    throw new Error("User is not authenticated!");
  }

  return userSession;
};