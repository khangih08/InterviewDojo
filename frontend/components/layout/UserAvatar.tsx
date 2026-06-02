import { User } from '@/lib/api/types';

type UserAvatarProps = {
  user?: User | null;
  size?: number;
  showProBadge?: boolean;
};

function getAvatarInitials(name?: string, email?: string) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    const initials = parts
      .slice(-2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
    return initials || 'U';
  }
  return email?.[0]?.toUpperCase() ?? 'U';
}

export default function UserAvatar({ user, size = 36, showProBadge = true }: UserAvatarProps) {
  const initials = getAvatarInitials(user?.full_name, user?.email);
  const isPro = user?.plan?.toUpperCase?.() === 'PRO';

  return (
    <div className="relative inline-flex">
      <div
        className="flex items-center justify-center overflow-hidden rounded-full bg-slate-950 text-xs font-semibold uppercase text-white shadow-sm"
        style={{ width: size, height: size }}
      >
        {initials}
      </div>

      {showProBadge && isPro ? (
        <span className="pointer-events-none absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-950 shadow-lg shadow-amber-500/30">
          PRO
        </span>
      ) : null}
    </div>
  );
}
