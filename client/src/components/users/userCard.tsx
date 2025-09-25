import type { profileType } from "@hibana/schema";
import { Show } from "solid-js";
import FollowButton from "../profile/button/followButton";

export default function UserCard(props: {
	user: profileType;
	showFollowButton?: boolean;
}) {
	return (
		<div class="card bg-base-100 border border-base-300 p-4 hover:shadow-lg transition-shadow">
			<div class="flex items-center gap-4">
				<div class="avatar">
					<div class="w-12 h-12 rounded-full">
						<img src={props.user.icon} alt={props.user.username} />
					</div>
				</div>

				<div class="flex-1 min-w-0">
					<a href={`/user?publickey=${props.user.publickey}`}>
						<h3 class="font-semibold truncate">{props.user.username}</h3>

						<p class="text-sm text-base-content/60 truncate">
							{props.user.publickey}
						</p>
						<Show when={props.user.description}>
							<p class="text-sm text-base-content/80 line-clamp-2 mt-1">
								{props.user.description}
							</p>
						</Show>
					</a>
				</div>

				<Show when={props.showFollowButton !== false}>
					<div class="shrink-0">
						<FollowButton target={props.user.publickey} />
					</div>
				</Show>
			</div>
		</div>
	);
}
