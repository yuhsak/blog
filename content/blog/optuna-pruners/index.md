---
title: OptunaのPruner一覧
description: さくさく枝刈りして探索を効率化しよう
date: '2022-03-14T04:56:26.962Z'
category: データサイエンス
tags: ['機械学習', 'ハイパーパラメータチューニング', 'Optuna']
---

[Optuna](https://optuna.org)にはPrunerっていう探索を劇的に効率化する仕組みがあるんだけど、みんな使ってる？

周りを見ていると意外と使われていない感じがするんだよね。

超便利だからスルーしてるともったいない！

この記事ではOptunaに用意されてるPrunerたちを紹介するよ。きっと使ってみたくなるはず。

<InfoBox title='Optunaのバージョン'>

`2.10.0`

</InfoBox>

## Prunerとは

探索を枝刈りして効率化する仕組み。

例えばモデルの学習だと早いタイミングで「あ、このパラメータあんまり良くないな」ってなることあるよね。

損失が減少するペースが遅すぎて収束まで待っても微妙な感じにしかならなそうな時とか。

そういう試行を早いタイミングで打ち切ってなるべく良さげなパラメータの試行に時間を割けるようにするっていうのが基本的なPrunerの役割。

<InfoBox title='基本の使い方'>

基本の使い方をコード例も併せて簡単に紹介してる記事はこちら。

Pruner初見の人は使い方が分かっていた方がイメージしやすいと思うから、良かったら一覧を見る前にチェックしてみてね。

[Optunaでハイパーパラメータチューニング#Prunerの基本 | Notes for hacks](./tune-hyper-parameters-with-optuna#prunerの基本)

</InfoBox>

## [MedianPruner](https://optuna.readthedocs.io/en/stable/reference/generated/optuna.pruners.MedianPruner.html)

スコアが過去のTrialにおけるステップtでの中央値に達していないものを打ち切りするわかりやすいPruner。

オプションでTrial数やステップ数に応じた打ち切り条件を指定できるよ。

**指定可能なオプション**

- `n_startup_trials`
  - とりあえずこの数字の数だけTrialが完了するまでは打ち切りが行われなくなる
  - デフォルト: 5
- `n_warmup_steps`
  - 個々のTrialについてこの数字以下のステップでは打ち切りを行わない
  - デフォルト: 0
- `interval_steps`
  - この数字の分だけ間隔を空けたステップごとにしか打ち切り判定が行われなくなる
  - 自作のコールバックで`report()`するタイミング自体を制御してると干渉するから注意しよう
  - デフォルト: 1
- `n_min_trials`
  - 各ステップにおいてそのステップに到達したTrialがこの数字に達するまでは打ち切りが行われなくなる
  - デフォルト: 1

## [PercentilePruner](https://optuna.readthedocs.io/en/stable/reference/generated/optuna.pruners.PercentilePruner.html)

MedianPrunerのパーセンタイルを指定できるバージョン。

打ち切り条件のTop N パーセンタイルを`0.0` ~ `100.0`の範囲で引数に指定する。多分50.0にするとMedianPrunerと同じことかな？

指定可能なオプションもMedianPrunerと同じ。

## [ThresholdPruner](https://optuna.readthedocs.io/en/stable/reference/generated/optuna.pruners.ThresholdPruner.html)

スコアに上限と下限を設けてはみ出た場合に打ち切りを行うPruner。

特定のパラメータの組み合わせの時だけ損失が発散し続けて学習が収束しない、といったようなケースを弾くために使う想定みたい。

`n_warmup_steps`と組み合わせれば単純にあるステップでのスコアが一定値に達していないものを一律で打ち切る使い方もできるね。

**指定可能なオプション**

- `lower`
  - スコアの下限値
  - デフォルト: None
- `upper`
  - スコアの上限値
  - デフォルト: None
- `n_warmup_steps`
  - 個々のTrialについてこの数字以下のステップでは打ち切りを行わない
  - デフォルト: 0
- `interval_steps`
  - この数字の分だけ間隔を空けたステップごとにしか打ち切り判定が行われなくなる
  - 自作のコールバックで`report()`するタイミング自体を制御してると干渉するから注意しよう
  - デフォルト: 1

## [SuccessiveHalvingPruner](https://optuna.readthedocs.io/en/stable/reference/generated/optuna.pruners.SuccessiveHalvingPruner.html)

Successive Halvingという、ハイパーパラメータの最適化を多腕バンディット問題の一種と捉えて計画するアルゴリズムを応用したPruner。

[Non-stochastic Best Arm Identification and Hyperparameter Optimization](https://arxiv.org/abs/1502.07943)

これは限られた時間や学習回数の中で出来るだけ良い結果になりそうなパラメータに多くのリソースを割くことに注目したアルゴリズムのよう。 [^1]

[^1]: 正確にはOptunaでは元のSuccessive Halvingじゃなくて並列実行に対応した[Asynchronous Successive Halving](http://arxiv.org/abs/1810.05934)が採用されてる&実装の都合により論文とは細部が若干異なるとのこと。

詳しくは論文を参照して欲しいんだけど、このアルゴリズムの最大のポイントは **`全体のリソース`と`生き残らせるTrial数`を増やせば増やすほど、最終的に得られるハイパーパラメータが最適なものに漸近的に近づいていく** ことが理論的に証明されているところ…で合ってるのかな？難しくて自信ないけど…。

仕組みが分かればもっと理解できるかもしれない。このPrunerの4つのパラメータ `min_resource` `reduction_factor` `min_early_stopping_rate` `bootstrap_count` を元に順番に仕組みを整理してみよう。

必須の引数は`min_resource`だけでその他はOptional。各パラメータのデフォルト値は`reduction_factor = 4` `min_early_stopping_rate = 0` `bootstrap_count = 0`になってるよ。

### min_resource & reduction_factor

まずメインになるパラメータが`min_resource`と`reduction_factor`の2つ。

`min_resource`には個々のTrialに割り当て可能な最低リソースを指定する。これ自体は抽象的な数値だから回数でも時間でも多分何でも良いんだけど、基本Optunaでは各学習で確保したい最低イテレーション数とかエポック数を指定する想定みたい。[^2] これを仮に100としよう。

[^2]: もし単位を時間にしたい時は`trial.report()`で報告するステップ数を経過秒数とかにすればいけそう。

続いて、このPrunerはステージ0, ステージ1, ステージ2とステップ数に区切りを設けて段階的に打ち切り判定を行うようになっていて、そんでこの時のステージ番号を$\text{rung}$とする。この数字は0から始まって判定が行われる度に1、2、3と増えていく。

そうするとまず打ち切り判定は基本的に $\text{min\_resource} \times \text{reduction\_factor}^{\text{rung}}$ ステップ毎に行われる形になる。

仮に `min_resource = 100` `reduction_factor = 4` とした時、一回目の判定は $100 \times 4^0 = 100$ ステップ時に行われる。

二回目の判定は $100 \times 4^1 = 400$ ステップ時、同様に三回目は $100 \times 4^2 = 1600$ ステップ時。

そしてその時の打ち切り条件は過去のTrialのそのステップにおけるスコアのトップ $\large \frac{1}{\text{reduction\_factor}}$ 以内に入るかどうか、となる。

この場合は100, 400, 1600, 6400ステップ時にトップ$\large \frac 1 4$に入るかどうかで判定が行われる形になるね。

同様に`reduction_factor`が`2`の時を考えてみると100, 200, 400, 800ステップ時にトップ$\large \frac 1 2$の条件で判定が行われることになる。

`reduction_factor` の値が大きいほどじっくりステップを重ねてから判定するようなっていくんだけど、その分判定条件は厳しくなるという感じ。

試しに`reduction_factor`ごとに判定が行われるステップを計算してみるとこう。

| reduction_factor |   1 |   2 |     3 |      4 |      5 |
| :--------------- | --: | --: | ----: | -----: | -----: |
| 2                | 100 | 200 |   400 |    800 |  1,600 |
| 3                | 100 | 300 |   900 |  2,700 |  8,100 |
| 4                | 100 | 400 | 1,600 |  6,400 | 25,600 |
| 5                | 100 | 500 | 2,500 | 12,500 | 62,500 |

### min_early_stopping_rate

上記の内容をベースに`min_early_stopping_rate`で判定が行われるタイミングを調整できる。指定すると判定ステップ数の計算が下記のように行われるようになる。

$$
\small
r = \text{reduction\_factor} \newline \ \newline
s = \text{min\_early\_stopping\_rate} \newline \ \newline
\text{step} = \text{min\_resource} \times r^{\text{rung}+s}
$$

数字を大きくすると判定が行われるステップを後回しにできるから判定条件はそのままに生き残るTrialの割合を増やす方向へ調整するために使える、っていうことかな？

特に`reduction_factor`が大きい時に最初の`min_resource`ステップ目でかなり厳しい判定が行われてしまうのを調整するためにある項目な気がする。

### bootstrap_count

最後の`bootstrap_count`は各$\text{rung}$においてそのステップに到達したTrialの数が指定した値を上回るまでTrialが次の$\text{rung}$へ進むことを抑制するというもの。

例えば100, 400, 1600ステップ時に判定が行われるって場合にこれを`5`にしてると100ステップまで到達したTrialの数が5個未満のうちは全てのTrialが100ステップ目で打ち切られる。
5Trialになった時点で初めて次の400ステップの判定まで進む可能性のあるTrialが出てきて、、以下繰り返し。

各rungで生き残るTrialの条件が「少なくともbootstrap_count個のTrialの中のTop$\large \frac{1}{\text{reduction\_factor}}$」になるって感じかな。

条件がTop$\large \frac{1}{n}$だからnが十分確保できてない時は選別が安定しない気がするんだけど、そこにベースラインを設けるためにある？

### まとめ

以上が現時点での自分の理解。特に`reduction_factor`が大事で、結局これが大きい値だと打ち切るTrialの割合が増えて小さい値だと多く生き残るようになるということだと思う。

やはり最適化に費やせる`全体のリソース`と`生き残らせるTrial数`にトレードオフがあるような感じ。意識しなければいけないのはここらへんかな。

- たくさん打ち切れば一定のリソース(時間)の中で試せるパラメータ数は増えるけど最適なものを逃すリスクが高まる
- たくさん生き残らせると最適なものを得られる可能性は高まるけど試行回数を確保するために多くのリソースが必要になる

調整の方針としてはこういう感じになってくるのかな。

- あんまり時間をかけずにサクっと済ませたい。結果がそれなりなら最適値じゃなくてもいい
  - → `reduction_factor`を`大きく`
- しっかり時間をかけて出来るだけ最適値に近づきたい
  - → `reduction_factor`を`小さく`

モデルの性質を考慮に入れるのはもちろん、最適化全体にどれだけ時間をかけられるかっていうところも考えながら調整してねってことだよね多分。

かけられる時間があんまり無いなら雑でも良いから試行回数を優先した方が良さそうだし、じっくり時間とれるならそもそも試行回数は心配せずに吟味する方向にした方が良さそうだし。

でもあんまり自信無い。間違ってたらマジでごめんね！

どうしてこうすると探索の効率が良くなるのかっていう理論的な部分は正直自分には全然分かってないんだけど、一見しただけでもリーズナブルなやり方に思える。

ただモデルの学習って到達する最大ステップ数が決まってるから、実際に到達し得るrungは`min_resource`と`最大ステップ数`の比率によって決まるってことだよね。

同じ`reduction_factor`を使ってても最大ステップ数に対しての`min_resource`の比率が小さければ小さいほど生き残る割合は少なくなるかわりに多くのTrialを試せるようになるから、実質この比率もトレードオフに大きな影響を与える重要な項目と言える。

実際に使う時はそこらへんも考慮に入れないと使いにくいと思うんだけどいちいちrungのステップ数を意識しながら使うのもちょっと大変だね。

## [HyperbandPruner](https://optuna.readthedocs.io/en/stable/reference/generated/optuna.pruners.HyperbandPruner.html)

個人的なPrunerの大本命がこれ！

[Hyperband: A Novel Bandit-Based Approach to Hyperparameter Optimization](https://www.jmlr.org/papers/volume18/16-558/16-558.pdf)

`min_early_stopping_rate`の値を変えた複数のSuccessiveHalvingPrunerを使って早期から打ち切っていくパターンと長く猶予を与えるパターンを組み合わせた動作を実現してくれるやつ。最強そう…！

Successive Halvingの時に問題だった`リソース`と`生き残らせる割合`のバランスついて様々な組み合わせを用意してトレードオフを出来るだけ緩和しようとしてる感じ。

特に`min_resource`だけじゃなくて`max_resource`も指定することで`reduction_factor`に応じていい感じになるように調整してくれるのがアツい。

実装の中身は実際に複数のSuccessiveHalvingPrunerを作って取り回すようになっているみたいで、パラメータは`min_resource` `max_resource` `reduction_factor` `bootstrap_count`の4つとなっている。こちらの`reduction_factor`のデフォルト値は`3`。

`min_resource`に確保したい最低限のステップ数、`max_resource`に個別のTrialに許容できる最大ステップ数を指定することで内部でSuccessiveHalvingPrunerを何個組み合わせるか決めてくれるみたい。

作成した子Prunerのうちどれか1つをそれぞれのTrialに割り当てて使う仕組み。

学習の開始時にガンガン切っていくパターンか長い目線パターンかが決まるっていうことだね。

注意点はこの`max_resource`はあくまでも大体こんなもんですよという数字をPrunerに教えるための参考値だから、例えステップ数がこの数字を超えたとしてもPruner自体がそれを基準に打ち切りをしたりはしないっていうこと。

そこは普段通りモデルの学習パラメータでハンドリングしないといけない。逆に言うとはみ出ても大丈夫。

<InfoBox>

`max_resource`を指定しない場合は実際に観測したステップ数の最大値から推測してくれるようになってる。

打ち切りにならない限り到達する最大ステップ数が一律で決まってる場合は省略してもいいんだけど、`EarlyStopping`を使ってたりしてTrialごとに到達する最大ステップ数にばらつきがある場合は明示的に指定するべしとのこと。

</InfoBox>

### 作成されるPrunerの構成

内部で作成される子Prunerの数は以下の式で決まるらしい。

$$
\small
r = \text{reduction\_factor} \newline \ \newline
N = \text{floor}\bigg(\log_{r}\Big(\frac{\text{max\_resource}}{\text{min\_resource}}\Big)\bigg) + 1
$$

例えば `min_resource = 100` `max_resource = 1000` `reduction_factor = 3` の時は…

$$
\small
\begin{aligned}
N &= \text{floor}(\log_3 \frac{1000}{100}) + 1 \\
N &= \text{floor}(\approx 2.096) + 1 \\
N &=  3
\end{aligned}
$$

ということで3つの子Prunerが作られるってことかな。`reduction_factor` を2に減らすと4つ作成されることになるね。

多分子Prunerが1個だけの時は単一のSuccessiveHalvingPrunerと同じになっちゃってあんまり意味がないと思うから適宜調整しよう。

各子Prunerに与えられる`min_early_stopping_rate`は単純にそのPrunerのインデックスになるよう。Pruner1は0, Pruner2は1, Pruner3は2, ...。

### TrialにPrunerを割り当てる仕組み

子PrunerはTrialに対してそれぞれ均等に割り当てられるんじゃなくてある一定の重みに従うようになってる。

打ち切りが厳しいものほど多く、なるべく生き残らせるものほど少ない割合になるみたい。

まずそれぞれの子Prunerに対してある方法で求めたバジェットという数字が与えられるんだけど、結果的にあるPrunerが採用される割合は$\frac{\text{そのPrunerのバジェット}}{\text{バジェットの総和}}$となる。[^3]

[^3]: 正確には元の論文だと子Prunerの割り当ては総リソースを元に計算されるみたいなんだけど、OptunaではPrunerは総リソース(`n_trials`とか)の概念を持たないためこのような計算で代替しているとのこと。

あるPrunerへのバジェットの計算方法は以下の通り。

$$
\small
\begin{aligned}
N &= \scriptsize{\text{子Prunerの数}} \\
s &= N - 1 - \scriptsize{\text{Prunerのインデックス}} \\
r &= \text{reduction\_factor} \\ \ \\
\scriptsize{\text{バジェット}} &= \text{ceil}\Big(\frac{N \times r^{s}}{s + 1}\Big)
\end{aligned}
$$

試しに`reduction_factor = 3`でPrunerの数が3つの時のバジェットを計算してみると以下のようにそれぞれ9, 5, 3になる。

$$
\small
\text{Pruner}_0 = \text{ceil}\Big(\frac{3 \times 3^2}{2 + 1}\Big) = 9 \\ \ \\
\text{Pruner}_1 = \text{ceil}\Big(\frac{3 \times 3^1}{1 + 1}\Big) = 5 \\ \ \\
\text{Pruner}_2 = \text{ceil}\Big(\frac{3 \times 3^0}{0 + 1}\Big) = 3
$$

結果的に各Prunerはこの比率でTrialに割り当てられるようになるから、$\text{Pruner}_0$は`52.941%`、$\text{Pruner}_1$は`29.412%`、$\text{Pruner}_2$は`17.647%`の割合で使われることになる感じ。

### 試しに計算してみる

`min_resource = 100` `max_resource = 1000` とした時の子Prunerの構成がどうなるか、`reduction_factor` を変えながら具体的に見てみよう。

#### reduction_factor = 2の時

作成される子Prunerの数は$\small \text{floor}(\log_2 \frac{1000}{100} \approx 3.322) + 1$だから4つだね。`min_early_stopping_rate`はそれぞれ`0.0` `1.0` `2.0` `3.0`。

この構成の時の各子Prunerの判定ステップと割り当て比率、Trialが生き残る割合はこんな感じ。

| Index | 1回目 |     2回目 |     3回目 |     4回目 |    比率 | 生存 |
| :---- | ----: | --------: | --------: | --------: | ------: | ---: |
| 0     |   100 |       200 |       400 |       800 | 36.364% | 1/16 |
| 1     |   200 |       400 |       800 | ~~1,600~~ | 27.273% |  1/8 |
| 2     |   400 |       800 | ~~1,600~~ | ~~3,200~~ | 18.182% |  1/4 |
| 3     |   800 | ~~1,600~~ | ~~3,200~~ | ~~6,400~~ | 18.182% |  1/2 |

番号が若いほど早期からアクティブに打ち切りするようになってて、後ろに行くほど長い目で見るようになっていくのね。

#### reduction_factor = 3の時

子Prunerの数は$\small \text{floor}(\log_3 \frac{1000}{100} \approx 2.096) + 1$だから3つ。

判定ステップはこう。

| Index | 1回目 |     2回目 |     3回目 |    比率 | 生存 |
| :---- | ----: | --------: | --------: | ------: | ---: |
| 0     |   100 |       300 |       900 | 52.941% | 1/27 |
| 1     |   300 |       900 | ~~2,700~~ | 29.412% |  1/9 |
| 2     |   900 | ~~2,700~~ | ~~8,100~~ | 17.647% |  1/3 |

#### reduction_factor = 4の時

子Prunerの数は$\small \text{floor}(\log_4 \frac{1000}{100} \approx 1.661) + 1$で2つ。

| Index | 1回目 |     2回目 |    比率 | 生存 |
| :---- | ----: | --------: | ------: | ---: |
| 0     |   100 |       400 | 66.667% | 1/16 |
| 1     |   400 | ~~1,600~~ | 33.333% |  1/4 |

表にしてみると分かりやすいね。

作成される子Pruner数の傾向はこんな感じかな。

- `max_resource`に対する`min_resource`の割合が小さいほどたくさん作られる
- `reduction_factor`が小さいほどたくさん作られる

どのパターンでもTrialが生き残る割合の異なるPrunerにバランスよく配分されるようになっててある程度SuccessiveHalvingのトレードオフを緩和できていそうだね。

個人的には特に`max_resource`を加味した調整がPruner自体に内包されていることで割とどんな時でも自動的にトレードオフに対してロバストな感じになるのが便利だなーと思う。

ただ基本的にはやはり `reduction_factorが大きいほど` `max_resourceに対するmin_resourceの比率が小さいほど` 少ないリソースで試行回数を増やせるようになって逆になるほど試行回数を確保するために求められるリソースが増えるというSuccessive Halvingの特徴は踏襲していると思うから、調整するならそこらへん考える方針で良さそう。

1. まず個々のTrialに最低限与えたいステップ数と許容できる最大のステップ数を決める (→ ベースのPruner数が決まる)
2. 確保できるリソースを考慮して`reduction_factor`を調整する

実際には`min_resource`が`max_resource`の5%~50%程度になるようにして`reduction_factor`はデフォルトの3か変えても2, 4あたり、ってぐらいの基準で調整すれば良い気がするよ。

例によってあんまり自信が無いんだけどね。

Successive Halving単体よりもうまくいきそうな感じがすごいね…！

### 注意点

このHyperBandPrunerとデフォルトのTPESampler(Samplerについては後述)を組み合わせる時は子Prunerの数を増やせば増やすほど最低限必要なTrial数も増えるってことに注意する必要があるらしい。

具体的には個々のTrialを複数あるSuccessiveHalvingPrunerのどれか1つに割り振る動作になる都合上それぞれのPrunerに一定数のTrial結果がたまるまでTPESamplerが機能しなくなるってことみたい。

TPESamplerは動作し始めるまでにデフォルトでは10Trial分の結果を貯める必要があるから最低でもこのPrunerで作成される子Prunerの数 × 10Trialの分だけは試行を完了させないと本領を発揮し始めてくれない。

だからPrunerを3つ作成する場合は`n_trials`を少なくとも30以上程度にはしないとあんまり意味ないよって感じだね。

これは`reduction_factor`が小さい(=Prunerの数が多い)ほど確保すべきリソースが大きくなるというそもそもの性質と矛盾しないから特に困らないかもしれないけど、あんまり`n_trials`を大きくできない状況でHyperBandを使いたい場合は適宜Pruner数が妥当かどうか確認してみてね。

**HyperBandの子Pruner数を求めるPythonコード**

```python
import math

def compute_n_pruners(min_resource: int, max_resource: int, reduction_factor: int):
    r = max_resource / min_resource
    rl = math.log(r, reduction_factor)
    return math.floor(rl) + 1
```

## [PatientPruner](https://optuna.readthedocs.io/en/stable/reference/generated/optuna.pruners.PatientPruner.html)

他のPrunerと組み合わせて使う変わり種のPruner。

EarlyStoppingによくあるnステップの間スコアが向上しなかったら~的な条件を任意のPrunerと組み合わせられるようになる。

例えばMedianPrunerと組み合わせて「10ステップの間スコアが向上しなかった時点でMedianPrunerの打ち切り判定を開始する」という動作が実現できる。

`2.8.0`で追加された試験的な機能なため今後インターフェースが変わる可能性があるから注意とのこと。

**指定可能なオプション**

- `min_delta`
  - 最低でもこの値の分だけスコアが向上しなかった時点でPrunerの判定対象になる
  - デフォルト: 0.0

## [NopPruner](https://optuna.readthedocs.io/en/stable/reference/generated/optuna.pruners.NopPruner.html)

一切打ち切りを行わないPruner。

実は`create_study()`する時って何もしなくてもデフォルトでMedianPrunerが指定されるんだよね。

だから学習のコールバックで打ち切り判定するようにしてると勝手にMedianPrunerが動作しちゃうんだけどそれを明示的に無効にしたい時に使える。

## まとめ

結構たくさん用意してくれてて嬉しいね。

自分は特に`HyperBandPruner`がお気に入り。

少なくともこれまで色々なタイプのモデルで使ってみた時の手応え的にはほとんどのケースで`MedianPruner`や単体の`SuccessiveHalvingPruner`よりも明らかに良いパラメータに辿り着くまでの探索効率が優れている実感があるよ。

どのPrunerも有効に使えば探索を圧倒的に効率化できると思うからどんどん試してみよう。
