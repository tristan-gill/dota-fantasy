import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Banner, UserBanner, UserTitle } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { getProfileBySlug } from "@/services/profiles";
import { getBanners, getPlayerTeams, getRosterRolls, getTitles, getUserBanners, getUserRoster, getUserTitles, insertBannerRoll, insertTitleRoll, PlayerTeam, saveRosterPlayer } from "@/services/rosterService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Check, CheckIcon, ChevronsUpDownIcon, Loader2 } from "lucide-react";
import { PropsWithChildren, useMemo, useState } from "react";

interface RollData {
  titleRolls: number;
  titleRollsUsed: number;
  bannerRolls: number;
  bannerRollsUsed: number;
}

interface RosterData {
  userId: string;

  carryPlayerId?: string;
  carryPlayer?: PlayerTeam;
  carryTitle?: UserTitle;
  carryBanner?: UserBanner;

  midPlayerId?: string;
  midPlayer?: PlayerTeam;
  midTitle?: UserTitle;
  midBanner?: UserBanner;

  offlanePlayerId?: string;
  offlanePlayer?: PlayerTeam;
  offlaneTitle?: UserTitle;
  offlaneBanner?: UserBanner;

  softSupportPlayerId?: string;
  softSupportPlayer?: PlayerTeam;
  softSupportTitle?: UserTitle;
  softSupportBanner?: UserBanner;

  hardSupportPlayerId?: string;
  hardSupportPlayer?: PlayerTeam;
  hardSupportTitle?: UserTitle;
  hardSupportBanner?: UserBanner;
}

export const Route = createFileRoute('/roster/$slug')({
  component: RouteComponent,
  loader: async ({ params: { slug } }) => {
    const profile = await getProfileBySlug({ data: { slug } });

    const responses = await Promise.all([
      getUserRoster({ data: { userId: profile.userId }}),
      getUserTitles({ data: { userId: profile.userId }}),
      getUserBanners({ data: { userId: profile.userId }}),
      getPlayerTeams(),
      getRosterRolls()
    ]);

    const userRoster = responses[0];
    const userTitles = responses[1];
    const userBanners = responses[2];
    const playerTeams = responses[3];
    const rollData: RollData = responses[4];

    const rosterData: RosterData = {
      userId: profile.userId,
      
      carryPlayerId: userRoster?.carryPlayerId || undefined,
      carryPlayer: playerTeams.find((pt) => pt.playerId === userRoster?.carryPlayerId),
      carryTitle: userTitles.find((ut) => ut.role === 1),
      carryBanner: userBanners.find((ub) => ub.role === 1),

      midPlayerId: userRoster?.midPlayerId || undefined,
      midPlayer: playerTeams.find((pt) => pt.playerId === userRoster?.midPlayerId),
      midTitle: userTitles.find((ut) => ut.role === 2),
      midBanner: userBanners.find((ub) => ub.role === 2),

      offlanePlayerId: userRoster?.offlanePlayerId || undefined,
      offlanePlayer: playerTeams.find((pt) => pt.playerId === userRoster?.offlanePlayerId),
      offlaneTitle: userTitles.find((ut) => ut.role === 3),
      offlaneBanner: userBanners.find((ub) => ub.role === 3),

      softSupportPlayerId: userRoster?.softSupportPlayerId || undefined,
      softSupportPlayer: playerTeams.find((pt) => pt.playerId === userRoster?.softSupportPlayerId),
      softSupportTitle: userTitles.find((ut) => ut.role === 4),
      softSupportBanner: userBanners.find((ub) => ub.role === 4),

      hardSupportPlayerId: userRoster?.hardSupportPlayerId || undefined,
      hardSupportPlayer: playerTeams.find((pt) => pt.playerId === userRoster?.hardSupportPlayerId),
      hardSupportTitle: userTitles.find((ut) => ut.role === 5),
      hardSupportBanner: userBanners.find((ub) => ub.role === 5),
    };

    return {
      rosterData,
      playerTeams,
      rollData
    };
  }
  // TODO errorcomponents all over
})

function RouteComponent() {
  const router = useRouter();
  const { rosterData, playerTeams, rollData } = Route.useLoaderData();
  const [isSaving, setIsSaving] = useState(false);

  const onSelectPlayer = async (playerId: string, role: number) => {
    if (isSaving) {
      console.log("Double save");
      return;
    }

    setIsSaving(true);
    await saveRosterPlayer({ data: {
      ...(role === 1 && { carryPlayerId: playerId }),
      ...(role === 2 && { midPlayerId: playerId }),
      ...(role === 3 && { offlanePlayerId: playerId }),
      ...(role === 4 && { softSupportPlayerId: playerId }),
      ...(role === 5 && { hardSupportPlayerId: playerId }),
    }});
    await router.invalidate({ sync: true });
    setIsSaving(false);
  };

  const onRollTitle = async (role: number) => {
    setIsSaving(true);
    await insertTitleRoll({ data: { role }});
    await router.invalidate({ sync: true });
    setIsSaving(false);
  };

  const onRollBanner = async (role: number) => {
    setIsSaving(true);
    await insertBannerRoll({ data: { role }});
    await router.invalidate({ sync: true });
    setIsSaving(false);
  };

  return (
    <div>
      <PlayerCard
        player={rosterData.carryPlayer}
        userBanner={rosterData.carryBanner}
        userTitle={rosterData.carryTitle}
        playerTeams={playerTeams}
        role={1}
        rollData={rollData}
        isLoading={isSaving}
        onSelectPlayer={(playerId: string) => onSelectPlayer(playerId, 1)}
        onRollTitle={onRollTitle}
        onRollBanner={onRollBanner}
      />
      <PlayerCard
        player={rosterData.midPlayer}
        userBanner={rosterData.midBanner}
        userTitle={rosterData.midTitle}
        playerTeams={playerTeams}
        role={2}
        rollData={rollData}
        isLoading={isSaving}
        onSelectPlayer={(playerId: string) => onSelectPlayer(playerId, 2)}
        onRollTitle={onRollTitle}
        onRollBanner={onRollBanner}
      />
      <PlayerCard
        player={rosterData.offlanePlayer}
        userBanner={rosterData.offlaneBanner}
        userTitle={rosterData.offlaneTitle}
        playerTeams={playerTeams}
        role={3}
        rollData={rollData}
        isLoading={isSaving}
        onSelectPlayer={(playerId: string) => onSelectPlayer(playerId, 3)}
        onRollTitle={onRollTitle}
        onRollBanner={onRollBanner}
      />
      <PlayerCard
        player={rosterData.softSupportPlayer}
        userBanner={rosterData.softSupportBanner}
        userTitle={rosterData.softSupportTitle}
        playerTeams={playerTeams}
        role={4}
        rollData={rollData}
        onSelectPlayer={(playerId: string) => onSelectPlayer(playerId, 4)}
        isLoading={isSaving}
        onRollTitle={onRollTitle}
        onRollBanner={onRollBanner}
      />
      <PlayerCard
        player={rosterData.hardSupportPlayer}
        userBanner={rosterData.hardSupportBanner}
        userTitle={rosterData.hardSupportTitle}
        playerTeams={playerTeams}
        role={5}
        rollData={rollData}
        onSelectPlayer={(playerId: string) => onSelectPlayer(playerId, 5)}
        isLoading={isSaving}
        onRollTitle={onRollTitle}
        onRollBanner={onRollBanner}
      />
    </div>
  );
}


interface PlayerCardProps {
  player?: PlayerTeam;
  userBanner?: UserBanner;
  userTitle?: UserTitle;
  playerTeams: PlayerTeam[];
  role: number;
  rollData: RollData;
  isLoading: boolean;
  onSelectPlayer: (playerId: string) => void;
  onRollTitle: (role: number) => void;
  onRollBanner: (role: number) => void;
}
function PlayerCard({
  isLoading,
  player,
  userTitle,
  userBanner,
  playerTeams,
  role,
  rollData,
  onSelectPlayer,
  onRollTitle,
  onRollBanner
}: PlayerCardProps) {
  const { data: titles } = useQuery({
    queryKey: ["titles"],
    queryFn: getTitles,
  });

  const { data: banners } = useQuery({
    queryKey: ["banners"],
    queryFn: getBanners,
  });

  const primaryTitle = useMemo(() => {
    return titles?.find((t) => t.id === userTitle?.primaryTitleId);
  }, [titles, userTitle?.primaryTitleId]);

  const secondaryTitle = useMemo(() => {
    return titles?.find((t) => t.id === userTitle?.secondaryTitleId);
  }, [titles, userTitle?.secondaryTitleId]);

  const topBanner = useMemo(() => {
    return banners?.find((b) => b.id === userBanner?.bannerTopId);
  }, [banners, userBanner?.bannerTopId]);

  const middleBanner = useMemo(() => {
    return banners?.find((b) => b.id === userBanner?.bannerMiddleId);
  }, [banners, userBanner?.bannerMiddleId]);

  const bottomBanner = useMemo(() => {
    return banners?.find((b) => b.id === userBanner?.bannerBottomId);
  }, [banners, userBanner?.bannerBottomId]);

  if (!player) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select a player</CardTitle>
          <CardDescription>Position {role}</CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerSelectButton
            playerTeams={playerTeams}
            roleFilter={role}
            isLoading={isLoading}
            variant="outline"
            onSelectPlayer={(playerId) => onSelectPlayer(playerId)}
          >
            Select player
          </PlayerSelectButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-md">
      <CardHeader>
        <CardTitle>{player?.playerName}</CardTitle>
        <CardDescription className="max-w-sm whitespace-nowrap overflow-hidden text-ellipsis">
          Position {role} - {player.teamName}
        </CardDescription>
        {player.playerImage && (
          <CardAction>
            <img
              src={player.playerImage}
              className="rounded-sm size-11"
              alt="Player profile picture"
            />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-row gap-2">
          {!!primaryTitle && (
            <TitleElement
              name={primaryTitle.name}
              description={primaryTitle.description}
              modifier={primaryTitle.modifier}
            />
          )}

          {!!secondaryTitle && (
            <TitleElement
              name={secondaryTitle.name}
              description={secondaryTitle.description}
              modifier={secondaryTitle.modifier}
            />
          )}
        </div>

        <div>
          <BannerElement banner={topBanner} multiplier={userBanner?.bannerTopMultiplier} />
          <BannerElement banner={middleBanner} multiplier={userBanner?.bannerMiddleMultiplier} />
          <BannerElement banner={bottomBanner} multiplier={userBanner?.bannerBottomMultiplier} />
        </div>

        <PlayerSelectButton
          playerTeams={playerTeams}
          roleFilter={role}
          isLoading={isLoading}
          variant="link"
          onSelectPlayer={(playerId) => onSelectPlayer(playerId)}
        >
          Replace player
        </PlayerSelectButton>

        {rollData.titleRollsUsed < rollData.titleRolls && (
          <Button
            variant="outline"
            className="cursor-pointer"
            disabled={isLoading}
            onClick={() => onRollTitle(role)}
          >
            Roll titles
          </Button>
        )}

        {rollData.bannerRollsUsed < rollData.bannerRolls && (
          <Button
            variant="outline"
            className="cursor-pointer"
            disabled={isLoading}
            onClick={() => onRollBanner(role)}
          >
            Roll banners
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface BannerElementProps {
  banner?: Banner;
  multiplier?: string;
}
function BannerElement({ banner, multiplier }: BannerElementProps) {
  if (!banner || !multiplier) {
    return null;
  }
  
  const colorMap = {
    "RED": "from-red-950/50 to-red-950/25",
    "GREEN": "from-emerald-950/50 to-emerald-950/25",
    "BLUE": "from-blue-950/50 to-blue-950/25",
  };
  const containerClassName = cn(
    "flex",
    "flex-row",
    "items-center",
    "gap-4",
    "bg-linear-to-r",
    "rounded-md",
    colorMap[banner.bannerColor]
  );
  
  const percentMultiplier = Math.round(Number(multiplier) * 100);
  
  const getMultiplierFontWeight = () => {
    if (percentMultiplier <= 110) return "font-light";
    if (percentMultiplier <= 130) return "font-normal";
    if (percentMultiplier <= 160) return "font-semibold";
    if (percentMultiplier <= 200) return "font-bold";

    return "font-extrabold";
  }
  
  return (
    <div className={containerClassName}>
      <img
        src={`/banners/${banner.bannerType}.png`}
        className="rounded-sm size-10 opacity-50"
        alt="Banner type icon"
      />
      <span className="text-muted-foreground">{banner.name}</span>
      <span className={cn(getMultiplierFontWeight(), "ml-auto", "mr-3", "my-2")}>
        {percentMultiplier}%
      </span>
    </div>
  );
}

interface TitleElementProps {
  name: string;
  description: string | null;
  modifier: string;
}
function TitleElement({ name, description, modifier }: TitleElementProps) {
  const modifierFormatted = Math.round(Number(modifier) * 100);

  return (
    <div className="flex flex-col w-50">
      <div className="text-sm">{name}</div>
      <div className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">+{modifierFormatted}%</span>
        {" "}
        {description}
      </div>
    </div>
  );
}

interface PlayerSelectButtonProps {
  playerTeams: PlayerTeam[];
  roleFilter: number;
  isLoading: boolean;
  variant: "outline" | "link";
  onSelectPlayer: (playerId: string) => void;
}
function PlayerSelectButton({ playerTeams, roleFilter, isLoading, variant, onSelectPlayer, children }: PropsWithChildren<PlayerSelectButtonProps>) {
  const [isPlayerPopoverOpen, setIsPlayerPopoverOpen] = useState(false)
 
  return (
    <div>
      <Popover open={isPlayerPopoverOpen} onOpenChange={setIsPlayerPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={variant}
            aria-expanded={isPlayerPopoverOpen}
            className="cursor-pointer"
            disabled={isLoading}
          >
            {children}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <CommandDialog open={isPlayerPopoverOpen} onOpenChange={setIsPlayerPopoverOpen}>
            <CommandInput placeholder="Type a player name or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading={`Position ${roleFilter}`}>
                {playerTeams
                  .filter((pt) => pt.playerPosition === roleFilter)
                  .map((pt) => (
                    <CommandItem
                      key={pt.playerId}
                      value={pt.playerId}
                      keywords={[pt.playerName]}
                      onSelect={(currentValue) => {
                        onSelectPlayer(currentValue)
                        setIsPlayerPopoverOpen(false)
                      }}
                      className="flex flex-row justify-between"
                    >
                      <div>{pt.playerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {pt.teamName}
                      </div>
                    </CommandItem>
                  ))
                }
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </PopoverContent>
      </Popover>
    </div>
  );
}