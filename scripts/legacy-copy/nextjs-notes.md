这篇笔记集中记录三个容易表现成“莫名其妙”的 Next.js 问题：无扩展名静态文件被下载、Universal Links 关联失败，以及 Hooks 调用顺序变化。

## 为无扩展名文件声明 Content-Type

`apple-app-site-association` 没有扩展名，静态服务不一定会自动返回正确的媒体类型。可以在 `next.config.ts` 中显式设置响应头：

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

部署后用响应头验证，而不是只在浏览器里观察：

```bash
curl -I https://example.com/.well-known/apple-app-site-association
```

## 认证中间件不要拦截关联文件

即使文件内容和 Content-Type 都正确，认证中间件的重定向仍然会让 Universal Links 验证失败。确保下面的路径可以匿名访问，并直接返回 `200`：

```text
/.well-known/apple-app-site-association
```

同样不要让它经过登录页、地区跳转或 HTML 错误页面。

## Hooks 调用顺序变化

出现下面的错误时：

```text
React has detected a change in the order of Hooks
```

通常是某个提前 `return` 让组件在不同渲染中调用了不同数量的 Hooks。所有 Hooks 都必须在条件返回之前执行：

```tsx
function HydratedContent({ children }: { children: React.ReactNode }) {
  const hasHydrated = useStore((state) => state.hasHydrated)

  if (!hasHydrated) return null

  return children
}
```

如果不同分支需要完全不同的逻辑，把它们拆成独立组件，比在同一组件中绕过 Hooks 更清楚。
