import { profileType } from "../../../backend/schema/Profile";
import PinButton from "./pinButton";

export default function Post(props: {
  id: string;
  text: string;
  postedAt: string;
  user: profileType;
}) {
  return (
    <div class="bg-base-100 rounded-xl border border-base-300 p-4 mb-4 hover:shadow-md transition-all">
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
            <span class="text-sm text-base-content/60">
              {props.postedAt}
            </span>
          </div>
          <p class="text-base leading-relaxed mb-3">{props.text}</p>
          <div class="flex items-center gap-6">
            <PinButton target={props.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
