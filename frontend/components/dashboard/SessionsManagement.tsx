"use client";

import { useEffect, useState } from "react";
import { userSessionsApi } from "@/lib/api/sessions";
import { UserSession } from "@/lib/api/types";
import { toastError, toastSuccess } from "@/lib/toast";
import { Loader2, LogOut, Smartphone, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function SessionsManagement() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await userSessionsApi.getAllSessions();
      setSessions(data);
    } catch (error) {
      toastError("Failed to load sessions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevoking(sessionId);
      await userSessionsApi.revokeSession(sessionId);
      toastSuccess("Session revoked successfully");
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (error) {
      toastError("Failed to revoke session");
      console.error(error);
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAllOther = async () => {
    try {
      setRevoking("all-other");
      const result = await userSessionsApi.revokeAllOtherSessions();
      toastSuccess(`${result.revoked_count} sessions revoked`);
      await loadSessions();
    } catch (error) {
      toastError("Failed to revoke sessions");
      console.error(error);
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm("This will log you out from all devices. Are you sure?")) {
      return;
    }

    try {
      setRevoking("all");
      const result = await userSessionsApi.revokeAllSessions();
      toastSuccess(`All ${result.revoked_count} sessions revoked`);
      logout();
      window.location.assign("/login");
      return;
    } catch (error) {
      toastError("Failed to revoke all sessions");
      console.error(error);
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Active Sessions</h2>
          <p className="text-gray-600 mt-1">
            Manage your active sessions across devices
          </p>
        </div>
        <div className="flex gap-2">
          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAllOther}
              disabled={revoking === "all-other"}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {revoking === "all-other" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Logout Other Devices
            </button>
          )}
          <button
            onClick={handleRevokeAll}
            disabled={revoking === "all"}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {revoking === "all" && <Loader2 className="h-4 w-4 animate-spin" />}
            Logout All Devices
          </button>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Smartphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No active sessions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {session.device_name || "Unknown Device"}
                      </h3>
                      {session.ip_address && (
                        <p className="text-sm text-gray-500">
                          IP: {session.ip_address}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-gray-600">
                        <span>Created: {formatDate(session.created_at)}</span>
                        <span>
                          Last accessed: {formatDate(session.last_accessed_at)}
                        </span>
                      </div>
                      {isExpired(session.expires_at) && (
                        <p className="text-xs text-red-600 mt-1">Expired</p>
                      )}
                      {session.expires_at && !isExpired(session.expires_at) && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Expires: {formatDate(session.expires_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={revoking === session.id}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Revoke this session"
                >
                  {revoking === session.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Each time you log in, a new session is created.
          Revoke sessions to log out from specific devices. Sessions
          automatically expire after 7 days.
        </p>
      </div>
    </div>
  );
}
