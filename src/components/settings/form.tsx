import { createSignal } from "solid-js";
import { db } from "~/lib/db/rxdb";

export default function Form() {
  const [serverURL, setServerURL] = createSignal("");

  async function registerServer(serverURL: string) {
    if (!serverURL.trim()) return;

    await db.servers.insert({ url: serverURL });

    setServerURL("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        registerServer(serverURL());
      }}
      class="space-x-4 flex justify-center py-12"
    >
      <input
        type="text"
        class="input input-neutral"
        placeholder="Enter server URL"
        value={serverURL()}
        onChange={(e) => setServerURL(e.target.value)}
      />
      <button class="btn btn-primary" type="submit">
        Register
      </button>
    </form>
  );
}
