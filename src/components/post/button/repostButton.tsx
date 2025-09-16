import { debounce } from "@solid-primitives/scheduled";
import { AiOutlineEdit, AiOutlineRetweet } from "solid-icons/ai";
import { createSignal, onMount, Show } from "solid-js";
import { checkRepostStatus, repostPost, unrepostPost } from "~/lib/api/social";
import type { profileType } from "../../../../backend/schema/Profile";
import QuoteRepostModal from "../modal/quoteRepostModal";

export default function RepostButton(props: {
	target: string;
	originalPost: {
		id: string;
		text: string;
		postedAt: string;
		user: profileType;
	};
}) {
	const [reposted, setReposted] = createSignal(false);
	const [repostId, setRepostId] = createSignal<string | null>(null);
	const [showMenu, setShowMenu] = createSignal(false);
	const [showQuoteModal, setShowQuoteModal] = createSignal(false);

	async function repost() {
		const eventId = await repostPost(props.originalPost.id);
		if (eventId) {
			setReposted(true);
			setRepostId(eventId);
		}
	}

	async function unrepost() {
		const id = repostId();
		if (!id) return;
		await unrepostPost(id);
		setReposted(false);
		setRepostId(null);
	}

	const repostDebounced = debounce(repost, 300);
	const unrepostDebounced = debounce(unrepost, 300);

	onMount(async () => {
		const result = await checkRepostStatus(props.originalPost.id);
		if (result.isReposted) {
			setReposted(true);
			setRepostId(result.id);
		}
	});

	return (
		<div class="relative">
			<button
				type="button"
				onClick={(e) => {
					e.preventDefault();
					if (reposted()) {
						unrepostDebounced();
					} else {
						setShowMenu(!showMenu());
					}
				}}
				class={`btn btn-sm btn-ghost gap-1 ${
					reposted() ? "text-success" : "text-base-content/60"
				} hover:text-success`}
			>
				<AiOutlineRetweet size={16} />
				<span class="text-sm">{reposted() ? "リポスト済み" : "リポスト"}</span>
			</button>

			<Show when={showMenu()}>
				<div class="absolute bottom-full left-0 mb-2 bg-base-100 border border-base-300 rounded-lg shadow-lg z-10 min-w-48">
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							repostDebounced();
							setShowMenu(false);
						}}
						class="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 rounded-t-lg"
					>
						<AiOutlineRetweet size={16} />
						<span>リポスト</span>
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							setShowQuoteModal(true);
							setShowMenu(false);
						}}
						class="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 rounded-b-lg"
					>
						<AiOutlineEdit size={16} />
						<span>引用リポスト</span>
					</button>
				</div>
			</Show>

			<Show when={showMenu()}>
				<div
					class="fixed inset-0 z-0"
					onClick={() => setShowMenu(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setShowMenu(false);
						}
					}}
					role="button"
					tabIndex={0}
					aria-label="メニューを閉じる"
				/>
			</Show>

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
