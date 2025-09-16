import { AiOutlineRetweet } from "solid-icons/ai";
import type { profileType } from "../../../backend/schema/Profile";
import Post from "./post";

export default function RepostedPost(props: {
	originalPost: {
		id: string;
		text: string;
		postedAt: string;
		user: profileType;
	};
	repostUser: profileType;
	repostedAt: string;
}) {
	return (
		<div class="bg-base-100 rounded-xl border border-base-300 p-4 mb-4 hover:shadow-md transition-all">
			<div class="flex items-center gap-2 mb-3 text-sm text-base-content/60">
				<AiOutlineRetweet size={16} />
				<a
					href={`/user?publickey=${props.repostUser.publickey}`}
					class="hover:underline font-medium"
				>
					{props.repostUser.username}
				</a>
				<span>がリポスト</span>
				<span>{props.repostedAt}</span>
			</div>

			<div class="ml-6 border-l-2 border-base-300 pl-4">
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
