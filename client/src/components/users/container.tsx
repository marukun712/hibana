import type { profileType } from "@hibana/schema/Profile";
import { useSearchParams } from "@solidjs/router";
import { createSignal, For, onMount } from "solid-js";
import { client } from "~/lib/client";
import UserCard from "./userCard";

export default function UsersContainer() {
	const [searchParams] = useSearchParams();
	const [users, setUsers] = createSignal<profileType[]>();

	onMount(async () => {
		const type = searchParams.type as string;
		const publickey = searchParams.publickey as string;
		const clientInstance = await client();

		switch (type) {
			case "follow": {
				const data = await clientInstance.event.follow.list();
				const usersData = await Promise.all(
					data.map(async (followEvent) => {
						if (followEvent.message.target) {
							return await clientInstance.profile.get(
								followEvent.message.target,
							);
						}
						return null;
					}),
				);
				setUsers(usersData.filter(Boolean) as profileType[]);
				break;
			}
			case "follower": {
				const data = await clientInstance.event.follow.list({
					target: publickey,
				});
				const usersData = await Promise.all(
					data.map(async (followEvent) => {
						return await clientInstance.profile.get(followEvent.publickey);
					}),
				);
				setUsers(usersData);
				break;
			}
		}
	});

	return (
		<div class="space-y-4 p-4">
			<For each={users()}>
				{(user) => <UserCard user={user} showFollowButton={true} />}
			</For>
		</div>
	);
}
