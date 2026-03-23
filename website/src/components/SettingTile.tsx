'use client';

import React from 'react';

interface SettingTileProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  iconColor?: string;
  showArrow?: boolean;
}

export function SettingTile({
  icon,
  title,
  subtitle,
  trailing,
  onClick,
  iconColor = 'text-primary',
  showArrow = true,
}: SettingTileProps) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-4 p-4 bg-white rounded-xl border border-card-border
        shadow-sm transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''}
      `}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-opacity-10 ${iconColor} bg-current`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {subtitle && (
          <p className="text-xs text-text-secondary mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      {trailing || (showArrow && onClick && (
        <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      ))}
    </div>
  );
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider px-1">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface ProfileHeaderProps {
  name: string;
  email: string;
  role: string;
  onCopyEmail?: () => void;
  onEditProfile?: () => void;
}

export function ProfileHeader({ name, email, role, onCopyEmail, onEditProfile }: ProfileHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 shadow-lg shadow-primary/20">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-white/90 truncate flex-1">{email}</p>
            {onCopyEmail && (
              <button onClick={onCopyEmail} className="text-white/80 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white uppercase tracking-wider">
          {role}
        </span>
        {onEditProfile && (
          <button
            onClick={onEditProfile}
            className="px-4 py-1.5 border border-white/30 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
