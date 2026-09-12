---
title: Fixture 富内容
description: Fixture 中文富内容文章，承载代码块、行内码、公式与图片的渲染验证。
lang: zh
slug: notes/rich-content
translationKey: rich-content
draft: false
tags:
  - fixture
publishedAtOverride: 2026-01-01
updatedAtOverride: 2026-01-02
order: 2
---

这一篇专门用来验证「不同位置的代码、公式、图片」渲染，正文里先放一处行内代码 `policy.step()` 与一处行内公式 $E = mc^2$。

## 代码块

普通代码块（T2）：

```ts
const reward = 1;
const discounted = reward * 0.99;
```

超长单行（T3）——用来验证**不折行**、横向滚动：

```ts
const hyperparameters = { learningRate: 0.0003, batchSize: 4096, gradientClip: 1.0, entropyBonus: 0.01, valueLossCoefficient: 0.5, discountFactor: 0.99, gaeLambda: 0.95, epochsPerUpdate: 10, minibatchSize: 256, klTarget: 0.01 };
```

## 公式

行内公式（T4）随文字流排布，例如上面的 $E = mc^2$。

独立公式（T5）必须把 `$$` 写成独占一行：

$$
J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\left[\sum_{t=0}^{T} \gamma^t r_t\right]
$$

超宽独立公式（T6）——正文宽度只有 72ch，这条会超出，用来验证横向滚动：

$$
\hat{\nabla}_\theta J(\theta) \approx \frac{1}{N} \sum_{i=1}^{N} \sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta\left(a_{i,t} \mid s_{i,t}\right) \left( \sum_{t'=t}^{T-1} \gamma^{t'-t} r_{i,t'} - b(s_{i,t}) \right) + \lambda \lVert \theta \rVert_2^2
$$

## 图片与列表

正文图片（T7）走相对路径，放在本文件旁边：

![Fixture 富内容测试图](./rich-content-image.png)

基础语法（T8）：

- 第一条，含 **粗体**
- 第二条，含 [外链](https://example.com)

> [!NOTE]
> Fixture 富内容提示块。
