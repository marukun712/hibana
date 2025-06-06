import { z } from "zod";

export const documentSchema = z.object({
  _id: z.string(),
  event: z.string(),
  target: z.union([z.string(), z.null()]),
  publickey: z.string(),
  timestamp: z.string(),
});

export type documentType = z.infer<typeof documentSchema>;
export type rawDocument = {
  value: documentType;
};
