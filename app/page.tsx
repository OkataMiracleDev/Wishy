import Link from "next/link";
import Image from "next/image";
import { cherryBombOne } from "@/lib/fonts";

export default function Home() {
  return (
    <div className="flex min-h-dvh w-full bg-white text-black overflow-hidden">
      {/* Left Panel - Illustration (Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-[#8B5CF6] flex-col items-center justify-center relative p-12 text-white overflow-hidden">
        <div className="absolute top-8 left-8">
          <h1 className={`${cherryBombOne.className} text-3xl`}>Wishy</h1>
        </div>

        <div className="relative w-full max-w-lg aspect-square">
          <Image
            src="/onboarding/welcome.png"
            alt="Welcome to Wishy"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right Panel - Content */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 relative bg-white">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-6 left-6">
          <h1 className={`${cherryBombOne.className} text-2xl text-[#8B5CF6]`}>
            Wishy
          </h1>
        </div>

        <div className="w-full max-w-md flex flex-col items-center text-center lg:items-start lg:text-left space-y-8">
          <div>
            <h1
              className={`${cherryBombOne.className} text-5xl sm:text-7xl text-[#8B5CF6] mb-4`}
            >
              hey I am <br /> Wiley Wishy
            </h1>
            <p className="text-lg text-zinc-500 max-w-sm mx-auto lg:mx-0">
              Create your wishlist, plan your budget, and keep a saving streak.
            </p>
          </div>

          {/* Mobile Illustration (Visible only on small screens) */}
          <div className="lg:hidden relative w-64 h-64 my-4">
            <Image
              src="/onboarding/welcome.png"
              alt="Welcome"
              fill
              className="object-contain"
            />
          </div>

          <div className="w-full space-y-3">
            <Link
              href="/signup"
              className="flex w-full items-center justify-center rounded-2xl bg-[#8B5CF6] py-4 text-lg font-semibold text-white shadow-lg shadow-[#8B5CF6]/20 hover:bg-[#7c4dff] transition-all"
            >
              Get Started
            </Link>
            <Link
              href="/signin"
              className="flex w-full items-center justify-center rounded-2xl border-2 border-zinc-100 bg-white py-4 text-lg font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-200 transition-all"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
