import { For } from "solid-js";
import Post from "./post";
import RepostedPost from "./repostedPost";
import QuoteRepost from "./quoteRepost";
import Reply from "./reply";
import { PostWithReplies } from "~/lib/utils/replyUtils";

export default function PostWithRepliesComponent(props: {
  post: PostWithReplies;
  depth?: number;
}) {
  const depth = props.depth || 0;
  const maxDepth = 3;

  function renderPost(post: PostWithReplies, currentDepth: number) {
    const data = post.message as Record<string, any>;
    
    if (post.event === "event.repost" && post.target) {
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
    } else if (post.event === "event.reply" && post.target && currentDepth > 0) {
      return (
        <Reply
          id={post.id}
          text={data.content}
          postedAt={new Date(post.timestamp).toLocaleString("ja-jp")}
          user={post.user}
          target={{
            id: post.target.id,
            text: (post.target.message as Record<string, any>).content,
            postedAt: new Date(post.target.timestamp).toLocaleString("ja-jp"),
            user: post.target.user
          }}
          depth={currentDepth}
        />
      );
    } else {
      return (
        <Post
          id={post.id}
          text={data.content}
          postedAt={new Date(post.timestamp).toLocaleString("ja-jp")}
          user={post.user}
        />
      );
    }
  }

  return (
    <div>
      {renderPost(props.post, depth)}
      
      {/* ネストしたリプライを表示 */}
      {props.post.replies && props.post.replies.length > 0 && depth < maxDepth && (
        <div class="ml-4">
          <For each={props.post.replies}>
            {(reply) => (
              <PostWithRepliesComponent 
                post={reply} 
                depth={depth + 1}
              />
            )}
          </For>
        </div>
      )}
      
      {/* 最大深度に達した場合の表示 */}
      {props.post.replies && props.post.replies.length > 0 && depth >= maxDepth && (
        <div class="ml-4 p-2 text-sm text-base-content/60 border-l border-base-300 pl-4">
          <span>さらに {props.post.replies.length} 件のリプライがあります</span>
        </div>
      )}
    </div>
  );
}