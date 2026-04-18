"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Shield,
  Smartphone,
  UserCircle2,
  Settings2,
  Clock3,
  LogOut,
} from "lucide-react";

function getDisplayName(fullName?: string, email?: string) {
  return fullName || email || "Candidate";
}

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const displayName = getDisplayName(user?.full_name, user?.email);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Account Settings
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Manage your profile and security
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Keep your account details, active devices, and interview preferences
          organized in one place.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <UserCircle2 className="h-5 w-5 text-violet-600" />
              Profile Overview
            </CardTitle>
            <CardDescription>
              This information is currently shown in your sidebar and used
              across the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Name
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {displayName}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Email
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {user?.email || "Not set"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Target Role
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {user?.target_role || "Not set"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Experience
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {user?.experience_level || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full px-3 py-1 font-medium bg-violet-50 text-violet-700 hover:bg-violet-50">
                {user?.role || "user"}
              </Badge>
              <Badge className="rounded-full px-3 py-1 font-medium bg-sky-50 text-sky-700 hover:bg-sky-50">
                InterviewDojo Member
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-950">
                <Shield className="h-5 w-5 text-emerald-600" />
                Security
              </CardTitle>
              <CardDescription>
                Control where you are signed in and review session activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href="/sessions"
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Smartphone className="h-4 w-4 text-violet-600" />
                  Active sessions
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="flex w-full items-center justify-between rounded-xl border border-rose-200 px-4 py-3 text-left text-sm text-rose-700 transition hover:bg-rose-50"
              >
                <span className="flex items-center gap-2 font-medium">
                  <LogOut className="h-4 w-4" />
                  Log out of this device
                </span>
                <ArrowRight className="h-4 w-4 text-rose-400" />
              </button>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-950">
                <Settings2 className="h-5 w-5 text-amber-600" />
                Quick Links
              </CardTitle>
              <CardDescription>
                Jump to the most used areas of the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/dashboard"
                className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                Dashboard overview
              </Link>
              <Link
                href="/history"
                className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                Practice history
              </Link>
              <Link
                href="/questions"
                className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-purple-200 hover:bg-purple-50"
              >
                Question bank
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-200/80 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-950">
            <Clock3 className="h-5 w-5 text-orange-600" />
            Preferences
          </CardTitle>
          <CardDescription>
            These controls are ready for future settings endpoints and can be
            connected later.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">Theme</p>
            <p className="mt-1 text-sm text-slate-600">
              Light interface optimized for focused interview practice.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">
              Notifications
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Session reminders and feedback alerts will appear here.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">
              Interview goals
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Adjust your target role and practice focus when profile editing is
              enabled.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          asChild
          className="bg-violet-600 text-white hover:bg-violet-700"
        >
          <Link href="/sessions">Open sessions</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
