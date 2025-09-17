import type { profileType } from "../../../backend/schema/Profile";
import PinButton from "./button/pinButton";
import ReplyButton from "./button/replyButton";
import RepostButton from "./button/repostButton";

export default function Reply(props: {
	id: string;
	text: string;
	postedAt: string;
	user: profileType;
}) {
	return (
		<div class="card bg-base-100 border border-base-300 p-3 sm:p-4 mb-3 sm:mb-4 hover:shadow-md transition-shadow">
			<div class="flex gap-2 sm:gap-3 md:gap-4">
				<div class="avatar">
					<div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full">
						<a href={`/user?publickey=${props.user.publickey}`}>
							<img src={props.user.icon} alt="User avatar" />
						</a>
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
						<a
							href={`/user?publickey=${props.user.publickey}`}
							class="font-bold hover:underline truncate text-sm sm:text-base"
						>
							{props.user.username}
						</a>
						<span class="text-xs sm:text-sm text-base-content/60 shrink-0">
							{props.postedAt}
						</span>
					</div>
					<p class="mb-3 sm:mb-4 text-sm sm:text-base">{props.text}</p>
					<div class="flex flex-wrap items-center gap-2 sm:gap-4">
						<ReplyButton
							target={props.id}
							originalPost={{
								id: props.id,
								text: props.text,
								postedAt: props.postedAt,
								user: props.user,
							}}
						/>
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
