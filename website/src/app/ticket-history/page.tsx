'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/context/TicketContext';
import { TicketCard } from '@/components/TicketCard';
import { TicketShimmer, SettingsShimmer } from '@/components/Shimmer';

export default function TicketHistoryPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { tickets, isLoading, error, loadUserTickets } = useTickets();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadUserTickets();
    }
  }, [user]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-card-border">
          <div className="max-w-3xl mx-auto p-4 flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Loading...</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto p-4 pt-8">
          <SettingsShimmer />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-card-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto p-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Ticket History</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 pt-8">
        {isLoading && tickets.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <TicketShimmer key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-error opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-error mb-4">{error}</p>
            <button
              onClick={loadUserTickets}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No tickets found</h3>
            <p className="text-text-secondary mb-4">Your support tickets will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket._id || ticket.id}
                className="bg-white rounded-xl border border-card-border p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">{ticket.issueTitle}</h3>
                    {ticket.description && (
                      <p className="text-sm text-text-secondary mt-1 line-clamp-2">{ticket.description}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                    ticket.status === 'pending' ? 'bg-warning/10 text-warning border-warning/30' :
                    ticket.status === 'resolved' ? 'bg-success/10 text-success border-success/30' :
                    'bg-info/10 text-info border-info/30'
                  }`}>
                    {ticket.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-text-tertiary">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(ticket.createdAt)}
                  </div>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary font-semibold rounded">
                    {ticket.caseNumber}
                  </span>
                </div>

                <button
                  onClick={() => router.push(`/ticket/${ticket._id || ticket.id}`)}
                  className="mt-3 w-full py-2 text-sm text-primary font-semibold border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
