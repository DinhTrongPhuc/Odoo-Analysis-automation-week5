export class Ticket {
  constructor(
    public id: number,
    public subject: string,
    public description: string,
    public requesterEmail: string,
    public createdAt: Date,
  ) {}

  getContent(): string {
    const cleanDescription = this.description
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase();

    return `${this.subject} ${cleanDescription}`;
  }
}
