import { debounce } from "@solid-primitives/scheduled";
import { createSignal, onMount } from "solid-js";
import { useAuth } from "~/contexts/authContext";

export default function FollowButton(props: { target: string }) {
	const [followed, setFollowed] = createSignal(false);
	const [followedId, setFollowedId] = createSignal<string | null>(null);
	const { client: getClient, user } = useAuth();

	async function fetchStatus() {
		try {
			const clientInstance = getClient();
			const publickey = user()?.publickey;
			if (!clientInstance || !publickey) return;
			const follows = await clientInstance.event.follow.list({
				publickey,
				target: props.target,
			});
			if (follows.length > 0) {
				setFollowed(true);
				setFollowedId(follows[0].id);
			}
		} catch (err) {
			console.error("フォロー状態の確認中にエラー:", err);
		}
	}

	async function post() {
		const clientInstance = getClient();
		const publickey = user()?.publickey;
		if (!clientInstance || !publickey) return;
		const id = await clientInstance.event.follow.post(publickey, {
			target: props.target,
		});
		if (id) {
			setFollowed(true);
			setFollowedId(id);
		}
	}

	async function remove() {
		const id = followedId();
		const publickey = user()?.publickey;
		if (!id || !publickey) return;
		const clientInstance = getClient();
		if (!clientInstance) return;
		await clientInstance.event.follow.delete(publickey, id);
		setFollowed(false);
		setFollowedId(null);
	}

	const postDebounced = debounce(post, 300);
	const removeDebounced = debounce(remove, 300);

	onMount(fetchStatus);

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
