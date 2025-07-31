import { createSignal, onMount } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import { deleteEvent, isPinned, postEvent } from "~/lib/api/event";

export default function PinButton(props: { target: string }) {
  const [pinned, setPinned] = createSignal(false);
  const [pinnedId, setPinnedId] = createSignal<string | null>(null);

  async function post() {
    const eventId = await postEvent("event.pin", { target: props.target });
    if (eventId) {
      setPinned(true);
      setPinnedId(eventId);
    }
  }

  async function remove() {
    const id = pinnedId();
    if (!id) return;
    await deleteEvent(id);
    setPinned(false);
    setPinnedId(null);
  }

  const postDebounced = debounce(post, 300);
  const removeDebounced = debounce(remove, 300);

  onMount(async () => {
    const publickey = await window.nostr.getPublicKey();
    const result = await isPinned(publickey, props.target);
    if (result.isPinned) {
      setPinned(true);
      setPinnedId(result.id);
    }
  });

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (pinned()) {
          removeDebounced();
        } else {
          postDebounced();
        }
      }}
      class={`btn btn-sm btn-ghost gap-1 ${
        pinned() ? "text-primary" : "text-base-content/60"
      } hover:text-primary`}
    >
      <svg
        class="w-4 h-4"
        fill={pinned() ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        ></path>
      </svg>
      <span class="text-sm">{pinned() ? "ピン済み" : "ピン"}</span>
    </button>
  );
}
