import { generateKeyPair } from "@hibana/utils";
import { createSignal, onMount, Show } from "solid-js";
import { useAuth } from "~/contexts/authContext";

export default function SignupForm() {
	const { client: clientInstance } = useAuth();
	const [step, setStep] = createSignal(1);
	const [username, setUsername] = createSignal("");
	const [icon, setIcon] = createSignal("");
	const [description, setDescription] = createSignal("");
	const [repository, setRepository] = createSignal("");
	const [privateKey, setPrivateKey] = createSignal("");
	const [copied, setCopied] = createSignal(false);
	const [publicKey, setPublicKey] = createSignal<string | null>(null);
	const [error, setError] = createSignal<string | null>(null);

	onMount(async () => {
		try {
			const pk = await window.nostr.getPublicKey();
			setPublicKey(pk);
			setStep(2);
		} catch (err) {
			console.log(err);
			setError("公開鍵を取得できませんでした。秘密鍵を生成してください。");
		}
	});

	function generateKey() {
		try {
			const { privatekey: generated } = generateKeyPair();
			setPrivateKey(generated);
			setCopied(false);
			setError(null);
		} catch (err) {
			console.log(err);
			setError("秘密鍵の生成に失敗しました。");
		}
	}

	async function update() {
		try {
			const client = clientInstance();
			let pk = publicKey();
			pk = await window.nostr.getPublicKey();
			setPublicKey(pk);
			if (!pk) {
				setError("公開鍵が取得できません。拡張機能を確認してください。");
				return;
			}
			if (!username().trim()) {
				setError("ユーザー名を入力してください。");
				return;
			}
			if (!icon().trim()) {
				setError("アイコンを入力してください。");
				return;
			}
			if (!repository().trim()) {
				setError("リポジトリURLを入力してください。");
				return;
			}
			await client.profile.update({
				publickey: pk,
				icon: icon(),
				username: username(),
				repository: repository(),
				description: description(),
			});
			setUsername("");
			setIcon("");
			setDescription("");
			setRepository("");
			setPrivateKey("");
			setCopied(false);
			setError(null);
		} catch (err) {
			console.log(err);
			setError("プロフィール更新に失敗しました。");
		}
	}

	async function copyPrivateKey() {
		if (!privateKey()) return;
		try {
			await navigator.clipboard.writeText(privateKey());
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.log(err);
			setError("クリップボードへのコピーに失敗しました。");
		}
	}

	return (
		<div class="flex items-center justify-center p-2 sm:p-4 min-h-screen">
			<div class="card w-full max-w-sm sm:max-w-md md:max-w-lg shadow-xl bg-base-100">
				<div class="card-body p-4 sm:p-6">
					<h1 class="text-center text-xl sm:text-2xl font-bold mb-4">
						hibanaへようこそ!
					</h1>

					<Show when={error()}>
						{(e) => (
							<div class="alert alert-error mb-4">
								<span>{e()}</span>
							</div>
						)}
					</Show>

					<Show when={step() === 1}>
						<div>
							<h2 class="card-title mb-4">ステップ1:秘密鍵の生成</h2>
							<p class="mb-4">
								秘密鍵を生成し、安全な場所に保管してください。
								秘密鍵を紛失すると、アカウントにアクセスできなくなります。
							</p>
							<button
								type="button"
								class="btn btn-primary mb-4 w-full"
								onClick={generateKey}
							>
								秘密鍵を生成する
							</button>

							<Show when={privateKey()}>
								<div class="card bg-base-200 p-3 sm:p-4 mb-4">
									<div class="mb-4">
										<p class="mb-2 text-sm sm:text-base">生成された秘密鍵:</p>
										<div class="bg-base-300 rounded p-2 max-h-20 overflow-y-auto">
											<code class="text-xs sm:text-sm break-all">
												{privateKey()}
											</code>
										</div>
									</div>
									<button
										type="button"
										class="btn btn-outline w-full sm:w-auto"
										onClick={copyPrivateKey}
									>
										{copied() ? "コピーしました！" : "コピー"}
									</button>
								</div>
							</Show>

							<Show when={privateKey()}>
								<div class="mb-4">
									<button
										type="button"
										class="btn btn-secondary w-full"
										onClick={async () => {
											try {
												const pk = await window.nostr.getPublicKey();
												setPublicKey(pk);
												setError(null);
											} catch (err) {
												console.log(err);
												setError("拡張機能に秘密鍵が登録されていません。");
											}
										}}
									>
										更新
									</button>
									<Show when={publicKey()}>
										<p class="mt-2 text-sm text-success">
											公開鍵を確認しました: {publicKey()}
										</p>
									</Show>
								</div>
							</Show>

							<div class="card-actions justify-end">
								<button
									type="button"
									class="btn btn-primary"
									disabled={!publicKey()}
									onClick={() => setStep(2)}
								>
									次へ
								</button>
							</div>
						</div>
					</Show>

					<Show when={step() === 2}>
						<div>
							<h2 class="card-title mb-4">ステップ2:ユーザー情報の入力</h2>
							<Show when={publicKey()}>
								<p class="mb-2 text-sm text-success">公開鍵取得済み</p>
							</Show>

							<div class="space-y-4">
								<input
									type="text"
									class="input input-bordered w-full"
									placeholder="ユーザー名"
									value={username()}
									onInput={(e) => setUsername(e.currentTarget.value)}
								/>
								<input
									type="text"
									class="input input-bordered w-full"
									placeholder="アイコンURL"
									value={icon()}
									onInput={(e) => setIcon(e.currentTarget.value)}
								/>
								<input
									type="text"
									class="input input-bordered w-full"
									placeholder="説明"
									value={description()}
									onInput={(e) => setDescription(e.currentTarget.value)}
								/>
							</div>

							<div class="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:card-actions sm:justify-between mt-6">
								<button
									type="button"
									class="btn order-2 sm:order-1"
									onClick={() => setStep(1)}
								>
									戻る
								</button>
								<button
									type="button"
									class="btn btn-primary order-1 sm:order-2"
									disabled={!username().trim() || !icon().trim()}
									onClick={() => setStep(3)}
								>
									次へ
								</button>
							</div>
						</div>
					</Show>

					<Show when={step() === 3}>
						<div>
							<h2 class="card-title mb-4">
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
									disabled={!repository().trim()}
									onClick={() => {
										setStep(4);
										update();
									}}
								>
									更新
								</button>
							</div>
						</div>
					</Show>

					<Show when={step() === 4}>
						<div>
							<h2 class="card-title mb-4">完了!</h2>
							<p class="mb-4">登録が完了しました。</p>
							<div class="card-actions justify-end">
								<a class="btn btn-primary" href="/">
									Done
								</a>
							</div>
						</div>
					</Show>
				</div>
			</div>
		</div>
	);
}
