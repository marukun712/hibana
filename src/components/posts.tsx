import { createSignal, onMount, For } from "solid-js";
import { db } from "~/lib/db/rxdb";
import Post from "./post";

export default function Posts() {
  const [posts, setPosts] = createSignal<any[]>([]);

  onMount(async () => {
    const docs = await db.posts.find().exec();
    setPosts(docs);
  });

  return (
    <div class="space-y-6 w-1/3 mx-auto">
      <For each={posts()}>{(post) => <Post text={post.text} />}</For>
    </div>
  );
}
