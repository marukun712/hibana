import { z } from "zod";

export const profileSchema = z.object({
  id: z.string(),
  publickey: z.string(),
  signature: z.string(),
  username: z.string(),
  icon: z.string(),
  description: z.string(),
  repository: z.string(),
  updatedAt: z.string(),
});

export type profileType = z.infer<typeof profileSchema>;
