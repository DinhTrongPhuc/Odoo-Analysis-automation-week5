import fs from "fs";

const FILE = "src/storage/processedTickets.json";

export class TicketTracker {
  static getProcessedTickets(): number[] {
    const data = fs.readFileSync(FILE, "utf-8");

    return JSON.parse(data);
  }

  static markProcessed(ticketId: number) {
    const tickets = this.getProcessedTickets();

    if (!tickets.includes(ticketId)) {
      tickets.push(ticketId);

      fs.writeFileSync(FILE, JSON.stringify(tickets, null, 2));
    }
  }

  static isProcessed(ticketId: number): boolean {
    const tickets = this.getProcessedTickets();

    return tickets.includes(ticketId);
  }
}
