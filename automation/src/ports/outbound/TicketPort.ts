export interface TicketPort {
  addNote(ticketId: number, note: string): Promise<void>;

  markResolved(ticketId: number): Promise<void>;
}
