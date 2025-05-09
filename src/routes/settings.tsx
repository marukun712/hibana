import { clientOnly } from "@solidjs/start";
const Form = clientOnly(() => import("../components/settings/form"));

export default function Register() {
  return (
    <div>
      <Form />
    </div>
  );
}
