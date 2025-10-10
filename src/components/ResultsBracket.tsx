import { db } from "@/lib/db"; // TODO commenting this out breaks types
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayoffMatch, Team } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface ResultsBracketProps {
  playoffMatches: PlayoffMatch[];
  teams: Team[];
}
export function ResultsBracket({ playoffMatches, teams }: ResultsBracketProps) {
  const fillMatch = (round: number, sequence: number, isUpper: boolean) => {
    // TODO not efficient at all
    const playoffMatch = playoffMatches.find((pg) => pg.round === round && pg.sequence === sequence && pg.isUpper === isUpper);
    const teamLeft = teams.find((t) => t.id === playoffMatch?.teamIdLeft);
    const teamRight = teams.find((t) => t.id === playoffMatch?.teamIdRight);

    if (!playoffMatch) {
      console.log(`Missing match round:${round} sequence:${sequence} isUpper:${isUpper}`);
      return null;
    }

    return <BracketMatch playoffMatch={playoffMatch} teamLeft={teamLeft} teamRight={teamRight} />;
  }
  
  return (
    <div className="flex flex-row">
      <div className="flex flex-col gap-4">
        {/* upper */}
        <div className="flex flex-row gap-4">
          <BracketColumn>
            <EmptyMatch />
          </BracketColumn>

          <BracketColumn>
            {fillMatch(2, 1, true)}
            {fillMatch(2, 2, true)}
            {fillMatch(2, 3, true)}
            {fillMatch(2, 4, true)}
          </BracketColumn>

          <BracketColumn>
            <EmptyMatch />
          </BracketColumn>

          <BracketColumn>
            {fillMatch(4, 1, true)}
            {fillMatch(4, 2, true)}
          </BracketColumn>

          <BracketColumn>
            <EmptyMatch />
          </BracketColumn>

          <BracketColumn>
            {fillMatch(6, 1, true)}
          </BracketColumn>

          <BracketColumn>
            <EmptyMatch />
          </BracketColumn>
        </div>

        <Separator />

        {/* lower */}
        <div className="flex flex-row gap-4">
          <BracketColumn>
            {fillMatch(1, 1, false)}
            {fillMatch(1, 2, false)}
            {fillMatch(1, 3, false)}
            {fillMatch(1, 4, false)}
            {fillMatch(1, 5, false)}
            {fillMatch(1, 6, false)}
            {fillMatch(1, 7, false)}
            {fillMatch(1, 8, false)}
          </BracketColumn>

          <BracketColumn>
            {fillMatch(2, 1, false)}
            {fillMatch(2, 2, false)}
            {fillMatch(2, 3, false)}
            {fillMatch(2, 4, false)}
          </BracketColumn>

          <BracketColumn>
            {fillMatch(3, 1, false)}
            {fillMatch(3, 2, false)}
            {fillMatch(3, 3, false)}
            {fillMatch(3, 4, false)}
          </BracketColumn>

          <BracketColumn>
            {fillMatch(4, 1, false)}
            {fillMatch(4, 2, false)}
          </BracketColumn>

          <BracketColumn>
            {fillMatch(5, 1, false)}
            {fillMatch(5, 2, false)}
          </BracketColumn>

          <BracketColumn>
            {fillMatch(6, 1, false)}
          </BracketColumn>

          <BracketColumn>
            {fillMatch(7, 1, false)}
          </BracketColumn>
        </div>
      </div>
      {/* finals */}
      <BracketColumn>
        <div className="mr-4 mb-[335px]">
          {fillMatch(8, 1, false)}
        </div>
      </BracketColumn>
    </div>
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
  playoffMatch: PlayoffMatch;
  teamLeft?: Team;
  teamRight?: Team;
}
function BracketMatch({ playoffMatch, teamLeft, teamRight }: BracketMatchProps) {
  return (
    <Card className="py-1 w-[144px] h-[68px] rounded-sm">      
      <CardContent className="px-1">
        <BracketTeam team={teamLeft} isLoser={playoffMatch.winnerId === teamRight?.id} />
        <Separator className="my-1" />
        <BracketTeam team={teamRight} isLoser={playoffMatch.winnerId === teamLeft?.id} />
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
  team?: Team;
  isLoser?: boolean;
}
function BracketTeam({ team, isLoser }: BracketTeamProps) {
  return (
    <div className={cn("flex", "flex-row", "items-center", "gap-1", isLoser && "opacity-50")}>
      {!!team?.image ? (
        <img
          src={team.image}
          className="rounded-sm size-6"
          alt="Team logo"
        />
      ) : (
        <Skeleton className="rounded-sm size-6 shrink-0 animate-none" />
      )}
      
      {!!team?.name ? (
        <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
          {team.name}
        </span>
      ) : (
        <Skeleton className="w-[154px] h-6 animate-none" />
      )}
    </div>
  );
}