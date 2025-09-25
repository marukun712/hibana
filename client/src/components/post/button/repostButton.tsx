import type { PostEvent } from "@hibana/client";
import { AiOutlineEdit, AiOutlineRetweet } from "solid-icons/ai";
import { createSignal, onMount } from "solid-js";
import { useAuth } from "~/contexts/authContext";
import QuoteRepostModal from "../modal/quoteRepostModal";

export default function RepostButton(props: {
	target: string;
	originalPost: PostEvent;
}) {
	const { client: getClient, user } = useAuth();
	const publickey = user()?.publickey;
	const [reposted, setReposted] = createSignal(false);
	const [repostId, setRepostId] = createSignal<string | null>(null);
	const [showQuoteModal, setShowQuoteModal] = createSignal(false);

	async function repost() {
		const clientInstance = getClient();
		if (!clientInstance || !publickey) return;
		if (reposted()) {
			const id = repostId();
			if (!id) return;
			await clientInstance.event.repost.delete(publickey, id);
			setReposted(false);
			setRepostId(null);
		} else {
			const eventId = await clientInstance.event.repost.post(publickey, {
				target: props.originalPost.id,
			});
			if (eventId) {
				setReposted(true);
				setRepostId(eventId);
			}
		}
	}

	onMount(async () => {
		try {
			const clientInstance = getClient();
			if (!clientInstance || !publickey) return;
			const reposts = await clientInstance.event.repost.list({ publickey });
			const repostRecord = reposts.find(
				(r) => r.message.target === props.originalPost.id,
			);
			if (repostRecord) {
				setReposted(true);
				setRepostId(repostRecord.id);
			}
		} catch (err) {
			console.error("リポスト状態の確認中にエラー:", err);
		}
	});

	return (
		<div class="dropdown dropdown-end">
			<button
				tabindex={0}
				type="button"
				class={`btn btn-ghost btn-sm gap-2 ${
					reposted() ? "text-success" : "text-base-content/60"
				} hover:text-success`}
			>
				<AiOutlineRetweet size={16} />
				<span class="hidden sm:inline text-sm">
					{reposted() ? "リポスト済み" : "リポスト"}
				</span>
			</button>

			<ul
				tabindex={0}
				class="dropdown-content menu p-2 shadow bg-base-100 border border-base-300 rounded-lg w-48 z-10"
			>
				<li>
					<button
						type="submit"
						onClick={repost}
						class="flex gap-2 items-center"
					>
						<AiOutlineRetweet size={16} />
						<span>{reposted() ? "リポスト解除" : "リポスト"}</span>
					</button>
				</li>
				<li>
					<button
						type="submit"
						onClick={() => setShowQuoteModal(true)}
						class="flex gap-2 items-center"
					>
						<AiOutlineEdit size={16} />
						<span>引用リポスト</span>
					</button>
				</li>
			</ul>

			<QuoteRepostModal
				originalPost={props.originalPost}
				isOpen={showQuoteModal}
				onClose={() => setShowQuoteModal(false)}
				onSuccess={() => {
					console.log("引用リポストが完了しました");
				}}
			/>
		</div>
	);
}
