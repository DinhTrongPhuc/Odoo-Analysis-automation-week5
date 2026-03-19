export type EmployeeStatus = "active" | "terminated";
export type AccountStatus = "active" | "locked";

export class Employee {
  constructor(
    public email: string,
    public name: string,
    public employeeStatus: EmployeeStatus,
    public accountStatus: AccountStatus,
  ) {}

  isActiveEmployee(): boolean {
    return this.employeeStatus === "active";
  }

  isAccountLocked(): boolean {
    return this.accountStatus === "locked";
  }
}
