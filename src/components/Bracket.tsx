import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function Bracket() {
  return (
    <div className="flex flex-row gap-4">
      <BracketColumn>
        <EmptyMatch />
        <EmptyMatch />
        <EmptyMatch />
        <EmptyMatch />
        <EmptyMatch />
        <EmptyMatch />
        <EmptyMatch />
        <EmptyMatch />

        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
      </BracketColumn>
      <BracketColumn>
        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
      </BracketColumn>
      <BracketColumn>
        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
        <BracketMatch />
      </BracketColumn>
      <BracketColumn>
        <BracketMatch />
        <BracketMatch />
      </BracketColumn>
      <BracketColumn>
        <BracketMatch />
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


function BracketMatch() {
  return (
    <Card className="py-1 w-[192px] h-[68px] rounded-sm">      
      <CardContent className="px-1">
        <BracketTeam name="Team A" image="https://avatars.fastly.steamstatic.com/bde1bfd44350801ca1bb638965fb5261e192f009_full.jpg" />
        <Separator className="my-1" />
        <BracketTeam name="Team B" image="https://avatars.fastly.steamstatic.com/318f1c602ecc91eb200ccee820ca9e94f44eb7ea_full.jpg" />
      </CardContent>
    </Card>
  );
}

function EmptyMatch() {
  return (
    <div className="py-1 w-[192px] h-[68px] rounded-sm">
    </div>
  );
}

interface BracketTeamProps {
  name: string,
  image: string
}

function BracketTeam({ name, image }: BracketTeamProps) {
  return (
    <div className="flex flex-row items-center gap-1">
      <img
        src={image}
        className="rounded-sm size-6"
        alt="Team logo"
      />
      <span className="whitespace-nowrap overflow-hidden text-ellipsis">
        {name}
      </span>
    </div>
  );
}