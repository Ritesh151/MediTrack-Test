'use client';

import React from 'react';
import { classNames } from '@/utils';
import { Ticket } from '@/lib/types';
import { formatDate, formatTime, getStatusColor } from '@/utils';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  actions?: React.ReactNode;
  showCaseNumber?: boolean;
  showPatientInfo?: boolean;
}

export function TicketCard({
  ticket,
  onClick,
  variant = 'default',
  actions,
  showCaseNumber = true,
  showPatientInfo = false,
}: TicketCardProps) {
  const ticketId = ticket._id || ticket.id;
  const caseNumber = ticket.caseNumber || `TKT-${ticketId.slice(-6).toUpperCase()}`;
  const statusClasses = getStatusColor(ticket.status);

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className={classNames(
          'flex items-center gap-3 p-3 bg-white rounded-xl border border-card-border',
          'transition-all duration-200 cursor-pointer',
          'hover:shadow-md hover:border-primary/30',
          onClick ? 'cursor-pointer' : ''
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary truncate text-sm">{ticket.issueTitle}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusClasses}`}>
              {ticket.status.toUpperCase()}
            </span>
            {showCaseNumber && (
              <span className="text-xs text-text-tertiary">{caseNumber}</span>
            )}
          </div>
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={classNames(
        'bg-white rounded-xl border border-card-border overflow-hidden',
        'transition-all duration-200',
        onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary/30' : ''
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {showCaseNumber && (
                <span className="text-xs font-bold text-primary">{caseNumber}</span>
              )}
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${statusClasses}`}>
                {ticket.status.toUpperCase()}
              </span>
            </div>
            <h3 className="font-semibold text-text-primary truncate">{ticket.issueTitle}</h3>
          </div>
        </div>

        {ticket.description && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {ticket.description}
          </p>
        )}

        {showPatientInfo && ticket.patient && (
          <div className="flex items-center gap-2 mb-3 text-sm text-text-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{ticket.patient.name}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(ticket.createdAt)}</span>
            <span className="mx-1">•</span>
            <span>{formatTime(ticket.createdAt)}</span>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  renderSkeleton?: () => React.ReactNode;
}

export function TicketList({
  tickets,
  onTicketClick,
  emptyMessage = 'No tickets found',
  isLoading,
  renderSkeleton,
}: TicketListProps) {
  if (isLoading && tickets.length === 0) {
    if (renderSkeleton) return <>{renderSkeleton()}</>;
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket._id || ticket.id}
          ticket={ticket}
          onClick={onTicketClick ? () => onTicketClick(ticket) : undefined}
        />
      ))}
    </div>
  );
}
