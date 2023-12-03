import type { AxiosInstance } from "axios";
import { z } from "zod";
// import { ReadableStream } from "stream/web";
import type { Command } from "../interfaces/Command.js";
import { OllamaError } from "../errors/OllamaError.js";
import { OptionsSchema, type Options } from "../types/Options.js";
import type { IncomingMessage } from "http";

// Request
export const formats = ["json"] as const;

export const FormatSchema = z.enum(formats);

export type Format = z.infer<typeof FormatSchema>;

export const GenerateRequestSchema = z.object({
  model: z.string().min(1),
  prompt: z.string().min(1),
  system: z.string().optional(),
  template: z.string().optional(),
  context: z.string().optional(),
  stream: z.boolean().optional(),
  raw: z.boolean().optional(),
  format: FormatSchema.optional(),
  options: OptionsSchema.optional(),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

// Response
export const GenerateResponseSchema = z.object({
  model: z.string(),
  created_at: z.string().refine((value) => {
    try {
      const date = new Date(value);
      return date instanceof Date && !isNaN(date.getTime());
    } catch (err) {
      return false;
    }
  }),
  response: z.string(),
  done: z.boolean(),
});

export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;

export type GenerateResponseStream = ReadableStream<GenerateResponse>;

// Command
export class GenerateCommand
  implements Command<GenerateResponseStream | GenerateResponse>
{
  private readonly model: string;
  private readonly prompt: string;
  private readonly format?: Format;
  private readonly options?: Options;
  private readonly system?: string;
  private readonly template?: string;
  private readonly context?: string;
  private readonly stream?: boolean;
  private readonly raw?: boolean;

  constructor(req: GenerateRequest) {
    this.model = req.model;
    this.prompt = req.prompt;
    this.format = req.format;
    this.options = req.options;
    this.system = req.system;
    this.template = req.template;
    this.context = req.context;
    this.stream = req.stream;
    this.raw = req.raw;
  }

  async execute(client: AxiosInstance) {
    const payload = {
      model: this.model,
      prompt: this.prompt,
      system: this.system,
      template: this.template,
      context: this.context,
      stream: this.stream,
      raw: this.raw,
      format: this.format,
      options: this.options,
    };

    if (payload.stream) {
      const resp = await client.post<IncomingMessage>(
        "/api/generate",
        payload,
        {
          responseType: "stream",
        }
      );

      const stream = new ReadableStream({
        start(controller) {
          resp.data.on("data", (chunk: Buffer) => {
            try {
              const data = chunk.toString();
              const parsed = GenerateResponseSchema.safeParse(JSON.parse(data));

              if (!parsed.success) {
                controller.error(
                  new OllamaError(
                    "Cannot parse Ollama response",
                    parsed.error.errors
                  )
                );

                return;
              }

              controller.enqueue(parsed.data);
            } catch (error) {
              controller.error(new OllamaError("Ollama response is not JSON"));
            }
          });

          resp.data.on("end", () => {
            controller.close();
          });

          resp.data.on("error", (error) => {
            console.error(error.message);
            controller.error(new OllamaError("Ollama upstream error"));
          });
        },
      }) as GenerateResponseStream;

      return stream;
    } else {
      const resp = await client.post<GenerateResponse>(
        "/api/generate",
        payload
      );
      const parsed = GenerateResponseSchema.safeParse(resp.data);

      if (!parsed.success) {
        throw new OllamaError(
          "Cannot parse generate response",
          parsed.error.errors
        );
      }

      return parsed.data;
    }
  }
}

// Helpers
export function isGenerateResponseStream(
  obj: any
): obj is GenerateResponseStream {
  return obj instanceof ReadableStream;
}
