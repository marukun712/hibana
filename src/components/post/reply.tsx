import type { profileType } from "../../../backend/schema/Profile";
import PinButton from "./pinButton";
import ReplyButton from "./replyButton";
import RepostButton from "./repostButton";

export default function Reply(props: {
	id: string;
	text: string;
	postedAt: string;
	user: profileType;
	target: {
		id: string;
		text: string;
		postedAt: string;
		user: profileType;
	};
	depth?: number;
}) {
	const depth = props.depth || 0;
	const maxDepth = 3;
	const indentClass =
		depth > 0
			? `ml-${Math.min(depth * 4, maxDepth * 4)} border-l border-base-300 pl-4`
			: "";

	return (
		<div
			class={`bg-base-100 rounded-xl border border-base-300 p-4 mb-4 hover:shadow-md transition-all ${indentClass}`}
		>
			{depth > 0 && (
				<div class="flex items-center gap-2 text-sm text-base-content/60 mb-3">
					<span>↳</span>
					<span>{props.target.user.username} へのリプライ</span>
				</div>
			)}

			<div class="flex gap-3">
				<div class="avatar">
					<div class="w-12 h-12 rounded-full">
						<a href={`/user?publickey=${props.user.publickey}`}>
							<img src={props.user.icon} alt="User avatar" />
						</a>
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 mb-1">
						<a
							href={`/user?publickey=${props.user.publickey}`}
							class="font-bold hover:underline"
						>
							{props.user.username}
						</a>
						<span class="text-sm text-base-content/60">{props.postedAt}</span>
					</div>
					<p class="text-base leading-relaxed mb-3">{props.text}</p>
					<div class="flex items-center gap-6">
						{depth < maxDepth && (
							<ReplyButton
								target={props.id}
								originalPost={{
									id: props.id,
									text: props.text,
									postedAt: props.postedAt,
									user: props.user,
								}}
							/>
						)}
						<PinButton target={props.id} />
						<RepostButton
							target={props.id}
							originalPost={{
								id: props.id,
								text: props.text,
								postedAt: props.postedAt,
								user: props.user,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
