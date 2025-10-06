import { getUserSession } from "@/services/auth";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/react"

// TODO maybe need to add baseURL: import.meta.env.VITE_SERVER_URL
export const authClient = createAuthClient({});

export const useAuthentication = () => {
  // TODO what is suspenseQuery
  const { data: userSession } = useSuspenseQuery(queryOptions({
    queryKey: ["user"],
    queryFn: () => getUserSession(),
    staleTime: 5000,
  }),)

  return { userSession, isAuthenticated: !!userSession };
};

export const useAuthenticatedUser = () => {
  const { userSession } = useAuthentication();

  if (!userSession) {
    throw new Error("User is not authenticated!");
  }

  return userSession;
};