import { debounce } from "@solid-primitives/scheduled";
import { createSignal, onMount } from "solid-js";
import { checkFollowStatus, followUser, unfollowUser } from "~/lib/api/social";

export default function FollowButton(props: { target: string }) {
	const [followed, setFollowed] = createSignal(false);
	const [followedId, setFollowedId] = createSignal<string | null>(null);

	async function post() {
		const id = await followUser(props.target);
		if (id) {
			setFollowed(true);
			setFollowedId(id);
		}
	}

	async function remove() {
		const id = followedId();
		if (!id) return;
		await unfollowUser(id);
		setFollowed(false);
		setFollowedId(null);
	}

	const postDebounced = debounce(post, 300);
	const removeDebounced = debounce(remove, 300);

	onMount(async () => {
		const result = await checkFollowStatus(props.target);
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
