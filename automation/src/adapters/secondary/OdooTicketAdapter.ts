import { TicketPort } from "../../ports/outbound/TicketPort";
import { OdooClient } from "./OdooClient";

export class OdooTicketAdapter implements TicketPort {
  constructor(private client: OdooClient) {}

  async addNote(ticketId: number, note: string): Promise<void> {
    await this.client.call("helpdesk.ticket", "message_post", [[ticketId]], {
      body: note,
      message_type: "comment",
      subtype_xmlid: "mail.mt_note",
    });
  }

  async markResolved(ticketId: number): Promise<void> {
    await this.client.call("helpdesk.ticket", "write", [
      [ticketId],
      { stage_id: 4 },
    ]);
  }
}
