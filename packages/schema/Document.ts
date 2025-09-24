import { z } from "zod";

export const documentSchema = z.object({
	_id: z.string(),
	event: z.string(),
	target: z.union([z.string(), z.null()]),
	publickey: z.string(),
	timestamp: z.string(),
});
export const rawDocumentSchema = z.object({ value: documentSchema });
export const searchResult = z.array(documentSchema);
export const allDataSchema = z.array(rawDocumentSchema);

export type documentType = z.infer<typeof documentSchema>;
export type rawDocument = z.infer<typeof rawDocumentSchema>;
export type allData = z.infer<typeof allDataSchema>;
