import { z } from "zod";

// https://github.com/jmorganca/ollama/blob/main/api/types.go#L72
export const RunnerSchema = z.object({
  numa: z.boolean().optional(),
  num_ctx: z.number().int().optional(),
  num_batch: z.number().int().optional(),
  num_gqa: z.number().int().optional(),
  num_gpu: z.number().int().optional(),
  main_gpu: z.number().int().optional(),
  low_vram: z.boolean().optional(),
  f16_kv: z.boolean().optional(),
  logits_all: z.boolean().optional(),
  vocab_only: z.boolean().optional(),
  use_mmap: z.boolean().optional(),
  use_mlock: z.boolean().optional(),
  embedding_only: z.boolean().optional(),
  rope_frequency_base: z.number().optional(),
  rope_frequency_scale: z.number().optional(),
  num_thread: z.number().int().optional(),
});

export type Runner = z.infer<typeof RunnerSchema>;
