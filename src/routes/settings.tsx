import { clientOnly } from "@solidjs/start";
const Form = clientOnly(() => import("../components/profile/form"));

export default function Register() {
  return (
    <div>
      <Form />
    </div>
  );
}
