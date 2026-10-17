import { Injectable } from "@nestjs/common";
import { APP_NAME } from "@easycert/types";

@Injectable()
export class AppService {
  health() {
    return {
      app: APP_NAME,
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
