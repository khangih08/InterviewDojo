import { AppShell } from "@/components/layout/app-shell";
import { AuthProvider } from "@/contexts/auth-context";
import { SubscriptionProvider } from "@/contexts/subscription-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AppShell>{children}</AppShell>
      </SubscriptionProvider>
    </AuthProvider>
  );
}