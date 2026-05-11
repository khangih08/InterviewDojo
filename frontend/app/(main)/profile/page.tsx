"use client";

import { UserRound } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm shadow-slate-200/60">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-600">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Profile
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              View your current account information.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm shadow-slate-200/60">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Full Name
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {user?.full_name || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {user?.email || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Target Role
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {user?.target_role || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Experience Level
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {user?.experience_level || "Not set"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
