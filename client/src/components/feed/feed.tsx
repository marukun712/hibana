import type { baseSchemaType } from "@hibana/schema";
import { createEffect, createSignal, For, onMount, Show } from "solid-js";
import { useAuth } from "~/contexts/authContext";
import { renderPost } from "../post/postDetail";
import Loading from "../ui/loading";

export default function Feed(props: {
	user?: string;
	feedType?: "all" | "following";
}) {
	const { client: getClient, user } = useAuth();
	const publickey = user()?.publickey;
	const [posts, setPosts] = createSignal<baseSchemaType[]>([]);
	const [loading, setLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);
	const [text, setText] = createSignal("");
	const [isSubmitting, setIsSubmitting] = createSignal(false);

	const fetchPosts = async () => {
		setLoading(true);
		try {
			const clientInstance = getClient();
			if (!clientInstance) {
				setError("クライアントが初期化されていません。");
				return;
			}
			if (props.user) {
				const data = await clientInstance.feed.getUserPosts(props.user);
				setPosts(data);
			} else if (props.feedType === "following") {
				if (!publickey) {
					setError("認証が必要です。");
					return;
				}
				const data = await clientInstance.feed.getFollowingPosts(publickey);
				setPosts(data);
			} else {
				const data = await clientInstance.feed.getPosts();
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
			const clientInstance = getClient();
			if (!clientInstance) {
				setError("クライアントが初期化されていません。");
				return;
			}
			if (!publickey) {
				setError("認証が必要です。");
				return;
			}
			await clientInstance.event.post.post(publickey, {
				content: text().trim(),
			});
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
