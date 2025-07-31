import { createSignal, onMount } from "solid-js";

export default function Backup() {
  const [publickey, setPublickey] = createSignal<string | null>(null);

  onMount(async () => {
    const publickey = await window.nostr.getPublicKey();
    setPublickey(publickey);
  });

  return (
    <div class="space-y-4">
      <div class="space-y-4">
        <h1 class="font-bold text-2xl">リポジトリをバックアップ</h1>
        <p class="text-sm">
          ここからダウンロードしたリポジトリファイルは引っ越しに使用することができます。
        </p>
        <a href={`http://localhost:8000/repository/${publickey()}.hibana`}>
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
