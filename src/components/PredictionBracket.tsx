import { db } from "@/lib/db"; // TODO commenting this out breaks types
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayoffMatch, Prediction, Team } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SavePrediction, savePredictions } from "@/services/bracket";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";

type UpsertPrediction = Prediction | SavePrediction;

interface PredictMatchWinnerProps {
  playoffMatch: PlayoffMatch;
  teamIdLeft: string;
  teamIdRight: string;
  winnerId: string;
}

interface PredictionBracketProps {
  playoffMatches: PlayoffMatch[];
  predictions: Prediction[];
  teams: Team[];
  isOwner: boolean;
  isLocked: boolean;
}

export function PredictionBracket({ playoffMatches, predictions, teams, isOwner, isLocked }: PredictionBracketProps) {
  const queryClient = useQueryClient();

  const [initialPredictions, setInitialPredictions] = useState<Prediction[]>(predictions);
  const [newPredictions, setNewPredictions] = useState<SavePrediction[]>([]);
  const allPredictions = useMemo(() => {
    return [...initialPredictions, ...newPredictions];
  }, [initialPredictions, newPredictions]);

  const showResetButton = !isLocked && isOwner && ((!!newPredictions && newPredictions.length > 0) || (initialPredictions.length === playoffMatches.length));
  const showSaveButton = !isLocked && isOwner && newPredictions.length === playoffMatches.length;

  const predictMatchWinner = (props: PredictMatchWinnerProps) => {
    const { playoffMatch, teamIdLeft, teamIdRight, winnerId } = props;

    const newPrediction: SavePrediction = {
      playoffMatchId: playoffMatch.id,
      teamIdLeft,
      teamIdRight,
      winnerId
    };

    setNewPredictions((prev) => [...prev, newPrediction]);
  };

  const reset = () => {
    setNewPredictions([]);
    setInitialPredictions([]);
  };

  const savePredictionsMutation = useMutation({
    mutationFn: savePredictions,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"]})
    }
  })
  const save = async () => {
    savePredictionsMutation.mutate({ data: { predictions: newPredictions }});
  };
  
  return (
    <>
      <div className="flex flex-row">
        <div className="flex flex-col gap-4">
          {/* upper */}
          <div className="flex flex-row gap-4">
            <BracketColumn>
              <EmptyMatch />
            </BracketColumn>

            <BracketColumn>
              <BracketMatch round={2} sequence={1} isUpper={true} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={2} sequence={2} isUpper={true} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={2} sequence={3} isUpper={true} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={2} sequence={4} isUpper={true} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
            </BracketColumn>

            <BracketColumn>
              <EmptyMatch />
            </BracketColumn>

            <BracketColumn>
              <BracketMatch round={4} sequence={1} isUpper={true} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={4} sequence={2} isUpper={true} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
            </BracketColumn>

            <BracketColumn>
              <EmptyMatch />
            </BracketColumn>

            <BracketColumn>
              <BracketMatch round={6} sequence={1} isUpper={true} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
            </BracketColumn>

            <BracketColumn>
              <EmptyMatch />
            </BracketColumn>
          </div>

          <Separator />

          {/* lower */}
          <div className="flex flex-row gap-4">
            <BracketColumn>
              <BracketMatch round={1} sequence={1} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={1} sequence={2} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={1} sequence={3} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={1} sequence={4} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={1} sequence={5} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={1} sequence={6} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={1} sequence={7} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={1} sequence={8} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
            </BracketColumn>

            <BracketColumn>
              <BracketMatch round={2} sequence={1} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={2} sequence={2} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={2} sequence={3} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={2} sequence={4} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
            </BracketColumn>

            <BracketColumn>
              <BracketMatch round={3} sequence={1} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={3} sequence={2} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={3} sequence={3} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={3} sequence={4} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
            </BracketColumn>

            <BracketColumn>
              <BracketMatch round={4} sequence={1} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={4} sequence={2} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
            </BracketColumn>

            <BracketColumn>
              <BracketMatch round={5} sequence={1} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
              <BracketMatch round={5} sequence={2} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
            </BracketColumn>

            <BracketColumn>
              <BracketMatch round={6} sequence={1} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
            </BracketColumn>

            <BracketColumn>
              <BracketMatch round={7} sequence={1} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
            </BracketColumn>
          </div>
        </div>
        {/* finals */}
        <BracketColumn>
          <div className="mr-4 mb-[335px]">
            <BracketMatch round={8} sequence={1} isUpper={false} playoffMatches={playoffMatches} teams={teams} predictions={allPredictions} onPredictWinner={predictMatchWinner} isLocked={isLocked} />
          </div>
        </BracketColumn>
      </div>
      <div className="absolute flex gap-3 mt-[-12px] ml-[-12px]">
        {showResetButton && (
          <Button variant="secondary" className="cursor-pointer" onClick={reset}>
            Reset
          </Button>
        )}
        {showSaveButton && (
          <Button className="cursor-pointer" onClick={save} disabled={savePredictionsMutation.isPending}>
            Save
          </Button>
        )}
      </div>
    </>
  );
}

function BracketColumn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-around gap-4">
      {children}
    </div>
  );
}

interface BracketMatchProps {
  round: number;
  sequence: number;
  isUpper: boolean;
  playoffMatches: PlayoffMatch[];
  predictions: UpsertPrediction[];
  teams: Team[];
  isLocked: boolean;

  onPredictWinner: (props: PredictMatchWinnerProps) => void;
}
// TODO logic in here getting kinda complex, could look into a large scale refactor
function BracketMatch({ round, sequence, isUpper, playoffMatches, predictions, teams, isLocked, onPredictWinner }: BracketMatchProps) {
  const playoffMatch = playoffMatches.find((pg) => pg.round === round && pg.sequence === sequence && pg.isUpper === isUpper);
  const prediction = predictions.find((p) => p.playoffMatchId === playoffMatch?.id);

  if (!playoffMatch) {
    console.error(`Missing match round:${round} sequence:${sequence} isUpper:${isUpper}`);
    return <Skeleton className="w-[144px] h-[68px] rounded-sm animate-none" />;
  }

  // if theres a prediction and a result
  if (!!prediction && playoffMatch.winnerId !== null) {
    const predictedTeamLeft = teams.find((t) => t.id === prediction?.teamIdLeft);
    const predictedTeamRight = teams.find((t) => t.id === prediction?.teamIdRight);

    const isLeftPredictionWinner = predictedTeamLeft?.id === playoffMatch.winnerId;
    const isRightPredictionWinner = predictedTeamRight?.id === playoffMatch.winnerId;
    
    const isPredictionCorrect = prediction.winnerId === playoffMatch.winnerId;
    const didPredictLeft = predictedTeamLeft?.id === prediction.winnerId;
    const leftPredictionState = didPredictLeft ? isPredictionCorrect ? "CORRECT" : "INCORRECT" : "NEITHER";
    const rightPredictionState = !didPredictLeft ? isPredictionCorrect ? "CORRECT" : "INCORRECT" : "NEITHER";

    return (
      <Card className="py-1 w-[144px] h-[68px] rounded-sm cursor-default">      
        <CardContent className="px-1">
          <BracketTeam team={predictedTeamLeft} isLoser={!isLeftPredictionWinner} predictionState={leftPredictionState} isAnimateDisabled />
          <Separator className="my-1" />
          <BracketTeam team={predictedTeamRight} isLoser={!isRightPredictionWinner} predictionState={rightPredictionState} isAnimateDisabled />
        </CardContent>
      </Card>
    );
  }

  // there is a prediction
  if (prediction) {
    const teamLeft = teams.find((t) => t.id === prediction?.teamIdLeft);
    const teamRight = teams.find((t) => t.id === prediction?.teamIdRight);
    
    return (
      <Card className="py-1 w-[144px] h-[68px] rounded-sm cursor-default">      
        <CardContent className="px-1">
          <BracketTeam team={teamLeft} isLoser={prediction.winnerId === teamRight?.id} isAnimateDisabled={!!teamLeft} />
          <Separator className="my-1" />
          <BracketTeam team={teamRight} isLoser={prediction.winnerId === teamLeft?.id} isAnimateDisabled={!!teamRight} />
        </CardContent>
      </Card>
    );
  }

  const getTeamLeft = () => {
    // if the playoff game has a team, then its a first round and we can use it as is
    if (!!playoffMatch.teamIdLeft) {
      const team = teams.find((t) => t.id === playoffMatch?.teamIdLeft);
      if (!team) {
        throw new Error(`Missing expected team ${playoffMatch.teamIdLeft}`);
      }
      return team;
    }

    let previousRound: number;
    let previousSequence: number;
    let isPreviousUpper: boolean;
    let isPreviousWinner: boolean;

    // grand finals - left is upper winner
    if (round === 8 && sequence === 1) {
      previousRound = 6;
      previousSequence = 1;
      isPreviousUpper = true;
      isPreviousWinner = true;
    } else if (isUpper) {
      // standard previous from upper
      previousRound = round - 2;
      previousSequence = (sequence * 2) - 1;
      isPreviousUpper = true;
      isPreviousWinner = true;
    } else if (round === 5) {
      previousRound = round - 1;
      previousSequence = sequence === 1 ? 2 : 1;
      isPreviousUpper = true;
      isPreviousWinner = false;
    } else if ([3, 7].includes(round)) {
      // lower bracket game - left is the loser from upper bracket
      previousRound = round - 1;
      previousSequence = sequence;
      isPreviousUpper = true;
      isPreviousWinner = false;
    } else {
      // standard previous from lower
      previousRound = round - 1;
      previousSequence = (sequence * 2) - 1;
      isPreviousUpper = false;
      isPreviousWinner = true;
    }

    const previousPlayoffMatch = playoffMatches.find((pg) => pg.round === previousRound && pg.sequence === previousSequence && pg.isUpper === isPreviousUpper);
    if (!previousPlayoffMatch) {
      throw new Error(`Unable to find left previous playoffMatch for round:${round} sequence:${sequence} ${isUpper ? "upper" : "lower"}`);
    }

    const previousPrediction = predictions.find((p) => p.playoffMatchId === previousPlayoffMatch.id);
    if (!previousPrediction) {
      return;
    }

    if (isPreviousWinner) {
      const team = teams.find((t) => t.id === previousPrediction.winnerId);
      if (!team) {
        throw new Error(`Missing expected team ${previousPrediction.winnerId}`);
      }

      return team;
    } else {
      const previousLoserTeamId = previousPrediction.winnerId === previousPrediction.teamIdLeft ? previousPrediction.teamIdRight : previousPrediction.teamIdLeft;
      const team = teams.find((t) => t.id === previousLoserTeamId);
      if (!team) {
        throw new Error(`Missing expected team ${previousLoserTeamId}`);
      }

      return team;
    }
  }

  const getTeamRight = () => {
    // if the playoff game has a team, then its a first round and we can use it as is
    if (!!playoffMatch.teamIdRight) {
      const team = teams.find((t) => t.id === playoffMatch?.teamIdRight);
      if (!team) {
        throw new Error(`Missing expected team ${playoffMatch.teamIdRight}`);
      }
      return team;
    }

    let previousRound: number;
    let previousSequence: number;
    let isPreviousUpper: boolean;
    let isPreviousWinner: boolean;

    // grand finals - right is lower winner
    if (round === 8 && sequence === 1) {
      previousRound = 7;
      previousSequence = 1;
      isPreviousUpper = false;
      isPreviousWinner = true;
    } else if (isUpper) {
      // standard previous from upper
      previousRound = round - 2;
      previousSequence = sequence * 2;
      isPreviousUpper = true;
      isPreviousWinner = true;
    } else if ([3, 5, 7].includes(round)) {
      // lower bracket game - right is the winner from lower bracket
      previousRound = round - 1;
      previousSequence = sequence;
      isPreviousUpper = false;
      isPreviousWinner = true;
    } else {
      // standard previous from lower
      previousRound = round - 1;
      previousSequence = sequence * 2;
      isPreviousUpper = false;
      isPreviousWinner = true;
    }

    const previousPlayoffMatch = playoffMatches.find((pg) => pg.round === previousRound && pg.sequence === previousSequence && pg.isUpper === isPreviousUpper);
    if (!previousPlayoffMatch) {
      throw new Error(`Unable to find right previous playoffMatch for round:${round} sequence:${sequence} ${isUpper ? "upper" : "lower"}`);
    }

    const previousPrediction = predictions.find((p) => p.playoffMatchId === previousPlayoffMatch.id);
    if (!previousPrediction) {
      return;
    }

    if (isPreviousWinner) {
      const team = teams.find((t) => t.id === previousPrediction.winnerId);
      if (!team) {
        throw new Error(`Missing expected team ${previousPrediction.winnerId}`);
      }

      return team;
    } else {
      const previousLoserTeamId = previousPrediction.winnerId === previousPrediction.teamIdLeft ? previousPrediction.teamIdRight : previousPrediction.teamIdLeft;
      const team = teams.find((t) => t.id === previousLoserTeamId);
      if (!team) {
        throw new Error(`Missing expected team ${previousLoserTeamId}`);
      }

      return team;
    }
  }

  const teamLeft = getTeamLeft();
  const teamRight = getTeamRight();

  if (!teamLeft || !teamRight) {
    return (
      <Card className="py-1 w-[144px] h-[68px] rounded-sm cursor-default">      
        <CardContent className="px-1">
          <BracketTeam team={teamLeft} isAnimateDisabled={!!teamLeft} />
          <Separator className="my-1" />
          <BracketTeam team={teamRight} isAnimateDisabled={!!teamRight} />
        </CardContent>
      </Card>
    );
  }

  if (isLocked) {
    return (
      <Card className="py-1 w-[144px] h-[68px] rounded-sm">      
        <CardContent className="px-1">
          <BracketTeam team={teamLeft} isLoser={playoffMatch.winnerId === teamRight?.id} isAnimateDisabled={true} />
          <Separator className="my-1" />
          <BracketTeam team={teamRight} isLoser={playoffMatch.winnerId === teamLeft?.id} isAnimateDisabled={true} />
        </CardContent>
      </Card>
    );
  }

  const predictWinner = (winnerId?: string) => {
    if (!winnerId) {
      return;
    }

    onPredictWinner({
      playoffMatch,
      teamIdLeft: teamLeft.id,
      teamIdRight: teamRight.id,
      winnerId
    });
  };

  return (
    <Card className="py-1 w-[144px] h-[68px] rounded-sm">      
      <CardContent className="px-1">
        <div className="cursor-pointer hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50" onClick={() => predictWinner(teamLeft?.id)}>
          <BracketTeam team={teamLeft} isLoser={playoffMatch.winnerId === teamRight?.id} isAnimateDisabled={true} />
        </div>
        <Separator className="my-1" />
        <div className="cursor-pointer hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50" onClick={() => predictWinner(teamRight?.id)}>
          <BracketTeam team={teamRight} isLoser={playoffMatch.winnerId === teamLeft?.id} isAnimateDisabled={true} />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyMatch() {
  return (
    <div className="py-1 w-[144px] h-[68px] rounded-sm">
    </div>
  );
}

interface BracketTeamProps {
  isAnimateDisabled?: boolean;
  predictionState?: "NEITHER" | "CORRECT" | "INCORRECT";
  isLoser?: boolean;
  team?: Team;
}
export function BracketTeam({ isAnimateDisabled = true, predictionState = "NEITHER", isLoser, team }: BracketTeamProps) {
  const renderImageSection = () => {
    if (predictionState === "CORRECT") {
      return (
        <div className="rounded-sm size-6">
          <Check className="stroke-green-500"/>
        </div>
      );
    }
    if (predictionState === "INCORRECT") {
      return (
        <div className="rounded-sm size-6">
          <X className="stroke-red-500"/>
        </div>
      );
    }
    if (predictionState === "NEITHER" && !!team?.image) {
      return (
        <img
          src={team.image}
          className="rounded-sm size-6"
          alt="Team logo"
        />
      );
    }

    return (
      <Skeleton className={cn("rounded-sm", "size-6", "shrink-0", isAnimateDisabled && "animate-none")} />
    );
  }
  
  return (
    <div className={cn("flex", "flex-row", "items-center", "gap-1", isLoser && "opacity-40")}>
      {renderImageSection()}
      
      {!!team?.name ? (
        <span className={cn("text-xs", "whitespace-nowrap", "overflow-hidden", "text-ellipsis", predictionState === "CORRECT" && "text-green-500", predictionState === "INCORRECT" && "text-red-500")}>
          {team.name}
        </span>
      ) : (
        <Skeleton className={cn("w-[154px]", "h-6", isAnimateDisabled && "animate-none")} />
      )}
    </div>
  );
}