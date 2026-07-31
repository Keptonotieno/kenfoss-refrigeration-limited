import React, { useState } from 'react';

interface UserAvatarProps {
  user?: {
    avatar?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  src?: string;
  name?: string;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  title?: string;
}

export function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    const handle = email.split('@')[0];
    return handle.substring(0, 2).toUpperCase();
  }
  return 'KF';
}

function getAvatarBgColor(name?: string, role?: string): string {
  if (role === 'Super Administrator' || role === 'Owner') return 'from-[#0057B8] to-blue-700 text-white border-blue-400/50';
  if (role === 'Administrator') return 'from-indigo-600 to-blue-800 text-white border-indigo-400/50';
  if (role === 'Manager') return 'from-amber-600 to-amber-700 text-amber-100 border-amber-400/50';
  if (role === 'Technician') return 'from-emerald-600 to-teal-700 text-emerald-100 border-emerald-400/50';

  // Deterministic fallback based on name character code sum
  const str = name || 'User';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i);
  }
  const gradients = [
    'from-[#0057B8] to-slate-800 text-white border-blue-400/40',
    'from-slate-700 to-slate-900 text-slate-100 border-slate-600',
    'from-cyan-700 to-blue-900 text-cyan-100 border-cyan-500/40',
    'from-violet-700 to-slate-900 text-violet-100 border-violet-500/40',
    'from-rose-700 to-slate-900 text-rose-100 border-rose-500/40'
  ];
  return gradients[hash % gradients.length];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  src: propSrc,
  name: propName,
  role: propRole,
  size = 'md',
  className = '',
  onClick,
  title
}) => {
  const [imgError, setImgError] = useState(false);

  const avatarUrl = propSrc !== undefined ? propSrc : user?.avatar;
  const displayName = propName || user?.name || user?.email?.split('@')[0] || 'Staff User';
  const displayRole = propRole || user?.role || 'Staff';
  const displayEmail = user?.email;

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-xs font-black',
    lg: 'w-12 h-12 text-sm font-black',
    xl: 'w-20 h-20 text-xl font-black'
  }[size];

  const initials = getInitials(displayName, displayEmail);
  const colorScheme = getAvatarBgColor(displayName, displayRole);

  const hasCustomPhoto = !imgError && 
    avatarUrl && 
    typeof avatarUrl === 'string' && 
    avatarUrl.trim() !== '' && 
    !avatarUrl.includes('dicebear.com');

  if (hasCustomPhoto) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        title={title || displayName}
        onClick={onClick}
        className={`${sizeClasses} rounded-full object-cover border shadow-sm border-slate-700 ${
          onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
        } ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  // Professional Default Avatar (Initials Badge)
  return (
    <div
      title={title || `${displayName} (${displayRole})`}
      onClick={onClick}
      className={`${sizeClasses} rounded-full bg-gradient-to-br ${colorScheme} flex items-center justify-center font-bold tracking-wider shrink-0 shadow-sm border ${
        onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''
      } ${className}`}
    >
      <span>{initials}</span>
    </div>
  );
};

