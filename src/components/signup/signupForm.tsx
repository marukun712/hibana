import { createSignal } from "solid-js";
import { updateProfile } from "~/lib/api/users";
import { CryptoUtils } from "../../../utils/crypto";

export default function SignupForm() {
	const [step, setStep] = createSignal(1);
	const [username, setUsername] = createSignal("");
	const [icon, setIcon] = createSignal("");
	const [description, setDescription] = createSignal("");
	const [repository, setRepository] = createSignal("");
	const [privateKey, setPrivateKey] = createSignal("");
	const [copied, setCopied] = createSignal(false);

	function generateKey() {
		const { privatekey: generated } = CryptoUtils.generateKeyPair();
		setPrivateKey(generated);
		setCopied(false);
	}

	async function update() {
		await updateProfile(username(), icon(), description(), repository());

		setUsername("");
		setIcon("");
		setDescription("");
		setRepository("");
		setPrivateKey("");
		setCopied(false);
	}

	async function copyPrivateKey() {
		if (!privateKey()) return;
		await navigator.clipboard.writeText(privateKey());
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div class="flex items-center justify-center p-4 min-h-screen">
			<div class="card w-full max-w-md shadow-2xl bg-base-100 animate-scale-up-center">
				<div class="card-body p-8">
					<h1 class="text-center text-2xl font-bold mb-4">Hibanaへようこそ!</h1>

					{step() === 1 && (
						<div class="step-1">
							<h2 class="card-title mb-2">ステップ1:秘密鍵の生成</h2>
							<p class="mb-4">
								秘密鍵を生成し、安全な場所に保管してください。
								秘密鍵を紛失すると、アカウントにアクセスできなくなります。
							</p>
							<button
								type="button"
								class="btn btn-primary mb-4"
								onClick={generateKey}
							>
								秘密鍵を生成する
							</button>
							{privateKey() && (
								<div class="alert alert-info mb-4 flex flex-col">
									<div class="mb-2">
										生成された秘密鍵:
										<span class="font-bold break-all ml-2">{privateKey()}</span>
									</div>
									<button
										type="button"
										class="btn btn-sm btn-outline w-24"
										onClick={copyPrivateKey}
									>
										コピー
									</button>
									{copied() && (
										<span class="mt-2 text-sm">コピーしました！</span>
									)}
								</div>
							)}
							<div class="card-actions justify-end">
								<button
									type="button"
									class="btn btn-primary"
									onClick={() => setStep(2)}
								>
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
								<button type="button" class="btn" onClick={() => setStep(1)}>
									戻る
								</button>
								<button
									type="button"
									class="btn btn-primary"
									onClick={() => setStep(3)}
								>
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
								<button type="button" class="btn" onClick={() => setStep(2)}>
									戻る
								</button>
								<button
									type="button"
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
