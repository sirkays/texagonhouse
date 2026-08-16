"use client";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {navLinks} from "@/constants";
import {cn} from "@/lib/utils";
import {useState} from "react";
import {useBrand} from "@/hooks/use-brand";

const NavBar = () => {
  const brand = useBrand();
  const pathname = usePathname();
  const [headerStyle, setHeaderStyle] = useState<"icons" | "text" | "both">(
    "both",
  );

  const handleStyleChange = (style: "icons" | "text" | "both") => {
    setHeaderStyle(style);
  };

  return (
    <>
      {/* Desktop / Tablet Top Navbar */}
      <nav className={`hidden sm:flex justify-between items-center fixed z-50 w-full py-2 sm:py-4 px-6 sm:px-10 backdrop-blur-xl ${brand.isNiMet ? "bg-[#006B3E]/10 border-b border-[#006B3E]/15" : "bg-[#ef7b55]/20 border-b border-[#ef7b55]/10"} shadow-md`}>
        {/* Logo */}
        <Link
          href="/main/home"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src={brand.logo}
            alt={brand.logoAlt}
            width={brand.id === "nimet" ? 110 : 36}
            height={36}
            className="object-contain"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {brand.name.toUpperCase()}
          </h1>
        </Link>

        {/* Nav Links */}
        <section className="flex items-center gap-6">
          {navLinks.map((item) => {
            const isActive = pathname === item.route;
            const Icon = item.icon;

            return (
              <Link
                href={item.route}
                key={item.label}
                className={cn(
                  "flex text-gray-700 text-base font-medium transition-colors gap-2",
                  isActive && (brand.isNiMet ? "text-[#006B3E] font-semibold" : "text-[#ef7b55] font-semibold"),
                )}>
                {headerStyle !== "text" && (
                  <Icon
                    className={cn("w-6 h-6", isActive && (brand.isNiMet ? "text-[#006B3E]" : "text-[#ef7b55]"))}
                  />
                )}
                {headerStyle !== "icons" && (
                  <p className="text-lg font-semibold">{item.label}</p>
                )}
              </Link>
            );
          })}
        </section>

        {/* Style Toggle Buttons and Avatar */}
        <div className="flex items-center gap-4">
          {/* Glass Toggle */}
          <div className="flex backdrop-blur-md bg-white/40 border border-white/40 rounded-md overflow-hidden">
            <button
              onClick={() => handleStyleChange("both")}
              className={cn(
                "px-3 py-1 text-sm font-medium transition-colors",
                headerStyle === "both"
                  ? (brand.isNiMet ? "bg-[#006B3E] text-white" : "bg-[#ef7b55] text-white")
                  : "bg-transparent text-gray-700 hover:bg-white/50",
              )}>
              Icons & Text
            </button>

            <button
              onClick={() => handleStyleChange("icons")}
              className={cn(
                "px-3 py-1 text-sm font-medium transition-colors",
                headerStyle === "icons"
                  ? (brand.isNiMet ? "bg-[#006B3E] text-white" : "bg-[#ef7b55] text-white")
                  : "bg-transparent text-gray-700 hover:bg-white/50",
              )}>
              Icons
            </button>

            <button
              onClick={() => handleStyleChange("text")}
              className={cn(
                "px-3 py-1 text-sm font-medium transition-colors",
                headerStyle === "text"
                  ? (brand.isNiMet ? "bg-[#006B3E] text-white" : "bg-[#ef7b55] text-white")
                  : "bg-transparent text-gray-700 hover:bg-white/50",
              )}>
              Text
            </button>
          </div>

          {/* Avatar */}
          <div className="hover:opacity-80 transition-opacity">
            <Link href="/profile">
              <Image
                src="/assets/images/avatar-1.svg"
                width={32}
                height={32}
                alt="User Avatar"
                className="rounded-full border border-white/50 backdrop-blur-md"
              />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className={`sm:hidden fixed bottom-0 left-0 w-full backdrop-blur-xl ${brand.isNiMet ? "bg-[#006B3E]/10 border-t border-[#006B3E]/15" : "bg-[#ef7b55]/20 border-t border-[#ef7b55]/10"} shadow-inner z-50`}>
        <div className="flex justify-around items-center h-16">
          {navLinks.map((item) => {
            const isActive = pathname === item.route;
            const Icon = item.icon;

            return (
              <Link
                href={item.route}
                key={item.label}
                className={cn(
                  "flex flex-col items-center justify-center text-xs text-gray-600 transition-colors",
                  isActive && (brand.isNiMet ? "text-[#006B3E] font-semibold" : "text-[#ef7b55] font-semibold"),
                )}>
                {headerStyle !== "text" && (
                  <Icon
                    className={cn("w-6 h-6", isActive && (brand.isNiMet ? "text-[#006B3E]" : "text-[#ef7b55]"))}
                  />
                )}
                {headerStyle !== "icons" && (
                  <span className="text-[11px]">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default NavBar;
