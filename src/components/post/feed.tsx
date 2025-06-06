import { createSignal, onMount, For } from "solid-js";
import Post from "./post";
import { getPosts, getUserPosts } from "~/lib/api/event";
import Loading from "../ui/loading";
import { eventType } from "../../../backend/schema/Event";
import { profileType } from "../../../backend/schema/Profile";

export default function Feed(props: { user?: string }) {
  const [posts, setPosts] = createSignal<(eventType & { user: profileType })[]>(
    []
  );

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
            const data = post.message as Record<string, any>;

            return (
              <Post
                id={post.id}
                text={data.content}
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
