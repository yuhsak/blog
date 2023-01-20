---
title: '[JavaScript] Promise.all()で順次処理'
description: Promise.all()したいけど順番に処理していきたい時あるよね
date: '2023-01-20T06:32:05.871Z'
category: Web開発
tags: ['JavaScript', 'TypeScript']
---

JSを書いてると非同期な処理をまとめて順番に実行したい時ってあるよね。

例えば配列に格納されたURL全てに対してリクエストをしたい時とか。

URLの件数が多くなってくると全件同時に実行するのが難しいから順番に処理をしていきたい。

普通にやると`async + await`と`for文`を組み合わせることになると思うんだけど、並列実行でOKの時は`Promise.all()`で綺麗に書けるのに順次実行の時だけfor文使うの何かちょっと微妙な感じだよね。

出来れば順番に実行する時も文じゃなくて「順次実行が終わったらresolveする単一のPromise」として表現したい。

そんな時に便利なスニペットを紹介するよ。

## やりたいこと

例えば「適当な配列の要素を先頭から順に出力して1秒待つ」っていうのを順次実行したいとする。

これを`for文`を使わずに単一のPromiseとして表現したい。

### 準備

```ts
/** 指定したミリ秒後にresolveするPromiseを生成する関数 */
const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 引数を出力して1秒待つ関数 */
const fn = async <T>(n: T) => {
  console.log(n)
  await wait(1000)
}

/** 適当な配列 */
const arr = [...Array(10)].map((_, i) => i)
```

### for文を使った書き方

普通のやり方。実際に実行してみると0, 1, 2, 3...と1秒おきに出力されるのが分かるはず。

```ts
/** 1秒毎に0~9まで出力 */
const run = async () => {
  for (const i of arr) {
    await fn(i)
  }
}
```

### Promise.all()だとうまくいかない

一見それっぽく見えるんだけどこれだと全部並列に実行されちゃうから0~9まで一気に出力されてしまう。

```ts
const run = async () => {
  await Promise.all(arr.map(fn))
}
```

## 解決策

### `array.reduce()` を使う

実は`reduce()`を使うと実現できるんだよね。

初見だとかなりわかりにくいと思うんだけど「初期値をresolve済みのPromiseにしておいて、async関数の中で常に第一引数のPromiseをawaitしてから処理を行う」っていう感じ。

`reduce()`の返り値は全ての出力が終わったらresolveされる単一のPromiseになるから一応やりたかったことは実現できてる。

けど何してるのかめちゃめちゃ分かりにくいからちょっと微妙だよね。

```ts
const run = async () => {
  await arr.reduce(
    /** 第一引数のPromiseのresolveを待つのがポイント */
    async (promise, i) => {
      await promise
      await fn(i)
    },
    /** 初期値をresolve済みのPromiseにする */
    Promise.resolve(),
  )
}
```

### 簡単なキューを用意する

reduceの例から分かることは要するに「前の処理を待ってから処理をする関数を逐次的に作ることが出来ればやりたかったことが実現できる」ってこと。

ある関数を簡単にそういう形に変換できる仕組みを用意すればわざわざreduceでトリッキーな書き方をしなくても良くなりそう。

そこでこんな感じのスニペットを考えてみる。

```ts
const createAsyncQueue = () => {
  const queue: Promise<unknown>[] = []

  const sequence = <A extends unknown[], R>(fn: (...args: A) => Promise<R>) => {
    return (...args: A) => {
      const before = queue.pop() || Promise.resolve()
      const next = before.then(() => {
        return fn(...args)
      })
      queue.push(next)
      return next
    }
  }

  return { sequence }
}
```

仕組みはさっきのreduceの例と同じなんだけど、関数を渡すと前のPromiseがresolveしてから実行される新しい関数を返すようになっているよ。

これで任意の関数をラップすれば良いだけになったからかなり便利そう。

例えばこんなふうに。なんと`Promise.all()`でmapする関数にかますだけで並列実行が順次実行になる。ちょっとすごくない？

```ts
const { sequence } = createAsyncQueue()

/** Promise.all()なのに0,1,2,3...と1秒ごとに順番に出力される */
const run = async () => {
  await Promise.all(arr.map(sequence(fn)))
}

/** awaitしてないのに1秒ごとに順番に実行される */
const sfn = sequence(fn)

sfn('a')
sfn('b')
sfn('c')
```

## 出来上がったのがこちら

このスニペットめちゃくちゃ便利でよく使うから[`pico-queue`](https://www.npmjs.com/package/pico-queue)っていう名前でnpmに登録しておいたよ。URLは[こちら](https://www.npmjs.com/package/pico-queue)。

使い方はさっき紹介したスニペットと全く同じ。

```bash
npm install pico-queue
```

```ts
import { createAsyncQueue } from 'pico-queue'

const { sequence } = createAsyncQueue()
```

他にもラップするだけで非同期に発生するイベント由来の処理を絶対に順番を守って実行するようにできたり、色々と絶妙に便利だから是非使ってみてね。
