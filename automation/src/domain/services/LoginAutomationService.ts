import { Ticket } from "../entities/Ticket";
import { TicketValidator } from "../validators/TicketValidator";

import { HRPort } from "../../ports/outbound/HRPort";
import { LMSPort } from "../../ports/outbound/LMSPort";
import { EmailPort } from "../../ports/outbound/EmailPort";
import { TicketPort } from "../../ports/outbound/TicketPort";

import { logger } from "../../utils/logger";

export class LoginAutomationService {
  constructor(
    private hrPort: HRPort,
    private lmsPort: LMSPort,
    private emailPort: EmailPort,
    private ticketPort: TicketPort,
  ) {}

  async processTicket(ticket: Ticket): Promise<void> {
    console.log("Processing ticket:", ticket.id);

    // STEP 1 — Check if login issue
    const isLoginIssue = TicketValidator.isLoginIssue(ticket);

    if (!isLoginIssue) {
      console.log("Not a login issue → ignore");
      return;
    }

    logger.info("Login issue detected", { id: ticket.id });

    // // STEP 2 — Reset LMS account
    // await this.lmsPort.reactivateAccount(ticket.requesterEmail);
    // const newPassword = await this.lmsPort.resetPassword(ticket.requesterEmail);

    // STEP 3 — Add internal note
    const note = "Automation: LMS account reactivated and password reset.";

    await this.ticketPort.addNote(ticket.id, note);

    // STEP 4 — Resolve ticket
    await this.ticketPort.markResolved(ticket.id);

    // STEP 5 — Send email to user
    await this.emailPort.sendEmail(
      ticket.requesterEmail,
      "LMS Account Reactivated",
      // `Your account has been reactivated.\nNew temporary password: ${newPassword}`,
      `Your account has been reactivated.\nNew temporary password: newpassword`,
    );

    logger.info("Automation completed", { ticketId: ticket.id });
  }

  private async handleEmployeeNotFound(ticket: Ticket) {
    const note =
      "Automation: Employee not found in HR system → Escalated to support team.";

    await this.ticketPort.addNote(ticket.id, note);

    await this.emailPort.sendEmail(
      ticket.requesterEmail,
      "Login Issue Escalated",
      "Your login issue has been forwarded to the support team for manual review.",
    );
  }

  private async handleTerminatedEmployee(ticket: Ticket) {
    const note =
      "Automation: Employee is terminated → account will NOT be reactivated.";

    await this.ticketPort.addNote(ticket.id, note);

    await this.emailPort.sendEmail(
      ticket.requesterEmail,
      "Account Access Denied",
      "Your account cannot be reactivated because HR records show your employment has ended.",
    );
  }

  private async handleActiveEmployee(ticket: Ticket) {
    logger.info("Active employee detected → Automation handling ticket");

    const note =
      "Automation: Login issue detected. Account check required. Support team notified.";

    await this.ticketPort.addNote(ticket.id, note);

    await this.ticketPort.markResolved(ticket.id);

    await this.emailPort.sendEmail(
      ticket.requesterEmail,
      "Login Issue Processed",
      "Your login issue has been received and processed by the automation system.",
    );
  }
}
