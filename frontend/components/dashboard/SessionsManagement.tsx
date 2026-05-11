'use client';

import { useEffect, useState } from 'react';
import { userSessionsApi } from '@/lib/api/sessions';
import { UserSession } from '@/lib/api/types';
import { toastError, toastSuccess } from '@/lib/toast';
import { Loader2, LogOut, Smartphone, Trash2 } from 'lucide-react';

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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Active Sessions</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your active sessions across devices
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAllOther}
              disabled={revoking === 'all-other'}
              className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              {revoking === 'all-other' && <Loader2 className="h-4 w-4 animate-spin" />}
              Logout Other Devices
            </button>
          )}
          <button
            onClick={handleRevokeAll}
            disabled={revoking === 'all'}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            {revoking === 'all' && <Loader2 className="h-4 w-4 animate-spin" />}
            Logout All Devices
          </button>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800">
          <Smartphone className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">No active sessions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-950 dark:text-white">
                        {session.device_name || 'Unknown Device'}
                      </h3>
                      {session.ip_address && (
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-500 mt-0.5">IP: {session.ip_address}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          Created: {formatDate(session.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          Accessed: {formatDate(session.last_accessed_at)}
                        </span>
                      </div>
                      {isExpired(session.expires_at) && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mt-2 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded inline-block">Expired</p>
                      )}
                      {session.expires_at && !isExpired(session.expires_at) && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mt-2 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded inline-block">
                          Expires: {formatDate(session.expires_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={revoking === session.id}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50"
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
      <div className="bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/30 rounded-3xl p-5">
        <div className="flex gap-3">
          <div className="h-5 w-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">!</div>
          <p className="text-sm text-sky-800 dark:text-sky-300 leading-relaxed">
            <strong className="font-bold">Tip:</strong> Each time you log in, a new session is created. Revoke sessions to
            log out from specific devices. Sessions automatically expire after 7 days of inactivity.
          </p>
        </div>
      </div>
    </div>
  );
}
