import { useNavigate } from "@solidjs/router";
import { AiOutlineComment } from "solid-icons/ai";

export default function ReplyButton(props: { target: string }) {
	const navigate = useNavigate();

	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				navigate(`/post?id=${props.target}`);
			}}
			class="btn btn-ghost btn-sm gap-1 sm:gap-2 text-base-content/60 hover:text-primary"
		>
			<AiOutlineComment size={16} />
			<span class="hidden sm:inline text-sm">リプライ</span>
		</button>
	);
}
