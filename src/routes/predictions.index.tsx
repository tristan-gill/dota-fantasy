import { BracketTeam } from "@/components/PredictionBracket";
import { ResultsBracket } from "@/components/ResultsBracket";
import { SignedIn } from "@/components/SignedIn";
import { SignedOut } from "@/components/SignedOut";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useAuthentication } from "@/lib/auth/client";
import { getUserSession } from '@/services/auth';
import { getPlayoffMatches, getPredictionActivity, getPredictionsByUserId, getTeams } from '@/services/bracket';
import { getConfig } from "@/services/configs";
import { getFinalsPredictionByUserId } from "@/services/predictionService";
import { getProfileByUserId } from '@/services/profiles';
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { formatDistance } from "date-fns";
import { LogInIcon, Pencil } from "lucide-react";

export const Route = createFileRoute('/predictions/')({
  component: RouteComponent,
  loader: async () => {
    const recentPredictions = await getPredictionActivity();
    return {
      recentPredictions
    }
  }
})

function RouteComponent() {
  const { recentPredictions } = Route.useLoaderData();
  const { userSession } = useAuthentication();

  return (
    <div className="p-4 h-full w-5xl grid grid-cols-3 grid-rows-3 gap-4 mx-auto overflow-hidden">
      <div className="col-span-2">
        <RecentPredictionsCard recentPredictions={recentPredictions} />
      </div>
      <div>
        <SignedIn>
          <YourPredictionsCard />
        </SignedIn>
        <SignedOut>
          <LoginToPredictCard />
        </SignedOut>
      </div>
      <div className="row-start-2 row-end-4 col-start-1 col-end-4">
        <ResultsCard />
      </div>
      
      {/* <div>
        <Card>
          Prompt to add your bracket
        </Card>
      </div>
      <div>
        <Card>
          Maybe show like common expected winners?
        </Card>
      </div> */}
    </div>
  );
}

// TODO proper type from the table level
interface RecentPrediction {
  userId: string;
  slug: string;
  name: string | null;
  teamName: string;
  teamImage: string | null;
  createdAt: Date;
}
// TODO change to top leaderboard when locked
function RecentPredictionsCard({ recentPredictions }: { recentPredictions: RecentPrediction[] }) {
  // TODO maybe add a list of possible phrasings, max limit team name, include team picture?
  // TODO make the user and team name look clickable
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent predictions</CardTitle>
        <CardDescription>
          Recently completed predictions and who they think will come out on top in the grand finals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {recentPredictions.map((recentPrediction) => {
              return (
                <TableRow key={recentPrediction.userId}>
                  <TableCell>
                    <span>
                      <Link to="/predictions/$slug" params={{ slug: recentPrediction.slug }}>
                        {recentPrediction.name}
                      </Link>
                      {" "}
                      predicted
                      {" "}
                      {/* <Link to="/predictions/$slug" params={{ slug: recentPrediction.slug }}>
                        {recentPrediction.name}
                      </Link> */}
                      {recentPrediction.teamName}
                      {" "}
                      will win
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDistance(recentPrediction.createdAt, new Date(), { addSuffix: true, includeSeconds: false })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function YourPredictionsCard() {
  const { userSession } = useAuthentication();

  const {
    data: finalsPrediction,
    isLoading: isfinalsPredictionLoading
  } = useQuery({
    queryKey: ["finalsPredictionByUserId", userSession?.user.id],
    queryFn: () => getFinalsPredictionByUserId({ data: { userId: userSession?.user.id || "" }})
  });

  const {
    data: profile,
    isLoading: isProfileLoading
  } = useQuery({
    queryKey: ["profileByUserId", userSession?.user.id],
    queryFn: () => getProfileByUserId({ data: { userId: userSession?.user.id || "" }})
  });

  const {
    data: isPredictionsOpen,
    isLoading: isPredictionsOpenLoading
  } = useQuery({
    queryKey: ["config", "isAcceptingPredictions"],
    queryFn: () => getConfig({ data: { name: "isAcceptingPredictions" }})
  });

  if (isfinalsPredictionLoading || isProfileLoading || isPredictionsOpenLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Your predictions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center grow">
          <Spinner className="size-12" />
        </CardContent>
      </Card>
    );
  }

  if (!finalsPrediction) {
    // TODO could indicate progress for fill out the content for this card
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Your predictions</CardTitle>
          <CardDescription>
            You have not yet finished your predictions.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <Button disabled={!isPredictionsOpen} className="w-full" asChild variant="outline">
            <Link to="/predictions/$slug" params={{ slug: profile?.slug || "" }}>
              Complete predictions
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Your predictions</CardTitle>
        <CardDescription>
          Who you anticipate to win it all.
        </CardDescription>
        <CardAction>
          <Button disabled={!isPredictionsOpen} asChild variant="link" size="icon" className="h-4">
            <Link to="/predictions/$slug" params={{ slug: profile?.slug || "" }}>
              <Pencil className="size-4" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex justify-center text-sm mb-1 text-muted-foreground">
          Grand finals
        </div>
        <Card className="py-1 h-[68px] rounded-sm">      
          <CardContent className="px-1">
            <BracketTeam team={finalsPrediction.leftTeam} isLoser={finalsPrediction.predictions.winnerId === finalsPrediction.rightTeam.id} isAnimateDisabled={true} />
            <Separator className="my-1" />
            <BracketTeam team={finalsPrediction.rightTeam} isLoser={finalsPrediction.predictions.winnerId === finalsPrediction.leftTeam.id} isAnimateDisabled={true} />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

function LoginToPredictCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Your predictions</CardTitle>
        <CardDescription>
          Login to start making your predictions.
          Predictions close after the first playoff game begins.
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
    data: playoffMatches,
    isLoading: isPlayoffMatchesLoading
  } = useQuery({
    queryKey: ['playoffMatches'],
    queryFn: getPlayoffMatches,
    staleTime: Infinity
  });

  const {
    data: teams,
    isLoading: isTeamsLoading
  } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    staleTime: Infinity
  });

  if (isPlayoffMatchesLoading || !playoffMatches || isTeamsLoading || !teams) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Results</CardTitle>
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
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent className="overflow-scroll">
        <ResultsBracket playoffMatches={playoffMatches} teams={teams} />
      </CardContent>
    </Card>
  );
}