import { z } from "zod";

export const getRequestSchema = z.object({
  publickey: z.string(),
  id: z.string(),
});

export type getSchemaType = z.infer<typeof getRequestSchema>;

export const feedRequestSchema = z.object({
  publickey: z.string().optional(),
  event: z.string().optional(),
  target: z.string().optional(),
});

export const eventRequestSchema = z.object({
  id: z.string(),
});

export const profileRequestSchema = z.object({
  publickey: z.string(),
});

export const deleteRequestSchema = z.object({
  target: z.string(),
  content: z.string(),
  signature: z.string(),
});

export type deleteSchemaType = z.infer<typeof deleteRequestSchema>;
