'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/context/TicketContext';
import { Navbar } from '@/components/Navbar';
import { TicketCard } from '@/components/TicketCard';
import { TicketStatusChart } from '@/components/Charts';
import { DashboardShimmer } from '@/components/Shimmer';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { tickets, isLoading, error, loadTickets, updateTicketStatus, deleteTicket } = useTickets();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadTickets();
    }
  }, [user]);

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicketStatus(ticketId, newStatus, newStatus === 'resolved');
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await deleteTicket(ticketId);
    } catch (err) {
      console.error('Failed to delete ticket:', err);
    }
  };

  const filteredTickets = searchQuery
    ? tickets.filter(
        (t) =>
          t.issueTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tickets;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar variant="admin" />
        <main className="max-w-7xl mx-auto p-4 pt-8">
          <DashboardShimmer />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="admin" />
      
      <main className="max-w-7xl mx-auto p-4 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            Admin: {user.hospitalId || 'Hospital'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TicketStatusChart tickets={tickets} />
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search tickets by title or patient name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-card-border bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <h2 className="text-lg font-bold text-text-primary mb-4">Recent Tickets</h2>

        {isLoading && tickets.length === 0 ? (
          <DashboardShimmer />
        ) : error ? (
          <div className="bg-white rounded-xl p-6 text-center">
            <p className="text-error mb-4">{error}</p>
            <button onClick={loadTickets} className="text-orange-500 font-semibold hover:underline">
              Try Again
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-text-secondary">No tickets found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket._id || ticket.id}
                ticket={ticket}
                showPatientInfo
                showActions
                onClick={() => router.push(`/ticket/${ticket._id || ticket.id}`)}
                onUpdateStatus={() => {
                  const currentStatus = ticket.status;
                  let newStatus = currentStatus;
                  if (currentStatus === 'pending') newStatus = 'in-progress';
                  else if (currentStatus === 'in-progress' || currentStatus === 'assigned') newStatus = 'resolved';
                  if (newStatus !== currentStatus) {
                    handleUpdateStatus(ticket._id || ticket.id, newStatus);
                  }
                }}
                onDelete={() => handleDelete(ticket._id || ticket.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
