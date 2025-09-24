import { createSignal, For, onMount, Show } from "solid-js";
import {
	type BackupFile,
	createBackup,
	deleteBackup,
	getBackupList,
} from "~/lib/api/backup";
import {
	migrateFromBackup,
	migrateFromFile,
	migrateFromLatest,
} from "~/lib/api/migration";

export default function Backup() {
	const [repository, setRepository] = createSignal<string | null>(null);
	const [backups, setBackups] = createSignal<BackupFile[]>([]);
	const [isLoading, setIsLoading] = createSignal(false);
	const [message, setMessage] = createSignal<string | null>(null);
	const [error, setError] = createSignal<string | null>(null);

	onMount(async () => {
		await loadBackups();
	});

	const loadBackups = async () => {
		try {
			const backupList = await getBackupList();
			setBackups(backupList);
		} catch (_e) {
			setError("バックアップ一覧の読み込みに失敗しました");
		}
	};

	const handleCreateBackup = async () => {
		setIsLoading(true);
		setError(null);
		try {
			await createBackup();
			setMessage("バックアップを作成しました");
			await loadBackups();
		} catch (err) {
			console.log(err);
			setError("バックアップの作成に失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteBackup = async (filename: string) => {
		if (!confirm("このバックアップを削除しますか？")) return;

		try {
			await deleteBackup(filename);
			setMessage("バックアップを削除しました");
			await loadBackups();
		} catch (err) {
			console.log(err);
			setError("バックアップの削除に失敗しました");
		}
	};

	const handleMigrateFromBackup = async (filename: string) => {
		if (!confirm("このバックアップでマイグレーションを実行しますか？")) return;
		const repo = repository();
		if (!repo) {
			setError("リポジトリURLが設定されていません");
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			await migrateFromBackup(filename, repo);
			setMessage("マイグレーションが完了しました");
		} catch (err) {
			console.log(err);
			setError(`マイグレーションに失敗しました`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMigrateFromLatest = async () => {
		if (!confirm("最新データでマイグレーションを実行しますか？")) return;
		const repo = repository();
		if (!repo) {
			setError("リポジトリURLが設定されていません");
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			await migrateFromLatest(repo);
			setMessage("マイグレーションが完了しました");
		} catch (err) {
			console.log(err);
			setError(`マイグレーションに失敗しました`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileUpload = async (e: Event) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const fileInput = form.file as HTMLInputElement;
		const file = fileInput.files?.[0];
		if (!file) {
			setError("ファイルを選択してください");
			return;
		}
		const repo = repository();
		if (!repo) {
			setError("リポジトリURLが設定されていません");
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			await migrateFromFile(file, repo);
			setMessage("ファイルからのマイグレーションが完了しました");
		} catch (err) {
			console.log(err);
			setError(`マイグレーションに失敗しました`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div class="space-y-8 my-12">
			<h1 class="font-bold text-2xl">移行先のリポジトリURLを指定</h1>
			<input
				type="text"
				placeholder="移行先のリポジトリURLを指定"
				class="input input-bordered w-full max-w-xs"
				value={repository() ?? ""}
				onInput={(e) => setRepository((e.target as HTMLInputElement).value)}
			/>

			<Show when={message()}>
				{(m) => {
					return (
						<div class="alert alert-success">
							<span>{m()}</span>
						</div>
					);
				}}
			</Show>

			<Show when={error()}>
				{(e) => {
					return (
						<div class="alert alert-error">
							<span>{e()}</span>
						</div>
					);
				}}
			</Show>

			<div class="space-y-4">
				<h1 class="font-bold text-2xl">リポジトリをバックアップ</h1>
				<p class="text-sm">
					リポジトリデータをローカルにバックアップできます。
				</p>

				<div class="flex gap-2">
					<button
						type="button"
						class="btn bg-primary"
						onclick={() => handleCreateBackup()}
						disabled={isLoading()}
					>
						{isLoading() ? "作成中..." : "バックアップ"}
					</button>
				</div>

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
													onclick={() => handleMigrateFromBackup(backup.name)}
													disabled={isLoading()}
												>
													migrate
												</button>
												<button
													type="button"
													class="btn btn-sm btn-error"
													onclick={() => handleDeleteBackup(backup.name)}
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
							onclick={handleMigrateFromLatest}
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
						<form onSubmit={handleFileUpload}>
							<div class="flex gap-2">
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
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
