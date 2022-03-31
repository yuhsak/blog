---
title: Chromeでタブの自動サスペンドを無効化したい
date: '2022-03-22T03:43:31.113Z'
description: コラボで接続が途切れちゃうのが困る
category: Web開発
tags: ['Google Chrome', 'Google Chrome拡張']
---

最近のGoogle Chromeは`automatic tab discarding`と言って非アクティブなタブのメモリを自動で解放する機能が有効になってるっぽい。

と言っても主にシステムメモリが足りてない時に発動するみたいだから基本は便利な仕様だと思うんだけど、なるべく解放しないで欲しいサイトもあるよね。

具体的にはコラボでセッションを開いている時とか。

コラボでセッション起動する→別のサイト見ながらローカルで割と重めの処理する→コラボのタブのメモリが解放される

↑こういうふうになっちゃうのが地味に不便。メモリ解放されるとセッション切断されたりするしリロード時にtqdmの表示が変なふうになったりするし…

探してみたらメモリ解放を無効にする系の拡張機能は何個かあったんだけど、正規表現で指定したURLだけ自動で無効にしてくれるやつがあったら一番便利だなーと思って作ってみた。

## インストール

[Don't discard - Chrome Web Store](https://chrome.google.com/webstore/detail/dont-discard/onodhifphgifinclhihikocgokedljbp)

[![](./dont-discard.jpg)](https://chrome.google.com/webstore/detail/dont-discard/onodhifphgifinclhihikocgokedljbp)

デフォルトでは全てのURLが対象。設定画面で任意の正規表現を入力しておくと該当するURLのタブのみ自動サスペンドが無効になる仕組み。

<WarnBox>

条件を反映するためにはタブをリロードする必要があるから注意しよう。

</WarnBox>

## GitHubリポジトリ

リポジトリは[ここ](https://github.com/yuhsak/dont-discard)。

[yuhsak/dont-discard](https://github.com/yuhsak/dont-discard)

ちょっとした実装の解説についてZennにも[記事](https://zenn.dev/yuhsak/articles/64c3e207a98b73)を投稿したから興味があったらチェックしてみてね。

[Chromeでタブの自動サスペンドを無効化する](https://zenn.dev/yuhsak/articles/64c3e207a98b73)

[![](https://res.cloudinary.com/zenn/image/upload/s--X5RmRTfW--/co_rgb:222%2Cg_south_west%2Cl_text:notosansjp-medium.otf_37_bold:Yuhsak%2520Inoue%2Cx_203%2Cy_98/c_fit%2Cco_rgb:222%2Cg_north_west%2Cl_text:notosansjp-medium.otf_70_bold:Chrome%25E3%2581%25A7%25E3%2582%25BF%25E3%2583%2596%25E3%2581%25AE%25E8%2587%25AA%25E5%258B%2595%25E3%2582%25B5%25E3%2582%25B9%25E3%2583%259A%25E3%2583%25B3%25E3%2583%2589%25E3%2582%2592%25E7%2584%25A1%25E5%258A%25B9%25E5%258C%2596%25E3%2581%2599%25E3%2582%258B%2Cw_1010%2Cx_90%2Cy_100/g_south_west%2Ch_90%2Cl_fetch:aHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FPaDE0R2dWemNGejQtb3Y5SFEyNFZmR2F6cUR2RC1CTHhIQ09EMkxzNmxDPXM5Ni1j%2Cr_max%2Cw_90%2Cx_87%2Cy_72/v1627274783/default/og-base_z4sxah.png)](https://zenn.dev/yuhsak/articles/64c3e207a98b73)
