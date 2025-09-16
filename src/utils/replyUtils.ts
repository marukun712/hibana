import type { eventType } from "../../backend/schema/Event";
import type { profileType } from "../../backend/schema/Profile";

export type PostWithReplies = eventType & {
	user: profileType;
	replies?: PostWithReplies[];
	depth?: number;
};

export function buildReplyTree(
	posts: (eventType & { user: profileType })[],
): PostWithReplies[] {
	const postMap = new Map<string, PostWithReplies>();
	const rootPosts: PostWithReplies[] = [];

	posts.forEach((post) => {
		postMap.set(post.id, { ...post, replies: [] });
	});

	posts.forEach((post) => {
		const postWithReplies = postMap.get(post.id);
		if (!postWithReplies) return;

		if (post.event === "event.reply" && post.target) {
			// リプライの場合、親投稿の replies 配列に追加
			const parentPost = postMap.get(post.target.id);
			if (parentPost) {
				parentPost.replies = parentPost.replies || [];
				parentPost.replies.push(postWithReplies);
			} else {
				rootPosts.push(postWithReplies);
			}
		} else {
			rootPosts.push(postWithReplies);
		}
	});

	function sortReplies(post: PostWithReplies) {
		if (post.replies && post.replies.length > 0) {
			post.replies.sort(
				(a, b) =>
					new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
			);
			post.replies.forEach(sortReplies);
		}
	}

	rootPosts.forEach(sortReplies);

	return rootPosts.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	);
}
