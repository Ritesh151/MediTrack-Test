'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/context/TicketContext';
import { Navbar } from '@/components/Navbar';
import { TicketCard } from '@/components/TicketCard';
import { DashboardShimmer } from '@/components/Shimmer';
import { CustomInput } from '@/components/CustomInput';

export default function PatientDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { tickets, isLoading, error, loadUserTickets, createTicket, setSearchQuery, searchQuery } = useTickets();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsCreating(true);
    try {
      await createTicket(title.trim(), description.trim());
      setShowModal(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setIsCreating(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar variant="patient" />
        <main className="max-w-7xl mx-auto p-4 pt-8">
          <DashboardShimmer />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="patient" />
      
      <main className="max-w-7xl mx-auto p-4 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome, {user.name}
          </h1>
        </div>

        <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 mb-6 shadow-lg shadow-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">My Tickets</h2>
              <p className="text-white/90">
                You have {tickets.length} active ticket{tickets.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {isLoading && tickets.length === 0 ? (
          <DashboardShimmer />
        ) : error ? (
          <div className="bg-white rounded-xl p-6 text-center">
            <p className="text-error mb-4">{error}</p>
            <button onClick={loadUserTickets} className="text-primary font-semibold hover:underline">
              Try Again
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No tickets found</h3>
            <p className="text-text-secondary mb-4">Your support tickets will appear here</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Your First Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket._id || ticket.id}
                ticket={ticket}
                onClick={() => router.push(`/ticket/${ticket._id || ticket.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 px-6 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-semibold"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Ticket
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h2 className="text-xl font-bold text-text-primary mb-4">Raise Healthcare Concern</h2>
            
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <CustomInput
                label="Issue Title"
                placeholder="Enter issue title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <div className="w-full">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your concern"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-card-border rounded-lg text-text-secondary font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !title.trim() || !description.trim()}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
