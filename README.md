# kinda.info

Kinda 的个人数字档案：笔记、摄影与独立项目。

## 技术栈

- Next.js 16 + React 19
- Tailwind CSS 4 + shadcn/ui
- Velite 本地内容索引
- Tiptap 只读 Markdown/MDX 渲染
- Cloudflare Workers（OpenNext 适配器）承载运行时

网站没有远程 CMS。`content/` 中的静态 MDX 文件是唯一内容来源，写作格式和自定义节点请查看 [`content/README.md`](content/README.md)。

## 媒体存储

远程图片和视频存放在 Cloudflare R2 的 `kinda-info` 桶，通过 `https://media.kinda.info` 公开访问。对象统一存放在 `images/` 目录；新增媒体时保持相同目录结构，并在 MDX 或站点配置中引用该域名。

## 本地开发

项目固定使用 Node.js 24 和 pnpm。使用 nvm 时可先切换到仓库声明的版本：

```bash
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

开发命令会同时启动 Velite 内容监听和 Next.js。`next dev` 通过 `initOpenNextCloudflareForDev()` 读取 `wrangler.jsonc` 里的绑定，因此本地也能用到 R2 与 Cloudflare Images 的等价替身。

需要在本机验证真实的 Workers 运行时（而不是 Node 内的 Next.js）：

```bash
pnpm preview
```

它先用 `pnpm build` 产出 `.open-next/`，再由 `wrangler dev` 在 workerd 中启动站点。

本机处于代理后面时，`next dev` 里调用 Google Translate 需要让 Node 的 `fetch` 走代理：

```bash
NODE_USE_ENV_PROXY=1 pnpm dev
```

## 部署

站点部署在 Cloudflare Workers 上，入口是 `@opennextjs/cloudflare` 生成的 `.open-next/worker.js`，配置文件为 `wrangler.jsonc`。

```bash
pnpm deploy   # opennextjs-cloudflare build + deploy，发布并立即切流
pnpm upload   # 上传为一个新版本，不切流，便于灰度
```

账号侧需要满足的前置条件：

- 已启用 Cloudflare Images（`IMAGES` 绑定，`next/image` 依赖它做缩放）
- 已创建 R2 桶 `kinda-info-cache`（`NEXT_INC_CACHE_R2_BUCKET` 绑定，承载 ISR 与 `/hot` 的 600 秒缓存）
- `kinda.info` 在同一个账号下，Worker 才能绑定该自定义域名

`pnpm build` 仍是纯 Next.js 构建，用于本地检查；部署务必走 `pnpm deploy`，否则 `.open-next/` 不会更新。

## 翻译与语音

自动翻译调用 Google Translate 的公开接口，文章朗读使用 Edge TTS 的 Sec-MS-GEC v2 协议，两者都依赖第三方服务策略。

语音链路需要 WebSocket，而 Workers 没有 TCP socket，所以 `lib/edge-speech/socket.ts` 按运行时选择传输层：workerd 走 `fetch` + `Upgrade: websocket`，Node（开发服务器与测试）走 `ws`。修改语音认证逻辑后，运行 `pnpm test` 校验固定令牌向量，并对着 `pnpm preview` 的 `/api/speech` 做一次真实合成验证。

## 搜索与评论

全站搜索索引在构建时直接从 Velite 内容生成，不依赖外部搜索服务。访客可以点击页头搜索按钮，或使用 `⌘ K` / `Ctrl K` 打开搜索。

评论使用 [Utterances](https://github.com/apps/utterances) 与 GitHub Issues。首次启用时，需要为 `Alndaly/kinda.info` 安装 Utterances GitHub App；之后笔记、摄影和作品详情页会自动创建并复用对应的评论 Issue。中英文同 slug 页面使用同一个讨论串。

## 热点快照

`/hot` 的数据由 GitHub Actions（`.github/workflows/hot-snapshot.yml`）每半小时抓取一次，提交到 `hot-data` 分支；页面读取该分支，自身不轮询六个来源。
