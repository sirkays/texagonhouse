"use client";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {navLinks} from "@/constants";
import {cn} from "@/lib/utils";
import {useState} from "react";

const NavBar = () => {
  const pathname = usePathname();
  const [headerStyle, setHeaderStyle] = useState<"icons" | "text" | "both">(
    "both"
  );

  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setHeaderStyle(event.target.value as "icons" | "text" | "both");
  };

  return (
    <>
      {/* Desktop / Tablet Top Navbar */}
      <nav className="hidden sm:flex justify-between items-center fixed z-50 w-full h-16 bg-white px-6 sm:px-10 shadow-md">
        {/* Logo */}
        <Link
          href="/main/home"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            TECHXAGON
          </h1>
        </Link>

        {/* Nav Links */}
        <section className="flex items-center gap-6">
          {navLinks.map((item) => {
            const isActive = pathname === item.route;
            const Icon = item.icon; // Treat icon as a React component

            return (
              <Link
                href={item.route}
                key={item.label}
                className={cn(
                  "flex text-gray-700 text-base font-medium transition-colors gap-2",
                  isActive && "text-blue-600 font-semibold"
                )}>
                {headerStyle !== "text" && (
                  <Icon
                    className={cn("w-6 h-6", isActive && "text-blue-600")}
                  />
                )}
                {headerStyle !== "icons" && (
                  <p className="text-lg font-semibold">{item.label}</p>
                )}
              </Link>
            );
          })}
        </section>

        {/* Style Selector and CTA/User */}
        <div className="flex items-center gap-4">
          <select
            value={headerStyle}
            onChange={handleStyleChange}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
            <option value="both">Icons & Text</option>
            <option value="icons">Icons Only</option>
            <option value="text">Text Only</option>
          </select>
          <div className="hover:opacity-80 transition-opacity">
            <Link href="/profile">
              <Image
                src="/assets/images/avatar-1.svg"
                width={32}
                height={32}
                alt="User Avatar"
                className="rounded-full"
              />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-inner z-50">
        <div className="flex justify-around items-center h-16">
          {navLinks.map((item) => {
            const isActive = pathname === item.route;
            const Icon = item.icon; // Treat icon as a React component for consistency

            return (
              <Link
                href={item.route}
                key={item.label}
                className={cn(
                  "flex flex-col items-center justify-center text-xs text-gray-600",
                  isActive && "text-blue-600 font-semibold"
                )}>
                <Icon className={cn("w-6 h-6", isActive && "text-blue-600")} />
                <span className="text-[11px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default NavBar;
