import Link from "next/link";
import { cherryBombOne } from "@/lib/fonts";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden w-full bg-background text-foreground">
      <img
        src="/onboarding/welcome.png"
        alt=""
        className="pointer-events-none absolute -bottom-42 left-10 h-[500px] w-[500px] object-contain opacity-90 sm:h-[320px] sm:w-[320px]"
      />
      <div
        className={`${cherryBombOne.className} absolute left-4 top-4 text-xl`}
      >
        Wishy
      </div>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 sm:max-w-lg">
        <h1 className={`${cherryBombOne.className} pb-12 text-center text-6xl`}>
          hey I am <br /> Wiley Wishy
        </h1>
        <p className="mt-2 pb-4 text-center text-md opacity-90">
          Create your wishlist, plan your budget, and keep a saving streak.
        </p>

        <div className="mt-6 mb-36 w-full rounded-lg bg-white p-4 text-foreground shadow-sm">
          <div className="flex flex-col gap-2">
            <Link
              href="/signin"
              className="text-black inline-flex flex-1 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-white"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
