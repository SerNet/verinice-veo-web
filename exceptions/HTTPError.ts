import LocalizedError from "./LocalizedError";
import { AxiosError } from "axios";
type ProjectLocaleErrorKey = keyof ProjectLocaleErrors;

export default class HTTPError<
  K extends ProjectLocaleErrorKey,
  Vars extends ProjectLocaleVariables[K]
> extends LocalizedError<AxiosError, K, Vars> {
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
