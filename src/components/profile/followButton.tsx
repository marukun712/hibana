import { createSignal, onMount } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import { postEvent, deleteEvent } from "~/lib/api/event";
import { getCurrentUser, isFollowed } from "~/lib/api/users";

export default function FollowButton(props: { target: string }) {
  const [followed, setFollowed] = createSignal(false);
  const [followedId, setFollowedId] = createSignal<string | null>(null);

  async function post() {
    const id = await postEvent("event.follow", { target: props.target });
    if (id) {
      setFollowed(true);
      setFollowedId(id);
    }
  }

  async function remove() {
    const id = followedId();
    if (!id) return;
    await deleteEvent(id);
    setFollowed(false);
    setFollowedId(null);
  }

  const postDebounced = debounce(post, 300);
  const removeDebounced = debounce(remove, 300);

  onMount(async () => {
    const user = await getCurrentUser();
    const publickey = user.publickey;
    const result = await isFollowed(publickey, props.target);
    if (result.isFollowed) {
      setFollowed(true);
      setFollowedId(result.id);
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (followed()) {
          removeDebounced();
        } else {
          postDebounced();
        }
      }}
      class="space-x-4 flex justify-center py-12"
    >
      <button class="btn btn-primary" type="submit">
        {followed() ? "Following" : "Follow"}
      </button>
    </form>
  );
}
