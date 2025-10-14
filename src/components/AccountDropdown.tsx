import { LogInIcon, LogOutIcon, CircleUserRoundIcon, UsersIcon, TrendingUpDownIcon } from "lucide-react";

import { authClient, useAuthentication } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { SignedOut } from "@/components/SignedOut";
import { SignedIn } from "@/components/SignedIn";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getProfileByUserId } from "@/services/profiles";

export function AccountDropdown() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { userSession } = useAuthentication();
  const navigate = useNavigate();

  const {
    data: profile
  } = useQuery({
    queryKey: ["profileByUserId", userSession?.user.id],
    queryFn: () => getProfileByUserId({ data: { userId: userSession?.user.id || "" }}),
    enabled: !!userSession?.user.id
  });

  const signOut = async () => {
    const response = await authClient.signOut();
    await queryClient.invalidateQueries();
    // TODO other invalidation
    if (response.data?.success) {
      navigate({ to: "/" });
    }
  }
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="size-8 rounded-full cursor-pointer">
          {!!userSession?.user ? (
            <img
              src={userSession.user.image || ""}
              className="rounded-full"
              alt="Discord profile picture"
            />
          ) : (
            <CircleUserRoundIcon />
          )}

          <span className="sr-only">Profile</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
        <SignedOut>
          <DropdownMenuItem asChild>
            <Link to="/login">
              <LogInIcon /> Login
            </Link>
          </DropdownMenuItem>
        </SignedOut>

        <SignedIn>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userSession?.user.name ?? "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                @{userSession?.user.email ?? ""}
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link to="/rosters/$slug" params={{ slug: profile?.slug || ""}}>
              <UsersIcon /> Your roster
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/predictions/$slug" params={{ slug: profile?.slug || ""}}>
              <TrendingUpDownIcon /> Your predictions
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={signOut}>
            <LogOutIcon />
            Log out
          </DropdownMenuItem>
        </SignedIn>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
