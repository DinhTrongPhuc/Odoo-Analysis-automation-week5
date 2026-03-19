export interface LMSPort {
  reactivateAccount(email: string): Promise<void>;

  resetPassword(email: string): Promise<string>;
}
