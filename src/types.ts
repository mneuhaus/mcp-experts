import { z } from 'zod';

export const ProviderConfigSchema = z.object({
  api_key: z.string().optional(),
  base_url: z.string().optional(),
});

export const ExpertConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.string(),
  system_prompt: z.string(),
});

export const ConfigSchema = z.object({
  providers: z.record(ProviderConfigSchema),
  experts: z.record(ExpertConfigSchema),
});

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;
export type ExpertConfig = z.infer<typeof ExpertConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

export interface ConsultExpertRequest {
  problem: string;
  context?: string;
  images?: string[];
}

export interface ExpertResponse {
  expert: string;
  response: string;
  reasoning?: string;
}