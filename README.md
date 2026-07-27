# kinda.info

Kinda 的个人数字档案：笔记、摄影与独立项目。

## 技术栈

- Next.js 16 + React 19
- Tailwind CSS 4 + shadcn/ui
- Velite 本地内容索引
- Tiptap 只读 Markdown/MDX 渲染

网站没有远程 CMS。`content/` 中的静态 MDX 文件是唯一内容来源，写作格式和自定义节点请查看 [`content/README.md`](content/README.md)。

## 本地开发

项目固定使用 pnpm 11：

```bash
pnpm install --frozen-lockfile
pnpm dev
```

开发命令会同时启动 Velite 内容监听和 Next.js。

## 生产构建

```bash
pnpm build
pnpm start
```

构建会先生成 Velite 内容索引，再执行 Next.js 静态页面生成。
