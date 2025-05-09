import { createSignal, onMount, For } from "solid-js";
import { db } from "~/lib/db/rxdb";
import Post from "./post";
import { verifySecureMessage } from "~/lib/crypto";
import { Message } from "../../../@types";

export default function Posts() {
  const [posts, setPosts] = createSignal<any[]>([]);

  onMount(async () => {
    const docs = await db.posts.find().exec();

    const verified = docs.filter(async (doc: Message) => {
      return verifySecureMessage(doc);
    });

    setPosts(verified);
  });

  return (
    <div class="space-y-6 w-1/3 mx-auto">
      <For each={posts()}>
        {(post) => {
          return <Post text={post.text} />;
        }}
      </For>
    </div>
  );
}
