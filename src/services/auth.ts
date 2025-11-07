import { createMiddleware, createServerFn, json } from "@tanstack/react-start";
import { authClient } from "@/lib/auth/client";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";

export const getUserSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();

    if (!headers) {
      return null;
    }
  
    const userSession = await authClient.getSession({ fetchOptions: { headers }});
    return userSession;
  },
);

export const userMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const userSession = await getUserSession();

    return next({ context: { userSession } });
  },
);

export const userRequiredMiddleware = createMiddleware({ type: "function" })
  .middleware([userMiddleware])
  .server(async ({ next, context }) => {
    if (!context.userSession || !context.userSession.data || !context.userSession.data.user) {
      throw redirect({ to: "/" });
    }

    return next({ context: { userSession: context.userSession.data } });
  });