import { clientOnly } from "@solidjs/start";

const Form = clientOnly(() => import("../components/post/form"));
const Posts = clientOnly(() => import("../components/post/posts"));

export default function PostForm() {
  return (
    <div>
      <Form />
      <Posts />
    </div>
  );
}
