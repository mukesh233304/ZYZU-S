// FOCUSPOINT Support Service Abstraction Layer

import { SupportTicket, UserRole } from '../types';
import { mockStore } from '../mock/store';

export const supportService = {
  async getTickets(userId?: string): Promise<SupportTicket[]> {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.getSupportTickets(userId);
  },

  async getDistrictTickets(districtName: string): Promise<SupportTicket[]> {
    await new Promise(r => setTimeout(r, 150));
    if (!districtName) return [];
    const all = mockStore.getSupportTickets();
    const clean = districtName.toLowerCase().trim();
    return all.filter(t => (t as any).district && (t as any).district.toLowerCase().trim() === clean);
  },

  async createTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'responses'>): Promise<SupportTicket> {
    await new Promise(r => setTimeout(r, 200));
    const newTicket: SupportTicket = {
      ...ticket,
      id: `tkt-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [
        {
          id: `resp-init-${Date.now()}`,
          senderId: ticket.userId,
          senderName: ticket.userName,
          senderRole: ticket.userRole,
          message: ticket.description,
          timestamp: new Date().toISOString(),
        }
      ]
    };
    return mockStore.addSupportTicket(newTicket);
  },

  async updateTicketStatus(ticketId: string, status: any) {
    await new Promise(r => setTimeout(r, 200));
    const tickets = mockStore.getSupportTickets();
    const match = tickets.find(t => t.id === ticketId);
    if (match) {
      match.status = status;
    }
    return match;
  },

  async addResponse(ticketId: string, senderId: string, senderName: string, senderRole: UserRole, message: string, attachments?: string[]) {
    await new Promise(r => setTimeout(r, 250));
    return mockStore.addTicketResponse(ticketId, {
      id: `resp-${Date.now()}`,
      senderId,
      senderName,
      senderRole,
      message,
      attachments,
      timestamp: new Date().toISOString(),
    });
  },

  async rateTicket(ticketId: string, rating: number, feedback?: string) {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.rateSupportTicket(ticketId, rating, feedback);
  },

  async reopenTicket(ticketId: string) {
    await new Promise(r => setTimeout(r, 150));
    return mockStore.reopenSupportTicket(ticketId);
  }
};
