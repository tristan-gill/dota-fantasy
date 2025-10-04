import { LogInIcon, LogOutIcon, CircleUserRoundIcon } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";

export function AccountDropdown() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  const signOut = async () => {
    const response = await authClient.signOut();
    if (response.data?.success) {
      navigate({ to: "/" });
    }
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="size-8 rounded-full cursor-pointer">
          {!!session ? (
            <img
              src={session.user.image || ""}
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
        {!session && (
          <DropdownMenuItem onClick={() => authClient.signIn.social({ provider: "discord" })}>
            <LogInIcon />
            Login
          </DropdownMenuItem>
        )}

        {!!session && (
          <DropdownMenuItem onClick={signOut}>
            <LogOutIcon />
            Log out
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
