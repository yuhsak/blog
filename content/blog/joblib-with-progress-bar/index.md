---
title: Joblibの進捗をプログレスバーで表示する
date: '2022-03-08T15:30:33.876Z'
description: '並列処理の進捗を華麗に確認しよう'
category: 'データサイエンス'
tags: ['機械学習', 'Python', 'Joblib', 'tqdm', '小ネタ']
---

[Joblib](https://joblib.readthedocs.io/)使ってる？ちょっとした処理を並列化したい時に鬼のように便利だよね。

きっとタスクの進捗を見たい時は`verbose=10`とかにして確認してると思うんだけど、[LightGBMの進捗をプログレスバーで表示する](./tune-hyper-parameters-with-optuna)で紹介したのと同じようにプログレスバーで表示する方法を紹介するよ。

プログレスバー大好きすぎて。笑

<video autoplay loop muted playsinline>
    <source src="./joblib-tqdm.webm" type='video/webm' />
    <source src="./joblib-tqdm.mp4" type='video/mp4' />
    <img src="./joblib-tqdm.gif" />
</video>

<InfoBox title='Joblibのバージョン'>

`1.1.0`

</InfoBox>

## tqdmのインストール

プログレスバーを使う時はこれ！

[tqdm - A Fast, Extensible Progress Bar for Python and CLI](https://github.com/tqdm/tqdm)

そのうちtqdm自体についても詳しく紹介する記事を書きたい。。

```shell
pip install tqdm
```

```python
from tqdm.auto import tqdm
from time import sleep

# これだけでかっこいいプログレスバーを表示してくれるすごいやつ
for i in tqdm(range(100)):
    sleep(0.1)
```

## ついやってしまいがちなパターン

例えばこんな感じの並列処理のコードがあったとする。

```python
from joblib import delayed, Parallel

@delayed
def compute_something(i: int):
    return i ** 2

results = Parallel(n_jobs=10)(
    compute_something(i) for i in range(100)
)
```

普段tqdmを使う時はイテレータをラップするだけで良い感じにやってくれるからつい↓こう書きたくなっちゃうよね。

```python
results = Parallel(n_jobs=10)(
    compute_something(i) for i in tqdm(range(100))
)
```

実際これでもプログレスバーは表示されるし何となく進捗表示っぽくなるんだけど、実はこれだと各タスクがJoblibによってキューイングされた瞬間に進捗が更新されてしまう。

処理の完了じゃなくて準備が終わったタイミングでプログレスバーが進んじゃうから場合によっては一瞬で100%になったりして変な感じになる。

## もっと良いやり方

ちゃんと各処理が終わったタイミングで進捗を更新するにはどうすればいいんだろう？と思ってググってたらStack Overflowにズバリな回答をしてくれている人がいた。感謝！

[Tracking progress of joblib.Parallel execution](https://stackoverflow.com/questions/24983493/tracking-progress-of-joblib-parallel-execution/58936697#58936697)

これをベースにさせてもらってちょこっと便利に改変したスニペットがこんな感じ。

```python
import contextlib
from typing import Optional
import joblib
from tqdm.auto import tqdm

@contextlib.contextmanager
def tqdm_joblib(total: Optional[int] = None, **kwargs):

    pbar = tqdm(total=total, miniters=1, smoothing=0, **kwargs)

    class TqdmBatchCompletionCallback(joblib.parallel.BatchCompletionCallBack):
        def __call__(self, *args, **kwargs):
            pbar.update(n=self.batch_size)
            return super().__call__(*args, **kwargs)

    old_batch_callback = joblib.parallel.BatchCompletionCallBack
    joblib.parallel.BatchCompletionCallBack = TqdmBatchCompletionCallback

    try:
        yield pbar
    finally:
        joblib.parallel.BatchCompletionCallBack = old_batch_callback
        pbar.close()
```

`BatchCompletionCallBack`っていうのがあるんだね。

使う時はこう。

実際に並列処理を実行してる部分を`with`ブロックで囲うだけでちゃんと処理の完了に応じてプログレスバーが更新されるようになるよ。

```python
with tqdm_joblib(100):
    results = Parallel(n_jobs=10)(
        compute_something(i) for i in range(100)
    )
```

ポイントは`tqdm`のコンストラクタに渡す`smoothing`を0に指定しているところ。

tqdmは1処理あたりの平均所要時間と推定残時間を計算して表示してくれるんだけど、これはデフォルトだと直近の結果を重視した加重移動平均で計算されるみたい。

並列処理する時ってたいてい各スレッドで同時に処理が開始して同時に終わるような挙動になると思うから、例えば5秒かかる処理を10並列で実行すると…

スタート → 5秒たつ → 進捗が一気に10進む → 5秒たつ → 進捗が一気に10進む → ...繰り返し

こんな感じになるよね。

ここで各処理の所要時間を加重移動平均で計算してしまうと一気に10進む分の影響が大きくなって実態よりもめっちゃ早く処理が終わってるかのような表示になってしまうという問題が発生する。

`smoothing`はそこをコントロールするための設定で、これを0にすると単純な平均で計算してくれるようになるから実態に即した表示が得られるという感じ。

並列処理の進捗までプログレスバーで表示されるとすごい気持ちいい！是非使ってみてね。
