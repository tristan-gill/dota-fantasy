import { SignedIn } from "@/components/SignedIn";
import { SignedOut } from "@/components/SignedOut";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthentication } from "@/lib/auth/client";
import { Player } from "@/lib/db/schema";
import { getConfig } from "@/services/configs";
import { getTopPlayersLeaderboard } from "@/services/playerService";
import { getProfileByUserId } from "@/services/profiles";
import { getRecentRosterCompletions, getUserRosterPlayers, getUserRosterScoresLeaderboard } from "@/services/rosterService";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from '@tanstack/react-router'
import { formatDistanceStrict } from "date-fns";
import { LogInIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute('/rosters/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-4 max-h-[775px] h-full my-auto max-w-full w-5xl grid grid-cols-3 grid-rows-3 gap-4 mx-auto">
      <div className="col-span-2">
        <SignedIn>
          <YourRosterCard />
        </SignedIn>
        <SignedOut>
          <LoginToRosterCard />
        </SignedOut>
      </div>
      <RecentRostersCard />
      <div className="row-start-2 row-end-4 col-start-1 col-end-2">
        <TopPlayersCard />
      </div>
      <div className="row-start-2 row-end-4 col-start-2 col-end-4">
        <RosterLoaderboardCard />
      </div>
    </div>
  );
}

function RecentRostersCard() {
  
  const {
    data: recentRosterCompletions,
    isLoading: isRecentRosterCompletionsLoading
  } = useQuery({
    queryKey: ["recentRosterCompletions"],
    queryFn: getRecentRosterCompletions
  });

  if (isRecentRosterCompletionsLoading) {
    return (
      <Card className="h-full gap-4">
        <CardHeader>
          <CardTitle>Recently updated</CardTitle>
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
        <CardTitle>Recently updated</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[147px]">
        <Table>
          <TableBody>
            {!recentRosterCompletions || recentRosterCompletions.length === 0 ? (
              <TableRow>
                <TableCell>
                  No results.
                </TableCell>
              </TableRow>
            ): (
              recentRosterCompletions.map((recentRosterCompletion) => {
                return (
                  <TableRow key={recentRosterCompletion.userId}>
                    <TableCell className="max-w-[168px] whitespace-nowrap overflow-hidden text-ellipsis">
                      <Link className="font-semibold underline" to="/rosters/$slug" params={{ slug: recentRosterCompletion.slug }}>
                        {recentRosterCompletion.name}
                      </Link>
                      {" "}
                      updated their roster 
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDistanceStrict(recentRosterCompletion.updatedAt, new Date(), { addSuffix: true })}
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
    data: rosterPlayers,
    isLoading: isRosterPlayersLoading
  } = useQuery({
    queryKey: ["rosterPlayers", userSession?.user.id],
    queryFn: () => getUserRosterPlayers({ data: { userId: userSession?.user.id || "" }}),
    enabled: !!userSession?.user.id
  });
  
  const {
    data: isRosterOpen,
    isLoading: isConfigLoading
  } = useQuery({
    queryKey: ["config", "IS_ROSTER_OPEN"],
    queryFn: () => getConfig({ data: { name: "IS_ROSTER_OPEN" }})
  });

  if (isProfileLoading || isConfigLoading || isRosterPlayersLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Your roster</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center grow">
          <Spinner className="size-10" />
        </CardContent>
      </Card>
    );
  }

  if (!rosterPlayers) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Your roster</CardTitle>
          <CardDescription>No roster found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full gap-4">
      <CardHeader>
        <CardTitle>Your roster</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row gap-2 justify-around">
          <RosterPlayer role={1} player={rosterPlayers.carryPlayer} />
          <RosterPlayer role={2} player={rosterPlayers.midPlayer} />
          <RosterPlayer role={3} player={rosterPlayers.offlanePlayer} />
          <RosterPlayer role={4} player={rosterPlayers.softSupportPlayer} />
          <RosterPlayer role={5} player={rosterPlayers.hardSupportPlayer} />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="ml-auto">
          <Link to="/rosters/$slug" params={{ slug: profile?.slug || "" }}>
            {isRosterOpen ? "Edit roster" : "View roster"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
interface RosterPlayerProps {
  role: number;
  player: Player | null;
}
function RosterPlayer({ role, player }: RosterPlayerProps) {
  // TODO reactive sized pictures
  return (
    <div className="flex flex-col">
      <div>
        {player?.image ? (
          <img
            src={player.image}
            className="rounded-sm size-18"
            alt="Team logo"
          />
        ) : (
          <div className="flex flex-col items-center justify-center bg-gray-900 rounded-md size-18">
            {role === 1 && <svg viewBox="0 0 24 24" width="16" height="16"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.792 16.244L.623 20.388a2.107 2.107 0 000 2.992h.002a2.136 2.136 0 003.01 0l4.167-4.142-3.01-2.994z" fill="url(#hilt_:r1s:_dark)" fill-opacity="0.7"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M2.853 10.193c-.373.32-.597.78-.615 1.268-.018.49.17.964.517 1.309l8.53 8.478c.326.327.77.507 1.233.507a1.73 1.73 0 001.228-.51 1.717 1.717 0 00-.003-2.434c-.86-.855-1.857-1.843-1.857-1.843s8.881-7.06 10.836-8.612a1.18 1.18 0 00.43-.776c.17-1.423.668-5.646.845-7.124a.406.406 0 00-.119-.337.414.414 0 00-.34-.116l-6.767.843c-.304.038-.578.19-.77.427L7.134 12.245s-1.087-1.085-1.973-1.962a1.702 1.702 0 00-2.305-.09h-.003zm7.519 4.69l9.922-9.861a.79.79 0 10-1.124-1.116l-9.922 9.863a.782.782 0 000 1.114c.31.31.813.31 1.124 0z" fill="url(#blade_:r1s:_dark)"></path><defs><linearGradient id="hilt_:r1s:_dark" x1="3" y1="18" x2="6" y2="21.75" gradientUnits="userSpaceOnUse"><stop stop-color="#DDD"></stop><stop offset="1" stop-color="#838383"></stop></linearGradient><linearGradient id="blade_:r1s:_dark" x1="23.915" y1="9.91042e-8" x2="6.38719" y2="17.6213" gradientUnits="userSpaceOnUse"><stop stop-color="hsl(231,54%,59%)"></stop><stop offset="1" stop-color="hsl(230,43%,45%)"></stop></linearGradient></defs></svg>}
            {role === 2 && <svg viewBox="0 0 24 24" width="16" height="16"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.262 3.015l-1.148-1.15A1.092 1.092 0 0118.884 0h4.025A1.092 1.092 0 0124 1.09v4.024a1.093 1.093 0 01-1.865.773l-1.152-1.15-1.05 1.051c3.603 4.439 3.448 10.915-.469 15.177l.763 1.271a.65.65 0 01-.165.857c-.31.234-.713.533-1.037.778a.636.636 0 01-.5.119.642.642 0 01-.432-.281c-.4-.598-1.016-1.52-1.376-2.063a1.206 1.206 0 00-.828-.522c-1.857-.26-8.092-1.13-10.479-1.462a1.26 1.26 0 01-1.07-1.073C3.957 15.857 2.877 8.11 2.877 8.11a1.197 1.197 0 00-.519-.825C1.81 6.92.89 6.305.291 5.907a.655.655 0 01-.162-.934c.245-.323.547-.726.778-1.034a.65.65 0 01.856-.167l1.271.762C6.731 1.141 12.088.571 16.34 2.827a.535.535 0 01.126.852L15.094 5.05a.538.538 0 01-.609.107 8.72 8.72 0 00-9.27 1.328l1.35 9.228L19.263 3.015zm-1.4 4.844l-9.576 9.578 9.227 1.347a8.723 8.723 0 00.35-10.925z" fill="url(#bow_arrow_:r1t:_dark)"></path><defs><linearGradient id="bow_arrow_:r1t:_dark" x1="25.0809" y1="-6.25872e-7" x2="1.25351" y2="22.5728" gradientUnits="userSpaceOnUse"><stop stop-color="hsl(187,60%,40%)"></stop><stop offset="1" stop-color="hsl(188,48%,38%)"></stop></linearGradient></defs></svg>}
            {role === 3 && <svg viewBox="0 0 24 24" width="16" height="16"><path fill-rule="evenodd" clip-rule="evenodd" d="M.75 3.3C.75 1.892 1.84.75 3.187.75H20.81c1.347 0 2.441 1.142 2.441 2.55v7.52a8.265 8.265 0 01-.803 3.56C20.953 17.45 17.43 23.25 12 23.25c-5.432 0-8.957-5.8-10.444-8.878a8.259 8.259 0 01-.799-3.553A2510.5 2510.5 0 01.75 3.3zm14.198 2.2a.509.509 0 00-.014-.482.462.462 0 00-.4-.238h-2.48a.469.469 0 00-.41.25c-.558 1.048-2.711 5.076-3.464 6.484-.054.1-.05.223.004.324.058.1.162.162.274.162h2.196c.169 0 .324.094.414.245.086.151.09.338.01.497-.64 1.242-1.93 3.75-2.646 5.148a.16.16 0 00.044.198c.06.046.144.04.198-.018 1.67-1.815 5.673-6.156 7.095-7.697a.338.338 0 00.061-.357.31.31 0 00-.288-.198h-2.008a.477.477 0 01-.407-.24.514.514 0 01-.011-.49c.49-.958 1.343-2.634 1.832-3.588z" fill="url(#shield_:r1u:_dark)"></path><defs><linearGradient id="shield_:r1u:_dark" x1="12" y1="0.75" x2="12" y2="23.25" gradientUnits="userSpaceOnUse"><stop stop-color="hsl(33,79%,46%)"></stop><stop offset="1" stop-color="hsl(34,82%,36%)"></stop></linearGradient></defs></svg>}
            {role === 4 && <svg viewBox="0 0 24 24" width="16" height="16"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.442 18.141l2.167-1.25c.398-.23.898-.219 1.286.03l1.93 1.238a.373.373 0 01.005.63c-1.77 1.183-8 5.211-10.744 5.211-.926 0-7.725-2.034-7.725-2.034v-6.999h2.704c.881 0 1.741.265 2.46.755l1.635 1.117h3.671c.438 0 1.482 0 1.482 1.302 0 1.41-1.14 1.41-1.482 1.41h-5.395a.555.555 0 00-.565.543c0 .3.254.543.565.543h5.75s.82.004 1.473-.56c.414-.359.783-.944.783-1.936z" fill="#DEDEDE"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M4.399 15.02c0-.583-.494-1.058-1.1-1.058h-2.2c-.606 0-1.099.475-1.099 1.059v6.998c0 .583.493 1.057 1.099 1.057h2.2c.606 0 1.1-.474 1.1-1.057v-6.998z" fill="url(#wrist_:r1v:_dark)" fill-opacity="0.7"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M20.895 6.395a.32.32 0 00-.202-.246.336.336 0 00-.32.043c-.91.64-1.942.965-1.942.965.04-3.622-2.211-5.914-5.873-7.13a.51.51 0 00-.541.141.463.463 0 00-.065.537c.833 1.5 1.205 2.868 1.068 4.825 0 0-.924-.426-1.26-1.51a.314.314 0 00-.205-.21.344.344 0 00-.3.043c-3.528 2.588-2.893 10.11 4.131 10.11 5.095 0 5.928-4.594 5.51-7.568zm-5.31-.56a.14.14 0 00-.03-.152.149.149 0 00-.158-.03c-2.764 1.222-3.878 6.061-.325 6.061 3.384 0 2.143-3.47.852-4.149a.111.111 0 00-.116.01.108.108 0 00-.05.106c.065.512-.148.819-.686.779-.209-.812.152-1.83.513-2.624z" fill="url(#flame_:r1v:_dark)"></path><defs><linearGradient id="wrist_:r1v:_dark" x1="2.19928" y1="13.9623" x2="2.19928" y2="23.0759" gradientUnits="userSpaceOnUse"><stop stop-color="#DEDEDE"></stop><stop offset="1" stop-color="#7B7373"></stop></linearGradient><linearGradient id="flame_:r1v:_dark" x1="20.1087" y1="-1.17264e-7" x2="10.053" y2="15.0821" gradientUnits="userSpaceOnUse"><stop stop-color="hsl(29,76%,39%)"></stop><stop offset="1" stop-color="hsl(335,58%,51%)"></stop></linearGradient></defs></svg>}
            {role === 5 && <svg viewBox="0 0 24 24" width="16" height="16"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.442 17.96l2.167-1.289a1.216 1.216 0 011.286.03l1.929 1.278a.392.392 0 01.005.65c-1.77 1.219-8 5.371-10.743 5.371-.926 0-7.725-2.097-7.725-2.097V14.69h2.704c.883 0 1.741.27 2.46.777l1.635 1.152h3.671c.44 0 1.484 0 1.484 1.342 0 1.453-1.143 1.453-1.484 1.453h-5.395a.564.564 0 00-.565.56c0 .308.254.558.565.558h5.75s.82.006 1.473-.578c.414-.368.783-.972.783-1.993z" fill="#DEDEDE"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M4.399 14.667c0-.602-.494-1.09-1.1-1.09h-2.2c-.606 0-1.099.488-1.099 1.09v7.214c0 .602.493 1.09 1.099 1.09h2.2c.607 0 1.1-.488 1.1-1.09v-7.214z" fill="url(#wrist_:r20:_dark)" fill-opacity="0.7"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M23.594 10.114a.142.142 0 00.002-.274c-1.165-.402-2.238-1.461-2.635-2.62a.142.142 0 00-.274 0c-.39 1.16-1.443 2.247-2.6 2.63a.141.141 0 00-.003.273c1.158.402 2.21 1.465 2.603 2.617a.142.142 0 00.274 0c.397-1.162 1.468-2.232 2.633-2.626zm-7.54-3.583a.215.215 0 00.158-.208.214.214 0 00-.157-.209c-1.774-.615-3.408-2.227-4.013-3.994a.213.213 0 00-.21-.158.214.214 0 00-.207.16c-.597 1.767-2.2 3.423-3.963 4.005a.216.216 0 00-.004.417c1.765.612 3.369 2.232 3.966 3.988.027.094.111.16.209.16a.214.214 0 00.207-.16c.606-1.77 2.24-3.401 4.014-4.001zm4.87-4.187a.11.11 0 00.08-.106.112.112 0 00-.08-.108c-.91-.314-1.749-1.142-2.058-2.048A.113.113 0 0018.76 0a.113.113 0 00-.108.082c-.306.908-1.128 1.758-2.032 2.055a.11.11 0 00-.082.106.109.109 0 00.08.108c.905.314 1.728 1.145 2.034 2.047a.11.11 0 00.108.08c.05 0 .093-.032.106-.08.31-.91 1.148-1.745 2.058-2.054z" fill="url(#sparks_:r20:_dark)"></path><defs><linearGradient id="wrist_:r20:_dark" x1="2.19928" y1="13.5766" x2="2.19928" y2="22.9711" gradientUnits="userSpaceOnUse"><stop stop-color="#DEDEDE"></stop><stop offset="1" stop-color="#7B7373"></stop></linearGradient><linearGradient id="sparks_:r20:_dark" x1="7.5" y1="0" x2="24" y2="13.5" gradientUnits="userSpaceOnUse"><stop stop-color="hsl(155,31%,48%)"></stop><stop offset="1" stop-color="hsl(158,78%,28%)"></stop></linearGradient></defs></svg>}
          </div>
        )}
        
      </div>
      <div className="max-w-20 text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis text-center">
        {player?.name || "Unpicked"}
      </div>
    </div>
  );
}

function LoginToRosterCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Your roster</CardTitle>
        <CardDescription>
          Login to start crafting your roster.
          Rosters close when playoffs begin.
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

function RosterLoaderboardCard() {
  const {
    data: userRosterScoresLeaderboard,
    isLoading: isUserRosterScoresLeaderboardLoading
  } = useQuery({
    queryKey: ["getUserRosterScoresLeaderboard"],
    queryFn: getUserRosterScoresLeaderboard
  });

  if (isUserRosterScoresLeaderboardLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Roster leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center grow">
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
          Who can craft the best fantasy team.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-15">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!userRosterScoresLeaderboard || userRosterScoresLeaderboard.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  Waiting for playoffs to begin.
                </TableCell>
              </TableRow>
            ): (
              userRosterScoresLeaderboard.map((userRosterScore, index) => {
                return (
                  <TableRow key={userRosterScore.profiles.userId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="max-w-[254px] overflow-hidden text-ellipsis">
                      <Link className="font-semibold underline" to="/rosters/$slug" params={{ slug: userRosterScore.profiles.slug }}>
                        {userRosterScore.profiles.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(userRosterScore.user_roster_scores.totalScore)}
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

function TopPlayersCard() {
  const [roleFilter, setRoleFilter] = useState(0);

  const {
    data: topPlayersLeaderboard,
    isLoading: isTopPlayersLeaderboardLoading
  } = useQuery({
    queryKey: ["getTopPlayersLeaderboard"],
    queryFn: getTopPlayersLeaderboard
  });

  if (isTopPlayersLeaderboardLoading) {
    return (
      <Card className="h-full gap-4">
        <CardHeader>
          <CardTitle>Top players</CardTitle>
          <CardDescription>
            Individual players with the highest base scores before banner and title multipliers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center grow">
          <Spinner className="size-10" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full gap-4">
      <CardHeader>
        <CardTitle>Top players</CardTitle>
        <CardDescription>
          Highest base scores from whole season.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto h-full">
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead className="w-35">User</TableHead>
              <TableHead className="text-right w-20">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!topPlayersLeaderboard || topPlayersLeaderboard.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  Waiting for playoffs to begin.
                </TableCell>
              </TableRow>
            ): (
              topPlayersLeaderboard
                .filter((topPlayer) => roleFilter === 0 || roleFilter === topPlayer.position)
                .map((topPlayer, index) => {
                return (
                  <TableRow key={topPlayer.name}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="overflow-hidden text-ellipsis flex gap-2 items-center max-w-35">
                      {topPlayer.image ? (
                        <img
                          src={topPlayer.image}
                          className="rounded-sm size-6"
                          alt="Player image"
                        />
                      ) : (
                        <Skeleton className="rounded-sm size-6 shrink-0 animate-none" />
                      )}
                      {topPlayer.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(topPlayer.totalScore)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Tabs defaultValue="0" className="sticky top-0">
        <TabsList>
          <TabsTrigger onClick={() => setRoleFilter(0)} value="0">All</TabsTrigger>
          <TabsTrigger onClick={() => setRoleFilter(1)} value="1">1</TabsTrigger>
          <TabsTrigger onClick={() => setRoleFilter(2)} value="2">2</TabsTrigger>
          <TabsTrigger onClick={() => setRoleFilter(3)} value="3">3</TabsTrigger>
          <TabsTrigger onClick={() => setRoleFilter(4)} value="4">4</TabsTrigger>
          <TabsTrigger onClick={() => setRoleFilter(5)} value="5">5</TabsTrigger>
        </TabsList>
        </Tabs>
      </CardFooter>
    </Card>
  );
}