"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PublicProfilePage({ params }: { params: { token: string } }) {
  const token = params.token;
  const [profile, setProfile] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [imageData, setImageData] = useState<string>("");
  const [submittedMessage, setSubmittedMessage] = useState<string>("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/api/public/profile/${token}`);
      const data = await res.json().catch(() => ({}));
      if (data?.profile) setProfile(data.profile);
    }
    load();
  }, [token]);

  return (
    <main className="min-h-dvh w-full bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 py-8 sm:max-w-lg">
        {profile && (
          <div className="space-y-3 rounded-2xl bg-white p-5 shadow-xl">
            <div className="text-xl font-semibold">{profile.fullname}</div>
            <div className="text-sm">Nickname: {profile.nickname}</div>
            <div className="text-sm">Email: {profile.email}</div>
            <div className="mt-3 text-sm font-medium">Wishlists</div>
            <div className="grid grid-cols-1 gap-3">
              {(profile.wishlists || []).map((w: any) => (
                <div key={w._id} className="rounded-xl bg-primary p-4 text-white">
                  <div className="text-sm opacity-90">
                    {w.currency} {w.goal.toLocaleString()} • {w.plan}
                  </div>
                  <div className="font-semibold">{w.name}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm">Total budget: {profile.totalBudget.toLocaleString()}</div>
            <a
              href={`/u/${token}/contribute`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white"
            >
              Contribute
            </a>
          </div>
        )}

        
      </div>
    </main>
  );
}
