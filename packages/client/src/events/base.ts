import type { eventRouteType, feedRouteType } from "@hibana/repository-server";
import type { eventReturnType } from "@hibana/schema";
import { createSecureMessage } from "@hibana/utils";
import { hc } from "hono/client";
import { calculateHash } from "../hash";

export abstract class BaseEventAPI<TName extends string, TContent>
	implements EventAPI<TName, TContent>
{
	protected repository: string;
	readonly name: TName;

	constructor(repository: string, name: TName) {
		this.repository = repository;
		this.name = name;
	}

	abstract get(id: string): Promise<eventReturnType<TName, TContent>>;
	abstract list(params?: {
		publickey?: string;
		id?: string;
		target?: string;
	}): Promise<eventReturnType<TName, TContent>[]>;
	abstract post(publickey: string, content: TContent): Promise<string>;
	abstract delete(publickey: string, id: string): Promise<void>;

	private async handleResponse<T>(res: Response): Promise<T> {
		const json = await res.json();
		if ("error" in json) {
			throw new Error("投稿中にエラーが発生しました。");
		}
		return json;
	}

	protected async getEvent(
		id: string,
	): Promise<eventReturnType<TName, TContent>> {
		const client = hc<eventRouteType>(this.repository);
		const res = await client.event.$get({ query: { id } });
		return this.handleResponse(res);
	}

	protected async listEvents(params?: {
		publickey?: string;
		id?: string;
		target?: string;
	}): Promise<eventReturnType<TName, TContent>[]> {
		const client = hc<feedRouteType>(this.repository);
		const query: Record<string, string> = {
			event: this.name,
		};
		if (params?.publickey) {
			query.publickey = params.publickey;
		}
		if (params?.id) {
			query.id = params.id;
		}
		if (params?.target) {
			query.target = params.target;
		}
		const res = await client.feed.$get({ query });
		return this.handleResponse(res);
	}

	protected async postEvent(
		publickey: string,
		content: TContent,
	): Promise<string> {
		const client = hc<eventRouteType>(this.repository);
		const message = await createSecureMessage<TName, TContent>(
			{
				event: this.name,
				timestamp: new Date().toISOString(),
				message: content,
				publickey: publickey,
			},
			calculateHash,
		);
		const res = await client.event.$post({ json: message });
		const json = await this.handleResponse<{ id: string }>(res);
		return json.id;
	}

	protected async deleteEvent(publickey: string, id: string): Promise<void> {
		const client = hc<eventRouteType>(this.repository);
		const message = await createSecureMessage<
			"event.delete",
			{ target: string }
		>(
			{
				event: "event.delete",
				timestamp: new Date().toISOString(),
				message: { target: id },
				publickey: publickey,
			},
			calculateHash,
		);
		await client.event.$delete({ json: message });
	}
}

export interface EventAPI<TName extends string, TContent> {
	get(id: string): Promise<eventReturnType<TName, TContent>>;
	list(params?: {
		publickey?: string;
		id?: string;
		target?: string;
	}): Promise<eventReturnType<TName, TContent>[]>;
	post(publickey: string, content: TContent): Promise<string>;
	delete(publickey: string, id: string): Promise<void>;
}
