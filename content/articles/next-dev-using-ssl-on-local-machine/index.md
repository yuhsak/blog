---
title: '[カスタムサーバ不要] Next.jsでお手軽にSSLを使ったローカル開発をする'
description: 'httpsでnext devしたい'
date: '2022-07-10T13:54:09.400Z'
category: 'Web開発'
tags: ['Node.js', 'Next.js', '小ネタ']
---

ローカルで`https`な環境作りたくなる時あるよね。

ソーシャル系など外部連携の実装をしたりセキュアな環境でしか動かないブラウザのAPIを使ったりとか。

`Next.js`使ってる時ってみんなどうしてる？`server.js`書いてる？

## server.js書きたくない問題

`Next.js`でも`server.js`とか書いてサーバ部分を自前で用意すれば普通に実現できるんだけど、[公式ドキュメント](https://nextjs.org/docs/advanced-features/custom-server)には*カスタムサーバを使うと重要なパフォーマンス最適化が無効化されるから本当に必要な時だけにしてね*って不穏なことが書かれてて。

> Before deciding to use a custom server, please keep in mind that it should only be used when the integrated router of Next.js can't meet your app requirements. A custom server will remove important performance optimizations, like serverless functions and Automatic Static Optimization.

だからカスタムサーバを使うのは開発時だけで本番ではvercelにお任せもしくは`next start`になると思うんだけど、そうするとそこの差分で動作に差異があったらハマりそうじゃない？

こういう内部で色々やってくれてるお任せ系フレームワークで脱出ハッチ的な機構を利用するとその後は自己責任的な感じになるから、やっていくぞ！っていう覚悟が要るんだよね…

実際`next dev`と`next build && next start`の挙動がちょっと違って困ったことあるし、開発環境をSSLにするためだけにそこの懸念が増えるのもなぁっていう。

出来れば`server.js`を書かなくても`next dev`や`next start`だけで`https`に出来ると嬉しいよね？

そんな時にいい感じのやり方があるから紹介するよ。

<InfoBox title='Next.jsのバージョン'>

`12.1.6`

</InfoBox>

## リバースプロキシを使えば良さそう

今回のやり方を簡単に説明するとこんな感じ。

1. nextを普通に`next dev`で立ち上げる
2. 別でhttps接続可能なリバースプロキシサーバを立てる
3. 2のリクエストを全部1にバイパスする

開発環境に`Docker`使ってればnginxと組み合わせて簡単に実現できるから、この構成で`docker compose`してるところも多いんじゃないかな？

でも実際ローカルでSSL環境を実現したいだけなのに`Docker`や`nginx`などの登場人物が増えてしまうのもちょっと大変だよね。

これをnpmとかNode.jsの世界だけで実現できるようになりたい。

と、その前に。ローカルで使うSSL証明書を作っておくのを忘れずに。

## ローカル用のSSL証明書を作る

今回は超簡単にローカル専用の証明書を作れる[`mkcert`](https://github.com/FiloSottile/mkcert)を使っていくよ。

`mkcert`自体のインストールがまだだったらやっておこう。

MacOS + Google ChromeならHomebrewで一発なんだけど、環境が違う場合は他に手順が必要だったりするから[GitHubのリポジトリ](https://github.com/FiloSottile/mkcert)を参考にやってみてね。

```shell:title=mkcertのインストール
brew install mkcert
```

```shell:title=ローカルCA(認証局)のインストール
mkcert -install
```

インストールが済んだらプロジェクトのディレクトリに移動して`localhost`用の証明書を生成しよう。

```shell:title=証明書の生成
mkcert localhost
```

カレントディレクトリに`localhost-key.pem` `localhost.pem`2種類のファイルが生成されていればOK。

## リバースプロキシを書く

証明書が出来たらいよいよリバースプロキシを準備していくよ。

ゆーて単にリクエストをバイパス出来ればいいだけだから自分でちょろっと書いてしまえそうだよね。

[`node-http-proxy`](https://github.com/http-party/node-http-proxy)という簡単にリバースプロキシが書けるおあつらえ向きなモジュールがあるから今回はこれを使っていくよ。

```shell:title=node-http-proxyのインストール
npm install http-proxy
```

```js:title=reverse-proxy.js
const fs = require('fs')
const https = require('https')
const httpProxy = require('http-proxy')

const proxy = httpProxy.createProxyServer({
  target: {
    host: '0.0.0.0',
    port: 3000,
  },
})

const web = (req, res) => {
  proxy.web(req, res)
}

const ws = (req, socket, head) => {
  proxy.ws(req, socket, head)
}

const server = https.createServer(
  {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem'),
  },
  web,
)

server.on('upgrade', ws)

server.listen(3100, 'localhost', () => {
  console.log(
    `proxy server has started listening on https://localhost:3100, forwarding to http://0.0.0.0:3000`,
  )
})
```

`next dev`で`http://0.0.0.0:3000`に開発サーバが立っている時に`node reverse-proxy.js`でこのスクリプトを起動しよう。

そうすると`https://localhost:3100`でnextの開発サーバにアクセスできる！簡単だね。

WebSocketもバイパスするようにしてあるからもちろんFast Refresh系もちゃんと動くし、`next dev`に限らず`next start`した時でも同様にアクセスできる。

<WarnBox title='node-http-proxy'>

[https://github.com/http-party/node-http-proxy](https://github.com/http-party/node-http-proxy)

このモジュール、簡単にリバースプロキシが書けて超便利なんだけど2018年4月のアップデートを最後にそれ以降放置されてるっぽいのがちょっと不安ではある…。

実際中でやってることはかなりシンプルだしモジュール自体の依存も少ないので今回みたく開発用途でちょこっと使うぐらいなら問題ないと思うけど、プロダクション環境で使うのはやめておいた方が良さそう。

</WarnBox>

## 出来上がったのがこちら

というわけで上記のスクリプトをベースにエラーハンドリングを追加したりコマンドラインで各種オプションの指定を出来るようにしたものをnpmに登録しておいたよ。

その名も[`dev-rev-proxy`](https://www.npmjs.com/package/dev-rev-proxy)。npmのURLは[こちら](https://www.npmjs.com/package/dev-rev-proxy)。

使い方はほぼ同じ。

```shell:title=インストール
npm install dev-rev-proxy -D
```

`http://0.0.0.0:3000`で起動してる開発サーバに`https://localhost:3100`でアクセスしたい時はこんな感じ。

```shell:title=プロキシサーバの起動
npx dev-rev-proxy \
  --host localhost \
  --port 3100 \
  --target-host 0.0.0.0 \
  --target-port 3000 \
  --cert localhost.pem \
  --key localhost-key.pem
```

`devDependencies`に`dev-rev-proxy`を入れて起動コマンドを`package.json`に登録しておけばSSLな環境構築をNode.jsのプロジェクトで完結できて便利！

```json:title=package.json (一部抜粋)
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "proxy": "dev-rev-proxy -h localhost -p 3100 -c localhost.pem -k localhost-key.pem -H 0.0.0.0 -P 3000"
  },
  "devDependencies": {
    "dev-rev-proxy": "^0.1.0"
  }
}
```

あとは`mkcert`での証明書生成のやり方を`README.md`にでも書いておけば完璧だね。

自分は実際にこの構成で業務を始めて何ヶ月か経つんだけど今のところ全く問題なくNext.jsでWeb開発を進められているよ。

やっぱりカスタムサーバもDockerも不要でコマンド一発でSSL環境作れると超便利で捗るのでかなりおすすめ。

もし使ってみて不具合があったりこういう場合はうまくいかないよとかあったりしたら[GitHub](https://github.com/yuhsak/dev-rev-proxy)の[issue](https://github.com/yuhsak/dev-rev-proxy/issues)とかTwitter([@YuhsakInoue](https://twitter.com/YuhsakInoue))とかで教えてね。
