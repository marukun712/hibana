import { debounce } from "@solid-primitives/scheduled";
import { AiFillBook, AiOutlineBook } from "solid-icons/ai";
import { createSignal, onMount } from "solid-js";
import { client } from "~/lib/client";

export default function PinButton(props: { target: string }) {
	const [pinned, setPinned] = createSignal(false);
	const [pinnedId, setPinnedId] = createSignal<string | null>(null);

	async function post() {
		const clientInstance = await client();
		const eventId = await clientInstance.event.pin.post({
			target: props.target,
		});
		if (eventId) {
			setPinned(true);
			setPinnedId(eventId);
		}
	}

	async function remove() {
		const id = pinnedId();
		if (!id) return;
		const clientInstance = await client();
		await clientInstance.event.pin.delete(id);
		setPinned(false);
		setPinnedId(null);
	}

	const postDebounced = debounce(post, 300);
	const removeDebounced = debounce(remove, 300);

	onMount(async () => {
		try {
			const clientInstance = await client();
			const pins = await clientInstance.event.pin.list({
				target: props.target,
			});
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
