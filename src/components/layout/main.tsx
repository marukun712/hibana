import type { JSX } from "solid-js";

export default function Main(props: { children: JSX.Element }) {
	return (
		<div class="container px-2 sm:px-4 lg:px-8 mx-auto min-h-screen max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl">
			{props.children}
		</div>
	);
}
