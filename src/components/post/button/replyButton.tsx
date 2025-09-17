import { AiOutlineComment } from "solid-icons/ai";
import { createSignal } from "solid-js";
import type { profileType } from "../../../../backend/schema/Profile";
import ReplyModal from "../modal/replyModal";

export default function ReplyButton(props: {
	target: string;
	originalPost: {
		id: string;
		text: string;
		postedAt: string;
		user: profileType;
	};
}) {
	const [showReplyModal, setShowReplyModal] = createSignal(false);

	return (
		<div class="relative">
			<button
				type="button"
				onClick={(e) => {
					e.preventDefault();
					setShowReplyModal(true);
				}}
				class="btn btn-ghost btn-sm gap-1 sm:gap-2 text-base-content/60 hover:text-primary"
			>
				<AiOutlineComment size={16} />
				<span class="hidden sm:inline text-sm">リプライ</span>
			</button>
			<ReplyModal
				originalPost={props.originalPost}
				isOpen={showReplyModal}
				onClose={() => setShowReplyModal(false)}
				onSuccess={() => {
					console.log("リプライが完了しました");
				}}
			/>
		</div>
	);
}
