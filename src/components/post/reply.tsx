import { IoReturnDownBack } from "solid-icons/io";
import type { ReplyEvent } from "~/types/feed";
import PinButton from "./button/pinButton";
import ReplyButton from "./button/replyButton";
import RepostButton from "./button/repostButton";

export default function Reply(props: { reply: ReplyEvent }) {
	return (
		<div>
			<div class="card bg-base-100 border border-base-300 p-3 sm:p-4 mb-3 sm:mb-4 hover:shadow-md transition-shadow">
				<div class="flex items-center gap-2 mb-4 text-sm text-base-content/60">
					<IoReturnDownBack size={16} />
					{props.reply.target.user.username}:
					{props.reply.target.message.content}
					<span>に返信</span>
					<span>{new Date(props.reply.timestamp).toLocaleTimeString()}</span>
				</div>
				<div class="flex gap-2 sm:gap-3 md:gap-4">
					<div class="avatar">
						<div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full">
							<a href={`/user?publickey=${props.reply.user.publickey}`}>
								<img src={props.reply.user.icon} alt="User avatar" />
							</a>
						</div>
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
							<a
								href={`/user?publickey=${props.reply.user.publickey}`}
								class="font-bold hover:underline truncate text-sm sm:text-base"
							>
								{props.reply.user.username}
							</a>
							<span class="text-xs sm:text-sm text-base-content/60 shrink-0">
								{new Date(props.reply.timestamp).toLocaleTimeString()}
							</span>
						</div>
						<p class="block mb-3 sm:mb-4 text-sm sm:text-base">
							{props.reply.message.content}
						</p>
						<div class="flex flex-wrap items-center gap-2 sm:gap-4">
							<ReplyButton target={props.reply.id} />
							<PinButton target={props.reply.id} />
							<RepostButton
								target={props.reply.id}
								originalPost={props.reply.target}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
