# Server

## Setup

ipfs をマシンにインストールします。

https://ipfs-book.decentralized-web.jp/install_ipfs/

ipfs を初期化します。

```
ipfs init
```

ipfs と orbitdb が通信するため、ポート`4001`と`4002`をを開放してください。

依存関係をインストール

```
yarn install
```

サーバーを起動します。自動的にサーバーに DB が replicate されます。

```
ipfs daemon
yarn dev
```

## 初期化

- repository/
- helia/
- orbitdb/

を削除することでサーバーを初期化できます。
