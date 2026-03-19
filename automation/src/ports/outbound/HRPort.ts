export interface HRPort {
  findEmployeeByEmail(email: string): Promise<EmployeeRecord | null>;
}

export interface EmployeeRecord {
  email: string;
  name: string;
  status: "active" | "terminated";
}
