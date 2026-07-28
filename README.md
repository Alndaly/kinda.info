# kinda.info

Kinda 的个人数字档案：笔记、摄影与独立项目。

## 技术栈

- Next.js 16 + React 19
- Tailwind CSS 4 + shadcn/ui
- Velite 本地内容索引
- Tiptap 只读 Markdown/MDX 渲染

网站没有远程 CMS。`content/` 中的静态 MDX 文件是唯一内容来源，写作格式和自定义节点请查看 [`content/README.md`](content/README.md)。

## 本地开发

项目固定使用 Node.js 24 和 pnpm 11。使用 nvm 时可先切换到仓库声明的版本：

```bash
nvm use
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

## 搜索与评论

全站搜索索引在构建时直接从 Velite 内容生成，不依赖外部搜索服务。访客可以点击页头搜索按钮，或使用 `⌘ K` / `Ctrl K` 打开搜索。

评论使用 [Utterances](https://github.com/apps/utterances) 与 GitHub Issues。首次启用时，需要为 `Alndaly/kinda.info` 安装 Utterances GitHub App；之后笔记、摄影和作品详情页会自动创建并复用对应的评论 Issue。中英文同 slug 页面使用同一个讨论串。
