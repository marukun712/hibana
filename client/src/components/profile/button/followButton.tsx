import { createClient } from "@hibana/client";
import { debounce } from "@solid-primitives/scheduled";
import { createSignal, onMount } from "solid-js";

export default function FollowButton(props: { target: string }) {
	const [followed, setFollowed] = createSignal(false);
	const [followedId, setFollowedId] = createSignal<string | null>(null);
	const client = createClient();

	async function post() {
		const id = await client.social.follow.add(props.target);
		if (id) {
			setFollowed(true);
			setFollowedId(id);
		}
	}

	async function remove() {
		const id = followedId();
		if (!id) return;
		await client.social.follow.delete(id);
		setFollowed(false);
		setFollowedId(null);
	}

	const postDebounced = debounce(post, 300);
	const removeDebounced = debounce(remove, 300);

	onMount(async () => {
		const result = await client.social.follow.checkStatus(props.target);
		if (result.isFollowed) {
			setFollowed(true);
			setFollowedId(result.id);
		}
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				if (followed()) {
					removeDebounced();
				} else {
					postDebounced();
				}
			}}
			class="space-x-4 flex justify-center py-12"
		>
			<button class="btn btn-primary" type="submit">
				{followed() ? "Following" : "Follow"}
			</button>
		</form>
	);
}
