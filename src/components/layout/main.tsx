import { JSX } from "solid-js";

export default function Main(props: { children: JSX.Element }) {
  return <div class="container p-4 mx-auto h-screen">{props.children}</div>;
}
