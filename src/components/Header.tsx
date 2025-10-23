import { Link } from "@tanstack/react-router";
import { AccountDropdown } from "@/components/AccountDropdown";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="border-b px-4 py-3 sticky top-0 bg-background">
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
