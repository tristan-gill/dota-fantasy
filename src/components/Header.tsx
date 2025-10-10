import { Link } from "@tanstack/react-router";
import { AccountDropdown } from "@/components/AccountDropdown";

// TODO update styling so that the content doesnt scroll underneath this
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/60 px-4 py-3 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/lads_logo.png"
            className="rounded-sm size-8"
            alt="League of Lads logo"
          />
          League of Lads
        </Link>

        <div className="flex items-center gap-2">
          {/* <ModeToggle /> */}
          <AccountDropdown />
        </div>
      </div>
    </header>
  )
}
