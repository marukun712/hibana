import { AiOutlineRetweet } from "solid-icons/ai";
import type { PostData, RepostEvent } from "~/types/feed";
import Post from "./post";

export default function RepostedPost(props: {
  originalPost: PostData;
  repost: RepostEvent;
}) {
  return (
    <div class="card bg-base-100 border border-base-300 p-4 mb-4 hover:shadow-md transition-shadow">
      <div class="flex items-center gap-2 mb-4 text-sm text-base-content/60">
        <AiOutlineRetweet size={16} />
        <a
          href={`/user?publickey=${props.repost.user.publickey}`}
          class="hover:underline font-medium"
        >
          {props.repost.user.username}
        </a>
        <span>がリポスト</span>
        <span>{new Date(props.repost.timestamp).toLocaleTimeString()}</span>
      </div>

      <Post post={props.originalPost} />
    </div>
  );
}
