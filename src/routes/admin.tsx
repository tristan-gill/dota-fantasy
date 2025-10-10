import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayoffMatch, Team } from "@/lib/db/schema";
import { getPlayoffMatches, getTeams } from "@/services/bracket";
import { processSeries } from '@/services/gameService';
import { updatePlayoffMatch } from "@/services/playoffMatchService";
import { getUserRole } from '@/services/profiles';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { Loader2, X } from 'lucide-react';
import { useMemo, useState } from "react";
import { toast } from 'sonner';

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
  loader: async () => {
    // TODO test if this works
    const userRole = await getUserRole();
    if (!userRole || userRole.role !== "ADMIN") {
      throw notFound();
    }

    // TODO maybe join this on the db side?
    const responses = await Promise.all([
      getPlayoffMatches(),
      getTeams(),
    ]);

    return {
      playoffMatches: responses[0],
      teams: responses[1]
    };
  }
})

function RouteComponent() {
  const { playoffMatches, teams } = Route.useLoaderData();
  
  return (
    <div className="flex flex-row gap-4">
      <AddSeriesCard playoffMatches={playoffMatches} />
      <UpdatePlayoffMatchCard playoffMatches={playoffMatches} teams={teams} />
    </div>
  );
}

interface UpdatePlayoffMatchCardProps {
  playoffMatches: PlayoffMatch[];
  teams: Team[];
}
function UpdatePlayoffMatchCard({ playoffMatches, teams }: UpdatePlayoffMatchCardProps) {
  const router = useRouter();

  const [selectedPlayoffMatchId, setSelectedPlayoffMatchId] = useState<string>('');
  const [leftTeamId, setLeftTeamId] = useState<string>('');
  const [rightTeamId, setRightTeamId] = useState<string>('');
  const [winnerId, setWinnerId] = useState<string>('');

  const updatePlayoffMatchMutation = useMutation({
    mutationFn: updatePlayoffMatch,
    onSuccess: async () => {
      toast("Saved successfully!");
      router.invalidate();
    },
  });
  
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    updatePlayoffMatchMutation.mutate({
      data: {
        id: formData.get("playoffMatchId") as string,
        teamIdLeft: formData.get("leftTeamId") as string || null,
        teamIdRight: formData.get("rightTeamId") as string || null,
        winnerId: formData.get("winnerId") as string || null,
      },
    });
  }

  // TODO should join this on the db side rather than client side but w/e
  const selectPlayoffMatches = useMemo(() => {
    return playoffMatches
      .sort((a, b) => {
        if (a.isUpper !== b.isUpper) {
          return Number(b.isUpper) - Number(a.isUpper);
        }
        if (a.round !== b.round) {
          return a.round - b.round;
        }
        return a.sequence - b.sequence;
      })
      .map((playoffMatch) => {
      return {
        value: playoffMatch.id,
        display: `${playoffMatch.isUpper ? "Upper" : "Lower"} round ${playoffMatch.round} game ${playoffMatch.sequence}`
      };
    });
  }, [playoffMatches, updatePlayoffMatchMutation.isSuccess]);

  const selectTeams = useMemo(() => {
    return teams
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      })
      .map((team) => {
      return {
        value: team.id,
        display: team.name
      };
    });
  }, [teams, updatePlayoffMatchMutation.isSuccess]);

  const onPlayoffMatchIdChange = (value: string) => {
    const selectedPlayoffMatch = playoffMatches.find((pg) => pg.id === value);
    if (!selectedPlayoffMatch) {
      return;
    }

    setLeftTeamId(selectedPlayoffMatch.teamIdLeft || "");
    setRightTeamId(selectedPlayoffMatch.teamIdRight || "");
    setWinnerId(selectedPlayoffMatch.winnerId || "");

    setSelectedPlayoffMatchId(value);
  };

  return (
    <Card className="w-sm">
      <CardHeader>
        <CardTitle>Update playoff match</CardTitle>
        <CardDescription>
          Update the state of a playoff match for the bracket.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="playoffMatchId">
                Playoff match
              </Label>
              <Select name="playoffMatchId" onValueChange={onPlayoffMatchIdChange} value={selectedPlayoffMatchId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a playoff match" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {selectPlayoffMatches.map((selectPlayoffMatch) => {
                      return (
                        <SelectItem key={selectPlayoffMatch.value} value={selectPlayoffMatch.value}>{selectPlayoffMatch.display}</SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-row gap-4">
              <div className="flex flex-col gap-2 size-1/2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="leftTeamId">
                    Left team
                  </Label>
                  {!!leftTeamId && <X className="size-3 cursor-pointer" onClick={() => setLeftTeamId('')}/>}
                </div>
                <Select name="leftTeamId" value={leftTeamId} onValueChange={setLeftTeamId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Team name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {selectTeams.map((selectTeam) => {
                        return (
                          <SelectItem key={selectTeam.value} value={selectTeam.value}>{selectTeam.display}</SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 size-1/2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="rightTeamId">
                    Right team
                  </Label>
                  {!!rightTeamId && <X className="size-3 cursor-pointer" onClick={() => setRightTeamId('')}/>}
                </div>
                <Select name="rightTeamId" value={rightTeamId} onValueChange={setRightTeamId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Team name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {selectTeams.map((selectTeam) => {
                        return (
                          <SelectItem key={selectTeam.value} value={selectTeam.value}>{selectTeam.display}</SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              
              <div className="flex justify-between items-center">
                <Label htmlFor="winnerId">
                  Winning team
                </Label>
                {!!winnerId && <X className="size-3 cursor-pointer" onClick={() => setWinnerId('')}/>}
              </div>
              <Select name="winnerId" value={winnerId} onValueChange={setWinnerId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Team name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {selectTeams.map((selectTeam) => {
                      return (
                        <SelectItem key={selectTeam.value} value={selectTeam.value}>{selectTeam.display}</SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button disabled={updatePlayoffMatchMutation.isPending} className="w-full cursor-pointer">
              {updatePlayoffMatchMutation.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface AddSeriesCardProps {
  playoffMatches: PlayoffMatch[];
}
function AddSeriesCard({ playoffMatches }: AddSeriesCardProps) {
  const selectPlayoffMatches = useMemo(() => {
    return playoffMatches
      .sort((a, b) => {
        if (a.isUpper !== b.isUpper) {
          return Number(b.isUpper) - Number(a.isUpper);
        }
        if (a.round !== b.round) {
          return a.round - b.round;
        }
        return a.sequence - b.sequence;
      })
      .map((playoffMatch) => {
      return {
        value: playoffMatch.id,
        display: `${playoffMatch.isUpper ? "Upper" : "Lower"} round ${playoffMatch.round} game ${playoffMatch.sequence}`
      };
    });
  }, [playoffMatches]);

  const processSeriesMutation = useMutation({
    mutationFn: processSeries,
    onSuccess: async () => {
      // TODO any invalidation needed?
      toast("Match was added successfully!");
    },
  });

  // TODO might be nice if we confirmed the match was parsed beforehand, could do a client side fetch?
  const onAddMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const gameIdsString = formData.get("gameIds") as string;

    processSeriesMutation.mutate({
      data: {
        gameIds: gameIdsString.split(","),
        playoffMatchId: formData.get("playoffMatchId") as string
      },
    });
  }

  return (
    <Card className="w-xs mb-auto">
      <CardHeader>
        <CardTitle>Add series</CardTitle>
        <CardDescription>
          Fetch the data from Opendota for the games in the series and save it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onAddMatch}>
          <div className="flex flex-col gap-4">
            <Label htmlFor="gameIds">
              Game Ids
            </Label>
            <Input id="gameIds" name="gameIds" required />
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="playoffMatchId">
                Playoff match
              </Label>
              <Select name="playoffMatchId">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a playoff match" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {selectPlayoffMatches.map((selectPlayoffMatch) => {
                      return (
                        <SelectItem key={selectPlayoffMatch.value} value={selectPlayoffMatch.value}>{selectPlayoffMatch.display}</SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button disabled={processSeriesMutation.isPending} className="w-full cursor-pointer">
              {processSeriesMutation.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              Add
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}