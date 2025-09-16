import { Show } from "solid-js";
import type { profileType } from "../../../backend/schema/Profile";
import FollowButton from "../profile/followButton";

type UserCardProps = {
	user: profileType;
	showFollowButton?: boolean;
};

export default function UserCard(props: UserCardProps) {
	return (
		<div class="bg-base-100 shadow-md border border-base-300 rounded-lg p-4 hover:shadow-lg transition-shadow">
			<div class="flex items-center space-x-4">
				<div class="avatar">
					<div class="w-12 h-12 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-2">
						<img src={props.user.icon} alt={props.user.username} />
					</div>
				</div>

				<div class="flex-1 min-w-0">
					<a href={`/user?publickey=${props.user.publickey}`}>
						<h3 class="font-semibold text-lg truncate">
							{props.user.username}
						</h3>

						<p class="text-sm text-gray-500 truncate">{props.user.publickey}</p>
						<Show when={props.user.description}>
							<p class="text-sm text-gray-700 line-clamp-2 mt-1">
								{props.user.description}
							</p>
						</Show>
					</a>
				</div>

				<Show when={props.showFollowButton !== false}>
					<div class="flex-shrink-0">
						<FollowButton target={props.user.publickey} />
					</div>
				</Show>
			</div>
		</div>
	);
}
