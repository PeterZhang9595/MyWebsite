---
title: Fixture Rich Content
description: Fixture English rich-content article covering code blocks, inline code, math and images.
lang: en
slug: notes/rich-content
translationKey: rich-content
draft: false
tags:
  - fixture
publishedAtOverride: 2026-01-01
updatedAtOverride: 2026-01-02
order: 2
---

This fixture exists to verify code, math and image rendering, starting with inline code `policy.step()` and inline math $E = mc^2$.

## Code blocks

An ordinary fenced block (T2):

```ts
const reward = 1;
const discounted = reward * 0.99;
```

An over-long single line (T3) — used to verify that we **do not wrap** and scroll horizontally instead:

```ts
const hyperparameters = { learningRate: 0.0003, batchSize: 4096, gradientClip: 1.0, entropyBonus: 0.01, valueLossCoefficient: 0.5, discountFactor: 0.99, gaeLambda: 0.95, epochsPerUpdate: 10, minibatchSize: 256, klTarget: 0.01 };
```

## Math

Inline math (T4) flows with the text, as in $E = mc^2$ above.

Display math (T5) requires `$$` on its own line:

$$
J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\left[\sum_{t=0}^{T} \gamma^t r_t\right]
$$

An over-wide display formula (T6) — the body column is 72ch, so this one overflows and must scroll:

$$
\hat{\nabla}_\theta J(\theta) \approx \frac{1}{N} \sum_{i=1}^{N} \sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta\left(a_{i,t} \mid s_{i,t}\right) \left( \sum_{t'=t}^{T-1} \gamma^{t'-t} r_{i,t'} - b(s_{i,t}) \right) + \lambda \lVert \theta \rVert_2^2
$$

## Images and lists

An in-body image (T7) referenced by a relative path next to this file:

![Fixture rich content test image](./rich-content-image.png)

Basic syntax (T8):

- first item, with **bold**
- second item, with an [external link](https://example.com)

> [!NOTE]
> Fixture rich content callout.
