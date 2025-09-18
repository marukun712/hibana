import { createSignal, For, onMount } from "solid-js";
import { getFollowingPosts, getPosts, getUserPosts } from "~/lib/api/posts";
import { getCurrentUser } from "~/lib/api/users";
import type { FeedItems } from "~/types/feed";
import { renderPost } from "../post/postDetail";
import Loading from "../ui/loading";

export default function Feed(props: {
	user?: string;
	feedType?: "all" | "following";
}) {
	const [posts, setPosts] = createSignal<FeedItems>([]);

	onMount(async () => {
		if (props.user) {
			const posts = await getUserPosts(props.user);
			setPosts(posts);
			return;
		}
		if (props.feedType === "following") {
			const user = await getCurrentUser();
			const posts = await getFollowingPosts(user.publickey);
			setPosts(posts);
			return;
		}
		const posts = await getPosts();
		setPosts(posts);
	});

	return (
		<div class="md:w-1/2 md:mx-auto">
			{posts().length > 0 ? (
				<For each={posts()}>{(post) => renderPost(post)}</For>
			) : (
				<Loading />
			)}
		</div>
	);
}
