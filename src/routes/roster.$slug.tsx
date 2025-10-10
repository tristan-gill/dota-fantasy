import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProfileBySlug } from "@/services/profiles";
import { getPlayerTeams, getUserRoster } from "@/services/rosterService";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/roster/$slug')({
  component: RouteComponent,
  loader: async ({ params: { slug } }) => {
    const profile = await getProfileBySlug({ data: { slug } });

    const responses = await Promise.all([
      getUserRoster({ data: { userId: profile.userId }}),
      getPlayerTeams(),
    ]);

    return {
      userRoster: responses[0],
      playerTeams: responses[1]
    };
  }
  // TODO errorcomponents all over
})

function RouteComponent() {
  const { userRoster, playerTeams } = Route.useLoaderData();

  return (
    <div>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <img
              src="/lads_logo.png"
              className="rounded-sm size-8"
              alt="League of Lads logo"
            />
            hi
          </SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
