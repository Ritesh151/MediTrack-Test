'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Ticket, TicketStats } from '@/lib/types';
import { ticketService } from '@/services';

interface TicketContextType {
  tickets: Ticket[];
  pendingTickets: Ticket[];
  stats: TicketStats | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loadTickets: () => Promise<void>;
  loadUserTickets: () => Promise<void>;
  loadPendingTickets: () => Promise<void>;
  loadStats: () => Promise<void>;
  createTicket: (issueTitle: string, description: string) => Promise<void>;
  updateTicketStatus: (id: string, status: string, assignCase?: boolean) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  getTicketById: (id: string) => Promise<Ticket>;
  replyToTicket: (id: string, data: { doctorName: string; doctorPhone: string; specialization: string; replyMessage: string }) => Promise<void>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketService.getAll();
      setTickets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketService.getUserTickets();
      setTickets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPendingTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketService.getPending();
      setPendingTickets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await ticketService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const createTicket = useCallback(async (issueTitle: string, description: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await ticketService.create({ issueTitle, description });
      await loadUserTickets();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserTickets]);

  const updateTicketStatus = useCallback(async (id: string, status: string, assignCase = false) => {
    setIsLoading(true);
    try {
      await ticketService.update(id, { status, assignCaseNumber: assignCase });
      await loadTickets();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadTickets]);

  const deleteTicket = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await ticketService.delete(id);
      setTickets(prev => prev.filter(t => (t._id || t.id) !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTicketById = useCallback(async (id: string): Promise<Ticket> => {
    return ticketService.getById(id);
  }, []);

  const replyToTicket = useCallback(async (
    id: string,
    data: { doctorName: string; doctorPhone: string; specialization: string; replyMessage: string }
  ) => {
    setIsLoading(true);
    try {
      await ticketService.reply(id, data);
      await loadTickets();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadTickets]);

  const filteredTickets = searchQuery
    ? tickets.filter(t =>
        t.issueTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tickets;

  return (
    <TicketContext.Provider
      value={{
        tickets: filteredTickets,
        pendingTickets,
        stats,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        loadTickets,
        loadUserTickets,
        loadPendingTickets,
        loadStats,
        createTicket,
        updateTicketStatus,
        deleteTicket,
        getTicketById,
        replyToTicket,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}

export default TicketContext;
