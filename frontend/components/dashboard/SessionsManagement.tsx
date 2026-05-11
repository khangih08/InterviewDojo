'use client';

import { useEffect, useState } from 'react';
import { userSessionsApi } from '@/lib/api/sessions';
import { UserSession } from '@/lib/api/types';
import { toastError, toastSuccess } from '@/lib/toast';
import { Loader2, LogOut, Monitor, Smartphone, Trash2 } from 'lucide-react';

export function SessionsManagement() {
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
      toastError('Failed to load sessions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevoking(sessionId);
      await userSessionsApi.revokeSession(sessionId);
      toastSuccess('Session revoked successfully');
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      toastError('Failed to revoke session');
      console.error(error);
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAllOther = async () => {
    try {
      setRevoking('all-other');
      const result = await userSessionsApi.revokeAllOtherSessions();
      toastSuccess(`${result.revoked_count} sessions revoked`);
      await loadSessions();
    } catch (error) {
      toastError('Failed to revoke sessions');
      console.error(error);
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('This will log you out from all devices. Are you sure?')) {
      return;
    }

    try {
      setRevoking('all');
      const result = await userSessionsApi.revokeAllSessions();
      toastSuccess(`All ${result.revoked_count} sessions revoked`);
      setSessions([]);
    } catch (error) {
      toastError('Failed to revoke all sessions');
      console.error(error);
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <span className="text-sm text-muted-foreground">Loading sessions...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm px-6 py-6 shadow-sm">
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
                Security
              </p>
              <h2 className="mt-1 text-xl font-bold">Active Sessions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your active sessions across devices
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {sessions.length > 1 && (
              <button
                onClick={handleRevokeAllOther}
                disabled={revoking === 'all-other'}
                className="px-4 py-2.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
              >
                {revoking === 'all-other' && <Loader2 className="h-4 w-4 animate-spin" />}
                <LogOut className="h-4 w-4" />
                Logout Other Devices
              </button>
            )}
            <button
              onClick={handleRevokeAll}
              disabled={revoking === 'all'}
              className="px-4 py-2.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive/20 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
            >
              {revoking === 'all' && <Loader2 className="h-4 w-4 animate-spin" />}
              <LogOut className="h-4 w-4" />
              Logout All Devices
            </button>
          </div>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="rounded-2xl bg-accent/30 border border-border/30 p-12 text-center">
            <Smartphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No active sessions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="group rounded-2xl border border-border/40 bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-accent/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors duration-200">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold">
                          {session.device_name || 'Unknown Device'}
                        </h3>
                        {session.ip_address && (
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">IP: {session.ip_address}</p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-primary/40" />
                            Created: {formatDate(session.created_at)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-primary/40" />
                            Accessed: {formatDate(session.last_accessed_at)}
                          </span>
                        </div>
                        {isExpired(session.expires_at) && (
                          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-destructive bg-destructive/10 border border-destructive/20 px-2.5 py-0.5 rounded-full">Expired</span>
                        )}
                        {session.expires_at && !isExpired(session.expires_at) && (
                          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                            Expires: {formatDate(session.expires_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={revoking === session.id}
                    className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200 disabled:opacity-50"
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
        <div className="rounded-2xl bg-primary/5 border border-primary/15 p-5">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[10px] font-bold mt-0.5">!</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="font-bold text-foreground">Tip:</strong> Each time you log in, a new session is created. Revoke sessions to
              log out from specific devices. Sessions automatically expire after 7 days of inactivity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
