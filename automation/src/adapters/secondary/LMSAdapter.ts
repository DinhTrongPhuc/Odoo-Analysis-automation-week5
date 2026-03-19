import axios from "axios";
import { LMSPort } from "../../ports/outbound/LMSPort";

export class LMSAdapter implements LMSPort {
  async reactivateAccount(email: string): Promise<void> {
    console.log("Calling LMS API → Reactivate account");

    await axios.post(`${process.env.LMS_API}/reactivate`, { email });
  }

  async resetPassword(email: string): Promise<string> {
    console.log("Calling LMS API → Reset password");

    const response = await axios.post(`${process.env.LMS_API}/reset-password`, {
      email,
    });

    return response.data.password;
  }
}
