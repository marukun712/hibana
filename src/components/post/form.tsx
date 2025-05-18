import { createSignal } from "solid-js";
import { postEvent } from "~/lib/api/event";

export default function PostForm() {
  const [text, setText] = createSignal("");
  const [privateKey, setPrivateKey] = createSignal("");

  async function post(text: string) {
    if (!text.trim()) return;

    await postEvent("event.post", { content: text }, privateKey());

    setText("");
    setPrivateKey("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        post(text());
      }}
      class="space-x-4 flex justify-center py-12"
    >
      <input
        type="text"
        class="input input-neutral"
        placeholder="Message..."
        value={text()}
        onChange={(e) => setText(e.target.value)}
      />

      <input
        type="text"
        class="input input-neutral"
        placeholder="Enter your private key"
        value={privateKey()}
        onChange={(e) => setPrivateKey(e.target.value)}
      />

      <button class="btn btn-primary" type="submit">
        POST
      </button>
    </form>
  );
}
