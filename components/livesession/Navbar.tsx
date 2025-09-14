"use client";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {navLinks} from "@/constants";
import {cn} from "@/lib/utils";

const NavBar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex justify-between items-center fixed z-50 w-full h-16 bg-white px-6 sm:px-10 shadow-md">
      {/* Logo */}
      <Link
        href="/main/home"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          TECHXAGON
        </h1>
      </Link>

      {/* Nav Links */}
      <section className="hidden sm:flex items-center gap-6">
        {navLinks.map((item) => {
          const isActive =
            pathname === item.route || pathname.startsWith(`${item.route}/`);

          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn(
                "flex text-gray-700 hover:text-blue-600 text-base font-medium transition-colors gap-2",
                isActive && "text-blue-600 border-b-2 border-blue-600"
              )}>
              <Image
                src={item.imgURL || "/placeholder.svg"}
                alt={item.label}
                width={24}
                height={20}
                className={cn("", isActive && "")}
              />

              <p className={cn("text-lg font-semibold max-lg:hidden")}>
                {item.label}
              </p>
            </Link>
          );
        })}
      </section>

      {/* CTA and User Button */}
      <div className="flex items-center gap-4">
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
  );
};

export default NavBar;
