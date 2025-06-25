import { useSearchParams } from "@solidjs/router";
import { createSignal, For, onMount } from "solid-js";
import { profileType } from "../../../backend/schema/Profile";
import { getFollowers, getFollows } from "~/lib/api/users";
import UserCard from "./userCard";

export default function UsersContainer() {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = createSignal<profileType[]>();

  onMount(async () => {
    const type = searchParams.type as string;
    const publickey = searchParams.publickey as string;

    switch (type) {
      case "follow": {
        const data = await getFollows(publickey);
        const usersData = data.map((data) => {
          return data.user;
        });
        setUsers(usersData);
      }
      case "follower": {
        const data = await getFollowers(publickey);
        const usersData = data.map((data) => {
          return data.user;
        });
        setUsers(usersData);
      }
    }
  });

  return (
    <div class="space-y-4 p-4">
      <For each={users()}>
        {(user) => <UserCard user={user} showFollowButton={true} />}
      </For>
    </div>
  );
}
