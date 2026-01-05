import Link from "next/link";

export default function AuthedHomePage() {
  return (
    <main className="relative min-h-dvh w-full bg-background text-foreground">
      <img
        src="/welome.png"
        alt=""
        className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 object-contain opacity-90"
      />
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 sm:max-w-lg">
        <div className="w-full rounded-lg bg-white p-5 text-foreground shadow-sm">
          <h1 className="text-lg font-semibold">Welcome</h1>
          <p className="mt-1 text-sm opacity-80">
            Create your wishlist and start planning.
          </p>
          <Link
            href="/wishlist"
            className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-white"
          >
            Create Wishlist
          </Link>
        </div>
      </div>
    </main>
  );
}

