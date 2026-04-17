import { AppShell } from "@/components/layout/app-shell";
import { AuthProvider } from "@/contexts/auth-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
