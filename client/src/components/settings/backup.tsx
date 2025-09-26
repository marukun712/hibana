import { createSignal, For, onMount, Show } from "solid-js";
import { useAuth } from "~/contexts/authContext";
import {
	type BackupFile,
	createBackup,
	deleteBackup,
	listBackups,
} from "~/lib/backup";
import { fromBackup, fromFile, fromLatest } from "~/lib/migrate";

export default function Backup() {
	const [repository, setRepository] = createSignal<string | null>(null);
	const [backups, setBackups] = createSignal<BackupFile[]>([]);
	const [isLoading, setIsLoading] = createSignal(false);
	const [message, setMessage] = createSignal<string | null>(null);
	const [error, setError] = createSignal<string | null>(null);

	const { client: getClient, user } = useAuth();

	const loadBackups = async () => {
		try {
			const list = await listBackups();
			setBackups(list);
		} catch (e) {
			console.log(e);
			setError("バックアップ一覧の読み込みに失敗しました");
		}
	};

	onMount(loadBackups);

	const onCreateBackup = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const client = getClient();
			const publicKey = user()?.publickey;
			if (!publicKey) throw new Error("ユーザーの公開鍵が見つかりません");

			await createBackup(client, publicKey);
			setMessage("バックアップを作成しました");
			await loadBackups();
		} catch (e) {
			console.log(e);
			setError("バックアップの作成に失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	const onDeleteBackup = async (filename: string) => {
		if (!confirm("このバックアップを削除しますか？")) return;
		try {
			await deleteBackup(filename);
			setMessage("バックアップを削除しました");
			await loadBackups();
		} catch (e) {
			console.log(e);
			setError("バックアップの削除に失敗しました");
		}
	};

	const onMigrateFromBackup = async (filename: string) => {
		if (!confirm("このバックアップでマイグレーションを実行しますか？")) return;

		const repo = repository();
		const profile = user();
		if (!repo) return setError("リポジトリURLが設定されていません");
		if (!profile) return setError("認証が必要です");

		setIsLoading(true);
		setError(null);
		try {
			await fromBackup(repo, profile, filename);
			setMessage("マイグレーションが完了しました");
		} catch (e) {
			console.log(e);
			setError("マイグレーションに失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	const onMigrateFromLatest = async () => {
		if (!confirm("最新データでマイグレーションを実行しますか？")) return;

		const repo = repository();
		const u = user();
		if (!repo) return setError("リポジトリURLが設定されていません");
		if (!u) return setError("認証が必要です");

		setIsLoading(true);
		setError(null);
		try {
			await fromLatest(repo, u);
			setMessage("マイグレーションが完了しました");
		} catch (e) {
			console.log(e);
			setError("マイグレーションに失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	const onFileUpload = async (e: Event) => {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const fileInput = form.file as HTMLInputElement;
		const file = fileInput.files?.[0];

		const repo = repository();
		const profile = user();

		if (!file) return setError("ファイルを選択してください");
		if (!repo) return setError("リポジトリURLが設定されていません");
		if (!profile) return setError("認証が必要です");

		setIsLoading(true);
		setError(null);
		try {
			await fromFile(repo, profile, file);
			setMessage("ファイルからのマイグレーションが完了しました");
		} catch (e) {
			console.log(e);
			setError("マイグレーションに失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div class="space-y-8 my-12">
			<div>
				<h1 class="font-bold text-2xl">移行先のリポジトリURLを指定</h1>
				<input
					type="text"
					placeholder="移行先のリポジトリURLを指定"
					class="input input-bordered w-full max-w-xs"
					value={repository() ?? ""}
					onInput={(e) => setRepository((e.target as HTMLInputElement).value)}
				/>
			</div>

			<Show when={message()}>
				<div class="alert alert-success">
					<span>{message()}</span>
				</div>
			</Show>

			<Show when={error()}>
				<div class="alert alert-error">
					<span>{error()}</span>
				</div>
			</Show>

			<div class="space-y-4">
				<h1 class="font-bold text-2xl">リポジトリをバックアップ</h1>
				<p class="text-sm">
					リポジトリデータをローカルにバックアップできます。
				</p>

				<button
					type="button"
					class="btn bg-primary"
					onClick={onCreateBackup}
					disabled={isLoading()}
				>
					{isLoading() ? "作成中..." : "バックアップ"}
				</button>

				<Show when={backups().length > 0}>
					<div class="space-y-4">
						<h3 class="font-semibold text-lg">保存済みバックアップ</h3>
						<div class="grid gap-4">
							<For each={backups()}>
								{(backup) => (
									<div class="card bg-base-100 shadow-xl">
										<div class="card-body">
											<h2 class="card-title">{backup.name}</h2>
											<div class="card-actions space-x-2">
												<button
													type="button"
													class="btn btn-sm btn-primary"
													onClick={() => onMigrateFromBackup(backup.name)}
													disabled={isLoading()}
												>
													migrate
												</button>
												<button
													type="button"
													class="btn btn-sm btn-error"
													onClick={() => onDeleteBackup(backup.name)}
												>
													削除
												</button>
											</div>
										</div>
									</div>
								)}
							</For>
						</div>
					</div>
				</Show>
			</div>

			<div class="space-y-4">
				<h1 class="font-bold text-2xl">マイグレーション</h1>

				<div class="space-y-4">
					<div>
						<h3 class="font-semibold mb-2">最新データでマイグレーション</h3>
						<p class="text-sm text-gray-600 mb-2">
							現在のリポジトリの最新データを使用してマイグレーションを実行します。
						</p>
						<button
							type="button"
							class="btn bg-primary"
							onClick={onMigrateFromLatest}
							disabled={isLoading()}
						>
							{isLoading() ? "実行中..." : "最新データでmigrate"}
						</button>
					</div>

					<div>
						<h3 class="font-semibold mb-2">ファイルからマイグレーション</h3>
						<p class="text-sm text-gray-600 mb-2">
							バックアップファイルをアップロードしてマイグレーションを実行します。
						</p>
						<form onSubmit={onFileUpload} class="flex gap-2">
							<input
								type="file"
								name="file"
								class="file-input file-input-bordered flex-1"
								accept=".hibana,.json"
							/>
							<button
								type="submit"
								class="btn bg-primary"
								disabled={isLoading()}
							>
								{isLoading() ? "実行中..." : "migrate"}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
