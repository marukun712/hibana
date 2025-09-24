import { createClient } from "@hibana/client";
import { debounce } from "@solid-primitives/scheduled";
import { AiFillBook, AiOutlineBook } from "solid-icons/ai";
import { createSignal, onMount } from "solid-js";

export default function PinButton(props: { target: string }) {
	const [pinned, setPinned] = createSignal(false);
	const [pinnedId, setPinnedId] = createSignal<string | null>(null);
	const client = createClient();

	async function post() {
		const eventId = await client.social.pin.add(props.target);
		if (eventId) {
			setPinned(true);
			setPinnedId(eventId);
		}
	}

	async function remove() {
		const id = pinnedId();
		if (!id) return;
		await client.social.pin.delete(id);
		setPinned(false);
		setPinnedId(null);
	}

	const postDebounced = debounce(post, 300);
	const removeDebounced = debounce(remove, 300);

	onMount(async () => {
		const result = await client.social.pin.checkStatus(props.target);
		if (result.isPinned) {
			setPinned(true);
			setPinnedId(result.id);
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
