import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfileBySlug } from "@/services/profiles";
import { createFileRoute, Link, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/$slug')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const profile = await getProfileBySlug({ data: { slug: params.slug } });
    if (!profile) {
      throw redirect({ to: "/predictions" });
    }
    
    return {
      profile
    };
  }
})

function RouteComponent() {
  const { profile } = Route.useLoaderData();

  return (
    <div className="p-4 max-h-[775px] h-full my-auto max-w-full w-5xl grid grid-cols-4 grid-rows-4 gap-4 mx-auto">
      <div className="row-start-1 row-end-4">
        <ProfileItem profile={profile} />
      </div>

      <div className="row-start-1 row-end-5 col-start-2 col-end-5 flex flex-col gap-2">
        <PredictionItem profile={profile} />
        <RosterItem profile={profile} />
      </div>
    </div>
  )
}

// TODO better type from service
interface ProfileProps {
  profile: {
    id: string;
    userId: string;
    slug: string;
    description: string | null;
    name: string;
    image: string | null;
    discordId: string;
  };
}
function ProfileItem({ profile }: ProfileProps) {
  return (
    <Item variant="outline">
      <ItemContent>
        <div className="flex gap-2">
          {!!profile.image ? (
            <img
              src={profile.image}
              className="rounded-sm size-14"
              alt="Profile picture"
            />
          ): (
            <Skeleton className="size-14 animate-none" />
          )}
          <div className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
            {profile.name}
          </div>
        </div>
      </ItemContent>
    </Item>
  );
}

function PredictionItem({ profile }: ProfileProps) {
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>Prediction Bracket</ItemTitle>
        <ItemDescription>
          Guess the outcome of each playoff match.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm" asChild>
          <Link to="/predictions/$slug" params={{ slug: profile.slug }}>
            Open
          </Link>
        </Button>
      </ItemActions>
    </Item>
  );
}

function RosterItem({ profile }: ProfileProps) {
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>Fantasy Roster</ItemTitle>
        <ItemDescription>
          Construct a team of your favourite players.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm" asChild>
          <Link to="/rosters/$slug" params={{ slug: profile.slug }}>
            Open
          </Link>
        </Button>
      </ItemActions>
    </Item>
  );
}