import { createSignal, onMount, For } from "solid-js";
import PostWithRepliesComponent from "./postWithReplies";
import { getPosts, getUserPosts } from "~/lib/api/event";
import Loading from "../ui/loading";
import { eventType } from "../../../backend/schema/Event";
import { profileType } from "../../../backend/schema/Profile";
import { buildReplyTree, PostWithReplies } from "~/lib/utils/replyUtils";

export default function Feed(props: { user?: string }) {
  const [posts, setPosts] = createSignal<PostWithReplies[]>([]);

  onMount(async () => {
    const rawPosts = props.user
      ? await getUserPosts(props.user)
      : await getPosts();
    
    // リプライツリーを構築
    const postsWithReplies = buildReplyTree(rawPosts);
    setPosts(postsWithReplies);
  });

  return (
    <div class="md:w-1/2 md:mx-auto">
      {posts().length > 0 ? (
        <For each={posts()}>
          {(post) => (
            <PostWithRepliesComponent post={post} />
          )}
        </For>
      ) : (
        <Loading />
      )}
    </div>
  );
}
