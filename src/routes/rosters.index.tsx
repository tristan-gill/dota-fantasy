import { SignedIn } from "@/components/SignedIn";
import { SignedOut } from "@/components/SignedOut";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuthentication } from "@/lib/auth/client";
import { getConfig } from "@/services/configs";
import { getProfileByUserId } from "@/services/profiles";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from '@tanstack/react-router'
import { LogInIcon, Pencil } from "lucide-react";

export const Route = createFileRoute('/rosters/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-4 h-full w-5xl grid grid-cols-3 grid-rows-3 gap-4 mx-auto">
      <div className="col-span-2">
        <SignedIn>
          <YourRosterCard />
        </SignedIn>
        <SignedOut>
          <LoginToRosterCard />
        </SignedOut>
      </div>
      <div>
        <RecentRostersCard />
      </div>
      <div className="row-start-2 row-end-4 col-start-2 col-end-4">
        <ResultsCard />
      </div>
    </div>
  );
}

function RecentRostersCard() {
  // TODO maybe add a list of possible phrasings, max limit team name, include team picture?
  // TODO make the user and team name look clickable
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recently completed</CardTitle>
        <CardDescription>
          Coming soon...
        </CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}

function YourRosterCard() {
  const { userSession } = useAuthentication();
  
  const {
    data: profile,
    isLoading: isProfileLoading
  } = useQuery({
    queryKey: ["profileByUserId", userSession?.user.id],
    queryFn: () => getProfileByUserId({ data: { userId: userSession?.user.id || "" }}),
    enabled: !!userSession?.user.id
  });

  const {
    data: isRosterOpen,
    isLoading: isConfigLoading
  } = useQuery({
    queryKey: ["config", "IS_ROSTER_OPEN"],
    queryFn: () => getConfig({ data: { name: "IS_ROSTER_OPEN" }})
  });

  if (isProfileLoading || isConfigLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Your roster</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center grow">
          <Spinner className="size-12" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Your roster</CardTitle>
        <CardDescription>
          Coming soon...
        </CardDescription>
        <CardAction>
          <Button disabled={!isRosterOpen} asChild variant="link" size="icon" className="h-4">
            <Link to="/predictions/$slug" params={{ slug: profile?.slug || "" }}>
              <Pencil className="size-4" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}

function LoginToRosterCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Your roster</CardTitle>
        <CardDescription>
          Login to start crafting your roster.
          Rosters close after the first playoff game begins.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Button className="w-full" asChild variant="outline">
          <Link to="/login">
            <LogInIcon /> Login
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ResultsCard() {
  const {
    data: isRosterOpen,
    isLoading: isConfigLoading
  } = useQuery({
    queryKey: ["config", "IS_ROSTER_OPEN"],
    queryFn: () => getConfig({ data: { name: "IS_ROSTER_OPEN" }})
  });

  if (isConfigLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Roster leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center grow">
          <Spinner className="size-12" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Roster leaderboard</CardTitle>
        <CardDescription>
          Results for who crafts the best fantasy team.
        </CardDescription>
      </CardHeader>
      {isRosterOpen && (
        <CardContent className="flex flex-col justify-center items-center grow">
          <div className="text-lg text-muted-foreground">
            Waiting for playoffs to start...
          </div>
        </CardContent>
      )}
    </Card>
  );
}