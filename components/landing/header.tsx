import Link from "next/link";
import {Hexagon} from "lucide-react";

export function Header() {
  return (
    <header className="relative z-10 px-6 py-6 lg:px-12">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10 bg-primary rounded-sm flex items-center justify-center">
              <Hexagon className="h-6 w-6 text-primary-foreground fill-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground leading-tight">
                TECHXAGON
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                ACADEMY
              </span>
            </div>
          </div>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          <li>
            <Link
              href="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </li>
          <li>
            <Link
              href="/team"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              The Team
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
