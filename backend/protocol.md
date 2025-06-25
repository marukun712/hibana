# プロトコル仕様書(Claude まとめ)

## 概要

本プロトコルは、IPFS（InterPlanetary File System）と OrbitDB を基盤とした分散型ソーシャルネットワークサービス（SNS）の実装仕様です。すべてのユーザーアクションは暗号学的署名付きイベントとして記録され、分散ストレージに保存されることで、中央集権的な制御を排除した信頼性の高い SNS を実現します。

## アーキテクチャ

### 1. 階層構造

```
分散型SNSプロトコル
├── 暗号レイヤー（secp256k1署名）
├── イベントレイヤー（アクション記録）
├── 分散ストレージレイヤー（IPFS + OrbitDB）
└── リポジトリレイヤー（各ユーザーのデータ保管）
```

### 2. 主要コンポーネント

- **IPFS**: 分散ファイルストレージ（プロフィール等の永続化）
- **OrbitDB**: 分散データベース（イベントメタデータの管理）
- **リポジトリサーバー**: 各ユーザーが管理するプライベートデータストア
- **暗号化モジュール**: Schnorr 署名による認証・検証

## データ構造

### 1. イベント（Event）

全てのユーザーアクションはイベントとして記録されます。

```typescript
interface Event {
  id: string; // SHA-256ハッシュ（コンテンツの完全性保証）
  publickey: string; // ユーザーの公開鍵（32バイトhex）
  signature: string; // Schnorr署名（64バイトhex）
  event: string; // イベントタイプ
  timestamp: string; // ISO8601形式のタイムスタンプ
  message: object; // イベント固有のペイロード
}
```

### 2. ドキュメント（Document）

OrbitDB に保存されるイベントメタデータ。

```typescript
interface Document {
  _id: string; // イベントID（EventのIDと同一）
  event: string; // イベントタイプ
  target: string | null; // 対象リソースのID（optional）
  publickey: string; // 投稿者の公開鍵
  timestamp: string; // タイムスタンプ
}
```

### 3. プロフィール（Profile）

ユーザープロフィール情報。IPFS に保存されます。

```typescript
interface Profile {
  id: string; // プロフィールのハッシュID
  publickey: string; // ユーザーの公開鍵
  signature: string; // プロフィールの署名
  username: string; // 表示名
  icon: string; // アイコンURL
  description: string; // 自己紹介
  repository: string; // リポジトリサーバーのURL
  updatedAt: string; // 更新日時
}
```

## イベントタイプ

### 1. event.post - 投稿イベント

テキスト投稿を記録します。

```json
{
  "event": "event.post",
  "message": {
    "content": "投稿内容のテキスト"
  }
}
```

### 2. event.follow - フォローイベント

他のユーザーをフォローしたことを記録します。

```json
{
  "event": "event.follow",
  "message": {
    "target": "フォロー対象の公開鍵"
  }
}
```

### 3. event.pin - いいねイベント

投稿やコンテンツに対するいいねを記録します。

```json
{
  "event": "event.pin",
  "message": {
    "target": "対象投稿のイベントID"
  }
}
```

### 4. event.profile - プロフィール更新イベント

ユーザープロフィールの更新を記録します。

```json
{
  "event": "event.profile",
  "message": {
    "target": "IPFSのCID（プロフィールデータの場所）"
  }
}
```

## 暗号学的セキュリティ

### 1. 鍵ペア生成

- **アルゴリズム**: secp256k1 曲線上の Schnorr 署名
- **秘密鍵**: 32 バイトのランダム値
- **公開鍵**: 秘密鍵から導出される 32 バイト値

### 2. 署名プロセス

1. イベントコンテンツを JSON 文字列として正規化
2. SHA-256 でハッシュ値を計算
3. Schnorr 署名アルゴリズムで署名を生成
4. 署名、ハッシュ、公開鍵をイベントに添付

### 3. 検証プロセス

1. 受信したイベントからコンテンツを再構築
2. 同じ手順でハッシュ値を再計算
3. 保存されたハッシュと比較（完全性検証）
4. Schnorr 署名を検証（真正性検証）

## データフロー

### 1. イベント投稿

```
クライアント → API Server → リポジトリサーバー → OrbitDB
                      ↓
                  IPFS（プロフィール更新時）
```

1. クライアントがイベントを署名付きで作成
2. API サーバーが署名を検証
3. 検証成功時、リポジトリサーバーと OrbitDB に保存
4. プロフィール更新の場合、IPFS にも保存

### 2. フィード取得

```
クライアント → API Server → OrbitDB → リポジトリサーバー
                                  ↓
                              IPFS（プロフィール解決）
```

1. クライアントがフィード要求
2. OrbitDB からイベントメタデータを検索
3. 各イベントに対してリポジトリサーバーから詳細データを取得
4. プロフィール情報を IPFS から解決
5. 完全なフィード情報を構築してクライアントに返却

## API 仕様

### 1. GET /feed

イベントフィードを取得します。

**パラメータ:**

- `publickey` (optional): 特定ユーザーの投稿のみ取得
- `event` (optional): 特定イベントタイプのみ取得
- `target` (optional): 特定対象への投稿のみ取得

**レスポンス:**

```json
[
  {
    "id": "event_id",
    "publickey": "user_publickey",
    "signature": "schnorr_signature",
    "event": "event.post",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "message": {
      "content": "投稿内容"
    },
    "user": {
      "username": "ユーザー名",
      "icon": "icon_url",
      "description": "プロフィール"
    }
  }
]
```

### 2. POST /event

新しいイベントを投稿します。

**リクエストボディ:**

```json
{
  "id": "calculated_hash",
  "publickey": "user_publickey",
  "signature": "schnorr_signature",
  "event": "event.post",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "message": {
    "content": "投稿内容"
  }
}
```

### 3. GET /profile

ユーザープロフィールを取得します。

**パラメータ:**

- `publickey`: 取得対象ユーザーの公開鍵

### 4. POST /profile

ユーザープロフィールを更新します。

**リクエストボディ:**

```json
{
  "id": "profile_hash",
  "publickey": "user_publickey",
  "signature": "profile_signature",
  "username": "新しいユーザー名",
  "icon": "新しいアイコンURL",
  "description": "新しい自己紹介",
  "repository": "https://repository.example.com",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 分散ストレージ

### 1. OrbitDB 設定

```typescript
const db = await orbitdb.open("sns-db", {
  Database: Documents({ storage, indexBy: "_id" }),
  type: "documents",
  AccessController: IPFSAccessController({ write: ["*"] }),
});
```

- **データベースタイプ**: Documents（ドキュメント指向）
- **インデックス**: `_id`フィールドでインデックス化
- **アクセス制御**: 誰でも書き込み可能（`["*"]`）

### 2. IPFS 統合

- **用途**: プロフィールデータの永続化
- **CID**: コンテンツアドレス可能な識別子
- **ピン留め**: 重要なデータの永続保存

## 拡張性

### 1. 新しいイベントタイプ

新しいアクションは新しいイベントタイプとして定義できます：

- `event.repost`: リポスト機能
- `event.comment`: コメント機能
- `event.reaction`: リアクション機能

### 2. プライベートメッセージ

公開鍵暗号を使用した暗号化メッセージングの実装が可能です。

### 3. メディア添付

IPFS を活用した画像・動画等のメディアファイル共有に対応できます。

## 実装ガイドライン

### 1. クライアント実装

- NIP-07 対応ウォレット（Alby 等）との統合
- Schnorr 署名の実装
- API クライアントの実装

### 2. サーバー実装

- IPFS・OrbitDB ノードの運用
- 署名検証の厳密な実行
- エラーハンドリングの実装

### 3. 運用要件

- IPFS デーモンの常時稼働
- OrbitDB の分散同期
- ネットワーク接続性の確保

この仕様に従うことで、検閲耐性があり、ユーザーが自分のデータを完全に制御できる分散型 SNS を構築できます。
