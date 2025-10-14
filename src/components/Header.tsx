import { Link } from "@tanstack/react-router";
import { AccountDropdown } from "@/components/AccountDropdown";
import { Button } from "./ui/button";
import { SignedIn } from "./SignedIn";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { getProfileByUserId } from "@/services/profiles";
import { useAuthentication } from "@/lib/auth/client";
import { TrendingUpDownIcon, UsersIcon } from "lucide-react";

export function Header() {
  const { userSession } = useAuthentication();
  
  const {
    data: profile
  } = useQuery({
    queryKey: ["profileByUserId", userSession?.user.id],
    queryFn: () => getProfileByUserId({ data: { userId: userSession?.user.id || "" }}),
    enabled: !!userSession?.user.id
  });

  return (
    <header className="border-b px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/lads_logo.png"
            className="rounded-sm size-8"
            alt="League of Lads logo"
          />
          <span className="text-lg font-semibold">League of Lads</span>
        </Link>

        <div className="flex items-center gap-2">
          <SignedIn>
            <Button variant="ghost" size="sm">
              <Link to="/rosters/$slug" params={{ slug: profile?.slug || ""}}>
                Draft
              </Link>
            </Button>
            <Button variant="ghost" size="sm">
              <Link to="/predictions/$slug" params={{ slug: profile?.slug || ""}}>
                Predict
              </Link>
            </Button>
          </SignedIn>
          <Button variant="ghost" size="sm">
            <Link to="/predictions">
              Predictions
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            <Link to="/rosters">
              Rosters
            </Link>
          </Button>
          <AccountDropdown />
        </div>
      </div>
    </header>
  )
}
