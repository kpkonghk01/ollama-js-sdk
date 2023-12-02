import type { AxiosInstance } from "axios";
import { z } from "zod";
import type { Command } from "../interfaces/Command.js";
import { OllamaError } from "../errors/OllamaError.js";

// Request
export const EmbeddingRequestSchema = z.object({
  model: z.string().min(1),
  prompt: z.string().min(1),
});

export type EmbeddingRequest = z.infer<typeof EmbeddingRequestSchema>;

// Response
export const EmbeddingSchema = z.array(z.number());

export type Embedding = z.infer<typeof EmbeddingSchema>;

export const EmbeddingResponseSchema = z.object({
  embedding: EmbeddingSchema,
});

export type EmbeddingResponse = z.infer<typeof EmbeddingResponseSchema>;

// Command
export class EmbeddingCommand implements Command<EmbeddingResponse> {
  private readonly model: string;
  private readonly prompt: string;

  constructor(req: EmbeddingRequest) {
    this.model = req.model;
    this.prompt = req.prompt;
  }

  async execute(client: AxiosInstance): Promise<EmbeddingResponse> {
    const payload = {
      model: this.model,
      prompt: this.prompt,
    };

    const resp = await client.post<EmbeddingResponse>(
      "/api/embeddings",
      payload
    );
    const parsed = EmbeddingResponseSchema.safeParse(resp.data);

    if (!parsed.success) {
      throw new OllamaError(
        "Cannot parse embedding response",
        parsed.error.errors
      );
    }

    resp.data = parsed.data;

    return resp.data;
  }
}
