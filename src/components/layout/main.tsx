import type { JSX } from "solid-js";

export default function Main(props: { children: JSX.Element }) {
	return <div class="container mx-auto px-4">{props.children}</div>;
}
