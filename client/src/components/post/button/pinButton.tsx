import { debounce } from "@solid-primitives/scheduled";
import { AiFillBook, AiOutlineBook } from "solid-icons/ai";
import { createSignal, onMount } from "solid-js";
import { useAuth } from "~/contexts/authContext";

export default function PinButton(props: { target: string }) {
	const [pinned, setPinned] = createSignal(false);
	const [pinnedId, setPinnedId] = createSignal<string | null>(null);
	const { client: getClient, user } = useAuth();
	const publickey = user()?.publickey;

	async function post() {
		const clientInstance = getClient();
		if (!clientInstance || !publickey) return;
		const eventId = await clientInstance.event.pin.post(publickey, {
			target: props.target,
		});
		if (eventId) {
			setPinned(true);
			setPinnedId(eventId);
		}
	}

	async function remove() {
		const id = pinnedId();
		if (!id || !publickey) return;
		const clientInstance = getClient();
		if (!clientInstance) return;
		await clientInstance.event.pin.delete(publickey, id);
		setPinned(false);
		setPinnedId(null);
	}

	const postDebounced = debounce(post, 300);
	const removeDebounced = debounce(remove, 300);

	onMount(async () => {
		try {
			const clientInstance = getClient();
			if (!clientInstance || !publickey) return;
			const pins = await clientInstance.event.pin.list({ publickey });
			const pinRecord = pins.find((p) => p.message.target === props.target);
			if (pinRecord) {
				setPinned(true);
				setPinnedId(pinRecord.id);
			}
		} catch (err) {
			console.error("ピン状態の確認中にエラー:", err);
		}
	});

	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				if (pinned()) {
					removeDebounced();
				} else {
					postDebounced();
				}
			}}
			class={`btn btn-ghost btn-sm gap-1 sm:gap-2 ${
				pinned() ? "text-primary" : "text-base-content/60"
			} hover:text-primary`}
		>
			{pinned() ? <AiFillBook size={16} /> : <AiOutlineBook size={16} />}
			<span class="text-xs sm:text-sm hidden sm:inline">
				{pinned() ? "ピン済み" : "ピン"}
			</span>
		</button>
	);
}
