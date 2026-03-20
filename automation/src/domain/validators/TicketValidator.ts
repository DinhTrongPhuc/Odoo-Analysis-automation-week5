import { Ticket } from "../entities/Ticket";

export class TicketValidator {
  public static readonly loginKeywords = [
    // keywords liên quan đến login issue
    "login",
    "log in",
    "password",
    "invalid password",
    "invalid username",
    "đăng nhập",
    "không đăng nhập",
    "không truy cập",
    "mật khẩu",
    "không vào được",
    "ko vào được",
    "không thể vào được",
    "không login",
    "ko login",
    "không vào",
    "account",
    "tài khoản",
    "lms",
    "tsm",
  ];

  static isLoginIssue(ticket: Ticket): boolean {
    const content = ticket.getContent().toLowerCase();
    return this.loginKeywords.some((keyword) =>
      content.includes(keyword.toLowerCase()),
    );
  }
}
