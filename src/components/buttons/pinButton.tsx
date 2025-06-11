import { createSignal } from "solid-js";
import { postEvent } from "~/lib/api/event";

export default function PinButton(props: { target: string }) {
  const [privateKey, setPrivateKey] = createSignal("");

  async function post() {
    await postEvent("event.pin", { target: props.target }, privateKey());

    setPrivateKey("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        post();
      }}
      class="space-x-4 flex justify-center py-12"
    >
      <input
        type="text"
        class="input input-neutral"
        placeholder="Enter your private key"
        value={privateKey()}
        onChange={(e) => setPrivateKey(e.target.value)}
      />

      <button class="btn btn-primary" type="submit">
        Pin
      </button>
    </form>
  );
}
