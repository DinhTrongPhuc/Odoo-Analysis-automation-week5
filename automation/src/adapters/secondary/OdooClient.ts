import axios from "axios";

export class OdooClient {
  private uid: number | null = null;

  constructor(
    private url: string,
    private db: string,
    private username: string,
    private password: string,
  ) {}

  private async authenticate() {
    const response = await axios.post(`${this.url}/jsonrpc`, {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "common",
        method: "login",
        args: [this.db, this.username, this.password],
      },
      id: Date.now(),
    });

    this.uid = response.data.result;

    console.log("Odoo login UID:", this.uid);
  }

  async call(model: string, method: string, domain: any[], kwargs: any = {}) {
    if (!this.uid) {
      await this.authenticate();
    }

    const response = await axios.post(`${this.url}/jsonrpc`, {
      jsonrpc: "2.0",
      method: "call",

      params: {
        service: "object",

        method: "execute_kw",

        args: [this.db, this.uid, this.password, model, method, domain, kwargs],
      },

      id: Date.now(),
    });

    // console.log("ODOO RAW RESPONSE:");
    // console.log(response.data);

    return response.data.result;
  }
}
