import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthentication } from "@/lib/auth/client";
import { Banner, UserBanner, UserTitle } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { getConfig } from "@/services/configs";
import { getProfileBySlug } from "@/services/profiles";
import { BASE_SCORE_MULTIPLIERS, getBanners, getPlayerTeams, getRosterRolls, getTitles, getUserBanners, getUserRoster, getUserRosterScore, getUserTitles, insertBannerRoll, insertTitleRoll, PlayerTeam, saveRosterPlayer } from "@/services/rosterService";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { DicesIcon, InfoIcon, ShuffleIcon } from "lucide-react";
import { PropsWithChildren, useMemo, useState } from "react";
import { toast } from "sonner";

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

export const Route = createFileRoute('/rosters/$slug')({
  component: RouteComponent,
  loader: async ({ params: { slug } }) => {
    // TODO need to rewrite this whole route with alias queries rather than this psycho multi table join shit
    const profile = await getProfileBySlug({ data: { slug } });
    if (!profile) {
      throw redirect({ to: "/rosters" });
    }

    const responses = await Promise.all([
      getUserRoster({ data: { userId: profile.userId }}),
      getUserTitles({ data: { userId: profile.userId }}),
      getUserBanners({ data: { userId: profile.userId }}),
      getPlayerTeams(),
      getRosterRolls({ data: { userId: profile.userId }}),
      getUserRosterScore({ data: { userId: profile.userId }})
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
      profile,
      rosterData,
      playerTeams,
      rollData,
      userRosterScore: responses[5]
    };
  }
  // TODO errorcomponents all over
})

function RouteComponent() {
  const router = useRouter();
  const { profile, rosterData, playerTeams, rollData, userRosterScore } = Route.useLoaderData();
  const { userSession } = useAuthentication();
  const [isSaving, setIsSaving] = useState(false);

  const { data: isRosterOpen } = useQuery({
    queryKey: ["configs"],
    queryFn: () => getConfig({ data: { name: "IS_ROSTER_OPEN" }}),
  });
  
  const isRollDataShowing = userSession?.user.id === rosterData.userId && isRosterOpen;

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
    toast(`New titles rolled! You have ${rollData.titleRolls - rollData.titleRollsUsed - 1} remaining.`);
    await router.invalidate({ sync: true });
    setIsSaving(false);
  };

  const onRollBanner = async (role: number) => {
    setIsSaving(true);
    await insertBannerRoll({ data: { role }});
    toast(`New banners rolled! You have ${rollData.bannerRolls - rollData.bannerRollsUsed - 1} remaining.`);
    await router.invalidate({ sync: true });
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex flex-row gap-2 justify-center">
        {profile.image ? (
          <img
            src={profile.image}
            className="rounded-sm size-6"
            alt="Team logo"
          />
        ) : (
          <Skeleton className="rounded-sm size-6 shrink-0 animate-none" />
        )}
        <div>{profile.name}<span className="text-muted-foreground">'s roster</span></div>
      </div>
      <div className="flex flex-row justify-center items-center mb-4 gap-8">
        <div>
          {!!userRosterScore && (
            <div>
              <span className="text-sm text-muted-foreground">
                Total score:{" "}
              </span>
              <span className="font-semibold">
                {userRosterScore.totalScore.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          )}
        </div>

        {isRollDataShowing && (
          <div className="flex flex-row items-center">
            <div className="mr-4 text-sm text-muted-foreground">{rollData.bannerRolls - rollData.bannerRollsUsed} Banner rolls</div>
            <div className="mr-3 text-sm text-muted-foreground">{rollData.titleRolls - rollData.titleRollsUsed} Title rolls</div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-full cursor-pointer w-[18px]" variant="link" size="icon">
                  <InfoIcon />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Fantasy roster</DialogTitle>
                  <DialogDescription>
                    Build your perfect team then use the roll mechanics to enhance your score!
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="text-sm text-muted-foreground">
                    Once playoffs begin, your roster is locked and used for scoring. Individual players scores are calculated
                    in each game they play. Banners amplify how much one stat contributes to the total score. 
                    If the any of the conditions for their Titles are met, their total score will be multiplied.
                    A players best score is calculated with their top 2 games within a series. The scoring for each stat is listed below:
                  </div>
                  <div className="flex flex-row gap-2">
                    <div className="text-right text-sm">
                      <div>Kills</div>
                      <div>Deaths</div>
                      <div>Creep score</div>
                      <div>GPM</div>
                      <div>Madstones collected</div>
                      <div>Tower kills</div>
                      <div>Wards placed</div>
                      <div>Camps stacked</div>
                      <div>Runes grabbed</div>
                      <div>Watchers taken</div>
                      <div>Roshan kills</div>
                      <div>Teamfight participation</div>
                      <div>Stuns</div>
                      <div>Tormentor kills</div>
                      <div>Courier kills</div>
                      <div>First blood</div>
                      <div>Smokes used</div>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      <div>+{BASE_SCORE_MULTIPLIERS.KILLS} per kill</div>
                      <div>+1800 - {BASE_SCORE_MULTIPLIERS.DEATHS} per death</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.LAST_HITS} per last hit</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.GPM} times the player's GPM</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.MADSTONE_COUNT} per Madstone collected</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.TOWER_KILLS} per tower kill</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.WARDS_PLACED} per observer placed</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.CAMPS_STACKED} per camp stacked</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.RUNES_GRABBED} per rune bottled or taken</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.WATCHERS_TAKEN} per captured watcher</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.ROSHAN_KILLS} per Roshan kill</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.TEAMFIGHT_PARTICIPATION} max for teamfight participation</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.STUN_TIME} per second of stun time</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.TORMENTOR_KILLS} per Tormentor kill</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.COURIER_KILLS} per Courier kill</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.FIRSTBLOOD_CLAIMED} if the player gets first blood</div>
                      <div>+{BASE_SCORE_MULTIPLIERS.SMOKES_USE} per smoke used</div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4 justify-center">
          <PlayerCard
            player={rosterData.carryPlayer}
            userBanner={rosterData.carryBanner}
            userTitle={rosterData.carryTitle}
            playerTeams={playerTeams}
            playerScore={userRosterScore?.carryPlayerScore}
            role={1}
            rollData={rollData}
            isLoading={isSaving}
            isRosterLocked={!isRollDataShowing}
            onSelectPlayer={(playerId: string) => onSelectPlayer(playerId, 1)}
            onRollTitle={onRollTitle}
            onRollBanner={onRollBanner}
          />
          <PlayerCard
            player={rosterData.midPlayer}
            userBanner={rosterData.midBanner}
            userTitle={rosterData.midTitle}
            playerTeams={playerTeams}
            playerScore={userRosterScore?.midPlayerScore}
            role={2}
            rollData={rollData}
            isLoading={isSaving}
            isRosterLocked={!isRollDataShowing}
            onSelectPlayer={(playerId: string) => onSelectPlayer(playerId, 2)}
            onRollTitle={onRollTitle}
            onRollBanner={onRollBanner}
          />
          <PlayerCard
            player={rosterData.offlanePlayer}
            userBanner={rosterData.offlaneBanner}
            userTitle={rosterData.offlaneTitle}
            playerTeams={playerTeams}
            playerScore={userRosterScore?.offlanePlayerScore}
            role={3}
            rollData={rollData}
            isLoading={isSaving}
            isRosterLocked={!isRollDataShowing}
            onSelectPlayer={(playerId: string) => onSelectPlayer(playerId, 3)}
            onRollTitle={onRollTitle}
            onRollBanner={onRollBanner}
          />
        </div>
        
        <div className="flex flex-row gap-4 justify-center">
          <PlayerCard
            player={rosterData.softSupportPlayer}
            userBanner={rosterData.softSupportBanner}
            userTitle={rosterData.softSupportTitle}
            playerTeams={playerTeams}
            playerScore={userRosterScore?.softSupportPlayerScore}
            role={4}
            rollData={rollData}
            isLoading={isSaving}
            isRosterLocked={!isRollDataShowing}
            onSelectPlayer={(playerId: string) => onSelectPlayer(playerId, 4)}
            onRollTitle={onRollTitle}
            onRollBanner={onRollBanner}
          />
          <PlayerCard
            player={rosterData.hardSupportPlayer}
            userBanner={rosterData.hardSupportBanner}
            userTitle={rosterData.hardSupportTitle}
            playerTeams={playerTeams}
            playerScore={userRosterScore?.hardSupportPlayerScore}
            role={5}
            rollData={rollData}
            isLoading={isSaving}
            isRosterLocked={!isRollDataShowing}
            onSelectPlayer={(playerId: string) => onSelectPlayer(playerId, 5)}
            onRollTitle={onRollTitle}
            onRollBanner={onRollBanner}
          />
        </div>
      </div>
    </div>
  );
}


interface PlayerCardProps {
  player?: PlayerTeam;
  userBanner?: UserBanner;
  userTitle?: UserTitle;
  playerScore?: number;
  playerTeams: PlayerTeam[];
  role: number;
  rollData: RollData;
  isLoading: boolean;
  isRosterLocked: boolean;
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
  playerScore,
  isRosterLocked,
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
      <Card className="w-[338px] gap-4">
        <CardHeader>
          <CardTitle>Select a player</CardTitle>
          <CardDescription>Position {role}</CardDescription>
        </CardHeader>
        <CardContent className="m-auto">
          <PlayerSelectButton
            playerTeams={playerTeams}
            roleFilter={role}
            isDisabled={isLoading || isRosterLocked}
            onSelectPlayer={(playerId) => onSelectPlayer(playerId)}
          >
            Choose a player
          </PlayerSelectButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[338px] gap-4">
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
      <CardContent className="flex flex-col grow gap-3">
        <div className="flex flex-row gap-2 mb-auto">
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

        <div className="flex flex-col gap-1">
          <BannerElement banner={topBanner} multiplier={userBanner?.bannerTopMultiplier} />
          <BannerElement banner={middleBanner} multiplier={userBanner?.bannerMiddleMultiplier} />
          <BannerElement banner={bottomBanner} multiplier={userBanner?.bannerBottomMultiplier} />
        </div>

        {!!playerScore && (
          <>
            <Separator />
            <div className="flex flex-row justify-between">
              <div className="text-muted-foreground">
                Score:
              </div>
              <div className="font-semibold">
                {playerScore.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </>
        )}
        {!isRosterLocked && (
          <div className="flex flex-row gap-3">
            <PlayerSelectButton
              playerTeams={playerTeams}
              roleFilter={role}
              isDisabled={isLoading}
              onSelectPlayer={(playerId) => onSelectPlayer(playerId)}
            >
              <ShuffleIcon /> Player
            </PlayerSelectButton>

            {rollData.titleRollsUsed === 0 ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    disabled={isLoading || rollData.titleRollsUsed >= rollData.titleRolls}
                    size="sm"
                  >
                    <DicesIcon /> Titles
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Title Rolls - {rollData.titleRolls} remaining</AlertDialogTitle>
                    <AlertDialogDescription>
                      You can choose to Roll for a new set of Titles. This will replace
                      both of the current Titles. The full list of Titles can be seen on the
                      information in the top right. Would you like to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction className="cursor-pointer" onClick={() => onRollTitle(role)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                variant="outline"
                className="cursor-pointer"
                disabled={isLoading || rollData.titleRollsUsed >= rollData.titleRolls}
                onClick={() => onRollTitle(role)}
                size="sm"
              >
                <DicesIcon /> Titles
              </Button>
            )}

            {rollData.bannerRollsUsed === 0 ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    disabled={isLoading || rollData.bannerRollsUsed >= rollData.bannerRolls}
                    size="sm"
                  >
                    <DicesIcon /> Banners
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Banner Rolls - {rollData.bannerRolls} remaining</AlertDialogTitle>
                    <AlertDialogDescription>
                      You can choose to Roll for a new set of Banners. This will replace
                      all three of the current Banners as well as the rarity of the banner. 
                      The rarity of the banner corresponds to the percentage modifier, ranging from
                      110% to 250%. Would you like to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction className="cursor-pointer" onClick={() => onRollBanner(role)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                variant="outline"
                className="cursor-pointer"
                disabled={isLoading || rollData.bannerRollsUsed >= rollData.bannerRolls}
                onClick={() => onRollBanner(role)}
                size="sm"
              >
                <DicesIcon /> Banners
              </Button>
            )}

          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BannerElementProps {
  banner?: Banner;
  multiplier?: number;
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
    "gap-3",
    "bg-linear-to-r",
    "rounded-md",
    colorMap[banner.bannerColor]
  );
  
  const percentMultiplier = Math.round(multiplier * 100);
  
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
        className="rounded-sm size-8 opacity-50"
        alt="Banner type icon"
      />
      <span className="text-muted-foreground">{banner.name}</span>
      <span className={cn(getMultiplierFontWeight(), "ml-auto", "mr-3", "my-1", "text-muted-foreground")}>
        {percentMultiplier}%
      </span>
    </div>
  );
}

interface TitleElementProps {
  name: string;
  description: string | null;
  modifier: number;
}
function TitleElement({ name, description, modifier }: TitleElementProps) {
  const modifierFormatted = Math.round(modifier * 100);

  return (
    <div className="flex flex-col w-50 min-h-[68px]">
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
  isDisabled: boolean;
  onSelectPlayer: (playerId: string) => void;
}
function PlayerSelectButton({ playerTeams, roleFilter, isDisabled, onSelectPlayer, children }: PropsWithChildren<PlayerSelectButtonProps>) {
  const [isPlayerPopoverOpen, setIsPlayerPopoverOpen] = useState(false)
 
  return (
    <div>
      <Popover open={isPlayerPopoverOpen} onOpenChange={setIsPlayerPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-expanded={isPlayerPopoverOpen}
            className="cursor-pointer"
            disabled={isDisabled}
            size="sm"
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