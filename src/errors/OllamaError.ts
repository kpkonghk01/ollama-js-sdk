import type { SdkError } from "../types/errors.js";

export class OllamaError extends Error {
  public readonly errors?: SdkError["errors"];

  constructor(message: string, errors?: SdkError["errors"]) {
    super(message);
    this.name = "OllamaError";
    this.errors = errors;
  }
}
