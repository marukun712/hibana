import { createSignal } from "solid-js";
import Feed from "~/components/feed/feed";
import PostForm from "~/components/ui/form";

export default function Index() {
	const [feedType, setFeedType] = createSignal<"all" | "following">("all");

	return (
		<div>
			<PostForm />
			<div class="flex justify-center my-4">
				<div class="tabs tabs-boxed">
					<button
						type="button"
						class={`tab ${feedType() === "all" ? "tab-active" : ""}`}
						onClick={() => setFeedType("all")}
					>
						ローカル
					</button>
					<button
						type="button"
						class={`tab ${feedType() === "following" ? "tab-active" : ""}`}
						onClick={() => setFeedType("following")}
					>
						フォロー中
					</button>
				</div>
			</div>
			<Feed feedType={feedType()} />
		</div>
	);
}
