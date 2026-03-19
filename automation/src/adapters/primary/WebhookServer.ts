import express from "express";

import { Ticket } from "../../domain/entities/Ticket";
import { LoginAutomationService } from "../../domain/services/LoginAutomationService";

export class WebhookServer {
  constructor(private automationService: LoginAutomationService) {}

  start(port: number) {
    const app = express();

    app.use(express.json());

    app.post("/webhook/ticket-created", async (req, res) => {
      try {
        const data = req.body;

        console.log("New ticket received:", data);

        const ticket = new Ticket(
          data.id,
          data.subject,
          data.description,
          data.email,
          new Date(),
        );

        await this.automationService.processTicket(ticket);

        res.send({ status: "automation processed" });
      } catch (error) {
        console.error("Automation error:", error);

        res.status(500).send({ error: "automation failed" });
      }
    });

    app.listen(port, () => {
      console.log(`Automation webhook listening on port ${port}`);
    });
  }
}
