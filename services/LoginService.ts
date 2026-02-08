// LoginService.ts
import { BaseHttpService } from "./BaseHttpService";

export class LoginService extends BaseHttpService {
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
  }
}
