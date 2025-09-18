import { useSearchParams } from "@solidjs/router";
import { createSignal, For, onMount, Show } from "solid-js";
import { createReply, getPostById, getReplies } from "~/lib/api/posts";
import type { FeedItem } from "~/types/feed";
import {
	isPostEvent,
	isQuoteRepostEvent,
	isReplyEvent,
	isRepostEvent,
} from "~/types/feed";
import Loading from "../ui/loading";
import Post from "./post";
import QuoteRepost from "./quoteRepost";
import Reply from "./reply";
import RepostedPost from "./repostedPost";

export const renderPost = (item: FeedItem) => {
	if (isPostEvent(item)) {
		return <Post post={item} />;
	}
	if (isRepostEvent(item)) {
		return <RepostedPost originalPost={item.target} repost={item} />;
	}
	if (isReplyEvent(item)) {
		return <Reply reply={item} />;
	}
	if (isQuoteRepostEvent(item)) {
		return <QuoteRepost quote={item} originalPost={item.target} />;
	}
	return null;
};

export default function PostDetail() {
	const [searchParams] = useSearchParams();
	const [post, setPost] = createSignal<FeedItem | null>(null);
	const [replies, setReplies] = createSignal<FeedItem[]>([]);
	const [error, setError] = createSignal<string | null>(null);
	const [replyText, setReplyText] = createSignal("");
	const [isSubmittingReply, setIsSubmittingReply] = createSignal(false);

	onMount(async () => {
		const postId = searchParams.id as string;
		if (!postId) {
			setError("投稿IDが指定されていません。");
			return;
		}
		try {
			const postData = await getPostById(postId);
			setPost(postData);
			const repliesData = await getReplies(postId);
			setReplies(repliesData);
		} catch (err) {
			console.error("投稿の取得中にエラーが発生しました:", err);
			setError("投稿の読み込みに失敗しました。");
		}
	});

	const handleReplySubmit = async (e: Event) => {
		e.preventDefault();
		const currentPost = post();
		if (!replyText().trim() || !currentPost) return;

		setIsSubmittingReply(true);
		try {
			await createReply(currentPost.id, replyText().trim());
			setReplyText("");
			const repliesData = await getReplies(currentPost.id);
			setReplies(repliesData);
		} catch (error) {
			console.error("リプライ中にエラーが発生しました:", error);
		} finally {
			setIsSubmittingReply(false);
		}
	};

	return (
		<div class="my-4">
			<Show when={error()}>
				{(e) => (
					<div class="alert alert-error">
						<span>{e()}</span>
					</div>
				)}
			</Show>

			<Show when={post()} fallback={<Loading />}>
				{(p) => (
					<>
						{renderPost(p())}

						<div class="mt-6 border-t border-base-300 pt-6">
							<h3 class="text-lg font-bold mb-4 px-4">
								{p().user.username} にリプライ
							</h3>
							<form onSubmit={handleReplySubmit} class="px-4 mb-6">
								<textarea
									value={replyText()}
									onInput={(e) => setReplyText(e.currentTarget.value)}
									placeholder="リプライを入力..."
									class="textarea textarea-bordered w-full min-h-24 mb-4 resize-none"
									disabled={isSubmittingReply()}
								/>
								<div class="flex justify-end">
									<button
										type="submit"
										class="btn btn-primary"
										disabled={!replyText().trim() || isSubmittingReply()}
									>
										{isSubmittingReply() ? (
											<span class="loading loading-spinner loading-sm" />
										) : (
											"リプライ"
										)}
									</button>
								</div>
							</form>
						</div>

						<Show when={replies().length > 0}>
							<div class="mt-6">
								<h3 class="text-lg font-bold mb-4 px-4">リプライ</h3>
								<For each={replies()}>
									{(reply) => isReplyEvent(reply) && <Reply reply={reply} />}
								</For>
							</div>
						</Show>
					</>
				)}
			</Show>
		</div>
	);
}
