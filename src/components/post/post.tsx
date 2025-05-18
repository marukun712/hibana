import { profileType } from "../../../backend/lib/ipfs/helia";

export default function Post(props: {
  text: string;
  postedAt: string;
  user: profileType;
}) {
  return (
    <div class="card bg-base-100 shadow-xl border border-base-300">
      <div class="card-body space-y-4">
        <div class="flex items-center space-x-3">
          <div class="avatar">
            <div class="w-10 h-10 rounded-full">
              <a href={`/user?publickey=${props.user.publickey}`}>
                <img src={props.user.icon} alt="User avatar" />
              </a>
            </div>
          </div>
          <div>
            <div class="font-bold">{props.user.username}</div>
            <div class="text-sm opacity-50">{props.postedAt}</div>
          </div>
        </div>

        <p class="text-base">{props.text}</p>
      </div>
    </div>
  );
}
