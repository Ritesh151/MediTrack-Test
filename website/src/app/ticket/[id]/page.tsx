'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useTickets } from '@/context/TicketContext';
import { TicketShimmer } from '@/components/Shimmer';
import { CustomInput } from '@/components/CustomInput';

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;
  
  const { user, isLoading: authLoading } = useAuth();
  const { getTicketById, replyToTicket, updateTicketStatus } = useTickets();
  const { messages, isLoading: chatLoading, loadMessages, sendMessage } = useChat();
  
  const [ticket, setTicket] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyData, setReplyData] = useState({
    doctorName: '',
    doctorPhone: '',
    specialization: '',
    replyMessage: '',
  });
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && ticketId) {
      loadTicketDetails();
      loadMessages(ticketId);
    }
  }, [user, ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadTicketDetails = async () => {
    try {
      const data = await getTicketById(ticketId);
      setTicket(data);
    } catch (err) {
      console.error('Failed to load ticket:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(ticketId, message.trim());
      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyData.doctorName || !replyData.specialization || !replyData.replyMessage) return;

    setIsReplying(true);
    try {
      await replyToTicket(ticketId, replyData);
      await updateTicketStatus(ticketId, 'resolved');
      setShowReplyModal(false);
      setReplyData({ doctorName: '', doctorPhone: '', specialization: '', replyMessage: '' });
      loadTicketDetails();
    } catch (err) {
      console.error('Failed to reply:', err);
      alert('Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/30';
      case 'assigned':
      case 'in-progress': return 'bg-info/10 text-info border-info/30';
      case 'resolved': return 'bg-success/10 text-success border-success/30';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super';
  const canReply = isAdmin && ticket?.assignedAdminId && 
    ((typeof ticket.assignedAdminId === 'object' && ticket.assignedAdminId._id === user?._id) ||
     (typeof ticket.assignedAdminId === 'string' && ticket.assignedAdminId === user?.id));

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-card-border">
          <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Loading...</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto p-4">
          <TicketShimmer />
        </main>
      </div>
    );
  }

  const ticketIdDisplay = (ticket._id || ticket.id).slice(-6).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-white border-b border-card-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Ticket Details</h1>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowReplyModal(true)}
              className="px-4 py-2 bg-success text-white rounded-lg font-semibold hover:bg-green-600 transition-colors text-sm"
            >
              Send Reply
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        <div className="bg-primary/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-primary">#{ticketIdDisplay}</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(ticket.status)}`}>
              {ticket.status.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-1">{ticket.issueTitle}</h2>
          <p className="text-text-secondary">{ticket.description}</p>
          {ticket.patient && (
            <p className="text-sm text-text-tertiary mt-2">From: {ticket.patient.name} ({ticket.patient.email})</p>
          )}
        </div>

        {ticket.reply && (
          <div className="bg-success/5 border border-success/30 rounded-xl p-4 m-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-bold text-success">Doctor Recommendation</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-text-secondary">Doctor:</span>
                <span className="ml-2 font-semibold">{ticket.reply.doctorName}</span>
              </div>
              <div>
                <span className="text-text-secondary">Specialization:</span>
                <span className="ml-2 font-semibold">{ticket.reply.specialization}</span>
              </div>
              {ticket.reply.doctorPhone && (
                <div>
                  <span className="text-text-secondary">Phone:</span>
                  <span className="ml-2 font-semibold">{ticket.reply.doctorPhone}</span>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-success/20">
              <p className="text-sm font-semibold mb-1">Message:</p>
              <p className="text-sm text-text-secondary">{ticket.reply.replyMessage}</p>
            </div>
            <p className="text-xs text-text-tertiary mt-3 text-right">
              Replied at: {formatDate(ticket.reply.repliedAt)}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatLoading && messages.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = (typeof msg.senderId === 'string' ? msg.senderId : msg.senderId?._id) === user._id || msg.senderId === user.id;
              return (
                <div
                  key={msg._id || msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      isMe
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-white border border-card-border text-text-primary rounded-bl-sm'
                    }`}
                  >
                    {!isMe && (
                      <p className="text-xs font-semibold text-info mb-1">{msg.senderName}</p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-text-tertiary'}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="border-t border-card-border bg-white p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-xl border border-card-border focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!message.trim() || isSending}
              className="p-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </main>

      {showReplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Send Doctor Recommendation</h2>
              <button onClick={() => setShowReplyModal(false)} className="text-text-tertiary hover:text-text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleReply} className="space-y-4">
              <CustomInput
                label="Doctor Name *"
                placeholder="Enter doctor's name"
                value={replyData.doctorName}
                onChange={(e) => setReplyData({ ...replyData, doctorName: e.target.value })}
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Specialization *
                </label>
                <select
                  value={replyData.specialization}
                  onChange={(e) => setReplyData({ ...replyData, specialization: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select specialization</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Orthopedic">Orthopedic</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="ENT Specialist">ENT Specialist</option>
                  <option value="Ophthalmologist">Ophthalmologist</option>
                  <option value="Psychiatrist">Psychiatrist</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <CustomInput
                label="Doctor Phone (Optional)"
                placeholder="Enter phone number"
                value={replyData.doctorPhone}
                onChange={(e) => setReplyData({ ...replyData, doctorPhone: e.target.value })}
                type="tel"
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Recommendation Message *
                </label>
                <textarea
                  value={replyData.replyMessage}
                  onChange={(e) => setReplyData({ ...replyData, replyMessage: e.target.value })}
                  placeholder="Enter your recommendation message to the patient"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1 px-4 py-3 border border-card-border rounded-lg text-text-secondary font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReplying || !replyData.doctorName || !replyData.specialization || !replyData.replyMessage}
                  className="flex-1 px-4 py-3 bg-success text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReplying ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
