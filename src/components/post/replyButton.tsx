import { createSignal } from "solid-js";
import { AiOutlineComment } from "solid-icons/ai";
import { profileType } from "../../../backend/schema/Profile";
import ReplyModal from "./replyModal";

export default function ReplyButton(props: { 
  target: string;
  originalPost: {
    id: string;
    text: string;
    postedAt: string;
    user: profileType;
  };
}) {
  const [showReplyModal, setShowReplyModal] = createSignal(false);

  return (
    <div class="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          setShowReplyModal(true);
        }}
        class="btn btn-sm btn-ghost gap-1 text-base-content/60 hover:text-primary"
      >
        <AiOutlineComment size={16} />
        <span class="text-sm">リプライ</span>
      </button>

      {/* リプライモーダル */}
      <ReplyModal
        originalPost={props.originalPost}
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        onSuccess={() => {
          console.log("リプライが完了しました");
        }}
      />
    </div>
  );
}