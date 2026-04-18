import { SessionsManagement } from "@/components/dashboard/SessionsManagement";

export const metadata = {
  title: "Active Sessions",
  description: "Manage your active sessions across devices",
};

export default function SessionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <SessionsManagement />
      </div>
    </div>
  );
}
