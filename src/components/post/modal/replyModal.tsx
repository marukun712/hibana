import { AiOutlineClose } from "solid-icons/ai";
import { createSignal, Show } from "solid-js";
import { createReply } from "~/lib/api/posts";
import type { profileType } from "../../../../backend/schema/Profile";

export default function ReplyModal(props: {
	originalPost: {
		id: string;
		text: string;
		postedAt: string;
		user: profileType;
	};
	isOpen: () => boolean;
	onClose: () => void;
	onSuccess: () => void;
}) {
	const [text, setText] = createSignal("");
	const [posting, setPosting] = createSignal(false);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (!text().trim()) return;

		setPosting(true);
		try {
			await createReply(props.originalPost.id, text().trim());
			setText("");
			props.onSuccess();
			props.onClose();
		} catch (error) {
			console.error("リプライ中にエラーが発生しました:", error);
		} finally {
			setPosting(false);
		}
	};

	const handleClose = () => {
		setText("");
		props.onClose();
	};

	return (
		<Show when={props.isOpen()}>
			<div class="fixed inset-0 z-50 flex items-center justify-center">
				<button
					type="submit"
					class="fixed inset-0 bg-black bg-opacity-50"
					onClick={handleClose}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							handleClose();
						}
					}}
					tabIndex={0}
					aria-label="モーダルを閉じる"
				/>
				<div class="relative bg-base-100 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
					<div class="flex items-center justify-between p-4 border-b border-base-300">
						<h2 class="text-lg font-bold">リプライ</h2>
						<button
							type="button"
							onClick={handleClose}
							class="btn btn-sm btn-ghost btn-circle"
						>
							<AiOutlineClose size={16} />
						</button>
					</div>

					<form onSubmit={handleSubmit} class="p-4">
						<div class="border border-base-300 rounded-lg p-3 mb-4 bg-base-50">
							<div class="flex gap-3">
								<div class="avatar">
									<div class="w-8 h-8 rounded-full">
										<img src={props.originalPost.user.icon} alt="User avatar" />
									</div>
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 mb-1">
										<span class="font-bold text-sm">
											{props.originalPost.user.username}
										</span>
										<span class="text-xs text-base-content/60">
											{props.originalPost.postedAt}
										</span>
									</div>
									<p class="text-sm text-base-content/80">
										{props.originalPost.text}
									</p>
								</div>
							</div>
						</div>

						<p class="text-sm text-base-content/60 mb-2">
							{props.originalPost.user.username} にリプライ
						</p>

						<textarea
							value={text()}
							onInput={(e) => setText(e.target.value)}
							placeholder="リプライを入力..."
							class="textarea textarea-bordered w-full min-h-24 mb-4 resize-none"
							disabled={posting()}
							autofocus
						/>

						<div class="flex justify-end gap-2">
							<button
								type="button"
								onClick={handleClose}
								class="btn btn-ghost"
								disabled={posting()}
							>
								キャンセル
							</button>
							<button
								type="submit"
								class="btn btn-primary"
								disabled={!text().trim() || posting()}
							>
								{posting() ? (
									<span class="loading loading-spinner loading-sm" />
								) : (
									"リプライ"
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</Show>
	);
}
