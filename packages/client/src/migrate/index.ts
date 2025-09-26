import type { migrateRouteType } from "@hibana/repository-server";
import type { profileType } from "@hibana/schema";
import type { baseSchemaType } from "@hibana/schema/Event";
import { createSecureMessage, createUserDoc } from "@hibana/utils";
import { hc } from "hono/client";
import { calculateHash } from "../hash";

export class MigrateAPI {
	async post(params: {
		repository: string;
		profile: profileType;
		body: baseSchemaType[];
	}): Promise<void> {
		const client = hc<migrateRouteType>(params.repository);
		const updatedAt = new Date().toISOString();
		const doc = await createUserDoc(
			{ ...params.profile, updatedAt, repository: params.repository },
			calculateHash,
		);
		const message = await createSecureMessage<
			"event.migrate",
			{ doc: profileType; body: baseSchemaType[] }
		>(
			{
				event: "event.migrate",
				timestamp: new Date().toISOString(),
				message: { doc, body: params.body },
				publickey: params.profile.publickey,
			},
			calculateHash,
		);
		await client.migrate.$post({
			json: message,
		});
	}
}
