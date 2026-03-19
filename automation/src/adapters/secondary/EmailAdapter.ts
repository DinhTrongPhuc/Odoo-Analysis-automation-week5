import nodemailer from "nodemailer";
import { EmailPort } from "../../ports/outbound/EmailPort";

export class EmailAdapter implements EmailPort {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_EMAIL,

      to: to,

      subject: subject,

      text: body,
    });

    console.log("Email sent to:", to);
  }
}
