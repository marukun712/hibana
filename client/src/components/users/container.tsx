import type { profileType } from "@hibana/schema";
import { useSearchParams } from "@solidjs/router";
import { createSignal, For, onMount } from "solid-js";
import { useAuth } from "~/contexts/authContext";
import UserCard from "./userCard";

export default function UsersContainer() {
	const [searchParams] = useSearchParams();
	const [users, setUsers] = createSignal<profileType[]>();
	const { client: getClient, user } = useAuth();

	async function fetchStatus() {
		const type = searchParams.type as string;
		const clientInstance = getClient();
		if (!clientInstance) return;

		switch (type) {
			case "follow": {
				const publickey = user()?.publickey;
				if (!publickey) return;
				const data = await clientInstance.event.follow.list({
					publickey: publickey,
				});
				setUsers(
					data.map((follow) => {
						return follow.target;
					}),
				);
				break;
			}
			case "follower": {
				const publickey = user()?.publickey;
				if (!publickey) return;
				const data = await clientInstance.event.follow.list({
					target: publickey,
				});
				setUsers(
					data.map((follow) => {
						return follow.target;
					}),
				);
				break;
			}
		}
	}

	onMount(fetchStatus);

	return (
		<div class="space-y-4 p-4">
			<For each={users()}>
				{(user) => <UserCard user={user} showFollowButton={true} />}
			</For>
		</div>
	);
}
