# kinda.info

我的个人网站

## TODO

- [x] 添加notion博客实时更新

## 部署

### 创建并且配置notion integration

前往[notion api管理台](https://www.notion.so/profile/integrations)创建新的integration

![](https://oss.kinda.info/image/202407191302569.png)

![](https://oss.kinda.info/image/202407191304285.png)


### 获取Notion Token

> [!WARNING]
> 就目前我搭建的服务而言不需要开启update和insert级别的权限，根据你自己的需求来就好。

保存后跳转的页面中点击show即可查看。

![](https://oss.kinda.info/image/202407191306158.png)

### 获取需要同步的notion database_id

### vercel部署

我使用的vercel，当然你可以选择其他方式。

vercel配置环境变量NOTION_TOKEN和NOTION_PAGE_ID。

## TIPS

默认情况下是部署静态网站，所以如果notion站点的博客存在更新的话需要重新部署，如果要开启notion博客自动实时更新，请打开本项目的next.config.js文件并作如下操作：

> [!WARNING]
> 一般情况下其实不建议开启，因为会极大的影响网站页面加载速度，虽然我已经一定程度做了页面交互优化和请求缓存，但实测还是很慢。

```js
...
{
    ...
    // output: 'export' //注释这一行
    ...
}
...
```

同时还需要注释`post/page.tsx`文件中的`generateStaticParams`函数体。