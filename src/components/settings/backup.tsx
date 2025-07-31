import { createSignal, onMount } from "solid-js";
import { getCurrentUser } from "~/lib/api/users";

export default function Backup() {
  const [publickey, setPublickey] = createSignal<string | null>(null);
  const [repository, setRepository] = createSignal<string | null>(null);

  onMount(async () => {
    const user = await getCurrentUser();
    setPublickey(user.publickey);
    setRepository(user.repository);
  });

  return (
    <div class="space-y-4">
      <div class="space-y-4">
        <h1 class="font-bold text-2xl">リポジトリをバックアップ</h1>
        <p class="text-sm">
          ここからダウンロードしたリポジトリファイルは引っ越しに使用することができます。
        </p>
        <a href={`${repository}/repository/${publickey()}.hibana`}>
          <button class="btn bg-primary">ダウンロード</button>
        </a>
      </div>

      <div class="space-y-4">
        <h1 class="font-bold text-2xl">引っ越し</h1>
        <form>
          <input type="file" name="file" class="file-input" accept=".hibana" />
          <button class="btn bg-primary">引っ越す</button>
        </form>
      </div>
    </div>
  );
}
