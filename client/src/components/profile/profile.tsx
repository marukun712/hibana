import type { profileType } from "@hibana/schema";
import { useSearchParams } from "@solidjs/router";
import { createSignal, onMount, Show } from "solid-js";
import { useAuth } from "~/contexts/authContext";
import Feed from "../feed/feed";
import Loading from "../ui/loading";
import FollowButton from "./button/followButton";

type ProfileType = profileType & { followCount: number; followerCount: number };

export default function ProfileCard() {
	const { client: getClient, user: profile } = useAuth();
	const currentUserPublickey = profile()?.publickey;
	const [user, setUser] = createSignal<ProfileType>();
	const [searchParams] = useSearchParams();

	onMount(async () => {
		const publickey = searchParams.publickey as string;
		const clientInstance = getClient();
		if (!clientInstance) return;

		const data = await clientInstance.profile.get(publickey);

		const follows = currentUserPublickey
			? await clientInstance.event.follow.list({
					publickey: currentUserPublickey,
				})
			: [];
		const followers = currentUserPublickey
			? await clientInstance.event.follow.list({
					publickey: currentUserPublickey,
				})
			: [];

		setUser({
			...data,
			followCount: follows.length,
			followerCount: followers.length,
		});
	});

	return (
		<div class="mt-2 sm:mt-4">
			<Show when={user()} fallback={<Loading />}>
				{(u) => (
					<>
						<div class="card bg-base-100 border border-base-300 overflow-hidden">
							<div class="h-24 sm:h-32 md:h-40 bg-base-200"></div>

							<div class="p-4 sm:p-5 md:p-6 -mt-8 sm:-mt-10 md:-mt-12">
								<div class="flex flex-col items-center text-center">
									<div class="avatar">
										<div class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full">
											<img src={u().icon} alt={`${u().username}のアイコン`} />
										</div>
									</div>
									<FollowButton target={u().publickey} />

									<div class="mt-3 sm:mt-4 space-y-2 sm:space-y-3 md:space-y-4">
										<h2 class="text-lg sm:text-xl md:text-2xl font-bold px-2">
											{u().username}@{u().repository}
										</h2>
										<p class="text-xs sm:text-sm text-base-content/60 break-all px-2">
											{u().publickey}
										</p>
										<p class="text-sm sm:text-base px-2">{u().description}</p>

										<div class="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center font-bold text-sm sm:text-base">
											<a
												href={`/users?type=follow&publickey=${u().publickey}`}
												class="hover:underline"
											>
												<span>{u().followCount} フォロー中</span>
											</a>
											<a
												href={`/users?type=follower&publickey=${u().publickey}`}
												class="hover:underline"
											>
												<span>{u().followerCount} フォロワー</span>
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="mt-4 sm:mt-6 md:mt-8">
							<Feed user={u().publickey} />
						</div>
					</>
				)}
			</Show>
		</div>
	);
}
