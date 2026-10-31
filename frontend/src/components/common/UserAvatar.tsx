import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { safeStorage } from '../../utils/storageUtils';

export interface UserAvatarProps {
  user?: Partial<User> | { name?: string; avatarUrl?: string; avatar?: string; email?: string } | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBorder?: boolean;
  shape?: 'circle' | 'rounded';
}

export const getCandidateInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'ZS';
  const clean = name.trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0][0];
    const second = parts[1][0];
    return (first + second).toUpperCase();
  }
  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase();
  }
  return clean.toUpperCase();
};

const sizeClasses: Record<string, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-9 h-9', text: 'text-xs font-black' },
  lg: { container: 'w-12 h-12', text: 'text-sm font-black' },
  xl: { container: 'w-16 h-16', text: 'text-lg font-black' },
  '2xl': { container: 'w-24 h-24 sm:w-28 sm:h-28', text: 'text-2xl sm:text-3xl font-black' },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  showBorder = false,
  shape = 'circle',
}) => {
  const [imageError, setImageError] = useState(false);
  const [liveVersion, setLiveVersion] = useState(0);
  const initials = getCandidateInitials(user?.name);
  const sizeConfig = sizeClasses[size] || sizeClasses.md;

  useEffect(() => {
    const onAvatarUpdated = () => {
      setLiveVersion(v => v + 1);
    };
    window.addEventListener('focuspoint_avatar_updated', onAvatarUpdated);
    return () => window.removeEventListener('focuspoint_avatar_updated', onAvatarUpdated);
  }, []);

  // Check if the user is Super Admin
  const isSuperAdmin =
    (user as any)?.role === 'SUPER_ADMIN' ||
    (user as any)?.role === 'super_admin' ||
    (user as any)?.email === 'superadmin@focuspoint.internal' ||
    (user as any)?.id === 'usr-super-admin' ||
    (user as any)?.id === 'usr-superadmin';

  let isSessionSuperAdmin = false;
  try {
    const sessionRaw = safeStorage.getItem('focuspoint_current_user') || safeStorage.getItem('fp_current_session_user');
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed.role === 'SUPER_ADMIN' || parsed.email === 'superadmin@focuspoint.internal') {
        isSessionSuperAdmin = true;
      }
    }
  } catch {}

  let resolvedPhoto = '';

  if (isSuperAdmin || (!user && isSessionSuperAdmin)) {
    try {
      const isDeleted = localStorage.getItem('fp_super_admin_avatar_deleted') === 'true';
      if (isDeleted) {
        resolvedPhoto = '';
      } else {
        const saCached =
          localStorage.getItem('fp_super_admin_avatar') ||
          localStorage.getItem('fp_superadmin_avatar') ||
          localStorage.getItem('fp_user_avatar_usr-super-admin') ||
          localStorage.getItem('fp_user_avatar_usr-superadmin');
        if (saCached && saCached.trim().length > 0) {
          resolvedPhoto = saCached;
        } else {
          resolvedPhoto = user?.avatarUrl || (user as any)?.avatar || '';
        }
      }
    } catch {
      resolvedPhoto = user?.avatarUrl || (user as any)?.avatar || '';
    }
  } else {
    // Normal user resolution with live synchronization
    const userId = (user as any)?.id;
    let isUserDeleted = false;
    if (userId) {
      try {
        isUserDeleted = localStorage.getItem(`fp_user_avatar_deleted_${userId}`) === 'true';
      } catch {}
    }

    if (isUserDeleted) {
      resolvedPhoto = '';
    } else {
      if (userId) {
        try {
          const cached = localStorage.getItem(`fp_user_avatar_${userId}`);
          if (cached) resolvedPhoto = cached;
        } catch {}
      }

      if (!resolvedPhoto) {
        resolvedPhoto =
          user?.avatarUrl ||
          (user as any)?.avatar ||
          (user as any)?.ownerAvatar ||
          (user as any)?.photo ||
          (user as any)?.profilePhoto ||
          (user as any)?.studentAvatar ||
          '';
      }

      if (!resolvedPhoto && ((user as any)?.role === 'LIBRARY_OWNER' || (user as any)?.role === 'library_owner')) {
        try {
          const ownerCached = localStorage.getItem('fp_owner_avatar');
          if (ownerCached) resolvedPhoto = ownerCached;
        } catch {}
      }
      if (!resolvedPhoto && ((user as any)?.role === 'DISTRICT_ADMIN' || (user as any)?.role === 'district_admin')) {
        try {
          const daCached = localStorage.getItem('fp_district_admin_avatar');
          if (daCached) resolvedPhoto = daCached;
        } catch {}
      }
    }
  }

  const photoUrl = resolvedPhoto;

  useEffect(() => {
    setImageError(false);
  }, [photoUrl, liveVersion]);

  const hasPhoto = Boolean(photoUrl && photoUrl.trim().length > 0 && !imageError);

  const roundedClass = shape === 'rounded' ? 'rounded-2xl' : 'rounded-full';
  const borderStyle = showBorder ? 'border-2 border-brand-500/40 shadow-sm' : '';

  if (hasPhoto && photoUrl) {
    return (
      <div
        className={`relative shrink-0 ${roundedClass} overflow-hidden bg-slate-100 flex items-center justify-center ${sizeConfig.container} ${borderStyle} ${className}`}
      >
        <img
          key={photoUrl}
          src={photoUrl}
          alt={user?.name || 'User Profile'}
          className={`w-full h-full object-cover ${roundedClass}`}
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Fallback: Showing candidate name first & second letter
  return (
    <div
      className={`relative shrink-0 ${roundedClass} bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-500 text-white flex items-center justify-center tracking-wider select-none shadow-xs font-black ${sizeConfig.container} ${sizeConfig.text} ${borderStyle} ${className}`}
      title={user?.name || 'Candidate'}
    >
      {initials}
    </div>
  );
};
