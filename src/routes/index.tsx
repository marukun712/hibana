import { clientOnly } from "@solidjs/start";

const Form = clientOnly(() => import("../components/form"));
const Posts = clientOnly(() => import("../components/posts"));

export default function PostForm() {
  return (
    <div class="container p-4 mx-auto h-screen">
      <Form />
      <Posts />
    </div>
  );
}
