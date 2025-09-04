import { createSignal, onMount, For } from "solid-js";
import Post from "./post";
import RepostedPost from "./repostedPost";
import QuoteRepost from "./quoteRepost";
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

            if (post.event === "event.repost" && post.target) {
              // リポストの場合、元の投稿を表示
              return (
                <RepostedPost
                  originalPost={{
                    id: post.target.id,
                    text: (post.target.message as Record<string, any>).content,
                    postedAt: new Date(post.target.timestamp).toLocaleString("ja-jp"),
                    user: post.target.user
                  }}
                  repostUser={post.user}
                  repostedAt={new Date(post.timestamp).toLocaleString("ja-jp")}
                />
              );
            } else if (post.event === "event.quote_repost" && post.target) {
              // 引用リポストの場合
              return (
                <QuoteRepost
                  quoteText={data.content}
                  originalPost={{
                    id: post.target.id,
                    text: (post.target.message as Record<string, any>).content,
                    postedAt: new Date(post.target.timestamp).toLocaleString("ja-jp"),
                    user: post.target.user
                  }}
                  quoteUser={post.user}
                  quotedAt={new Date(post.timestamp).toLocaleString("ja-jp")}
                  quotePostId={post.id}
                />
              );
            } else {
              // 通常の投稿の場合
              return (
                <Post
                  id={post.id}
                  text={data.content}
                  postedAt={new Date(post.timestamp).toLocaleString("ja-jp")}
                  user={post.user}
                />
              );
            }
          }}
        </For>
      ) : (
        <Loading />
      )}
    </div>
  );
}
