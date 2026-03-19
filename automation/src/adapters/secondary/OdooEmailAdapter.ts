import { EmailPort } from "../../ports/outbound/EmailPort";
import { OdooClient } from "./OdooClient";

export class OdooEmailAdapter implements EmailPort {
  constructor(private client: OdooClient) {}

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const mailId = await this.client.call("mail.mail", "create", [
      {
        email_to: to,
        subject: subject,
        body_html: `<p>${body}</p>`,
      },
    ]);

    await this.client.call("mail.mail", "send", [[mailId]]);
  }
}
