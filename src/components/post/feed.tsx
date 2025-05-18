import { createSignal, onMount, For } from "solid-js";
import Post from "./post";
import { getPosts, getUserPosts } from "~/lib/api/event";
import { defaultEvent } from "../../../backend/db/schema";
import { profileType } from "../../../backend/lib/ipfs/helia";
import Loading from "../ui/loading";

export default function Feed(props: { user?: string }) {
  const [posts, setPosts] = createSignal<
    (defaultEvent & { user: profileType })[]
  >([]);

  onMount(async () => {
    const posts = props.user
      ? await getUserPosts(props.user)
      : await getPosts();
    setPosts(posts);
  });

  return (
    <div class="md:w-1/2 md:mx-auto">
      {posts().length > 0 ? (
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
      ) : (
        <Loading />
      )}
    </div>
  );
}
