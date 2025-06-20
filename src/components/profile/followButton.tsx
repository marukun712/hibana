import { createSignal } from "solid-js";
import { postEvent } from "~/lib/api/event";

export default function FollowButton(props: { target: string }) {
  async function post() {
    await postEvent("event.follow", { target: props.target });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        post();
      }}
      class="space-x-4 flex justify-center py-12"
    >
      <button class="btn btn-primary" type="submit">
        Follow
      </button>
    </form>
  );
}
