import { createSignal, For, onMount } from "solid-js";
import { getFollowingPosts, getPosts, getUserPosts } from "~/lib/api/event";
import { getCurrentUser } from "~/lib/api/users";
import type { FeedItems } from "~/types/feed";
import { isPostEvent, isQuoteRepostEvent, isRepostEvent } from "~/types/feed";
import Post from "../post/post";
import QuoteRepost from "../post/quoteRepost";
import RepostedPost from "../post/repostedPost";
import Loading from "../ui/loading";

export default function Feed(props: {
	user?: string;
	feedType?: "all" | "following";
}) {
	const [posts, setPosts] = createSignal<FeedItems>([]);

	onMount(async () => {
		if (props.user) {
			const posts = await getUserPosts(props.user);
			setPosts(posts as FeedItems);
			return;
		}
		if (props.feedType === "following") {
			const user = await getCurrentUser();
			const posts = await getFollowingPosts(user.publickey);
			setPosts(posts as FeedItems);
			return;
		}
		const posts = await getPosts();
		setPosts(posts as FeedItems);
	});

	return (
		<div class="md:w-1/2 md:mx-auto">
			{posts().length > 0 ? (
				<For each={posts()}>
					{(post) => {
						if (isPostEvent(post)) {
							return (
								<Post
									id={post.id}
									text={post.message.content}
									postedAt={post.timestamp}
									user={post.user}
								/>
							);
						}
						if (isRepostEvent(post)) {
							return (
								<RepostedPost
									originalPost={post.target}
									repostUser={post.user}
									repostedAt={post.timestamp}
								/>
							);
						}
						if (isQuoteRepostEvent(post)) {
							return (
								<QuoteRepost
									quoteText={post.message.content}
									originalPost={post.target}
									quoteUser={post.user}
									quotedAt={post.timestamp}
									quotePostId={post.id}
								/>
							);
						}
						return null;
					}}
				</For>
			) : (
				<Loading />
			)}
		</div>
	);
}
