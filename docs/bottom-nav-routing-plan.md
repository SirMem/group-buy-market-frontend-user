# Frontend User Bottom Tab 路由实施方案

## 背景

- `frontend-user/src/pages/home/index.vue` 是首页页面。
- `frontend-user/src/components/BottomNav.vue` 是底部 Tab 栏组件。
- 首页当前仍处于设计稿 / mock 数据阶段，暂未接入后端接口。
- 当前目标不是接后端，而是先把底部 Tab 导航接入 `vue-router`，实现点击 tab 后跳转到对应页面。

## 已确认的设计决策

### 1. 采用全局壳层方案

底部导航统一由 `frontend-user/src/App.vue` 控制显示，而不是在各个页面分别维护各自的底部导航。

原因：

- `App.vue` 已经具备根据 `route.meta.tabbar` 控制底部导航显示的机制。
- 登录页是否显示底部导航的问题，已经可以通过路由 `meta.tabbar` 正确控制。
- 对 tab 页面来说，底部导航属于共享布局，而不是页面私有内容。

### 2. 接受 route meta 控制布局

已确认接受以下规则：

- `route.meta.tabbar === true` 时显示底部导航。
- `route.meta.tabbar !== true` 时不显示底部导航。

因此：

- 首页 `/` 显示 BottomNav
- 订单页 `/orders` 显示 BottomNav
- 我的页 `/profile` 显示 BottomNav
- 登录页 `/login` 不显示 BottomNav
- 商品详情页 `/goods/:goodsId` 不显示 BottomNav

### 3. 主 tab 固定为 3 个

本次底部主导航只保留 3 个 tab：

- 首页 `/`
- 订单 `/orders`
- 我的 `/profile`

不把 `settings` 作为主底部 tab 纳入本轮改造。

### 4. active 状态必须由路由驱动

`BottomNav.vue` 不能再使用本地 `ref('home')` 作为真实选中状态来源。

必须改为：

- 使用 `useRoute()` 获取当前路由
- 根据当前 `route.path` 计算哪个 tab 处于激活状态

### 5. 点击 tab 时执行路由跳转

点击底部 tab 后，应通过 `vue-router` 跳转到目标页面。

推荐实现：

- 使用 `useRouter()`
- 点击时执行 `router.push(tab.to)`
- 若点击的是当前已激活 tab，则不重复跳转

### 6. 子路由保持父 tab 激活

底部 tab 的激活逻辑需要支持父级高亮：

- `/orders` 高亮“订单”
- `/orders/:id` 仍高亮“订单”
- `/profile` 高亮“我的”
- `/profile/settings` 仍高亮“我的”
- `/` 只匹配首页自身

---

## 当前代码中的关键事实

### App 全局显示逻辑已存在

文件：`frontend-user/src/App.vue`

- 已通过 `useRoute()` 和 `route.meta.tabbar` 控制 `BottomNav` 是否显示。
- 当前方向正确，应继续保留。

### 路由定义已存在

文件：`frontend-user/src/router/index.ts`

当前已经存在以下主路由：

- `/`
- `/login`
- `/goods/:goodsId`
- `/orders`
- `/profile`

且这些路由已经带有 `meta.tabbar` 配置。

### 当前存在重复底部导航

#### 首页
文件：`frontend-user/src/pages/home/index.vue`

- 页面内手动引入并渲染了 `BottomNav`
- 这会与 `App.vue` 全局渲染逻辑重复

#### 订单页
文件：`frontend-user/src/pages/orders/index.vue`

- 页面底部内嵌了一整段静态 `<nav>`
- 使用的是静态 `<a href="#">`
- 不是统一的全局底部导航实现

#### 我的页
文件：`frontend-user/src/pages/profile/index.vue`

- 页面底部同样内嵌了一整段静态 `<nav>`
- 与统一 `BottomNav.vue` 相冲突

---

## 具体实施方案

## 一、改造 `frontend-user/src/components/BottomNav.vue`

### 目标
把当前“本地按钮切换”改造成“基于路由的底部 tab 导航”。

### 当前问题

当前实现中：

- 用本地 `activeTab` 保存激活状态
- 点击按钮只会修改本地状态
- 没有触发页面路由跳转

### 实施要求

1. 引入 `useRoute` 和 `useRouter`
2. 将 tabs 配置改为同时包含：
   - `id`
   - `label`
   - `icon`
   - `to`
3. 不再使用本地 `activeTab` 作为激活来源
4. 新增激活判断逻辑：
   - `/` 仅匹配首页
   - 其他 tab 既匹配自身，也匹配其子路径
5. 点击 tab 时：
   - 如果当前已激活，则不重复跳转
   - 否则执行 `router.push(tab.to)`
6. 尽量保留现有视觉样式，避免无关 UI 大改

### 推荐 tabs 配置

```ts
const tabs = [
  { id: 'home', label: '首页', icon: 'home', to: '/' },
  { id: 'orders', label: '订单', icon: 'receipt_long', to: '/orders' },
  { id: 'profile', label: '我的', icon: 'person', to: '/profile' },
]
```

### 推荐激活逻辑

```ts
function isTabActive(tabTo: string) {
  if (tabTo === '/') return route.path === '/'
  return route.path === tabTo || route.path.startsWith(`${tabTo}/`)
}
```

### 推荐点击逻辑

```ts
async function handleTabClick(tabTo: string) {
  if (isTabActive(tabTo)) return
  await router.push(tabTo)
}
```

---

## 二、保留 `frontend-user/src/App.vue` 的全局控制逻辑

### 目标
继续让 `App.vue` 作为底部导航显示入口。

### 要求
保留以下结构：

- `<router-view />`
- `<BottomNav v-if="showTabBar" />`
- 底部 spacer

### 原因

- 这是当前项目已经具备的布局机制
- 与 `route.meta.tabbar` 方案一致
- 可以确保登录页和详情页不会显示底部 tab

---

## 三、清理 `frontend-user/src/pages/home/index.vue`

### 目标
移除页面内部重复渲染的 `BottomNav`

### 需要删除的内容

1. 组件引入：

```ts
import BottomNav from "../../components/BottomNav.vue";
```

2. 模板中的：

```vue
<BottomNav/>
```

### 原因

首页的底部导航应由 `App.vue` 统一渲染，避免重复。

---

## 四、清理 `frontend-user/src/pages/orders/index.vue`

### 目标
移除页面内部硬编码的底部 `<nav>`。

### 需要删除的内容
删除页面底部那整段静态底部导航。

### 原因

- 当前使用的是静态 `<a href="#">`
- 不具备统一路由逻辑
- 会与全局 `BottomNav.vue` 重复渲染

---

## 五、清理 `frontend-user/src/pages/profile/index.vue`

### 目标
移除页面内部硬编码的底部 `<nav>`。

### 需要删除的内容
删除页面底部那整段静态底部导航。

### 原因

- 当前为页面私有静态实现
- 与全局统一的 `BottomNav.vue` 冲突

---

## 六、确认 `frontend-user/src/router/index.ts`

### 目标
确认并保留已有 `meta.tabbar` 规则。

### 应满足的路由规则

- `/` -> `tabbar: true`
- `/orders` -> `tabbar: true`
- `/profile` -> `tabbar: true`
- `/login` -> `tabbar: false`
- `/goods/:goodsId` -> `tabbar: false`

### 说明
若这些配置已经正确，则无需大改。

---

## 七、测试要求

### 重点验证

文件：`frontend-user/src/components/BottomNav.spec.ts`

应满足：

1. 渲染 3 个 tab：首页 / 订单 / 我的
2. 当前路由对应 tab 正确高亮
3. 子路由保持父 tab 高亮
4. 点击非激活 tab 时执行 `router.push(...)`
5. 点击当前激活 tab 时不重复跳转

### 额外验证

还应检查：

- `frontend-user/src/App.spec.ts`
- `frontend-user/src/router/index.spec.ts`

---

## 八、最终验收标准

### 显示规则

- `/` 显示 BottomNav
- `/orders` 显示 BottomNav
- `/profile` 显示 BottomNav
- `/login` 不显示 BottomNav
- `/goods/:goodsId` 不显示 BottomNav

### 跳转规则

- 点击首页 tab -> 跳到 `/`
- 点击订单 tab -> 跳到 `/orders`
- 点击我的 tab -> 跳到 `/profile`

### 激活规则

- `/` 高亮首页
- `/orders` 高亮订单
- `/orders/xxx` 仍高亮订单
- `/profile` 高亮我的
- `/profile/settings` 仍高亮我的

### 结构规则

- `App.vue` 中保留全局 `BottomNav`
- 首页不再单独渲染 `BottomNav`
- 订单页不再保留私有静态底部导航
- 我的页不再保留私有静态底部导航

---

## 清理上下文后的执行提示词

清理上下文后，可直接向 Claude Code 输入以下提示词执行方案：

```text
请按 frontend-user/docs/bottom-nav-routing-plan.md 中的方案直接实施，不需要重新做方案讨论。

实施范围：frontend-user

要求：
1. 将 frontend-user/src/components/BottomNav.vue 改造成基于 vue-router 的底部 tab 导航
2. 采用 App.vue 全局壳层方案，继续使用 route.meta.tabbar 控制显示隐藏
3. tabs 只保留 3 个：首页 /、订单 /orders、我的 /profile
4. active 状态必须由 route 决定，不能再用本地 ref 作为真实状态来源
5. 支持子路由保持父 tab 高亮，例如 /orders/:id 和 /profile/settings
6. 点击当前已激活 tab 时不要重复 push
7. 删除 frontend-user/src/pages/home/index.vue 中重复渲染的 BottomNav
8. 删除 frontend-user/src/pages/orders/index.vue 和 frontend-user/src/pages/profile/index.vue 中页面内硬编码的底部 nav
9. 尽量保持现有视觉样式不做无关大改
10. 修改后运行相关测试并汇报结果

请先阅读并遵循文档方案，再开始修改代码。
```
