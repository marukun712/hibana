import type { profileType } from "@hibana/schema";
import { useSearchParams } from "@solidjs/router";
import { createSignal, For, onMount } from "solid-js";
import { useAuth } from "~/contexts/authContext";
import UserCard from "./userCard";

export default function UsersContainer() {
	const [searchParams] = useSearchParams();
	const [users, setUsers] = createSignal<profileType[]>();
	const { client: getClient, user } = useAuth();
	const currentUserPublickey = user()?.publickey;

	onMount(async () => {
		const type = searchParams.type as string;
		const publickey = searchParams.publickey as string;
		const clientInstance = getClient();
		if (!clientInstance) return;

		switch (type) {
			case "follow": {
				if (!currentUserPublickey) return;
				const data = await clientInstance.event.follow.list({
					publickey: currentUserPublickey,
				});
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
				// For followers, we might need a different API call or approach
				// This logic might need to be updated based on the actual API capabilities
				if (!currentUserPublickey) return;
				const data = await clientInstance.event.follow.list({
					publickey: currentUserPublickey,
				});
				// Filter for follows where the target is the specified publickey
				const followersData = data.filter(
					(followEvent) => followEvent.message.target === publickey,
				);
				const usersData = await Promise.all(
					followersData.map(async (followEvent) => {
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
