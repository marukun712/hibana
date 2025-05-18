import { createSignal, onMount, For } from "solid-js";
import Post from "./post";
import { getPosts } from "~/lib/api/event";
import { defaultEvent } from "../../../backend/db/schema";
import { profileType } from "../../../backend/lib/ipfs/helia";

export default function Posts() {
  const [posts, setPosts] = createSignal<
    (defaultEvent & { user: profileType })[]
  >([]);

  onMount(async () => {
    const posts = await getPosts();
    setPosts(posts);
  });

  return (
    <div class="space-y-6 w-1/3 mx-auto">
      <For each={posts()}>
        {(post) => {
          return (
            <Post
              text={post.message.content}
              postedAt={new Date(post.timestamp).toLocaleString("ja-jp")}
              user={post.user}
            />
          );
        }}
      </For>
    </div>
  );
}
