import { BracketTeam } from "@/components/PredictionBracket";
import { ResultsBracket } from "@/components/ResultsBracket";
import { SignedIn } from "@/components/SignedIn";
import { SignedOut } from "@/components/SignedOut";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthentication } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { getPlayoffMatches, getPredictionActivity, getTeams } from '@/services/bracket';
import { getConfig } from "@/services/configs";
import { getFinalsPredictionByUserId, getLeaderboardPredictions } from "@/services/predictionService";
import { getProfileByUserId } from '@/services/profiles';
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from '@tanstack/react-router';
import { formatDistanceStrict } from "date-fns";
import { LogInIcon } from "lucide-react";

export const Route = createFileRoute('/predictions/')({
  component: RouteComponent,
  loader: async () => {
    const isPredictionsOpen = await getConfig({ data: { name: "isAcceptingPredictions" }});
    return {
      isPredictionsOpen: !!isPredictionsOpen
    }
  }
})

function RouteComponent() {
  const { isPredictionsOpen } = Route.useLoaderData();
  // TODO Maybe show like common expected winners?
  return (
    <div className="p-4 max-h-[775px] h-full my-auto w-7xl max-w-full grid grid-cols-3 grid-rows-3 gap-4 mx-auto overflow-hidden">
      {isPredictionsOpen && (
        <div className="col-span-2">
          <RecentPredictionsCard />
        </div>
      )}
      <div>
        <SignedIn>
          <YourPredictionsCard />
        </SignedIn>
        <SignedOut>
          <LoginToPredictCard />
        </SignedOut>
      </div>
      <div className="row-start-2 row-end-4 col-start-1 col-end-2">
        <PredictionsLeaderboardCard />
      </div>
      <div
        className={cn(
          isPredictionsOpen && "row-start-2 row-end-4 col-start-2 col-end-4",
          !isPredictionsOpen && "row-start-1 row-end-4 col-start-2 col-end-4",
        )}
      >
        <ResultsCard />
      </div>
    </div>
  );
}

function RecentPredictionsCard() {
  // TODO maybe add a list of possible phrasings, max limit team name, include team picture?

  const {
    data: predictionActivity,
    isLoading: isPredictionActivityLoading
  } = useQuery({
    queryKey: ["predictionActivity"],
    queryFn: getPredictionActivity
  });

  if (isPredictionActivityLoading) {
    return (
      <Card className="h-full gap-4">
        <CardHeader>
          <CardTitle>Recent predictions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full">
          <Spinner className="size-10" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full gap-4">
      <CardHeader>
        <CardTitle>Recent predictions</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Table>
          <TableBody>
            {!predictionActivity || predictionActivity.length === 0 ? (
              <TableRow>
                <TableCell>
                  No results.
                </TableCell>
              </TableRow>
            ): (
              predictionActivity.map((recentPrediction) => {
                return (
                  <TableRow key={recentPrediction.userId}>
                    <TableCell>
                      <Link className="font-semibold underline" to="/predictions/$slug" params={{ slug: recentPrediction.slug }}>
                        {recentPrediction.name}
                      </Link>
                      {" "}
                      predicted
                      {" "}
                      {/* <Link to="/predictions/$slug" params={{ slug: recentPrediction.slug }}>
                        {recentPrediction.name}
                      </Link> */}
                      {recentPrediction.teamName}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDistanceStrict(recentPrediction.createdAt, new Date(), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
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
          <Spinner className="size-10" />
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
    <Card className="h-full gap-4">
      <CardHeader>
        <CardTitle>Your prediction</CardTitle>
        <CardDescription>
          Who you expect to win the grand finals.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto  overflow-auto">
        <Card className="py-1 h-[68px] rounded-sm">      
          <CardContent className="px-1">
            <BracketTeam team={finalsPrediction.leftTeam} isLoser={finalsPrediction.predictions.winnerId === finalsPrediction.rightTeam.id} isAnimateDisabled={true} />
            <Separator className="my-1" />
            <BracketTeam team={finalsPrediction.rightTeam} isLoser={finalsPrediction.predictions.winnerId === finalsPrediction.leftTeam.id} isAnimateDisabled={true} />
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to="/predictions/$slug" params={{ slug: profile?.slug || "" }}>
            {isPredictionsOpen ? "Edit" : "View"}
          </Link>
        </Button>
      </CardFooter>
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
    <Card className="h-full gap-4 pb-0">
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent className="overflow-scroll">
        <ResultsBracket playoffMatches={playoffMatches} teams={teams} />
      </CardContent>
    </Card>
  );
}

function PredictionsLeaderboardCard() {
  const {
    data: leaderboardPredictions,
    isLoading: isLeaderboardPredictionsLoading
  } = useQuery({
    queryKey: ['leaderboardPredictions'],
    queryFn: getLeaderboardPredictions,
  });

  if (isLeaderboardPredictionsLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full">
          <Spinner className="size-10" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full gap-4">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>
          Users with the most correct predictions.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!leaderboardPredictions || leaderboardPredictions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  Waiting for playoffs to begin.
                </TableCell>
              </TableRow>
            ): (
              leaderboardPredictions.map((leaderboardPrediction, index) => {
                return (
                  <TableRow key={leaderboardPrediction.userId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="max-w-[168px] overflow-hidden text-ellipsis">
                      <Link className="font-semibold underline" to="/predictions/$slug" params={{ slug: leaderboardPrediction.slug || "" }}>
                        {leaderboardPrediction.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      {leaderboardPrediction.count}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}