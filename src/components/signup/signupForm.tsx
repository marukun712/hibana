import { createSignal, onMount } from "solid-js";
import { updateProfile } from "~/lib/api/users";
import { Crypto } from "../../../utils/crypto";

export default function SignupForm() {
  const [step, setStep] = createSignal(1);
  const [username, setUsername] = createSignal("");
  const [icon, setIcon] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [repository, setRepository] = createSignal("");
  const [privateKey, setPrivateKey] = createSignal("");

  function generateKey() {
    const { privatekey: generated } = Crypto.generateKeyPair();
    setPrivateKey(generated);
  }

  async function update() {
    await updateProfile(
      username(),
      icon(),
      description(),
      repository(),
      privateKey()
    );

    setUsername("");
    setIcon("");
    setDescription("");
    setRepository("");
    setPrivateKey("");
  }

  return (
    <div class="hero min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div class="card w-full max-w-md shadow-2xl bg-base-100 animate-scale-up-center">
        <div class="card-body p-8">
          <h1 class="text-center text-2xl font-bold mb-4">
            IPFS-SNSへようこそ!
          </h1>
          {step() === 1 && (
            <div class="step-1">
              <h2 class="card-title mb-2">ステップ1:秘密鍵の生成</h2>
              <p class="mb-4">
                秘密鍵を生成し、安全な場所に保管してください。
                秘密鍵を紛失すると、アカウントにアクセスできなくなります。
              </p>
              <button class="btn btn-primary mb-4" onClick={generateKey}>
                秘密鍵を生成する
              </button>
              {privateKey() && (
                <div class="alert alert-info mb-4">
                  <label>
                    生成された秘密鍵:
                    <span class="font-bold break-all">{privateKey()}</span>
                  </label>
                </div>
              )}
              <div class="card-actions justify-end">
                <button class="btn btn-primary" onClick={() => setStep(2)}>
                  次へ
                </button>
              </div>
            </div>
          )}

          {step() === 2 && (
            <div class="step-2">
              <h2 class="card-title mb-2">ステップ2:ユーザー情報の入力</h2>
              <input
                type="text"
                class="input input-bordered w-full mb-4"
                placeholder="ユーザー名"
                value={username()}
                onInput={(e) => setUsername(e.currentTarget.value)}
              />
              <input
                type="text"
                class="input input-bordered w-full mb-4"
                placeholder="アイコンURL"
                value={icon()}
                onInput={(e) => setIcon(e.currentTarget.value)}
              />
              <input
                type="text"
                class="input input-bordered w-full mb-4"
                placeholder="説明"
                value={description()}
                onInput={(e) => setDescription(e.currentTarget.value)}
              />
              <div class="card-actions justify-between">
                <button class="btn" onClick={() => setStep(1)}>
                  戻る
                </button>
                <button class="btn btn-primary" onClick={() => setStep(3)}>
                  次へ
                </button>
              </div>
            </div>
          )}

          {step() === 3 && (
            <div class="step-3">
              <h2 class="card-title mb-2">
                ステップ3:リポジトリサーバーの選択
              </h2>
              <p class="mb-4">
                信頼できるリポジトリサーバーを選択してください。
                リポジトリサーバーは、あなたのデータを保存します。
              </p>
              <input
                type="text"
                class="input input-bordered w-full mb-4"
                placeholder="リポジトリURL"
                value={repository()}
                onInput={(e) => setRepository(e.currentTarget.value)}
              />
              <div class="card-actions justify-between">
                <button class="btn" onClick={() => setStep(2)}>
                  戻る
                </button>
                <button
                  class="btn btn-primary"
                  onClick={() => {
                    setStep(4);
                    update();
                  }}
                >
                  更新
                </button>
              </div>
            </div>
          )}
          {step() === 4 && (
            <div class="step-4">
              <h2 class="card-title mb-2">完了!</h2>
              <p class="mb-4">登録が完了しました。</p>
              <div class="card-actions justify-end">
                <a class="btn btn-primary" href="/">
                  Done
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
