'use client';

import React from 'react';

interface ShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Shimmer({ className = '', width, height }: ShimmerProps) {
  return (
    <div
      className={`shimmer rounded ${className}`}
      style={{ width, height }}
    />
  );
}

export function TicketShimmer() {
  return (
    <div className="bg-white rounded-xl border border-card-border p-4 shadow-sm animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <Shimmer className="w-20 h-4" />
        <Shimmer className="w-16 h-5 rounded-full" />
      </div>
      <Shimmer className="w-3/4 h-5 mb-2" />
      <Shimmer className="w-full h-4 mb-1" />
      <Shimmer className="w-1/2 h-4" />
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
        <Shimmer className="w-24 h-3" />
      </div>
    </div>
  );
}

export function SettingsShimmer() {
  return (
    <div className="space-y-4">
      <div className="h-40 shimmer rounded-2xl" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 shimmer rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function DashboardShimmer() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 shimmer rounded-2xl" />
        <div className="h-32 shimmer rounded-2xl" />
      </div>
      <div className="h-80 shimmer rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <TicketShimmer key={i} />
        ))}
      </div>
    </div>
  );
}
