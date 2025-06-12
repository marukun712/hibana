import { createSignal, onMount } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import Feed from "../post/feed";
import Loading from "../ui/loading";
import { getFollowers, getFollows, getProfile } from "~/lib/api/users";
import FollowButton from "./followButton";
import { profileType } from "../../../backend/schema/Profile";

type ProfileType = profileType & { followCount: number; followerCount: number };

export default function ProfileCard() {
  const [user, setUser] = createSignal<ProfileType>();
  const [searchParams] = useSearchParams();

  onMount(async () => {
    const publickey = searchParams.publickey as string;
    const data = await getProfile(publickey);

    const follows = await getFollows(publickey);
    const followers = await getFollowers(publickey);

    setUser({
      ...data,
      followCount: follows.length,
      followerCount: followers.length,
    });
  });

  return (
    <div class="mt-4">
      {user() ? (
        <div>
          <div class="bg-base-100 shadow-xl border border-base-300 rounded-xl overflow-hidden">
            <div class="h-40 bg-base-200"></div>

            <div class="p-6 -mt-12">
              <div class="flex flex-col items-center text-center">
                <div class="avatar">
                  <div class="w-24 h-24 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-2">
                    <img src={user()!.icon} />
                  </div>
                </div>
                <FollowButton target={user()!.publickey} />

                <div class="mt-4 space-y-4">
                  <h2 class="text-2xl font-bold">{user()!.username}</h2>
                  <h2 class="text-sm text-gray-500">{user()!.publickey}</h2>
                  <p class="text-sm">{user()!.description}</p>

                  <div class="flex space-x-4 justify-center font-bold">
                    <h2>{user()!.followCount} フォロー中</h2>
                    <h2>{user()!.followerCount} フォロワー</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-24">
            <Feed user={user()!.publickey} />
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
}
