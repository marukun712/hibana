import { createSignal, For, onMount } from "solid-js";
import { getPosts, getUserPosts } from "~/lib/api/event";
import { buildReplyTree, type PostWithReplies } from "~/utils/replyUtils";
import Loading from "../ui/loading";
import PostWithRepliesComponent from "./postWithReplies";

export default function Feed(props: { user?: string }) {
	const [posts, setPosts] = createSignal<PostWithReplies[]>([]);

	onMount(async () => {
		const rawPosts = props.user
			? await getUserPosts(props.user)
			: await getPosts();
		const postsWithReplies = buildReplyTree(rawPosts);
		setPosts(postsWithReplies);
	});

	return (
		<div class="md:w-1/2 md:mx-auto">
			{posts().length > 0 ? (
				<For each={posts()}>
					{(post) => <PostWithRepliesComponent post={post} />}
				</For>
			) : (
				<Loading />
			)}
		</div>
	);
}
