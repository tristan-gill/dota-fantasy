import { DiscordIcon } from "@/components/DiscordIcon";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { getUserSession } from "@/services/auth";
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  loader: async () => {
    const userSession = await getUserSession();
    if (!!userSession?.data?.user) {
      throw redirect({ to: "/"});
    }
  }
});

function RouteComponent() {
  return (
    <div className="flex flex-col justify-center items-center h-100">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="max-w-sm text-muted-foreground">
          Log in to get your predictions and roster started.
        </p>
        <Button variant="outline" onClick={() => authClient.signIn.social({ provider: "discord" })}>
          <DiscordIcon />
          Login with Discord
        </Button>
      </div>
      <div className="text-sm text-muted-foreground absolute bottom-10">
        By logging in, you agree to our{" "}
        <a className="underline" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
          terms of service
        </a>
      </div>
    </div>
  );
}
