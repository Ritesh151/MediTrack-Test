'use client';

import React from 'react';
import { Ticket } from '@/lib/types';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  showPatientInfo?: boolean;
  showActions?: boolean;
  onDelete?: () => void;
  onUpdateStatus?: () => void;
}

export function TicketCard({
  ticket,
  onClick,
  showPatientInfo = false,
  showActions = false,
  onDelete,
  onUpdateStatus,
}: TicketCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'assigned':
      case 'in-progress':
        return 'bg-info/10 text-info border-info/30';
      case 'resolved':
        return 'bg-success/10 text-success border-success/30';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const ticketId = ticket._id || ticket.id;
  const shortId = ticketId.slice(-6).toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-card-border p-4 shadow-sm
        transition-all duration-200 cursor-pointer
        hover:shadow-md hover:border-primary/30 animate-fade-in
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-primary">
              #{shortId}
            </span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(ticket.status)}`}>
              {ticket.status.toUpperCase()}
            </span>
          </div>
          <h3 className="font-semibold text-text-primary truncate">{ticket.issueTitle}</h3>
          {ticket.description && (
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">{ticket.description}</p>
          )}
          {showPatientInfo && ticket.patient && (
            <p className="text-xs text-text-tertiary mt-2">Patient: {ticket.patient.name}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-text-tertiary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(ticket.createdAt)}
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            {onUpdateStatus && (
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateStatus(); }}
                className="p-1.5 text-info hover:bg-info/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
