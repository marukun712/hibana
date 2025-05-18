import { createSignal } from "solid-js";
import { updateProfile } from "~/lib/api/users";

export default function ProfileForm() {
  const [username, setUsername] = createSignal("");
  const [icon, setIcon] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [repository, setRepository] = createSignal("");
  const [privateKey, setPrivateKey] = createSignal("");

  async function update() {
    await updateProfile(
      username(),
      icon(),
      description(),
      repository(),
      privateKey()
    );

    setUsername("");
    setIcon("");
    setDescription("");
    setRepository("");
    setPrivateKey("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        update();
      }}
      class="flex flex-col gap-4 p-6 max-w-md mx-auto"
    >
      <input
        type="text"
        class="input input-neutral"
        placeholder="Enter your private key"
        value={privateKey()}
        onInput={(e) => setPrivateKey(e.currentTarget.value)}
      />

      <input
        type="text"
        class="input input-neutral"
        placeholder="Username"
        value={username()}
        onInput={(e) => setUsername(e.currentTarget.value)}
      />

      <input
        type="text"
        class="input input-neutral"
        placeholder="Icon URL"
        value={icon()}
        onInput={(e) => setIcon(e.currentTarget.value)}
      />

      <input
        type="text"
        class="input input-neutral"
        placeholder="Description"
        value={description()}
        onInput={(e) => setDescription(e.currentTarget.value)}
      />

      <input
        type="text"
        class="input input-neutral"
        placeholder="Repository URL"
        value={repository()}
        onInput={(e) => setRepository(e.currentTarget.value)}
      />

      <button class="btn btn-primary" type="submit">
        Update Profile
      </button>
    </form>
  );
}
