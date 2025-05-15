import { createSignal, onMount, For } from "solid-js";
import Post from "./post";
import { getPosts } from "~/lib/api/post";
import { defaultEvent } from "../../../backend/db/schema";

export default function Posts() {
  const [posts, setPosts] = createSignal<defaultEvent[]>([]);

  onMount(async () => {
    const posts = await getPosts();
  });

  return (
    <div class="space-y-6 w-1/3 mx-auto">
      <For each={posts()}>
        {(post) => {
          return <></>;
        }}
      </For>
    </div>
  );
}
