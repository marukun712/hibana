import { createClient } from "@hibana/client";
import type { profileType } from "@hibana/schema/Profile";
import { useSearchParams } from "@solidjs/router";
import { createSignal, For, onMount } from "solid-js";
import UserCard from "./userCard";

export default function UsersContainer() {
	const [searchParams] = useSearchParams();
	const [users, setUsers] = createSignal<profileType[]>();
	const client = createClient();

	onMount(async () => {
		const type = searchParams.type as string;
		const publickey = searchParams.publickey as string;

		switch (type) {
			case "follow": {
				const data = await client.social.follow.getFollows(publickey);
				const usersData = data.map((data) => {
					return data.target as profileType;
				});

				setUsers(usersData);
				break;
			}
			case "follower": {
				const data = await client.social.follow.getFollowers(publickey);
				const usersData = data.map((data) => {
					return data.user;
				});
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
