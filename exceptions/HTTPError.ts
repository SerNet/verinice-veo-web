import LocalizedError from "./LocalizedError";
import { AxiosError } from "axios";

export default class HTTPError extends LocalizedError<AxiosError> {
  get response() {
    const cause = this.cause;
    return cause && cause.response;
  }

  get status() {
    const response = this.response;
    return response && response.status;
  }

  getPlaceholders() {
    return { ...super.getPlaceholders(), response: this.response, status: this.status };
  }
}
