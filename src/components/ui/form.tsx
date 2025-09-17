import { createSignal } from "solid-js";
import { createPost } from "~/lib/api/posts";

export default function PostForm() {
	const [text, setText] = createSignal("");

	async function post(text: string) {
		if (!text.trim()) return;
		await createPost(text);
		setText("");
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				post(text());
			}}
			class="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center py-4 sm:py-8 px-2 sm:px-4"
		>
			<input
				type="text"
				class="input input-bordered w-full sm:flex-1 max-w-full sm:max-w-md md:max-w-lg"
				placeholder="Message..."
				value={text()}
				onChange={(e) => setText(e.target.value)}
			/>
			<button class="btn btn-primary w-full sm:w-auto px-6" type="submit">
				投稿
			</button>
		</form>
	);
}
