import { createEffect, createSignal, For, onMount, Show } from "solid-js";
import {
	createPost,
	getFollowingPosts,
	getPosts,
	getUserPosts,
} from "~/lib/api/posts";
import { getCurrentUser } from "~/lib/api/users";
import type { FeedItem } from "~/types/feed";
import { renderPost } from "../post/postDetail";
import Loading from "../ui/loading";

export default function Feed(props: {
	user?: string;
	feedType?: "all" | "following";
}) {
	const [posts, setPosts] = createSignal<FeedItem[]>([]);
	const [loading, setLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);
	const [text, setText] = createSignal("");
	const [isSubmitting, setIsSubmitting] = createSignal(false);

	const fetchPosts = async () => {
		setLoading(true);
		try {
			if (props.user) {
				const data = await getUserPosts(props.user);
				setPosts(data);
			} else if (props.feedType === "following") {
				const user = await getCurrentUser();
				const data = await getFollowingPosts(user.publickey);
				setPosts(data);
			} else {
				const data = await getPosts();
				setPosts(data);
			}
		} catch (err) {
			console.error("フィード取得中にエラー:", err);
			setError("フィードの読み込みに失敗しました。");
		} finally {
			setLoading(false);
		}
	};

	onMount(fetchPosts);
	createEffect(() => {
		void fetchPosts();
	});

	const handlePostSubmit = async (e: Event) => {
		e.preventDefault();
		if (!text().trim()) return;

		setIsSubmitting(true);
		try {
			await createPost(text().trim());
			setText("");
			await fetchPosts();
		} catch (err) {
			console.error("投稿中にエラー:", err);
			setError("投稿に失敗しました。");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div>
			<form
				onSubmit={handlePostSubmit}
				class="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center py-4 sm:py-8 px-2 sm:px-4"
			>
				<input
					type="text"
					class="input input-bordered w-full sm:flex-1 max-w-full sm:max-w-md md:max-w-lg"
					placeholder="Message..."
					value={text()}
					onInput={(e) => setText(e.currentTarget.value)}
					disabled={isSubmitting()}
				/>
				<button
					class="btn btn-primary w-full sm:w-auto px-6"
					type="submit"
					disabled={!text().trim() || isSubmitting()}
				>
					{isSubmitting() ? (
						<span class="loading loading-spinner loading-sm" />
					) : (
						"投稿"
					)}
				</button>
			</form>

			<Show when={error()}>
				{(e) => (
					<div class="alert alert-error md:w-1/2 md:mx-auto my-4">
						<span>{e()}</span>
					</div>
				)}
			</Show>

			<div class="md:w-1/2 md:mx-auto">
				<Show when={!loading()} fallback={<Loading />}>
					<Show
						when={posts().length > 0}
						fallback={<div class="text-center py-8">投稿がありません。</div>}
					>
						<For each={posts()}>{(post) => renderPost(post)}</For>
					</Show>
				</Show>
			</div>
		</div>
	);
}
