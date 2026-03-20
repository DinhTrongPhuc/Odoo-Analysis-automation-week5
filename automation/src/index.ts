import "dotenv/config";

import { LoginAutomationService } from "./domain/services/LoginAutomationService";
import { Ticket } from "./domain/entities/Ticket";

import { OdooClient } from "./adapters/secondary/OdooClient";
import { OdooHRAdapter } from "./adapters/secondary/OdooHRAdapter";
import { OdooTicketAdapter } from "./adapters/secondary/OdooTicketAdapter";

import { EmailAdapter } from "./adapters/secondary/EmailAdapter";
import { LMSAdapter } from "./adapters/secondary/LMSAdapter";

import { TicketTracker } from "./utils/TicketTracker";
import { logger } from "./utils/logger";
import { TicketValidator } from "./domain/validators/TicketValidator";

// Odoo Client
const client = new OdooClient(
  process.env.ODOO_URL!,
  process.env.ODOO_DB!,
  process.env.ODOO_USER!,
  process.env.ODOO_PASS!,
);

// automation services
const automation = new LoginAutomationService(
  new OdooHRAdapter(client),
  new LMSAdapter(), // currently mock / optional
  new EmailAdapter(),
  new OdooTicketAdapter(client),
);

function buildLoginDomain() {
  const keywords = TicketValidator.loginKeywords;
  const conditions: any[] = [];
  keywords.forEach((word) => {
    conditions.push(["name", "ilike", word]);
    conditions.push(["description", "ilike", word]);
  });

  const orOperators = Array(conditions.length - 1).fill("|");

  return [
    "&",
    ["stage_id.name", "!=", "Solved"],
    ...orOperators,
    ...conditions,
  ];
}

async function checkNewTickets() {
  try {
    logger.info("Checking new tickets...");

    const loginDomain = buildLoginDomain();

    const tickets = await client.call(
      "helpdesk.ticket",
      "search_read",
      [loginDomain],
      {
        fields: [
          "id",
          "name",
          "description",
          "partner_email",
          "create_date",
          "stage_id",
        ],
        limit: 20, // Giới hạn số lượng ticket lấy về để tránh quá tải
        order: "create_date desc",
      },
    );

    if (!Array.isArray(tickets)) {
      logger.error("Odoo did not return tickets", tickets);
      return;
    }

    console.log("ODOO TICKETS:", tickets);

    for (const t of tickets) {
      if (TicketTracker.isProcessed(t.id)) {
        logger.info("Ticket already processed", { id: t.id });

        continue;
      }

      const email = t.partner_email || "";

      const ticket = new Ticket(
        t.id,
        t.name,
        t.description || "",
        email,
        new Date(t.create_date),
      );

      console.log("Stage id: ", t.stage_id);

      logger.info("Processing ticket", {
        id: ticket.id,
        subject: ticket.subject,
        email: ticket.requesterEmail,
      });

      await automation.processTicket(ticket);

      TicketTracker.markProcessed(ticket.id);

      logger.info("Ticket processed successfully", {
        id: ticket.id,
      });
    }
  } catch (error) {
    logger.error("Automation error", error);
  }
}

logger.info("Automation started...");

// first run
checkNewTickets();
// run/60s
setInterval(checkNewTickets, 60000);
