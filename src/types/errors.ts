import type { ZodIssue } from "zod";

export type ValidationError = ZodIssue;

export type MalformedError = {
  code: "malformed_error";
  message: string;
};

export type InternalError = {
  code: "internal_error";
  message: string;
};

export type SdkError = {
  errors?: (ValidationError | MalformedError | InternalError)[];
};
