import { createSignal } from "solid-js";
import { postEvent } from "~/lib/api/event";

export default function PostForm() {
  const [text, setText] = createSignal("");

  async function post(text: string) {
    if (!text.trim()) return;

    await postEvent("event.post", { content: text });

    setText("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        post(text());
      }}
      class="gap-3 flex justify-center py-8"
    >
      <input
        type="text"
        class="input input-bordered w-full max-w-md"
        placeholder="Message..."
        value={text()}
        onChange={(e) => setText(e.target.value)}
      />

      <button class="btn btn-primary" type="submit">
        投稿
      </button>
    </form>
  );
}
