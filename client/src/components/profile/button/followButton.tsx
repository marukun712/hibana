import { debounce } from "@solid-primitives/scheduled";
import { createSignal, onMount } from "solid-js";
import { client } from "~/lib/client";

export default function FollowButton(props: { target: string }) {
	const [followed, setFollowed] = createSignal(false);
	const [followedId, setFollowedId] = createSignal<string | null>(null);

	async function post() {
		const clientInstance = await client();
		const id = await clientInstance.event.follow.post({ target: props.target });
		if (id) {
			setFollowed(true);
			setFollowedId(id);
		}
	}

	async function remove() {
		const id = followedId();
		if (!id) return;
		const clientInstance = await client();
		await clientInstance.event.follow.delete(id);
		setFollowed(false);
		setFollowedId(null);
	}

	const postDebounced = debounce(post, 300);
	const removeDebounced = debounce(remove, 300);

	onMount(async () => {
		try {
			const clientInstance = await client();
			const follows = await clientInstance.event.follow.list({
				target: props.target,
			});
			const followRecord = follows.find(
				(f) => f.message.target === props.target,
			);
			if (followRecord) {
				setFollowed(true);
				setFollowedId(followRecord.id);
			}
		} catch (err) {
			console.error("フォロー状態の確認中にエラー:", err);
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
