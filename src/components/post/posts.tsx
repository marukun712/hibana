import { createSignal, onMount, For } from "solid-js";
import Post from "./post";
import { getPosts } from "~/lib/api/post";
import { defaultEvent } from "../../../@types";

export default function Posts() {
  const [posts, setPosts] = createSignal<defaultEvent[]>([]);

  onMount(async () => {
    const posts = await getPosts();

    setPosts(posts);
  });

  return (
    <div class="space-y-6 w-1/3 mx-auto">
      <For each={posts()}>
        {(post) => {
          return <Post text={post.text} />;
        }}
      </For>
    </div>
  );
}
