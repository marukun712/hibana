import { AiOutlineEdit } from "solid-icons/ai";
import type { profileType } from "../../../backend/schema/Profile";
import Post from "./post";

export default function QuoteRepost(props: {
	quoteText: string;
	originalPost: {
		id: string;
		text: string;
		postedAt: string;
		user: profileType;
	};
	quoteUser: profileType;
	quotedAt: string;
	quotePostId: string;
}) {
	return (
		<div class="bg-base-100 rounded-xl border border-base-300 p-4 mb-4 hover:shadow-md transition-all">
			<div class="flex items-center gap-2 mb-3 text-sm text-base-content/60">
				<AiOutlineEdit size={16} />
				<a
					href={`/user?publickey=${props.quoteUser.publickey}`}
					class="hover:underline font-medium"
				>
					{props.quoteUser.username}
				</a>
				<span>が引用リポスト</span>
				<span>{props.quotedAt}</span>
			</div>

			{/* 引用コメント */}
			<div class="flex gap-3 mb-4">
				<div class="avatar">
					<div class="w-12 h-12 rounded-full">
						<a href={`/user?publickey=${props.quoteUser.publickey}`}>
							<img src={props.quoteUser.icon} alt="User avatar" />
						</a>
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 mb-1">
						<a
							href={`/user?publickey=${props.quoteUser.publickey}`}
							class="font-bold hover:underline"
						>
							{props.quoteUser.username}
						</a>
						<span class="text-sm text-base-content/60">{props.quotedAt}</span>
					</div>
					<p class="text-base leading-relaxed">{props.quoteText}</p>
				</div>
			</div>

			{/* 引用された元の投稿 */}
			<div class="ml-6 border border-base-300 rounded-lg overflow-hidden">
				<Post
					id={props.originalPost.id}
					text={props.originalPost.text}
					postedAt={props.originalPost.postedAt}
					user={props.originalPost.user}
				/>
			</div>
		</div>
	);
}
