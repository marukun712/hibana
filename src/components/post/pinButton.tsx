import { createSignal, onMount } from "solid-js";
import { isPinned, postEvent } from "~/lib/api/event";

export default function PinButton(props: { target: string }) {
  const [pinned, setPinned] = createSignal(false);

  async function post() {
    await postEvent("event.pin", { target: props.target });
  }

  onMount(async () => {
    const publickey = await window.nostr.getPublicKey();
    const isPinnedResult = await isPinned(publickey, props.target);
    setPinned(isPinnedResult);
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        post();
      }}
      class="space-x-4 flex justify-center py-12"
    >
      <button class="btn btn-primary" type="submit">
        {pinned() ? "Unpin" : "Pin"}
      </button>
    </form>
  );
}
