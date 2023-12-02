import { z } from "zod";
import { RunnerSchema } from "./Runner.js";

// https://github.com/jmorganca/ollama/blob/main/api/types.go#L48
export const OptionsSchema = RunnerSchema.merge(
  z.object({
    num_keep: z.number().int().optional(),
    seed: z.number().int().optional(),
    num_predict: z.number().int().optional(),
    top_k: z.number().int().optional(),
    top_p: z.number().optional(),
    tfs_z: z.number().optional(),
    typical_p: z.number().optional(),
    repeat_last_n: z.number().int().optional(),
    temperature: z.number().optional(),
    repeat_penalty: z.number().optional(),
    presence_penalty: z.number().optional(),
    frequency_penalty: z.number().optional(),
    mirostat: z.number().int().optional(),
    mirostat_tau: z.number().optional(),
    mirostat_eta: z.number().optional(),
    penalize_newline: z.boolean().optional(),
    stop: z.array(z.string()).optional(),
  })
);

export type Options = z.infer<typeof OptionsSchema>;
