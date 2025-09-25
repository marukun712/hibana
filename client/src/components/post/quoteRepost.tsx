import { AiOutlineEdit } from "solid-icons/ai";
import type { PostEvent, QuoteRepostEvent } from "~/lib/client";
import Post from "./post";

export default function QuoteRepost(props: {
	quote: QuoteRepostEvent;
	originalPost: PostEvent;
}) {
	return (
		<div class="card bg-base-100 border border-base-300 p-4 mb-4 hover:shadow-md transition-shadow">
			<div class="flex items-center gap-2 mb-4 text-sm text-base-content/60">
				<AiOutlineEdit size={16} />
				<a
					href={`/user?publickey=${props.quote.user.publickey}`}
					class="hover:underline font-medium"
				>
					{props.quote.user.username}
				</a>
				<span>が引用リポスト</span>
				<span>
					{new Date(props.originalPost.timestamp).toLocaleTimeString()}
				</span>
			</div>

			<div class="flex gap-4 mb-4">
				<div class="avatar">
					<div class="w-12 h-12 rounded-full">
						<a href={`/user?publickey=${props.quote.user.publickey}`}>
							<img src={props.quote.user.icon} alt="User avatar" />
						</a>
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 mb-1">
						<a
							href={`/user?publickey=${props.quote.user.publickey}`}
							class="font-bold hover:underline"
						>
							{props.quote.user.username}
						</a>
						<span class="text-sm text-base-content/60">
							{props.quote.timestamp}
						</span>
					</div>
					<p>{props.quote.message.content}</p>
				</div>
			</div>
			<Post post={props.originalPost} />
		</div>
	);
}
