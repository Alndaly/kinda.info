Flex 布局中的滚动失效，往往不是 `overflow-auto` 本身的问题，而是滚动容器或它的祖先仍保留了默认的最小内容尺寸。

## 纵向布局中的常见结构

```tsx
<div className="flex h-dvh flex-col">
  <header className="shrink-0">Header</header>

  <main className="min-h-0 flex-1 overflow-y-auto">
    ...
  </main>
</div>
```

这里有三个关键点：

- 父元素必须有可计算的高度，例如 `h-dvh`；
- 主轴方向要与预期一致，例如纵向布局使用 `flex-col`；
- 可滚动的 flex 子项通常需要 `min-h-0`，允许它缩小到内容高度以下。

如果滚动容器外面还包着一层 `flex-1`，那一层也可能需要 `min-h-0`：

```tsx
<div className="flex min-h-0 flex-1 flex-col">
  <section className="min-h-0 flex-1 overflow-y-auto">
    ...
  </section>
</div>
```

横向布局对应使用 `min-w-0`，否则长文本或宽内容可能把列宽撑开。

## 为什么只加 `overflow-auto` 不够

Flex 子项默认使用 `min-height: auto` 或 `min-width: auto`，也就是至少容纳自身内容。元素没有真正变小，自然也就没有可供 `overflow` 接管的溢出区域。

排查时可以依次确认：

1. 从视口到滚动容器的高度链路是否完整；
2. 中间的 flex 子项是否允许收缩；
3. 滚动方向是否与 flex 主轴一致；
4. 是否有 `h-auto`、`min-h-full` 等规则重新把容器撑开。

## `line-clamp` 不生效

`line-clamp-*` 依赖文本换行。如果当前元素或祖先应用了 `whitespace-nowrap`，内容不会形成多行，截断自然无法生效。

```tsx
<p className="line-clamp-2 whitespace-normal">
  ...
</p>
```

在 flex 或 grid 子项中，还要确认文本容器可以收缩：

```tsx
<div className="min-w-0">
  <p className="line-clamp-2">...</p>
</div>
```

比起继续叠加更多 utility class，先在浏览器开发工具中观察元素的实际尺寸、`min-*` 和 `white-space`，通常更快。
