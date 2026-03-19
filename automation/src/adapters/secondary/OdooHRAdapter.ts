import { HRPort, EmployeeRecord } from "../../ports/outbound/HRPort";
import { OdooClient } from "./OdooClient";

export class OdooHRAdapter implements HRPort {
  constructor(private client: OdooClient) {}

  async findEmployeeByEmail(email: string): Promise<EmployeeRecord | null> {
    const result = await this.client.call(
      "hr.employee",
      "search_read",
      [[["work_email", "=", email]]],
      { limit: 1 },
    );

    if (!result.length) return null;

    const e = result[0];

    return {
      email: e.work_email,
      name: e.name,
      status: e.active ? "active" : "terminated",
    };
  }
}
