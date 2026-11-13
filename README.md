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

开发命令会同时启动 Velite 内容监听和 Next.js。`next dev` 不加载 `wrangler.jsonc` 里的绑定（R2、Images、Workers AI 只在 Workers 运行时存在），因此需要验证与绑定相关的行为时用真实运行时：

```bash
pnpm preview
```

它先用 `pnpm build` 产出 `.open-next/`，再由 `wrangler dev` 在 workerd 中启动站点，绑定按本地模拟提供。

本机处于代理后面时，`next dev` 里调用 Google Translate 需要让 Node 的 `fetch` 走代理：

```bash
NODE_USE_ENV_PROXY=1 pnpm dev
```

## 部署

站点部署在 Cloudflare Workers 上，入口是 `@opennextjs/cloudflare` 生成的 `.open-next/worker.js`，配置在 `wrangler.jsonc`。

```bash
npx opennextjs-cloudflare build         # Next.js 构建 + 适配器打包到 .open-next/
npx wrangler deploy --autoconfig=false  # 上传 Worker 并挂载 routes
```

`--autoconfig=false` 是必须的：`wrangler deploy` 检测到 OpenNext 项目会转交 `opennextjs-cloudflare deploy`，而后者发布前要跑 `populateCache remote`——它依赖一个临时 Worker 预览会话（`open-next-cache-populate.<account>.workers.dev`）和一个额外的 workers.dev 子域名。账号没有该子域名、或本机连不上 workers.dev 时，预热会一直失败重试。跳过预热只是让页面在第一次访问时才写进 R2 缓存，行为不变。

`pnpm deploy` 保留了同样的预热行为，适合网络与账号都齐备的环境。

`kinda.info` 与 `www.kinda.info` 通过 `wrangler.jsonc` 的 `routes` 挂载在 zone 已有的代理记录上，不改 DNS；把这两条删掉再发布一次即可把流量放回原处。

账号侧需要满足的前置条件：

- 已启用 Cloudflare Images（`IMAGES` 绑定，`next/image` 依赖它做缩放）
- Workers AI（`AI` 绑定，Google Translate 被限流时接手翻译）
- 已创建 R2 桶 `kinda-info-cache`（`NEXT_INC_CACHE_R2_BUCKET` 绑定，承载 ISR 与 `/hot` 的 600 秒缓存）
- `kinda.info` 在同一个账号下，且 apex / www 的 DNS 记录是「已代理」，routes 才能挂载

`pnpm build` 仍是纯 Next.js 构建，用于本地检查；部署务必先 `opennextjs-cloudflare build`，否则 `.open-next/` 不会更新。

## 翻译与语音

自动翻译首选 Google Translate 的公开接口，但它对 Cloudflare 的共享出口 IP 返回 429，所以失败时由 Workers AI 的 `@cf/meta/m2m100-1.2b` 接手（译文中会带 `provider: cloudflare-ai`）：质量略低于 Google，但同一运行时内没有第三方依赖。译文按行送入、按行取回，句子不会串到别的段落。

文章朗读使用 Edge TTS 的 Sec-MS-GEC v2 协议，同样依赖第三方服务策略。

语音链路需要 WebSocket，而 Workers 没有 TCP socket，所以 `lib/edge-speech/socket.ts` 按运行时选择传输层：workerd 走 `fetch` + `Upgrade: websocket`，Node（开发服务器与测试）走 `ws`。修改语音认证逻辑后，运行 `pnpm test` 校验固定令牌向量，并对着 `pnpm preview` 的 `/api/speech` 做一次真实合成验证。

## 搜索与评论

全站搜索索引在构建时直接从 Velite 内容生成，不依赖外部搜索服务。访客可以点击页头搜索按钮，或使用 `⌘ K` / `Ctrl K` 打开搜索。

评论使用 [Utterances](https://github.com/apps/utterances) 与 GitHub Issues。首次启用时，需要为 `Alndaly/kinda.info` 安装 Utterances GitHub App；之后笔记、摄影和作品详情页会自动创建并复用对应的评论 Issue。中英文同 slug 页面使用同一个讨论串。

## 热点快照

`/hot` 的数据由 GitHub Actions（`.github/workflows/hot-snapshot.yml`）每半小时抓取一次，提交到 `hot-data` 分支；页面读取该分支，自身不轮询六个来源。
