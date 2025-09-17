import { createSignal, For, onMount } from "solid-js";
import { getPosts, getUserPosts } from "~/lib/api/event";
import Loading from "../ui/loading";

type Post = Awaited<ReturnType<typeof getPosts>>;

export default function Feed(props: { user?: string }) {
	const [posts, setPosts] = createSignal<Post>([]);
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
					{(post) => }
				</For>
			) : (
				<Loading />
			)}
		</div>
	);
}
