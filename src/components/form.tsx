import { createSignal } from "solid-js";
import { db } from "~/lib/db/rxdb";

export default function PostForm() {
  const [text, setText] = createSignal("");

  async function post(text: string) {
    if (!text.trim()) return;

    const timestamp = new Date().toISOString();

    const obj = {
      text,
      timestamp,
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(obj));
    const hash = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    await db.posts.insert({
      id: hashHex,
      text,
      timestamp,
    });
    setText("");
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
        value={text()}
        onChange={(e) => setText(e.target.value)}
      />
      <button class="btn btn-primary" type="submit">
        POST
      </button>
    </form>
  );
}
