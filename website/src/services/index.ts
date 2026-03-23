import { apiService } from './api';
import { User, Hospital, Ticket, Message } from '@/lib/types';

export const authService = {
  login: (email: string, password: string) =>
    apiService.post<User>('/api/auth/login', { email, password }, false),

  register: (name: string, email: string, password: string, hospitalId: string) =>
    apiService.post<User>('/api/auth/register', { name, email, password, hospitalId }, false),

  getMe: () => apiService.get<User>('/api/auth/me'),

  updateProfile: (data: Partial<User>) => apiService.patch<User>('/api/auth/me', data),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
};

export const hospitalService = {
  getAll: () => apiService.get<Hospital[]>('/api/hospitals'),

  create: (data: { name: string; type: string; address: string; city: string }) =>
    apiService.post<Hospital>('/api/hospitals', data),

  update: (id: string, data: Partial<Hospital>) =>
    apiService.patch<Hospital>(`/api/hospitals/${id}`, data),

  delete: (id: string) => apiService.delete(`/api/hospitals/${id}`),
};

export const ticketService = {
  getAll: () => apiService.get<Ticket[]>('/api/tickets'),

  getUserTickets: () => apiService.get<Ticket[]>('/api/tickets/user'),

  getPending: () => apiService.get<Ticket[]>('/api/tickets/pending'),

  getById: (id: string) => apiService.get<Ticket>(`/api/tickets/${id}`),

  create: (data: { issueTitle: string; description: string }) =>
    apiService.post<Ticket>('/api/tickets', data),

  update: (id: string, data: { status?: string; assignCaseNumber?: boolean }) =>
    apiService.patch<Ticket>(`/api/tickets/${id}`, data),

  delete: (id: string) => apiService.delete(`/api/tickets/${id}`),

  reply: (id: string, data: { doctorName: string; doctorPhone: string; specialization: string; replyMessage: string }) =>
    apiService.patch<Ticket>(`/api/tickets/${id}/reply`, data),

  assign: (id: string, adminId: string) =>
    apiService.patch(`/api/tickets/${id}/assign`, { adminId }),

  getStats: () => apiService.get<{ totalTickets: number; totalHospitals: number; statsByType: Record<string, number> }>('/api/tickets/stats'),
};

export const chatService = {
  getMessages: (ticketId: string) => apiService.get<Message[]>(`/api/chat/${ticketId}`),

  sendMessage: (ticketId: string, content: string) =>
    apiService.post<Message>(`/api/chat/${ticketId}`, { content }),
};

export const userService = {
  getAdmins: () => apiService.get<User[]>('/api/users'),

  assignAdmin: (data: { name: string; email: string; password: string; hospitalId: string }) =>
    apiService.post('/api/users/assign-admin', data),
};
