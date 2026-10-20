"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLink = ({ href, children, onClick }) => {
  const path = usePathname();
  const active = href === "/" ? path === "/" : path.startsWith(href.split("?")[0]);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`font-medium ${active ? "text-primary" : "text-base-content/80 hover:text-primary"}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
