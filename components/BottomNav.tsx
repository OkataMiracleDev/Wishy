"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on landing page, signin, and signup
  const hiddenPaths = ["/", "/signin", "/signup"];
  // Also hide if pathname starts with these but allow sub-routes if needed (though exact match is safer for now)
  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  // Hide on public share pages: /u/<token> and /<username>/<hex-code>(/contribute|/thanks)?
  const isPublicShare =
    pathname.startsWith("/u/") ||
    /^\/[A-Za-z0-9._-]+\/[a-f0-9]{10,64}(?:\/.*)?$/.test(pathname);
  if (isPublicShare) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
      <nav className="flex w-full max-w-sm items-center justify-around rounded-full bg-black/40 px-6 py-3 text-xs text-white pointer-events-auto backdrop-blur-md">
        <Link href="/home" className="flex flex-col items-center gap-1 group">
          <span className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] transition-colors ${pathname === '/home' ? 'bg-white text-black' : 'border border-white text-white group-hover:bg-white/20'}`}>
            H
          </span>
          <span>Home</span>
        </Link>
        <Link href="/budget" className="flex flex-col items-center gap-1 group">
          <span className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] transition-colors ${pathname === '/budget' ? 'bg-white text-black' : 'border border-white text-white group-hover:bg-white/20'}`}>
            ₦
          </span>
          <span>Budget</span>
        </Link>
        <Link href="/qa" className="flex flex-col items-center gap-1 group">
          <span className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] transition-colors ${pathname === '/qa' ? 'bg-white text-black' : 'border border-white text-white group-hover:bg-white/20'}`}>
            ?
          </span>
          <span>Q/A</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 group">
          <span className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] transition-colors ${pathname === '/profile' ? 'bg-white text-black' : 'border border-white text-white group-hover:bg-white/20'}`}>
            ☺
          </span>
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
