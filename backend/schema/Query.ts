import { z } from "zod";

export const getSchema = z.object({
  publickey: z.string(),
  id: z.string(),
});

export type getSchemaType = z.infer<typeof getSchema>;

export const feedSchema = z.object({
  publickey: z.string().optional(),
  event: z.string().optional(),
});

export const eventQuerySchema = z.object({
  id: z.string(),
});

export const profileQuerySchema = z.object({
  publickey: z.string(),
});
