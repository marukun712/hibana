import { FollowAPI } from "../events/follow";
import { PostAPI } from "../events/post";
import { ReplyAPI } from "../events/reply";
import { QuoteRepostAPI, RepostAPI } from "../events/repost";

export class FeedAPI {
	private postAPI: PostAPI;
	private replyAPI: ReplyAPI;
	private repostAPI: RepostAPI;
	private quoteRepostAPI: QuoteRepostAPI;
	private followAPI: FollowAPI;

	constructor(repository: string) {
		this.postAPI = new PostAPI(repository);
		this.replyAPI = new ReplyAPI(repository);
		this.repostAPI = new RepostAPI(repository);
		this.quoteRepostAPI = new QuoteRepostAPI(repository);
		this.followAPI = new FollowAPI(repository);
	}

	async getPosts(params?: { publickey?: string }) {
		const results = await Promise.all([
			this.postAPI.list(params),
			this.repostAPI.list(params),
			this.quoteRepostAPI.list(params),
			this.replyAPI.list(params),
		]);

		const allPosts = results.flat();
		return allPosts.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);
	}

	async getUserPosts(publickey: string) {
		const results = await Promise.all([
			this.postAPI.list({ publickey }),
			this.replyAPI.list({ publickey }),
			this.repostAPI.list({ publickey }),
			this.quoteRepostAPI.list({ publickey }),
		]);

		const allPosts = results.flat();
		return allPosts.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);
	}

	async getFollowingPosts(publickey: string) {
		const follows = await this.followAPI.list({ publickey });

		const posts = await Promise.all(
			follows.map((follow) =>
				follow.message.target ? this.getUserPosts(follow.message.target) : [],
			),
		);

		return posts
			.flat()
			.sort(
				(a, b) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
			);
	}

	async getReplies(postId: string, params?: { publickey?: string }) {
		const replies = await this.replyAPI.list({ id: postId, ...params });
		return replies.sort(
			(a, b) =>
				new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
		);
	}

	async getPostById(postId: string) {
		return await this.postAPI.get(postId);
	}
}
