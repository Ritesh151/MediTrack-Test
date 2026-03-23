export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'admin' | 'super';
  hospitalId?: string;
  permissions?: string[];
  token?: string;
}

export interface Hospital {
  _id: string;
  id: string;
  name: string;
  type: 'gov' | 'private' | 'semi';
  address: string;
  city: string;
  code: string;
}

export interface Ticket {
  _id: string;
  id: string;
  caseNumber: string;
  patientId: string | Patient;
  assignedAdminId?: string | Admin;
  issueTitle: string;
  description: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'resolved';
  priority?: string;
  reply?: TicketReply;
  createdAt: string;
  updatedAt: string;
  patient?: { _id: string; name: string; email: string };
  assignedAdmin?: { _id: string; name: string; email: string };
}

export interface TicketReply {
  doctorName: string;
  doctorPhone: string;
  specialization: string;
  replyMessage: string;
  repliedBy: string | User;
  repliedAt: string;
}

export interface Patient {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface Message {
  _id: string;
  id: string;
  ticketId: string;
  senderId: string | User;
  senderRole: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface TicketStats {
  totalTickets: number;
  totalHospitals: number;
  statsByType: Record<string, number>;
}
