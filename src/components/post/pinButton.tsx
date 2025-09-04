import { createSignal, onMount } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import { deleteEvent, isPinned, postEvent } from "~/lib/api/event";
import { getCurrentUser } from "~/lib/api/users";
import { AiOutlineBook, AiFillBook } from "solid-icons/ai";

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
    const user = await getCurrentUser();
    const publickey = user.publickey;
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
      {pinned() ? <AiFillBook size={16} /> : <AiOutlineBook size={16} />}
      <span class="text-sm">{pinned() ? "ピン済み" : "ピン"}</span>
    </button>
  );
}
