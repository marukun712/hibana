import { FollowAPI } from "../events/follow";
import { PostAPI } from "../events/post";
import { ReplyAPI } from "../events/reply";
import { QuoteRepostAPI, RepostAPI } from "../events/repost";

export class FeedAPI {
	private repository: string;
	private postAPI: PostAPI;
	private replyAPI: ReplyAPI;
	private repostAPI: RepostAPI;
	private quoteRepostAPI: QuoteRepostAPI;
	private followAPI: FollowAPI;

	constructor(repository: string, publickey: string) {
		this.repository = repository;
		this.postAPI = new PostAPI(repository, publickey);
		this.replyAPI = new ReplyAPI(repository, publickey);
		this.repostAPI = new RepostAPI(repository, publickey);
		this.quoteRepostAPI = new QuoteRepostAPI(repository, publickey);
		this.followAPI = new FollowAPI(repository, publickey);
	}

	async getPosts() {
		const results = await Promise.all([
			this.postAPI.list(),
			this.repostAPI.list(),
			this.quoteRepostAPI.list(),
			this.replyAPI.list(),
		]);

		const allPosts = results.flat();
		return allPosts.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);
	}

	async getUserPosts(publickey: string) {
		const targetPostAPI = new PostAPI(this.repository, publickey);
		const targetReplyAPI = new ReplyAPI(this.repository, publickey);
		const targetRepostAPI = new RepostAPI(this.repository, publickey);
		const targetQuoteRepostAPI = new QuoteRepostAPI(this.repository, publickey);

		const results = await Promise.all([
			targetPostAPI.list(),
			targetReplyAPI.list(),
			targetRepostAPI.list(),
			targetQuoteRepostAPI.list(),
		]);

		const allPosts = results.flat();
		return allPosts.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);
	}

	async getFollowingPosts() {
		const follows = await this.followAPI.list();

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

	async getReplies(postId: string) {
		const replies = await this.replyAPI.list({ id: postId });
		return replies.sort(
			(a, b) =>
				new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
		);
	}

	async getPostById(postId: string) {
		return await this.postAPI.get(postId);
	}
}
