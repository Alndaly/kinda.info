SwiftUI 的许多“偶发问题”，本质上来自状态归属不清：谁创建状态、谁观察状态、谁负责导航。先理顺所有权，再选择工具。

## 页面内状态与共享状态

- `@State`：由当前 View 持有的轻量状态；
- `@StateObject`：当前 View 创建并持有的引用模型；
- `@ObservedObject`：模型由外部创建，当前 View 只观察；
- `@EnvironmentObject`：跨层级共享，但依赖注入必须完整；
- Observation 框架：在支持的系统中可减少样板代码。

不要在多个位置分别创建“同一个”状态模型，否则页面观察的实例与业务修改的实例可能不是同一个。

```swift
final class Session: ObservableObject {
    @Published var message = "Hello"
}

struct RootView: View {
    @StateObject private var session = Session()

    var body: some View {
        ContentView()
            .environmentObject(session)
    }
}
```

## NotificationCenter 适合什么

NotificationCenter 适合系统事件或松耦合广播，例如推送点击、应用生命周期变化。普通页面状态更适合显式模型或路由器，否则事件来源难以追踪。

```swift
extension Notification.Name {
    static let openNotificationRoute =
        Notification.Name("openNotificationRoute")
}

struct ContentView: View {
    var body: some View {
        Text("Home")
            .onReceive(
                NotificationCenter.default.publisher(
                    for: .openNotificationRoute
                )
            ) { notification in
                // 把事件交给路由状态
            }
    }
}
```

使用 Combine 的 `sink` 手动订阅时，要保存并在合适的生命周期取消订阅；`onReceive` 通常更贴合 View 生命周期。

## 应用回到前台

页面不会因为应用从后台回来就重新触发 `onAppear`。需要刷新数据时，观察 `scenePhase`：

```swift
struct ContentView: View {
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        Text("Home")
            .onChange(of: scenePhase) { _, phase in
                if phase == .active {
                    refresh()
                }
            }
    }

    private func refresh() {
        // 避免无条件重复请求
    }
}
```

刷新逻辑应当幂等，并根据上次更新时间判断是否真的需要请求。

## NavigationStack 排错

`navigationDestination` 和 `navigationTitle` 应放在对应 `NavigationStack` 的作用域内。复杂导航推荐使用单一 `NavigationPath` 或类型安全路由数组，让跳转来源统一。

如果自定义 Router 与 `TabView(selection:)` 同时修改选中项和导航路径，可能发生“刚跳转又被重置”。解决思路不是移除 selection，而是把两个状态交给同一个上层协调：

1. 明确切换 Tab 和压入页面的先后顺序；
2. 避免 `onAppear` 无条件重置路径；
3. 不要让多个 Router 同时写入同一个导航状态；
4. 为 deep link 和推送建立单一入口。

## SwiftData 与 iCloudKit

启用 CloudKit 后，模型需要满足云端同步约束。常见问题包括：

- 非可选属性没有默认值；
- 关系缺少可兼容的删除规则；
- 唯一性或迁移假设只在本地成立；
- 容器、entitlement 与环境不一致。

先用本地容器验证模型，再启用 CloudKit；启动时记录容器初始化错误，不要只观察“数据没有出现”。数据模型发生变化时，还要考虑已有用户的迁移路径。
