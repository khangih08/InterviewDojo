"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { completeGoogleProfile } from "@/lib/api/auth";
import { getAccessToken, getUser, saveUser } from "@/lib/auth";
import type { ExperienceLevel, JobRole } from "@/lib/api/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const jobRoleOptions: JobRole[] = [
  "Backend Developer",
  "Frontend Developer",
  "Fullstack Developer",
  "AI Engineer",
  "DevOps Engineer",
  "Data Scientist",
  "Cloud Engineer",
  "Mobile Developer",
  "Security Engineer",
  "Embedded Systems Engineer",
];

const experienceOptions: { value: ExperienceLevel; label: string }[] = [
  { value: "intern", label: "Intern" },
  { value: "fresher", label: "Fresher" },
  { value: "junior", label: "Junior" },
  { value: "middle", label: "Middle" },
  { value: "senior", label: "Senior" },
];

function GoogleOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const remember = searchParams.get("remember") === "1";

  const initialUser = useMemo(() => getUser(), []);

  const [form, setForm] = useState({
    full_name: initialUser?.full_name ?? "",
    target_role: (initialUser?.target_role as JobRole) ?? "Backend Developer",
    experience_level:
      (initialUser?.experience_level as ExperienceLevel) ?? "fresher",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    field: "full_name" | "target_role" | "experience_level",
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await completeGoogleProfile({
        full_name: form.full_name.trim(),
        target_role: form.target_role,
        experience_level: form.experience_level,
      });

      saveUser(response.user, remember);
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(message || "Could not complete profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold text-violet-600 dark:text-violet-400">
          Complete Your Profile
        </CardTitle>
        <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
          One more step to finish Google sign in.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_role">Target Role</Label>
            <select
              id="target_role"
              value={form.target_role}
              onChange={(e) => handleChange("target_role", e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              required
            >
              {jobRoleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_level">Experience Level</Label>
            <select
              id="experience_level"
              value={form.experience_level}
              onChange={(e) => handleChange("experience_level", e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              required
            >
              {experienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={loading} className="h-11 w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving profile...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function GoogleOnboardingPage() {
  return (
    <Suspense fallback={null}>
      <GoogleOnboardingContent />
    </Suspense>
  );
}
